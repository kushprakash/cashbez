<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserKyc;
use App\Models\AepsDraft;
use Illuminate\Http\Request;
use App\Models\Beneficiary;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use DB;
use App\Services\CatchLogService;

class KycController extends Controller
{
    /**
     * Get KYC status for a user (existing method - kept for compatibility)
     */
    public function getKycStatus(Request $request)
    {
        try {
            $user = $request->get('user');
            $admin = $request->get('admin');

            $kyc = UserKyc::where('user_id', $user->id)->first();

            if (!$kyc) {
                $kyc = UserKyc::create(['user_id' => $user->id]);
            }

            // Get AEPS status
            $aepsDraft = AepsDraft::where('mid', $user->mid)->select('aeps_status')->first();

            return response()->json([
                'status' => 1,
                'kyc' => $kyc,
                'aeps_status' => $aepsDraft ? $aepsDraft->aeps_status : null,
                'user_role' => $user->role,
                'is_corporate' => $user->role == 2,
                'digilocker_linked' => !empty($kyc->digilocker_id),
                'refer_by' => $user->refer_by ?? '',
            ]);
        }
        catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'DigiLocker_getKycStatus', $e, [
                'api' => 'DigiLocker KYC Status',
                'context' => 'Get KYC Status with DigiLocker',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Something went wrong',
                'ref_id' => $refId,
                'data' => null
            ], 500);
        }
    }


    /**
     * Send OTP for Aadhaar verification
     */
    public function sendAadhaarOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'aadhar_number' => 'required|string|size:12',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first()
            ]);
        }
        //test
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
        }

        // aadhar check for unique aadhar every time
        $aadharExists = UserKyc::where('aadhar_number', $request->aadhar_number)->where('user_id', '!=', $user->id)->exists();
        if ($aadharExists) {
            return response()->json([
                'status' => 0,
                'message' => 'Aadhar number already exists'
            ]);
        }

        try {
            $admin = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$admin) {
                return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
            }
      
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url(''). '/api/v2/verify/aadhar-send-otp',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode([
                    "aadhaar_number" => $request->aadhar_number
                ]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . $admin->mid,
                    'mkey: ' . $admin->mkey
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);
            
            $rj = json_decode($response, true);
            
            if (isset($rj['status']) && $rj['status'] == 1) {

                return response()->json([
                    'status' => 1,
                    'message' => 'OTP sent successfully',
                    'txnid' => $rj['data']['request_id'] ?? '',
                    'otp_sent' => true
                ]);
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => $rj['message'] ?? 'Technical Issue Try again',
                    'txnid' => '',
                    'otp_sent' => false,
                    'data'=>$response
                ]);
            }
        }
        catch (\Exception $e) {
            Log::error('Aadhaar OTP Error: ' . $e->getMessage());
            CatchLogService::logException($request, 'sendAadhaarOtp', $e, [
                'context' => 'Aadhaar OTP Send Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to send OTP'
            ]);
        }
    }

    /**
     * Verify Aadhaar OTP and get user data
     */
    public function verifyAadhaarOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'otp' => 'required|string|size:6',
            'txnid' => 'required',
            'aadhar_number' => 'required|string|size:12',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first()
            ]);
        }




        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
        }

        // aadhar check for unique aadhar every time
        $aadharExists = UserKyc::where('aadhar_number', $request->aadhar_number)->where('user_id', '!=', $user->id)->exists();
        if ($aadharExists) {
            return response()->json([
                'status' => 0,
                'message' => 'Aadhar number already exists'
            ]);
        }


        try {
            $admin = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$admin) {
                return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
            }

            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url(''). '/api/v2/verify/aadhaar-verify-otp',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode([
                    "otp" => $request->otp,
                    "refid" => $request->txnid
                ]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . $admin->mid,
                    'mkey: ' . $admin->mkey
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);
            $rj = json_decode($response, true);

            if (isset($rj['status']) && $rj['status'] == 1) {
                $aadhaarInfo = $rj['data'];

                // Update or create KYC record
                $kyc = UserKyc::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'aadhar_number' => $request->aadhar_number,
                        'country' => $aadhaarInfo['split_address']['country'] ?? null,
                        'dist' => $aadhaarInfo['split_address']['dist'] ?? null,
                        'house' => $aadhaarInfo['split_address']['house'] ?? null,
                        'landmark' => $aadhaarInfo['split_address']['landmark'] ?? null,
                        'pincode' => $aadhaarInfo['split_address']['pincode'] ?? null,
                        'po' => $aadhaarInfo['split_address']['po'] ?? null,
                        'state' => $aadhaarInfo['split_address']['state'] ?? null,
                        'street' => $aadhaarInfo['split_address']['street'] ?? null,
                        'subdist' => $aadhaarInfo['split_address']['subdist'] ?? null,
                        'vtc' => $aadhaarInfo['split_address']['vtc'] ?? null,
                        'dob' => isset($aadhaarInfo['dob']) ? \Carbon\Carbon::createFromFormat('d-m-Y', $aadhaarInfo['dob'])->format('Y-m-d') : null,
                        'gender' => $aadhaarInfo['gender'] ?? null,
                        'name' => $aadhaarInfo['name'] ?? null,
                        'photo' => isset($aadhaarInfo['photo']) && strpos($aadhaarInfo['photo'], 'data:image') === false ? 'data:image/png;base64,' . $aadhaarInfo['photo'] : ($aadhaarInfo['photo'] ?? null),
                        'response_aadhar' => json_encode([
                            'status' => 1,
                            'message' => 'Success',
                            'data' => $rj['data']
                        ]),
                        'aadhar_verified' => true
                    ]
                );

                return response()->json([
                    'status' => 1,
                    'message' => 'Aadhaar verified successfully',
                    'kyc' => $kyc,
                    'aadhaar_data' => [
                        'name' => $aadhaarInfo['name'] ?? null,
                        'dob' => $aadhaarInfo['dob'] ?? null,
                        'gender' => $aadhaarInfo['gender'] ?? null,
                        'address' => $aadhaarInfo['address'] ?? null,
                        'state' => $aadhaarInfo['split_address']['state'] ?? null,
                        'pincode' => $aadhaarInfo['split_address']['pincode'] ?? null
                    ]
                ]);
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => $rj['message'] ?? 'Technical Issue try again..'
                ]);
            }
        }
        catch (\Exception $e) {
            Log::error('Aadhaar Verification Error: ' . $e->getMessage());
            CatchLogService::logException($request, 'verifyAadhaarOtp', $e, [
                'context' => 'Aadhaar OTP Verification Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Verification failed'
            ]);
        }
    }

    /**
     * Verify PAN number
     */
    public function verifyPan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pan_number' => 'required|string|size:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first()
            ]);
        }

        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
        }

        // pan check for unique pan every time
        $panExists = UserKyc::where('pan_number', $request->pan_number)->where('user_id', '!=', $user->id)->exists();
        if ($panExists) {
            return response()->json([
                'status' => 0,
                'message' => 'PAN number already exists'
            ]);
        }

        try {
            $kyc = UserKyc::where('user_id', $user->id)->first();
            $admin = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$admin) {
                return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
            }

            
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url(''). '/api/v2/verify/pan',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode(["pan_number" => $request->pan_number]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . $admin->mid,
                    'mkey: ' . $admin->mkey
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);
            $rj = json_decode($response, true);

            if (isset($rj['status']) && $rj['status'] == 1) {
                $panData = $rj['data'];
                $name = $kyc->name;
                $name = str_replace(' ', '', strtoupper($name));

                $name1 = str_replace(' ', '', strtoupper($panData['RegisteredName'] ?? ''));

                if ($name1 == $name) {
                    $panResponse = [
                        'status' => 'SUCCESS',
                        'pan_number' => $request->pan_number,
                        'name' => $panData['RegisteredName'],
                        'valid' => true
                    ];

                    if ($kyc) {
                        $kyc->update([
                            'pan_number' => $request->pan_number,
                            'response_pan' => json_encode([
                                'status' => 1,
                                'message' => 'Success',
                                'data' => $panData
                            ]),
                            'pan_verified' => true
                        ]);
                    }

                    return response()->json([
                        'status' => 1,
                        'message' => 'PAN verified successfully',
                        'pan_data' => $panResponse
                    ]);
                } elseif ($name1 == '') {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Pan not verified. Name mismatch.',
                        'refid' => ''
                    ]);
                } else {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Pan not verified. Details mismatch.',
                        'refid' => ''
                    ]);
                }
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => $rj['message'] ?? 'NSDL Server Down. try again..',
                    'data'=>$rj
                ]);
            }
        }
        catch (\Exception $e) {
            Log::error('PAN Verification Error: ' . $e->getMessage());
            CatchLogService::logException($request, 'verifyPan', $e, [
                'context' => 'PAN Verification Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'PAN verification failed'
            ]);
        }
    }

    /**
     * Verify bank account
     */
    public function verifyBankAccount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'account_number' => 'required|string',
            'ifsc_code' => 'required|string|size:11',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first()
            ]);
        }

        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
        }

        $admin = User::where('mid', $user->admin_mid)->first();
        if (!$admin) {
            return response()->json(['status' => 0, 'message' => 'Invalid Admin'], 401);
        }

        try {
            $kyc = UserKyc::where('user_id', $user->id)->first();
            $admin = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$admin) {
                return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
            }

            
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url(''). '/api/v2/verify/bank-account',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode([
                    "accountno" => $request->account_number,
                    "ifsccode" => $request->ifsc_code
                ]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . $admin->mid,
                    'mkey: ' . $admin->mkey
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);
            $rj = json_decode($response, true);

            if (isset($rj['status']) && $rj['status'] == 1) {
                $bankData = $rj['data'];
                $accountName = $bankData['AccountName'] ?? '';
                $prefixes = [
                    'Mr. ', 'MR. ', 'Mr ', 'MR ',
                    'Mrs. ', 'MRS. ', 'Mrs ', 'MRS ',
                    'Ms. ', 'MS. ', 'Ms ', 'MS ',
                    'Miss ', 'MISS ',
                    'Shri. ', 'SHRI. ', 'Shri ', 'SHRI ',
                    'Sri. ', 'SRI. ', 'Sri ', 'SRI ',
                    'Smt. ', 'SMT. ', 'Smt ', 'SMT ',
                    'Dr. ', 'DR. ', 'Prof. ', 'PROF. ',
                    'Mx. ', 'Master ', 'MASTER '
                ];
                $cleanAccountName = str_ireplace($prefixes, '', $accountName);
                
                $name = $kyc->name;
                $name = str_replace(' ', '', strtoupper($name));
                $name1 = str_replace(' ', '', strtoupper($cleanAccountName));

                if ($name1 == $name) {
                    $bankResponse = [
                        'status' => 'SUCCESS',
                        'account_number' => $request->account_number,
                        'ifsc_code' => $request->ifsc_code,
                        'bank_name' => $bankData['bank_name'] ?? '',
                        'branch' => $bankData['branch'] ?? '',
                        'account_holder_name' => $cleanAccountName,
                        'valid' => true
                    ];

                    if ($kyc) {
                        $kyc->update([
                            'account_number' => $request->account_number,
                            'ifsc_code' => $request->ifsc_code,
                            'bank_name' => $bankResponse['bank_name'],
                            'branch' => $bankResponse['branch'],
                            'response_account' => json_encode([
                                'status' => 1,
                                'message' => 'Success',
                                'data' => $bankData
                            ]),
                            'account_verified' => true
                        ]);

                        if ($kyc->isBasicKycComplete() || $kyc->isFullKycComplete()) {
                            $kyc->update([
                                'kyc_completed' => true,
                                'verified_at' => now()
                            ]);
                        }
                    }

                    $beneficiaryData = [
                        'user_id' => $user->id,
                        'name' => $kyc->name,
                        'mobile' => $kyc->phone,
                        'account' => $request->account_number,
                        'ifsc' => $request->ifsc_code,
                        'bank' => $bankResponse['bank_name'],
                        'branch' => $bankResponse['branch'],
                        'type' => 3,
                        'status' => 1,
                        'admin_id' => $admin->id,
                        'created_by' => $user->id,
                        'ifsc_verified' => 1,
                        'account_verified' => 1,
                        'verification_data' => json_encode([
                            'account_data' => $rj,
                            'verified_at' => now()->toISOString()
                        ])
                    ];
                    Beneficiary::create($beneficiaryData);

                    return response()->json([
                        'status' => 1,
                        'message' => 'Bank account verified successfully',
                        'bank_data' => $bankResponse
                    ]);
                } elseif ($name1 == '') {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Account not verified. Name mismatch.',
                        'refid' => ''
                    ]);
                } else {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Account name is ' . $cleanAccountName . ' & ' . "\n" . '  Aadhar name is ' . $name,
                        'refid' => ''
                    ]);
                }
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => $rj['message'] ?? 'Bank verification failed',
                    'refid' => ''
                ]);
            }
        }
        catch (\Exception $e) {
            Log::error('Bank Account Verification Error: ' . $e->getMessage());
            CatchLogService::logException($request, 'verifyBankAccount', $e, [
                'context' => 'Bank Account Verification Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Bank account verification failed'
            ]);
        }
    }

    /**
     * Update corporate KYC details
     */
    public function updateCorporateKyc(Request $request)
    {
        $user = $request->get('user');
        $admin = $request->get('admin');

        $validator = Validator::make($request->all(), [
            'authorized_signatory' => 'required|array',
            'authorized_signatory.*.name' => 'required|string',
            'authorized_signatory.*.mobile' => 'required|string',
            'authorized_signatory.*.email' => 'required|email',
            'authorized_signatory.*.aadhaarNumber' => 'required|string',
            'bank_details' => 'required|array',
            'bank_details.bankName' => 'required|string',
            'bank_details.accountNumber' => 'required|string',
            'bank_details.ifsc' => 'required|string',
            'bank_details.branch' => 'required|string',
            'business_details' => 'required|array',
            'business_details.type' => 'required|string',
            'business_details.name' => 'required|string',
            'business_details.gstin' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first()
            ]);
        }


        if ($user->role != 2) {
            return response()->json([
                'status' => 0,
                'message' => 'Corporate KYC is only available for corporate users'
            ]);
        }

        try {
            $kyc = UserKyc::where('user_id', $user->id)->first();
            if (!$kyc) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Please complete basic KYC first'
                ]);
            }

            $kyc->update([
                'authorized_signatory' => $request->authorized_signatory,
                'bank_details' => $request->bank_details,
                'business_details' => $request->business_details
            ]);

            // Check if corporate KYC is complete
            if ($kyc->isCorporateKycComplete()) {
                $kyc->update([
                    'kyc_completed' => true,
                    'verified_at' => now()
                ]);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Corporate KYC updated successfully',
                'kyc' => $kyc
            ]);
        }
        catch (\Exception $e) {
            Log::error('Corporate KYC Update Error: ' . $e->getMessage());
            CatchLogService::logException($request, 'updateCorporateKyc', $e, [
                'context' => 'Corporate KYC Update Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update corporate KYC'
            ]);
        }
    }

    /**
     * Get KYC details for admin view
     */
    public function getKycDetails($userId)
    {
        $user = User::with(['kyc', 'employee'])->find($userId);
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'User not found'
            ]);
        }

        return response()->json([
            'status' => 1,
            'user' => $user,
            'kyc' => $user->kyc
        ]);
    }

    // =====================================================
    // MANUAL KYC - Authorization Gate
    // Only role=1 or user_id=21 can access manual KYC
    // =====================================================

    private function isManualKycAuthorized(Request $request)
    {
        $user = $request->get('user');
        if (!$user)
            return false;
        return ($user->role == 1 || $user->id == 21);
    }

    private function unauthorizedResponse()
    {
        return response()->json([
            'status' => 0,
            'message' => 'Unauthorized: Manual KYC access restricted'
        ], 403);
    }

    // =====================================================
    // MANUAL KYC - Gorter API Helpers (Mode 2)
    // Hit API directly, return raw data for admin review
    // =====================================================


    /**
     * Helper: Send Aadhaar OTP via Gorter (no uniqueness check, admin use)
     */
    public function helperVerifyAadhaar(Request $request)
    {
        if (!$this->isManualKycAuthorized($request))
            return $this->unauthorizedResponse();

        $validator = Validator::make($request->all(), [
            'aadhar_number' => 'required|string|size:12',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()]);
        }

        try {
            $mid = "G195064846";
            $mkey = "PRA3948146";
            $wallet = "G53BD90U9F612K83574F1";
            $txnid = rand(11111111, 99999999);
            $aadhaarno = $request->aadhar_number;

            $url = "https://dashboard.goterpay.com/api/v3/verification/aadhaarotp?mid=$mid&mkey=$mkey&subwallet=$wallet&txnid=$txnid&aadhaarno=$aadhaarno";

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            curl_close($ch);

            if (empty($response)) {
                return response()->json(['status' => 0, 'message' => 'Aadhaar server down']);
            }

            $rj = json_decode($response, true);

            if (isset($rj['status']) && $rj['status'] == 'SUCCESS') {

                return response()->json([
                    'status' => 1,
                    'message' => 'OTP sent successfully',
                    'txnid' => $rj['refid'],
                    'otp_sent' => true
                ]);
            }
            else {
                return response()->json([
                    'status' => 0,
                    'message' => $rj['resText'] ?? 'Failed to send OTP'
                ]);
            }
        }
        catch (\Exception $e) {
            Log::error('Helper Aadhaar OTP Error: ' . $e->getMessage());
            return response()->json(['status' => 0, 'message' => 'Failed to send OTP']);
        }
    }


    public function helperVerifyAadhaarOtp(Request $request)
    {
        if (!$this->isManualKycAuthorized($request))
            return $this->unauthorizedResponse();

        $validator = Validator::make($request->all(), [
            'otp' => 'required|string|size:6',
            'txnid' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()]);
        }

        try {
            $user = $request->get('user');
            $admin = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$admin) {
                return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
            }

            
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url(''). '/api/v2/verify/aadhaar-verify-otp',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode([
                    "otp" => $request->otp,
                    "refid" => $request->txnid
                ]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . $admin->mid,
                    'mkey: ' . $admin->mkey
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);
            $rj = json_decode($response, true);

            if (isset($rj['status']) && $rj['status'] == 1) {

                // Return raw data for admin to review — DO NOT save to KYC
                return response()->json([
                    'status' => 1,
                    'message' => 'Aadhaar data fetched successfully',
                    'aadhaar_data' => [
                        'name' => $rj['data']['name'] ?? '',
                        'dob' => $rj['data']['dob'] ?? '',
                        'gender' => $rj['data']['gender'] ?? '',
                        'mobile' => $rj['data']['mobile'] ?? '',
                        'email' => $rj['data']['email'] ?? '',
                        'photo' => isset($rj['data']['photo']) && strpos($rj['data']['photo'], 'data:image') === false ? 'data:image/png;base64,' . $rj['data']['photo'] : ($rj['data']['photo'] ?? ''),
                        'address' => $rj['data']['address'] ?? '',
                        'country' => $rj['data']['split_address']['country'] ?? '',
                        'dist' => $rj['data']['split_address']['dist'] ?? '',
                        'house' => $rj['data']['split_address']['house'] ?? '',
                        'landmark' => $rj['data']['split_address']['landmark'] ?? '',
                        'pincode' => $rj['data']['split_address']['pincode'] ?? '',
                        'po' => $rj['data']['split_address']['po'] ?? '',
                        'state' => $rj['data']['split_address']['state'] ?? '',
                        'street' => $rj['data']['split_address']['street'] ?? '',
                        'subdist' => $rj['data']['split_address']['subdist'] ?? '',
                        'vtc' => $rj['data']['split_address']['vtc'] ?? '',
                    ],
                    'raw_response' => $rj
                ]);
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => $rj['message'] ?? 'Verification failed'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Helper Aadhaar Verify Error: ' . $e->getMessage());
            return response()->json(['status' => 0, 'message' => 'Verification failed']);
        }
    }


    public function helperVerifyPan(Request $request)
    {
        if (!$this->isManualKycAuthorized($request))
            return $this->unauthorizedResponse();

        $validator = Validator::make($request->all(), [
            'pan_number' => 'required|string|size:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()]);
        }

        try {
            $user = $request->get('user');
            $admin = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$admin) {
                return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
            }

            
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url(''). '/api/v2/verify/pan',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode(["pan_number" => $request->pan_number]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . $admin->mid,
                    'mkey: ' . $admin->mkey
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);
            $rj = json_decode($response, true);

            if (isset($rj['status']) && $rj['status'] == 1) {
                $panData = $rj['data'];

                return response()->json([
                    'status' => 1,
                    'message' => 'PAN data fetched successfully',
                    'pan_data' => [
                        'pan_number' => $panData['pan'] ?? $request->pan_number,
                        'registered_name' => $panData['RegisteredName'] ?? '',
                        'father_name' => $panData['FatherName'] ?? '',
                        'type' => $panData['type'] ?? '',
                    ],
                    'raw_response' => $rj
                ]);
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => $rj['message'] ?? 'PAN verification failed'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Helper PAN Verify Error: ' . $e->getMessage());
            return response()->json(['status' => 0, 'message' => 'PAN verification failed']);
        }
    }

    public function helperVerifyBankAccount(Request $request)
    {
        if (!$this->isManualKycAuthorized($request))
            return $this->unauthorizedResponse();

        $validator = Validator::make($request->all(), [
            'account_number' => 'required|string',
            'ifsc_code' => 'required|string|size:11',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()]);
        }

        try {
            $user = $request->get('user');
            $admin = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$admin) {
                return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
            }

            
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url(''). '/api/v2/verify/bank-account',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode([
                    "accountno" => $request->account_number,
                    "ifsccode" => $request->ifsc_code
                ]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . $admin->mid,
                    'mkey: ' . $admin->mkey
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);
            $rj = json_decode($response, true);

            if (isset($rj['status']) && $rj['status'] == 1) {
                $bankData = $rj['data'];
                $accountno = $request->account_number;
                $ifsccode = $request->ifsc_code;
                $txnid = $bankData['txnid'] ?? rand(11111111, 99999999);

                return response()->json([
                    'status' => 1,
                    'message' => 'Bank data fetched successfully',
                    'bank_data' => [
                        'account_number' => $bankData['AccountNumber'] ?? $accountno,
                        'account_name' => $bankData['AccountName'] ?? '',
                        'account_status' => $bankData['accountStatus'] ?? '',
                        'bank_name' => $bankData['bank_name'] ?? '',
                        'branch' => $bankData['branch'] ?? '',
                        'city' => $bankData['city'] ?? '',
                        'ifsc_code' => $ifsccode,
                    ],
                    'raw_response' => $rj
                ]);
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => $rj['message'] ?? 'Bank verification failed'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Helper Bank Verify Error: ' . $e->getMessage());
            return response()->json(['status' => 0, 'message' => 'Bank verification failed']);
        }
    }

    // =====================================================
    // MANUAL KYC - Save Endpoints (Mode 2 & 3)
    // Save form data + auto-generate JSON response
    // =====================================================

    /**
     * Manual Save: Aadhaar verification data
     */
    public function manualSaveAadhaar(Request $request)
    {
        if (!$this->isManualKycAuthorized($request))
            return $this->unauthorizedResponse();

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'aadhar_number' => 'required|string|size:12',
            'name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()]);
        }

        try {
            $txnid = rand(11111111, 99999999);

            // Auto-generate response_aadhar JSON in Gorter format
            $responseAadhar = [
                'status' => 1,
                'message' => 'Success',
                'data' => [
                    'txnid' => (string)$txnid,
                    'status' => 'SUCCESS',
                    'refid' => (string)rand(11111111, 99999999),
                    'address' => trim(implode(', ', array_filter([
                        $request->landmark, $request->vtc, $request->subdist,
                        $request->dist, $request->state, $request->country, $request->pincode
                    ]))),
                    'split_address' => [
                        'country' => $request->country ?? '',
                        'dist' => $request->dist ?? '',
                        'house' => $request->house ?? '',
                        'landmark' => $request->landmark ?? '',
                        'pincode' => $request->pincode ?? '',
                        'po' => $request->po ?? '',
                        'state' => $request->state ?? '',
                        'street' => $request->street ?? '',
                        'subdist' => $request->subdist ?? '',
                        'vtc' => $request->vtc ?? '',
                    ],
                    'dob' => $request->dob ?? '',
                    'mobile' => $request->mobile ?? '',
                    'gender' => $request->gender ?? '',
                    'email' => $request->email ?? '',
                    'name' => $request->name ?? '',
                    'photo' => '',
                    'Fees' => '0.00',
                    'Bal' => 0,
                    'resText' => 'Manual Verification by Admin'
                ]
            ];

            // Parse DOB for storage
            $dobFormatted = null;
            if ($request->dob) {
                try {
                    $dobFormatted = \Carbon\Carbon::createFromFormat('d-m-Y', $request->dob)->format('Y-m-d');
                }
                catch (\Exception $e) {
                    $dobFormatted = $request->dob; // store as-is if parsing fails
                }
            }

            $kyc = UserKyc::updateOrCreate(
            ['user_id' => $request->user_id],
            [
                'aadhar_number' => $request->aadhar_number,
                'name' => $request->name,
                'dob' => $dobFormatted,
                'gender' => $request->gender,
                'mobile' => $request->mobile,
                'email' => $request->email,
                'country' => $request->country,
                'dist' => $request->dist,
                'house' => $request->house,
                'landmark' => $request->landmark,
                'pincode' => $request->pincode,
                'po' => $request->po,
                'state' => $request->state,
                'street' => $request->street,
                'subdist' => $request->subdist,
                'vtc' => $request->vtc,
                'photo' => $request->photo ?? null,
                'response_aadhar' => json_encode($responseAadhar),
                'aadhar_verified' => true,
            ]
            );

            return response()->json([
                'status' => 1,
                'message' => 'Aadhaar verified manually',
                'kyc' => $kyc,
                'generated_json' => $responseAadhar
            ]);
        }
        catch (\Exception $e) {
            Log::error('Manual Aadhaar Save Error: ' . $e->getMessage());
            return response()->json(['status' => 0, 'message' => 'Failed to save Aadhaar data']);
        }
    }

    /**
     * Manual Save: PAN verification data
     */
    public function manualSavePan(Request $request)
    {
        if (!$this->isManualKycAuthorized($request))
            return $this->unauthorizedResponse();

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'pan_number' => 'required|string|size:10',
            'registered_name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()]);
        }

        try {
            $txnid = rand(11111111, 99999999);

            // Auto-generate response_pan JSON in Gorter format
            $responsePan = [
                'status' => 1,
                'message' => 'Success',
                'data' => [
                    'Txnid' => (string)$txnid,
                    'status' => 'SUCCESS',
                    'pan' => strtoupper($request->pan_number),
                    'RegisteredName' => $request->registered_name,
                    'FatherName' => $request->father_name ?? '',
                    'type' => $request->type ?? 'Individual',
                    'Fees' => '0.00',
                    'Bal' => '0',
                    'resText' => 'Manual Verification by Admin'
                ]
            ];

            $kyc = UserKyc::updateOrCreate(
            ['user_id' => $request->user_id],
            [
                'pan_number' => strtoupper($request->pan_number),
                'response_pan' => json_encode($responsePan),
                'pan_verified' => true,
            ]
            );

            return response()->json([
                'status' => 1,
                'message' => 'PAN verified manually',
                'kyc' => $kyc,
                'generated_json' => $responsePan
            ]);
        }
        catch (\Exception $e) {
            Log::error('Manual PAN Save Error: ' . $e->getMessage());
            return response()->json(['status' => 0, 'message' => 'Failed to save PAN data']);
        }
    }

    /**
     * Manual Save: Bank Account verification data
     */
    public function manualSaveBank(Request $request)
    {
        if (!$this->isManualKycAuthorized($request))
            return $this->unauthorizedResponse();

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'account_number' => 'required|string',
            'ifsc_code' => 'required|string',
            'bank_name' => 'required|string',
            'branch' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()]);
        }

        try {
            $txnid = rand(11111111, 99999999);

            // Auto-generate response_account JSON in Gorter format
            $responseAccount = [
                'status' => 1,
                'message' => 'Success',
                'data' => [
                    'txnid' => (string)$txnid,
                    'status' => 'SUCCESS',
                    'AccountName' => $request->account_holder_name ?? '',
                    'AccountNumber' => $request->account_number,
                    'accountStatus' => 'VALID',
                    'bank_name' => $request->bank_name,
                    'utr' => (string)rand(100000000000, 999999999999),
                    'city' => $request->city ?? '',
                    'branch' => $request->branch,
                    'micr' => '',
                    'Fees' => '0.00',
                    'bal' => 0,
                    'resText' => 'Manual Verification by Admin'
                ]
            ];

            $kyc = UserKyc::updateOrCreate(
            ['user_id' => $request->user_id],
            [
                'account_number' => $request->account_number,
                'ifsc_code' => $request->ifsc_code,
                'bank_name' => $request->bank_name,
                'branch' => $request->branch,
                'response_account' => json_encode($responseAccount),
                'account_verified' => true,
            ]
            );

            // Check if KYC is complete
            if ($kyc->aadhar_verified && $kyc->pan_verified && $kyc->account_verified) {
                $kyc->update([
                    'kyc_completed' => true,
                    'verified_at' => now()
                ]);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Bank account verified manually',
                'kyc' => $kyc,
                'generated_json' => $responseAccount
            ]);
        }
        catch (\Exception $e) {
            Log::error('Manual Bank Save Error: ' . $e->getMessage());
            return response()->json(['status' => 0, 'message' => 'Failed to save bank data']);
        }
    }


    private function verifyIfsc($ifsc)
    {
        try {
            $url = "https://ifsc.razorpay.com/" . urlencode($ifsc);

            $response = Http::timeout(10)->get($url);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'verified' => true,
                    'branch' => $data['BRANCH'] ?? null,
                    'bank' => $data['BANK'] ?? null,
                    'city' => $data['CITY'] ?? null,
                    'district' => $data['DISTRICT'] ?? null,
                    'state' => $data['STATE'] ?? null,
                    'response' => $data
                ];
            }

            return [
                'verified' => false,
                'error' => 'Invalid IFSC code',
                'response' => $response->body()
            ];

        }
        catch (\Exception $e) {
            return [
                'verified' => false,
                'error' => $e->getMessage(),
                'response' => null
            ];
        }
    }
}
