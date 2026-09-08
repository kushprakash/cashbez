<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserKyc;
use App\Models\Account;
use App\Models\Mid;
use App\Models\Role;
use App\Services\DigiLockerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use DB;
use Carbon\Carbon;
use App\Services\CatchLogService;

class DigiLockerOnboarding extends Controller
{
    protected DigiLockerService $digiLockerService;

    public function __construct(DigiLockerService $digiLockerService)
    {
        $this->digiLockerService = $digiLockerService;
    }

    /**
     * Initiate DigiLocker OAuth flow
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function initiateAuth(Request $request)
    {
        try {
            return response()->json([
                'status' => 0,
                'message' => 'DigiLocker authentication failed',
            ], 200);

            // Generate PKCE code verifier and challenge
            $codeVerifier = $this->digiLockerService->generateCodeVerifier();
            $codeChallenge = $this->digiLockerService->generateCodeChallenge($codeVerifier);

            // Generate unique state for CSRF protection
            $flow = $request->get('flow', 'signin'); // signin or signup
            $state = $this->digiLockerService->generateState('oidc_' . $flow);

            // Store code verifier in cache for retrieval during callback
            $this->digiLockerService->storeCodeVerifier($state, $codeVerifier, 15);

            // Store refer_by in cache so it survives the OAuth redirect
            $referBy = $request->get('refer_by');
            if ($referBy) {
                \Illuminate\Support\Facades\Cache::put("digilocker_refer_{$state}", $referBy, now()->addMinutes(15));
            }

            // Build authorization URL
            $options = [
                'purpose' => $request->get('purpose', 'kyc'),
                'verified_mobile' => $request->get('mobile'),
            ];

            $authUrl = $this->digiLockerService->buildAuthorizationUrl(
                $codeChallenge,
                $state,
                $flow,
                $options
            );

            Log::info('DigiLocker auth initiated', [
                'flow' => $flow,
                'state' => $state,
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Authorization URL generated',
                'authorization_url' => $authUrl,
                'state' => $state,
            ]);
        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'DigiLocker_initiateAuth', $e, [
                'api' => 'DigiLocker OAuth',
                'context' => 'Initiate DigiLocker Authentication',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to initiate DigiLocker authentication',
                'ref_id' => $refId,
            ], 500);
        }
    }

    /**
     * Handle DigiLocker OAuth callback (webhook)
     * This is called by DigiLocker after user authorization
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function handleCallback(Request $request)
    {
        $txnId = 'DL' . date('YmdHis') . rand(1000, 9999);
        
        // Unconditional Webhook Log
        try {
            DB::table('webhook_logs')->insert([
                'provider'        => 'DigiLocker',
                'txn_id'          => $txnId,
                'ref_id'          => $request->get('state'),
                'status'          => 'RECEIVED',
                'request_ip'      => $request->ip(),
                'request_payload' => json_encode($request->all()),
                'created_at'      => now(),
            ]);
        } catch (\Exception $e) {
            // Squelch logging errors to avoid blocking main flow
            $refId = CatchLogService::logException($request, 'DigiLocker_handleCallback', $e, [
                'api' => 'DigiLocker OAuth Callback',
                'context' => 'Handle DigiLocker Callback (Webhook Log)',
                'txn_id' => $txnId,
            ]);
        }

        try {
            $code = $request->get('code');
            $state = $request->get('state');
            $error = $request->get('error');
            $jti = $request->get('jti');

            Log::info('DigiLocker callback received', [
                'has_code' => !empty($code),
                'state' => $state,
                'error' => $error,
                'jti' => $jti,
                'txn_id' => $txnId,
            ]);

            // Log request BEFORE processing
            DB::table('logs')->insert([
                'mid'          => 'SYSTEM',
                'type'         => 'DigiLocker_Callback',
                'platform'     => 'WEB',
                'headers'      => json_encode($request->headers->all()),
                'request_data' => json_encode($request->all()),
                'url'          => config('digilocker.redirect_uri'),
                'txnid'        => $txnId,
                'status'       => 0,
                'created_at'   => now(),
            ]);

            // Handle error from DigiLocker
            if ($error) {
                $errorDesc = $request->get('error_description', 'Authorization denied');
                return $this->redirectWithError($error, $errorDesc);
            }

            if (!$code || !$state) {
                return $this->redirectWithError('invalid_request', 'Missing code or state');
            }

            // Retrieve code verifier from cache
            $codeVerifier = $this->digiLockerService->getCodeVerifier($state);
            if (!$codeVerifier) {
                Log::warning('DigiLocker callback - Invalid or expired state', ['state' => $state]);
                return $this->redirectWithError('invalid_state', 'Session expired. Please try again.');
            }

            // Retrieve refer_by that was stored during initiateAuth
            $referBy = \Illuminate\Support\Facades\Cache::pull("digilocker_refer_{$state}");

            // Exchange code for tokens
            $tokenResult = $this->digiLockerService->exchangeCodeForToken($code, $codeVerifier);

            if (!$tokenResult['success']) {
                return $this->redirectWithError(
                    $tokenResult['error'],
                    $tokenResult['error_description']
                );
            }

            $tokenData = $tokenResult['data'];

            // Decode id_token to get user claims
            $idTokenClaims = [];
            if (!empty($tokenData['id_token'])) {
                $idTokenClaims = $this->digiLockerService->decodeIdToken($tokenData['id_token']);
            }

            // Also get user details via v1 API for more data
            $v1Result = $this->digiLockerService->exchangeCodeForTokenV1($code, $codeVerifier);
            $v1Data = $v1Result['success'] ? $v1Result['data'] : [];

            // Merge all available user data
            $userData = $this->extractUserData($tokenData, $idTokenClaims, $v1Data);

            // Inject refer_by so processUserAuth can use it when creating a new user
            if ($referBy) {
                $userData['refer_by'] = $referBy;
            }

            // Try to get eAadhaar data if available
            if (!empty($tokenData['access_token'])) {
                $eaadhaarResult = $this->digiLockerService->getEAadhaarData($tokenData['access_token']);
                if ($eaadhaarResult['success']) {
                    $userData = array_merge($userData, [
                        'eaadhaar_data' => $eaadhaarResult['data'],
                    ]);
                }
            }

            // Process login or registration
            $result = $this->processUserAuth($userData, $tokenData);

            if ($result['status'] === 0) {
                return $this->redirectWithError('auth_failed', $result['message']);
            }

            // Update log with success response
            DB::table('logs')
                ->where('txnid', $txnId)
                ->update([
                    'response_data' => json_encode([
                        'status' => 'success', 
                        'type' => $result['type'],
                        'userData' => $userData, // Logging full extracted user data including Aadhaar
                        'tokenData' => $tokenData, // Logging raw token data
                        'v1Data' => $v1Data, // Logging v1 API data
                    ]),
                    'status'        => 1,
                    'updated_at'    => now(),
                ]);

            // Update webhook_logs with success
            DB::table('webhook_logs')
                ->where('txn_id', $txnId)
                ->update([
                    'status'           => 'PROCESSED',
                    'response_status'  => 'SUCCESS',
                    'response_message' => 'Token exchanged and user processed',
                ]);

            // Redirect to app with success and token
            return $this->redirectWithSuccess($result);

        } catch (\Exception $e) {
            // Update log with error
            DB::table('logs')
                ->where('txnid', $txnId)
                ->update([
                    'response_data' => json_encode(['error' => $e->getMessage()]),
                    'status'        => 0,
                    'updated_at'    => now(),
                ]);

            // Update webhook_logs with failure
            DB::table('webhook_logs')
                ->where('txn_id', $txnId)
                ->update([
                    'status'           => 'FAILED',
                    'response_status'  => 'ERROR',
                    'response_message' => $e->getMessage(),
                ]);

            $refId = CatchLogService::logException($request, 'DigiLocker_handleCallback', $e, [
                'api' => 'DigiLocker OAuth Callback',
                'context' => 'Handle DigiLocker Callback',
                'txn_id' => $txnId,
            ]);
            Log::error('DigiLocker callback error', [
                'message' => $e->getMessage(),
                'ref_id' => $refId,
            ]);
            return $this->redirectWithError('server_error', 'An unexpected error occurred');
        }
    }

    /**
     * Extract user data from DigiLocker responses
     */
    protected function extractUserData(array $tokenData, array $idTokenClaims, array $v1Data): array
    {
        return [
            // Primary identifiers
            'digilocker_id' => $v1Data['digilockerid'] ?? $idTokenClaims['user_sso_id'] ?? null,
            'name' => $v1Data['name'] ?? $idTokenClaims['given_name'] ?? null,
            
            // Date of birth (v1 returns DDMMYYYY, id_token returns DD/MM/YYYY)
            'dob' => $this->parseDob($v1Data['dob'] ?? $idTokenClaims['birthdate'] ?? null),
            
            // Gender (M/F/T)
            'gender' => $v1Data['gender'] ?? null,
            
            // Contact info (from id_token)
            'mobile' => $idTokenClaims['phone_number'] ?? null,
            'email' => $idTokenClaims['email'] ?? null,
            
            // Document numbers (from id_token if acr included)
            'masked_aadhaar' => $idTokenClaims['masked_aadhaar'] ?? null,
            'pan_number' => $idTokenClaims['pan_number'] ?? null,
            'driving_licence' => $idTokenClaims['driving_licence'] ?? null,
            
            // Tokens
            'access_token' => $tokenData['access_token'] ?? null,
            'refresh_token' => $tokenData['refresh_token'] ?? $v1Data['refresh_token'] ?? null,
            'expires_in' => $tokenData['expires_in'] ?? 3600,
            'scope' => $tokenData['scope'] ?? null,
            
            // Flags
            'eaadhaar_available' => ($v1Data['eaadhaar'] ?? 'N') === 'Y',
            'new_account' => ($v1Data['new_account'] ?? 'N') === 'Y',
            'reference_key' => $v1Data['reference_key'] ?? null,
        ];
    }

    /**
     * Parse DOB to Y-m-d format
     */
    protected function parseDob(?string $dob): ?string
    {
        if (!$dob) return null;

        try {
            // Try DDMMYYYY format first
            if (preg_match('/^\d{8}$/', $dob)) {
                return Carbon::createFromFormat('dmY', $dob)->format('Y-m-d');
            }
            // Try DD/MM/YYYY format
            if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $dob)) {
                return Carbon::createFromFormat('d/m/Y', $dob)->format('Y-m-d');
            }
            // Try DD-MM-YYYY format
            if (preg_match('/^\d{2}-\d{2}-\d{4}$/', $dob)) {
                return Carbon::createFromFormat('d-m-Y', $dob)->format('Y-m-d');
            }
        } catch (\Exception $e) {
            Log::warning('Failed to parse DOB', ['dob' => $dob]);
        }

        return null;
    }

    /**
     * Process user authentication - login existing or register new user
     */
    protected function processUserAuth(array $userData, array $tokenData): array
    {
        try {
            // Try to find existing user by DigiLocker ID first
            $existingUser = null;
            
            if (!empty($userData['digilocker_id'])) {
                $kyc = UserKyc::where('digilocker_id', $userData['digilocker_id'])->first();
                if ($kyc) {
                    $existingUser = User::find($kyc->user_id);
                }
            }
            
            // If not found by DigiLocker ID, try by mobile
            if (!$existingUser && !empty($userData['mobile'])) {
                $existingUser = User::where('mobile', $userData['mobile'])->first();
            }

            if ($existingUser) {
                // Update existing user's KYC with latest DigiLocker data
                $this->updateUserKyc($existingUser, $userData, $tokenData);
                
                Log::info('Existing user logged in via DigiLocker', [
                    'user_id' => $existingUser->id,
                    'mid' => $existingUser->mid,
                    'digilocker_id' => $userData['digilocker_id'],
                ]);
                
                return $this->generateAuthResponse($existingUser, 'login');
            } else {
                // Create new user
                return $this->createNewUser($userData, $tokenData);
            }
            
        } catch (\Exception $e) {
            Log::error('processUserAuth failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return [
                'status' => 0,
                'message' => 'Failed to process user authentication: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update existing user's KYC with DigiLocker data
     */
    protected function updateUserKyc(User $user, array $userData, array $tokenData): void
    {
        $kycData = [
            'user_id' => $user->id,
            'digilocker_id' => $userData['digilocker_id'],
            'digilocker_access_token' => $userData['access_token'],
            'digilocker_refresh_token' => $userData['refresh_token'],
            'digilocker_token_expires_at' => now()->addSeconds($userData['expires_in']),
            'digilocker_verified' => true,
            'digilocker_response' => json_encode($tokenData),
            'name' => $userData['name'] ?? $user->name,
            'mobile' => $userData['mobile'] ?? $user->mobile,
            'email' => $userData['email'] ?? $user->email,
            'dob' => $userData['dob'],
            'gender' => $userData['gender'],
        ];

        // Add PAN if available
        if (!empty($userData['pan_number'])) {
            $kycData['pan_number'] = $userData['pan_number'];
            $kycData['pan_verified'] = true;

            // Construct PAN Verification Response JSON
            $panResponse = [
                "status" => 1,
                "message" => "Success",
                "data" => [
                    "Txnid" => (string)rand(10000000, 99999999),
                    "status" => "SUCCESS",
                    "pan" => $userData['pan_number'],
                    "RegisteredName" => $userData['name'] ?? "", // Name from DigiLocker
                    "FatherName" => "", // Not available in standard scope
                    "type" => "Individual",
                    "Fees" => "3.00", // Placeholder
                    "Bal" => "0.0", // Placeholder
                    "resText" => "PAN verified successfully"
                ]
            ];
            $kycData['response_pan'] = json_encode($panResponse);
        }

        // Add Driving Licence if available
        if (!empty($userData['driving_licence'])) {
            $kycData['driving_licence'] = $userData['driving_licence'];
        }

        // Note: masked_aadhaar from DigiLocker is intentionally NOT stored in aadhar_number.
        // The full Aadhaar number is collected from the user during the completeOnboarding step.

        // Add eAadhaar data if available
        if (!empty($userData['eaadhaar_data'])) {
            $eaadhaar = $userData['eaadhaar_data'];
            
            // Prefer full Aadhaar number from eAadhaar XML if available
            if (!empty($eaadhaar['uid'])) {
                $kycData['aadhar_number'] = $eaadhaar['uid'];
                $kycData['aadhar_verified'] = true;
            }

            if (!empty($eaadhaar['photo'])) {
                $kycData['photo'] = 'data:image/jpeg;base64,' . $eaadhaar['photo'];
            }
            
            $addressParts = [];
            $splitAddress = [];

            if (!empty($eaadhaar['address'])) {
                $address = $eaadhaar['address'];
                $kycData['house'] = $address['house'] ?? null;
                $kycData['street'] = $address['street'] ?? null;
                $kycData['landmark'] = $address['landmark'] ?? null;
                $kycData['vtc'] = $address['vtc'] ?? null;
                $kycData['dist'] = $address['dist'] ?? null;
                $kycData['state'] = $address['state'] ?? null;
                $kycData['pincode'] = $address['pincode'] ?? null;
                $kycData['country'] = $address['country'] ?? 'India';
                $kycData['po'] = $address['po'] ?? null;
                $kycData['subdist'] = $address['subdist'] ?? null;

                // Build split_address for response
                $splitAddress = [
                    "country" => $address['country'] ?? "",
                    "dist" => $address['dist'] ?? "",
                    "house" => $address['house'] ?? "",
                    "landmark" => $address['landmark'] ?? "",
                    "pincode" => $address['pincode'] ?? "",
                    "po" => $address['po'] ?? "",
                    "state" => $address['state'] ?? "",
                    "street" => $address['street'] ?? "",
                    "subdist" => $address['subdist'] ?? "",
                    "vtc" => $address['vtc'] ?? "",
                    "locality" => $address['locality'] ?? ""
                ];

                // Build full address string
                // Logic: Concatenate available parts with comma
                $parts = [
                    $address['house'] ?? '',
                    $address['street'] ?? '',
                    $address['locality'] ?? '',
                    $address['vtc'] ?? '',
                    $address['po'] ?? '',
                    $address['dist'] ?? '',
                    $address['state'] ?? '',
                    $address['country'] ?? '',
                    $address['pincode'] ?? ''
                ];
                $addressParts = array_filter($parts, fn($value) => !empty($value));
            }
            
            $fullAddress = implode(', ', $addressParts);

            // Construct the response JSON
            $aadharResponse = [
                "status" => 1,
                "message" => "Success",
                "data" => [
                    "txnid" => (string)rand(10000000, 99999999), // Generate random txn ID
                    "status" => "SUCCESS",
                    "refid" => $userData['digilocker_id'] ?? (string)rand(10000000, 99999999),
                    "address" => $fullAddress,
                    "split_address" => $splitAddress,
                    "dob" => $eaadhaar['dob'] ?? $userData['dob'] ?? '',
                    "mobile" => isset($userData['mobile']) ? hash('sha256', $userData['mobile']) : "", // Hash to match example
                    "gender" => $eaadhaar['gender'] ?? $userData['gender'] ?? '',
                    "email" => $eaadhaar['email'] ?? $userData['email'] ?? '',
                    "name" => $eaadhaar['name'] ?? $userData['name'] ?? '',
                    "photo" => $eaadhaar['photo'] ?? "", // Raw base64 from XML (without header) or formatted
                    "resText" => "Aadhaar Card Exists"
                ]
            ];

            $kycData['response_aadhar'] = json_encode($aadharResponse);
        }

        UserKyc::updateOrCreate(
            ['user_id' => $user->id],
            $kycData
        );

        // Update user's name and email if available
        $user->update([
            'name' => $userData['name'] ?? $user->name,
            'email' => $userData['email'] ?? $user->email,
        ]);
    }



    /**
     * Create new user from DigiLocker data
     */
    protected function createNewUser(array $userData, array $tokenData): array
    {
        if (!$userData['mobile']) {
            return [
                'status' => 0,
                'message' => 'Mobile number is required for registration',
            ];
        }

        DB::beginTransaction();
        try {
            // Get next available MID
            $lastUser = Mid::where('status', 0)->orderBy('id', 'asc')->first();
            if (!$lastUser) {
                 throw new \Exception('No available MIDs found. Please contact administrator.');
            }
            $nextMid = $lastUser->mid;
            $lastUser->markAsUsed();
            
            // Get default admin and role
            $adminId = $this->getDefaultAdminId();
            $defaultRole = 10; // Default user role

            // Create user
            $user = User::create([
                'mid' => $nextMid,
                'mkey' => Str::random(32),
                'admin_mid' => $adminId,
                'mobile' => $userData['mobile'],
                'name' => $userData['name'] ?? 'DigiLocker User',
                'email' => $userData['email'],
                'role' => $defaultRole,
                'status' => 0,
                'password' => Hash::make($userData['mobile']),
            ]);

            // Create account
            Account::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'number' => $userData['mobile'] . date('ym') . rand(11, 99),
                'upi' => $userData['mobile'] . '@cashbez',
                'mpin' => 1234,
                'hold_amount' => 0,
                'created_by' => $user->id,
                'admin_id' => $user->id,
                'status' => 1,
                'primary_status' => true,
            ]);

            // Assign permissions and commissions from role template
            $this->assignRolePermissionsAndCommissions($user->id, $user->role);

            // Create KYC record with DigiLocker data
            $this->updateUserKyc($user, $userData, $tokenData);
            

            // Process Referral if present
            if (!empty($userData['refer_by'])) {
                $this->processReferral($user, $userData['refer_by']);
                // Refresh user instance after updates
                $user->refresh(); 
            }

            DB::commit();

            Log::info('New user created via DigiLocker', [
                'user_id' => $user->id,
                'mid' => $user->mid,
                'digilocker_id' => $userData['digilocker_id'],
            ]);

            return $this->generateAuthResponse($user, 'register');

        } catch (\Exception $e) {
            DB::rollBack();
            $refId = CatchLogService::logException(request(), 'DigiLocker_createNewUser', $e, [
                'api' => 'DigiLocker User Creation',
                'context' => 'Create New User from DigiLocker',
                'mobile' => $userData['mobile'] ?? null,
            ]);
            Log::error('Failed to create user from DigiLocker', [
                'message' => $e->getMessage(),
                'ref_id' => $refId,
            ]);
            return [
                'status' => 0,
                'message' => 'Failed to create user account',
            ];
        }
    }



    /**
     * Get default admin ID for new users
     */
    protected function getDefaultAdminId(): string
    {
        $admin = User::where('role', 1)->first();
        return $admin ? $admin->mid : 'CW0000001';
    }

    /**
     * Generate authentication response with JWT token
     */
    protected function generateAuthResponse(User $user, string $type): array
    {
        $token = JWTAuth::fromUser($user);
        $user->remember_token = $token;
        $user->save();
        
        // Get role name
        $role = DB::table('roles')->where('id', $user->role)->first();
        $user->role_name = $role->name ?? 'Unknown';

        // Get logo
        $admin = User::where('mid', $user->admin_mid)->first();
        $settings = DB::table('settings')->where('user_id', $admin?->id)->select('logo')->first();
        $user->logo = $settings->logo ?? 'https://enexa.in/images/enexa-logo-mix-white.png';

        return [
            'status' => 1,
            'message' => $type === 'register' 
                ? 'Account created successfully via DigiLocker' 
                : 'Login successful via DigiLocker',
            'type' => $type,
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => $user,
            'access_token' => $token
        ];
    }

    protected function updateDigiLockerTokens($kyc, $tokenData)
    {
        $kyc->digilocker_access_token = $tokenData['access_token'];
        if (isset($tokenData['refresh_token'])) {
             $kyc->digilocker_refresh_token = $tokenData['refresh_token'];
        }
        if (isset($tokenData['expires_in'])) {
             $kyc->digilocker_token_expires_at = now()->addSeconds($tokenData['expires_in']);
        }
        $kyc->save();
    }

    protected function redirectWithError(string $error, string $desc)
    {
        $params = http_build_query([
            'status' => 0,
            'error' => $error,
            'message' => $desc,
        ]);
        
        $redirectUrl = env('DIGILOCKER_APP_REDIRECT', url('').'/digilocker/callback');
        return redirect("{$redirectUrl}?{$params}");
    }

    protected function redirectWithSuccess(array $result)
    {
        // Check if KYC is complete (Bank verified)
        $isKycComplete = 0;
        $kyc = DB::table('user_kyc')->where('user_id', $result['user']->id)->first();
        if ($kyc && $kyc->account_verified) {
            $isKycComplete = 1;
        }

        // Only return essential data
        $params = http_build_query([
            'status' => 1,
            'type' => $result['type'],
            'access_token' => $result['access_token'],
            'user_id' => $result['user']->id,
            'name' => $result['user']->name,
            'role_name' => $result['user']->role_name ?? 'Unknown',
            'logo' => $result['user']->logo ?? '',
            'kyc_complete' => $isKycComplete,
            'refer_by' => $result['user']->refer_by ?? '',
            'email' => $result['user']->email ?? '',
        ]);

        $redirectUrl = env('DIGILOCKER_APP_REDIRECT', url('').'/digilocker/callback');
        return redirect("{$redirectUrl}?{$params}");
    }
    
    // API to Complete Onboarding (Bank Verification)
    public function completeOnboarding(Request $request) {
         $user = auth()->user();
         if(!$user) return response()->json(['status'=> 0, 'message'=>'Unauthorized'], 401);

         // Email is required only if user doesn't already have one
         $emailRules = [];
         if (empty($user->email)) {
             $emailRules['email'] = 'required|email';
         }

         $request->validate(array_merge([
             'account_number' => 'required',
             'ifsc_code'      => 'required',
             'aadhaar_number' => 'required|digits:12',
             'refer_by'       => 'required',
         ], $emailRules));

           // Referral ID required
            if (empty($request->refer_by)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Please enter a referral ID.'
                ]);
            }

            // Referral ID must exist
            $referUser = User::where('mid', $request->refer_by)->first();
            if (!$referUser) {
                $user->refer_by = null;
                $user->save();
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid Referral ID. Please contact your senior or distributor.'
                ]);
            }

         // Email handling: only update if user doesn't have one yet
         if (empty($user->email) && !empty($request->email)) {
             // Verify that OTP was verified for this email
             $otpVerified = DB::table('otps')
                 ->where('mobile', $request->email)
                 ->where('verified', 1)
                 ->first();

             if (!$otpVerified) {
                 return response()->json([
                     'status' => 0,
                     'message' => 'Please verify your email with OTP first.'
                 ]);
             }

             // Email must be unique
             $checkEmail = User::where('email', $request->email)
                 ->where('id', '!=', $user->id)
                 ->first();
             if ($checkEmail) {
                 return response()->json([
                     'status' => 0,
                     'message' => 'This email is already registered. Please use another email.'
                 ]);
             }

             $user->email = $request->email;

             // Clean up verified OTP record
             DB::table('otps')->where('mobile', $request->email)->delete();
         }

         // Process Referral
         if (empty($user->refer_by)) {
             try {
                 $this->processReferral($user, $request->refer_by);
             } catch (\Exception $e) {
                // do nothing
             }
         }

         // Update UserKyc
         $kyc = UserKyc::firstOrNew(['user_id' => $user->id]);
         $kyc->account_number  = $request->account_number;
         $kyc->ifsc_code       = $request->ifsc_code;
         $kyc->bank_name       = $request->bank_name; // Optional
         $kyc->branch          = $request->branch;    // Optional
         $kyc->aadhar_number   = $request->aadhaar_number;
         $kyc->save();

         // Update User Status
         $user->status = 1;
         $user->save();

         // Refresh role name and logo in case referral changed them
         $role = DB::table('roles')->where('id', $user->role)->first();
         $user->role_name = $role->name ?? 'Unknown';
         $admin = User::where('mid', $user->admin_mid)->first();
         $settings = DB::table('settings')->where('user_id', $admin?->id)->select('logo')->first();
         $user->logo = $settings->logo ?? 'https://enexa.in/images/enexa-logo-mix-white.png';

         return response()->json([
             'status' => 1,
             'message' => 'Onboarding Completed',
             'user' => $user
         ]);
    }

    /**
     * Send email verification OTP for onboarding
     */
    public function sendEmailOtp(Request $request) {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = auth()->user();
        if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);

        $email = $request->email;

        // Check if email is already taken by another user
        $existing = User::where('email', $email)->where('id', '!=', $user->id)->first();
        if ($existing) {
            return response()->json([
                'status' => 0,
                'message' => 'This email is already registered. Please use another email.'
            ]);
        }

        $otp = rand(100000, 999999);
        $subject = 'Email Verification OTP';

        // Try admin SMTP first, fallback to default
        $adminId = 1;
        if (!empty($user->admin_mid)) {
            $admin = User::where('mid', $user->admin_mid)->first();
            if ($admin) {
                $setting = Setting::where('user_id', $admin->id)->first();
                if ($setting && !empty($setting->smtp_password)) {
                    $adminId = $admin->id;
                }
            }
        }

        $messageRow = getMessageRow('VerificationOTP', $adminId);
        if (!$messageRow) {
            return response()->json([
                'status' => 0,
                'message' => 'Email template not configured. Please contact support.'
            ]);
        }

        $messageTemplate = $messageRow->message;
        eval("\$message = \"$messageTemplate\";");

        try {
            sentMail($email, $subject, $adminId, $message);
        } catch (\Exception $e) {
            Log::error('Failed to send email OTP', ['email' => $email, 'error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to send OTP email. Please try again.'
            ]);
        }

        // Store OTP (reuse otps table — mobile column stores email)
        DB::table('otps')->where('mobile', $email)->delete();
        DB::table('otps')->insert([
            'mobile'     => $email,
            'otp'        => $otp,
            'verified'   => 0,
            'created_at' => now(),
        ]);

        return response()->json([
            'status' => 1,
            'message' => 'Verification OTP sent to ' . $email
        ]);
    }

    /**
     * Verify email OTP for onboarding
     */
    public function verifyEmailOtp(Request $request) {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|digits:6',
        ]);

        $user = auth()->user();
        if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);

        $otpData = DB::table('otps')->where('mobile', $request->email)->first();

        if (!$otpData) {
            return response()->json([
                'status' => 0,
                'message' => 'OTP expired. Please request a new one.'
            ]);
        }

        // Check OTP expiry (10 minutes)
        if ($otpData->created_at && Carbon::parse($otpData->created_at)->diffInMinutes(now()) > 10) {
            DB::table('otps')->where('mobile', $request->email)->delete();
            return response()->json([
                'status' => 0,
                'message' => 'OTP expired. Please request a new one.'
            ]);
        }

        if ($otpData->otp != $request->otp) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid OTP. Please try again.'
            ]);
        }

        // Mark OTP as verified (don't delete — completeOnboarding checks this)
        DB::table('otps')->where('mobile', $request->email)->update(['verified' => 1]);

        return response()->json([
            'status' => 1,
            'message' => 'Email verified successfully'
        ]);
    }


    /**
     * Process referral code to update user hierarchy
     */
    protected function processReferral(User $user, string $referBy)
    {
        $referUser = User::where('mid', $referBy)->first();
        if (!$referUser) {
            return; // Invalid referral code, do nothing
        }

        $adminUser = User::where('mid', $referUser->admin_mid)->first();
        if (!$adminUser) {
            return;
        }

        // Current role of referUser
        $refferRole = Role::where('id', $referUser->role)
            ->where('status', 1)
            ->where('user_id', $adminUser->id)
            ->first();

        if ($refferRole) {
            // Check if big role exist (guest level + 1)
            $newGuestLevel = $refferRole->guest + 1;
            $bigRole = Role::where('status', 1)
                ->where('user_id', $adminUser->id)
                ->where('guest', $newGuestLevel)
                ->first();

            if ($bigRole) {
                // Guest -> Big role exists
                $newRole = $bigRole->id;
                $root = $referUser->root ? ($referUser->root . ',' . $referUser->id) : (',' . $referUser->id);
            } else {
                // Big role does not exist -> same role (fallback logic from AuthController)
                $newRole = $referUser->role;
                $root = $referUser->root;
            }

            $user->admin_mid = $referUser->admin_mid;
            $user->role = $newRole;
            $user->root = $root;
            $user->refer_by = $referBy; // Ensure refer_by is saved
            $user->save();

            // Update Account created_by to referrer's ID
            $account = Account::where('user_id', $user->id)->first();
            if ($account) {
                $account->created_by = $referUser->id;
                $account->save();
            }
        }
    }

    /**
     * Get user profile from DigiLocker (for authenticated users)
     */
    public function getUserProfile(Request $request)
    {
        try {
            $user = $request->get('user');
            $kyc = UserKyc::where('user_id', $user->id)->first();

            if (!$kyc || !$kyc->digilocker_access_token) {
                return response()->json([
                    'status' => 0,
                    'message' => 'DigiLocker not linked to this account',
                ], 400);
            }

            // Check if token is expired
            if ($kyc->digilocker_token_expires_at && $kyc->digilocker_token_expires_at < now()) {
                // Try to refresh token
                if ($kyc->digilocker_refresh_token) {
                    $refreshResult = $this->digiLockerService->refreshAccessToken($kyc->digilocker_refresh_token);
                    if ($refreshResult['success']) {
                        $kyc->update([
                            'digilocker_access_token' => $refreshResult['data']['access_token'],
                            'digilocker_refresh_token' => $refreshResult['data']['refresh_token'] ?? $kyc->digilocker_refresh_token,
                            'digilocker_token_expires_at' => now()->addSeconds($refreshResult['data']['expires_in'] ?? 3600),
                        ]);
                    } else {
                        return response()->json([
                            'status' => 0,
                            'message' => 'DigiLocker session expired. Please re-authenticate.',
                        ], 401);
                    }
                }
            }

            // Get user details from DigiLocker
            $userResult = $this->digiLockerService->getUserDetails($kyc->digilocker_access_token);

            if (!$userResult['success']) {
                return response()->json([
                    'status' => 0,
                    'message' => $userResult['error_description'],
                ], 400);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Profile fetched successfully',
                'data' => $userResult['data'],
            ]);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'DigiLocker_getUserProfile', $e, [
                'api' => 'DigiLocker Profile API',
                'context' => 'Get User Profile from DigiLocker',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch profile',
                'ref_id' => $refId,
            ], 500);
        }
    }

    /**
     * Refresh DigiLocker token
     */
    public function refreshToken(Request $request)
    {
        try {
            $user = $request->get('user');
            $kyc = UserKyc::where('user_id', $user->id)->first();

            if (!$kyc || !$kyc->digilocker_refresh_token) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No refresh token available',
                ], 400);
            }

            $result = $this->digiLockerService->refreshAccessToken($kyc->digilocker_refresh_token);

            if (!$result['success']) {
                return response()->json([
                    'status' => 0,
                    'message' => $result['error_description'],
                ], 400);
            }

            $kyc->update([
                'digilocker_access_token' => $result['data']['access_token'],
                'digilocker_refresh_token' => $result['data']['refresh_token'] ?? $kyc->digilocker_refresh_token,
                'digilocker_token_expires_at' => now()->addSeconds($result['data']['expires_in'] ?? 3600),
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Token refreshed successfully',
            ]);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'DigiLocker_refreshToken', $e, [
                'api' => 'DigiLocker Token Refresh',
                'context' => 'Refresh DigiLocker Access Token',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to refresh token',
                'ref_id' => $refId,
            ], 500);
        }
    }

    // Helper: Assign user_role_permission and user_role_commission from role templates
    protected function assignRolePermissionsAndCommissions($userId, $roleId)
    {
        // Assign Permissions
        $rolePermissions = DB::table('role_module_permissions')->where('role_id', $roleId)->get();
        foreach ($rolePermissions as $perm) {
            DB::table('user_role_permissions')->insert([
                'user_id' => $userId,
                'role_id' => $roleId,
                'main_module_id' => $perm->main_module_id,
                'module_id' => $perm->module_id,
                'sub_module_id' => $perm->sub_module_id,
                'permission_id' => $perm->permission_id,
            ]);
        }
        // Assign Commissions
        $roleCommissions = DB::table('role_module_commission')->where('role_id', $roleId)->get();
        foreach ($roleCommissions as $comm) {
            DB::table('user_role_commissions')->insert([
                'user_id' => $userId,
                'role_id' => $roleId,
                'main_module_id' => $comm->main_module_id,
                'module_id' => $comm->module_id,
                'sub_module_id' => $comm->sub_module_id,
                'commission_id' => $comm->commission_id,
            ]);
        }
    }
}