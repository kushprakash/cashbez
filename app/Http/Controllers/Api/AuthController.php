<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\Mid;
use App\Models\AepsDraft;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Account;
use App\Models\Passbook;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Writer\SvgWriter;
use DB;
use Illuminate\Support\Facades\Http;


class AuthController extends Controller
{

    public function getAppRoles(Request $request)
    {
        $mid = $request->header('mid') ?? $request->input('mid');
        $mkey = $request->header('mkey') ?? $request->input('mkey');
        $user = User::where('mid', $mid)->where('mkey', $mkey)->first();
        $roles = Role::where('user_id', $user->id)->where('id', '!=', $user->role)->get();
        return response()->json(['status' => 1, 'roles' => $roles]);
    }
    // Send OTP
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mobile' => 'required|digits:10',
        ]);

       

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $user = User::where('mobile', $request->mobile)->first();


        if($request->hasHeader('platform')   && $request->header('platform') == 'app' && ($user->role!=10 || $user->role!=2) ) {
            return response()->json([
                'status' => 0,
                'message' => 'You are not allowed to login from app',
            ], 200);
        }

   
        $otp = rand(100000, 999999);
   
        $number = $request->mobile;

      

        if ($user) {
            if ($user->status == 0) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Your account is blocked. Contact support.',
                ]);
            }


            $admin = DB::table('users')->where('mid', $user->admin_mid)->first();
            $adminId = $admin->id ?? 1;

            if(isset($request->type) && $request->type != 'web') {


                    $brole = Role::where('status', 1)
                            ->where('user_id', $adminId)
                            ->orderBy('guest', 'desc')
                            ->first();

                if ($user->role != $brole->id || $user->role != 1 || $user->role != 2) {
                        return response()->json([
                            'status' => 0,
                            'message' => 'You are not allowed to login from this platform.',
                        ]);
                    }
                }


                $messageRow = getMessageRow("VerificationOTP", $adminId);
            if (!$messageRow) {
                return [
                    'status' => 0,
                    'message' => 'Message not sent due to Technical issue. Please contact the administrator.'
                ];
            }

                    $messageTemplate = $messageRow->message;
            eval("\$message = \"$messageTemplate\";");
            
            $res=sendSms($message, $adminId, $number,$messageRow->template_id);
        } else {

            $adminId = 1;
            $messageRow = getMessageRow("VerificationOTP", $adminId);
            if (!$messageRow) {
                return [
                    'status' => 0,
                    'message' => 'Message not sent due to Technical issue. Please contact the administrator.'
                ];
            }
                    $messageTemplate = $messageRow->message;
            eval("\$message = \"$messageTemplate\";");
           
            $res=sendSms($message, $adminId, $number,$messageRow->template_id);
           
        }

        DB::table('otps')->where('mobile', $request->mobile)->delete();
        DB::table('otps')->insert([
            'mobile' => $request->mobile,
            'otp' => $otp,
        ]);

        if ($user) {

            return response()->json([
                'status' => 2,
                'message' => 'OTP sent for login',
                'is_registered' => true,
                'sms_response' => $res ?? null
            ]);
        } else {

            return response()->json([
                'status' => 1,
                'message' => 'OTP sent for signup',
                'is_registered' => false
            ]);
        }
    }

    // Validate OTP (helper method)
    protected function validateOtp($mobile, $otp)
    {
        // $cachedOtp = Cache::get('otp_' . $mobile);

        $user2 = DB::table('otps')->where('mobile', $mobile)->first();
        if (!$user2) {
            return ['status' => 0, 'message' => 'OTP expired or not found'];
        } else {

            if ($user2->otp != $otp) {
                return ['status' => 0, 'message' => 'Invalid OTP'];
            }
            DB::table('otps')->where('mobile', $mobile)->delete();
            return ['status' => 1, 'message' => 'OTP valid'];
        }



        return ['status' => 1, 'message' => 'OTP valid'];
    }


    // Verify OTP and login/signup
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mobile' => 'required|digits:10',
            'otp'    => 'required|digits:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }


        $user2 = DB::table('otps')->where('mobile', $request->mobile)->first();
        if (!$user2) {
            return ['status' => 0, 'message' => 'Invalid OTP'];
        } else {

            if ($user2->otp != $request->otp) {
                return ['status' => 0, 'message' => 'Invalid OTP'];
            }
        }

      

        // Find or create user
        $user1 = $user = User::where('mobile', $request->mobile)->first();

        if (!$user) {

            // Referral ID required
            if (empty($request->refer_by)) {
                return [
                    'status' => 0,
                    'message' => 'Please enter a referral ID.'
                ];
            }

            // Referral ID must exist
            $referUser = User::where('mid', $request->refer_by)->first();
            if (!$referUser) {
                return [
                    'status' => 0,
                    'message' => 'Referral ID not found. Please contact your senior or distributor.'
                ];
            }

            // Email must be unique
            $checkEmail = User::where('email', $request->email)->first();
            if ($checkEmail) {
                return [
                    'status' => 0,
                    'message' => 'This email is already registered. Please use another email.'
                ];
            }

            $defaultRole=null;

            $adminUser = User::where('mid', $referUser->admin_mid)->first();

            $refferRole = Role::where('id', $referUser->role)
                ->where('status', 1)
                ->where('user_id', $adminUser->id)
                ->first();


            if (!$refferRole) {
                return [
                    'status' => 0,
                    'message' => 'Please contact administrator. Refferer role not Defined'
                ];
            }
  

            if($referUser->mid==$referUser->admin_mid){


                $guestLevel = 1;
                $bigRole = Role::where('status', 1)
                    ->where('user_id', $referUser->id)
                    ->where('guest', $guestLevel)
                    ->first();

            
                $newRole = $bigRole->id;
                $root = $referUser->id;
                $admin_id = $referUser->mid;

            } else {
             
                $nextLevel = $refferRole->guest + 1;
                $bigRole = Role::where('status', 1)
                    ->where('user_id', $adminUser->id)
                    ->where('guest', $nextLevel)
                    ->first();

                if ($bigRole) {
                    $newRole = $bigRole->id;
                    $root = $referUser->root . ',' . $referUser->id;
                } else {
                    $newRole = $referUser->role;
                    $root = $referUser->root;
                }

                $admin_id = $referUser->admin_mid;

            }

          

    


            $lastUser = Mid::where('status', 0)->first();
            $nextMid = $lastUser->mid;
            $lastUser->markAsUsed();



            $user1 = User::create([
                'mid' => $nextMid,
                'mkey' => Str::random(32), 
                'admin_mid' => $admin_id, 
                'mobile' => $request->mobile,
                'name' => $request->name,
                'email' => $request->email ?? null,
                'role' => $newRole ?? null,
                'root' => $root ?? null,
                'refer_by' => $request->refer_by ?? null,
                'status' => 1,
                'password' => Hash::make($request->mobile), // Hash the mobile number as password
            ]);

            $account = Account::create([
                'user_id' => $user1->id,
                'name' => 'Utility Wallet',
                'number' => $request->mobile . date('ym') . rand(11, 99), // Example account number
                'upi' => $request->mobile . '-1@cbz', // Example UPI ID
                'mpin' => 1234, // Default MPIN
                'hold_amount' => 0,
                'created_by' => $user1->id,
                'admin_id' => $user1->id,
                'status' => 1,
                'primary_status' => false
            ]);

            $account = Account::create([
                'user_id' => $user1->id,
                'name' => 'Trade Wallet',
                'number' => $request->mobile . date('ym') . rand(11, 99), // Example account number
                'upi' => $request->mobile . '@cbz', // Example UPI ID
                'mpin' => 1234, // Default MPIN
                'hold_amount' => 0,
                'created_by' => $user1->id,
                'admin_id' => $user1->id,
                'status' => 1,
                'primary_status' => true
            ]);

            // Assign permissions and commissions from role template
            $this->assignRolePermissionsAndCommissions($user1->id, $user1->role);

            $number = $request->mobile;
            $name = $request->name; 
            $mid = $user1->mid; 
            $password = $request->mobile;
            $mpin ='1234';
            $toEmail=$request->email;
            $subject="Welcome to";

            $admin = DB::table('users')->where('mid', $user1->admin_mid)->first();
            if ($admin) {
                $adminId = $admin->id;
                $messageRow = getMessageRow("joining", $adminId);
                if (!$messageRow) {
                    return [
                        'status' => 0,
                        'message' => 'Message not sent due to Technical issue. Please contact the administrator.'
                    ];
                }

                $messageTemplate = $messageRow->message;
                eval("\$message = \"$messageTemplate\";");

                sendSms($message, $adminId, $number);
                sentMail($toEmail, $subject, $adminId, $message);
            } else {

                $adminId = 1;
                $messageRow = getMessageRow("joining", $adminId);
                if (!$messageRow) {
                    return [
                        'status' => 0,
                        'message' => 'Message not sent due to Technical issue. Please contact the administrator.'
                    ];
                }
                $messageTemplate = $messageRow->message;
                eval("\$message = \"$messageTemplate\";");

                sendSms($message, $adminId, $number);
                sentMail($toEmail, $subject, $adminId, $message);
            }
        }

        DB::table('otps')->where('mobile', $request->mobile)->delete();
        $token = JWTAuth::fromUser($user1);

        // Store JWT token in remember_token column
        $user1->remember_token = $token;
        $user1->save();

        // referal code check for login
        if($user1->refer_by == null) {
            return response()->json([
                'status' => 0,
                'message' => 'Referral code is not assigned. Please Contact Your Distributor or Senior.'
            ], 200);
        }

        if ($user1->role == 10) {
            $aepsdraft = DB::table('aeps_drafts')->select('aeps_status')->where('mid', $user1->mid)->first();
            $user1->aeps_status = !empty($aepsdraft->aeps_status) ? $aepsdraft->aeps_status : 0;
        } else {
            $user1->aeps_status = 3;
        }

        //get user role_name
        $role = DB::table('roles')->where('id', $user1->role)->first();
        $user1->role_name = $role->name ?? 'Unknown';

        $user12 = User::where('mid', $user1->admin_mid)->first();
        $sett = DB::table('settings')->where('user_id', $user12->id)->select('logo')->first();
        $user1->logo = $sett->logo ?? 'https://enexa.in/images/enexa-logo-mix-white.png?id=83e17363ed5f59867f1cb9c59b3c5f56';

        $this->logVisitors($request, $user1->mid);
        return response()->json([
            'status' => 1,
            'message' => 'OTP verified and user authenticated',
            'access_token' => $token,
            'token_type'   => 'bearer',
            'user'         => $user1,
        ]);
    }

    public function autoPermissionCommission($userId=null)
    {
        $user = User::where('id', $userId)->first();
        if ($user) {
            $this->assignRolePermissionsAndCommissions($userId, $user->role);
        } else {
            return response()->json([
                'status' => 0,
                'message' => 'User not found'
            ], 200);
        }
    }

    public function profile(Request $request)
    {
        $token = $request->header('Token');
        if (!$token) {
            return response()->json([
                'status' => 0,
                'message' => 'Unauthorized',
            ], 200);
        }

        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 200);
        }

        $role = DB::table('roles')->where('id', $user->role)->first();
        $user->role_name = $role->name ?? 'Unknown';


        $user1 = User::where('mid', $user->admin_mid)->first();
        $sett = DB::table('settings')->where('user_id', $user1->id)->select('logo')->first();
        $user->logo = $sett->logo ?? 'https://enexa.in/images/enexa-logo-mix-white.png?id=83e17363ed5f59867f1cb9c59b3c5f56';
        $userKyc = DB::table('user_kyc')->where('user_id', $user->id)->first();
        $user->kyc = $userKyc;
        $user->photo = $userKyc->photo ?? url('').'/assets/images/users/avatar-1.jpg';
        if ($userKyc) {
            $user->address = trim(($userKyc->house ? $userKyc->house . ', ' : '') . ($userKyc->street ? $userKyc->street . ', ' : '') . ($userKyc->landmark ? $userKyc->landmark . ', ' : '') . ($userKyc->vtc ? $userKyc->vtc . ', ' : '') . ($userKyc->subdist ? $userKyc->subdist . ', ' : '') . ($userKyc->dist ? $userKyc->dist . ', ' : '') . ($userKyc->state ? $userKyc->state : '') . ($userKyc->pincode ? ' - ' . $userKyc->pincode : ''), ', ');
        }


        return response()->json([
            'status' => 1,
            'message' => 'User profile fetched successfully',
            'user' => $user
        ]);
    }

    public function logout()
    {
        auth()->logout();
        return response()->json([
            'status' => 1,
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Check if token is valid and return user if authenticated
     */
    public function checkToken(Request $request)
    {
        $token = null;
        // Try to get token from Authorization header
        if ($request->hasHeader('Authorization')) {
            $authHeader = $request->header('Authorization');
            if (strpos($authHeader, 'Bearer ') === 0) {
                $token = substr($authHeader, 7);
            }
        }

        if ($token) {
            $user = User::where('remember_token', $token)->first();
            if ($user) {
                return response()->json([
                    'status' => 1,
                    'message' => 'Token is valid'
                ]);
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid token',
                ], 200);
            }
        } else {
            return response()->json([
                'status' => 0,
                'message' => 'No token provided',
            ], 200);
        }
    }

    public function getLogo(Request $request)
    {

        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
        $baseUrl .= "://" . $_SERVER['HTTP_HOST'];
        $site = $_SERVER['HTTP_X_FORWARDED_SITE']
            ?? $_SERVER['HTTP_ORIGIN']
            ?? $_SERVER['HTTP_REFERER']
            ?? null;

        if ($site) {
            // Parse domain
            $host = parse_url($site, PHP_URL_HOST); // gives "banking.cashbez.com"

            // Extract only main domain (last 2 parts)
            $parts = explode('.', $host);
            $count = count($parts);

            if ($count >= 2) {
                $mainDomain = $parts[$count - 2] . '.' . $parts[$count - 1];
                // "cashbez.com"
            } else {
                $mainDomain = $host;
            }
        } else {
            $mainDomain = null;
        }
        $baseUrl = $mainDomain ?? $baseUrl;
        

        $logo = url('uploads/enexa-logo-color.png');
        $footer_logo = url('uploads/enexa-logo-mix-white.png');
        $playstore_qr_img = '';
        $playstore_url = '';
        $name = 'Enexa IT Solutions';
        $about = 'Unified Open Banking & API Platform';
        $color1 = '#21736a';
        $color2 = '#acdd49';

        $setting = Setting::where('website', $baseUrl)->first();
        if (!$setting) {
            $setting = Setting::first();
        }
        if ($setting) {
            $logo = $setting->logo;
            $footer_logo = $setting->footer_logo;
            $name = $setting->company_name;
            $about = $setting->about;
            $color1 = $setting->theme_color_primary;
            $color2 = $setting->theme_color_secondary;
            $playstore_qr_img = $setting->playstore_qr_img;
            $playstore_url = $setting->playstore_url;
        }

        $userIdToSearch = $setting->user_id ?? 1;
        $adminUser = User::where('id', $userIdToSearch)->first();
        if (!$adminUser) {
            $adminUser = User::where('id', 1)->first();
        }

        $roles = Role::where('user_id', $adminUser->id)->where('guest', 1)->where('status', 1)->where('id', '!=', $adminUser->role)->get();
        return response()->json([
            'status' => 1,
            'logo' => $logo,
            'playstore_qr_img' => $playstore_qr_img,
            'playstore_url' => $playstore_url,
            'footer_logo' => $footer_logo,
            'name' => $name,
            'about' => $about,
            'roles' => $roles,
            'color1' => $color1,
            'color2' => $color2,
        ]);
    }


    /**
     * Check if refer ID exists and return user info
     */
    public function checkRefer($referId)
    {
        if (empty($referId)) {
            return response()->json([
                'status' => 0,
                'message' => 'Refer ID is required.'
            ], 200);
        }

        $user = User::where('mid', $referId)->first();
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Refer ID not found.'
            ], 200);
        }

        return response()->json([
            'status' => 1,
            'message' => 'Refer ID found.',
            'user' => [
                'mid' => $user->mid,
                'name' => $user->name,
                'role' => $user->role,
            ]
        ]);
    }


    public function verifyReferBy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'refer_by' => 'required|string'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $referUser = User::where('mid', $request->refer_by)->first();
        if (!$referUser) {
            return response()->json([
                'status' => 0,
                'message' => 'Refer ID not found.'
            ], 200);
        }


        return response()->json([
            'status' => 1,
            'message' => 'Refer ID valid.',
            'user' => [
                'mid' => $referUser->mid,
                'name' => $referUser->name,
                'role' => $referUser->role,
            ]
        ]);
    }

    public function verifyRefersBy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'refer_by' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $referUser = User::where('mid', $request->refer_by)->first();
        if (!$referUser) {
            return response()->json([
                'status' => 0,
                'message' => 'Refer ID not found.'
            ], 200);
        }


        return response()->json([
            'status' => 1,
            'message' => 'Refer ID is valid.',
            'user' => [
                'mid' => $referUser->mid,
                'name' => $referUser->name
            ]
        ]);
    }


    public function users(Request $request)
    {

        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }



        if ($user->id != 1) {
            $users = User::with(['admin', 'kyc'])
                ->leftJoin('roles', 'users.role', '=', 'roles.id')
                ->where('users.root', 'LIKE', '%' . $user->id . '%')
                ->select('users.*', 'roles.name as role_name')
                ->orderBy('users.id', 'desc')
                ->get();
        } else {
            $users = User::with(['admin', 'kyc'])
                ->leftJoin('roles', 'users.role', '=', 'roles.id')
                ->where('users.role', '!=', 1)
                ->select('users.*', 'roles.name as role_name')
                ->orderBy('users.id', 'desc')
                ->get();
        }

        // Add admin_name and KYC status to each user
        $users->transform(function ($u) {
            $u->admin_name = $u->admin ? $u->admin->name : null;
            $u->aadhar_verified = $u->kyc ? (bool) $u->kyc->aadhar_verified : false;
            $u->pan_verified = $u->kyc ? (bool) $u->kyc->pan_verified : false;
            $u->account_verified = $u->kyc ? (bool) $u->kyc->account_verified : false;
            $u->kyc_completed = $u->kyc ? (bool) $u->kyc->kyc_completed : false;
            return $u;
        });
        return response()->json([
            'status' => 1,
            'message' => 'Users fetched successfully',
            'users' => $users
        ]);
    }

    /**
     * Server-side paginated users list with KYC status, search, filters, date range
     */
    public function usersPaginated(Request $request)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
        }

        $perPage = min((int) ($request->per_page ?? 20), 100);
        $sortBy = in_array($request->sort_by, ['id', 'name', 'email', 'mobile', 'created_at', 'role']) ? $request->sort_by : 'id';
        $sortDir = strtolower($request->sort_dir ?? 'desc') === 'asc' ? 'asc' : 'desc';

        // Base query
        $query = User::leftJoin('roles', 'users.role', '=', 'roles.id')
            ->leftJoin('user_kyc', 'users.id', '=', 'user_kyc.user_id')
            ->select(
                'users.*',
                'roles.name as role_name',
                'user_kyc.aadhar_verified',
                'user_kyc.pan_verified',
                'user_kyc.account_verified',
                'user_kyc.kyc_completed',
                'user_kyc.aadhar_number as kyc_aadhar_number',
                'user_kyc.pan_number as kyc_pan_number',
                'user_kyc.account_number as kyc_account_number'
            );

        // Scope: non-admin users only
        if ($user->id != 1) {
            $query->where('users.root', 'LIKE', '%' . $user->id . '%');
        } else {
            $query->where('users.role', '!=', 1);
        }

        // Search (name, email, mobile, mid)
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('users.name', 'LIKE', "%{$s}%")
                  ->orWhere('users.email', 'LIKE', "%{$s}%")
                  ->orWhere('users.mobile', 'LIKE', "%{$s}%")
                  ->orWhere('users.mid', 'LIKE', "%{$s}%");
            });
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('users.created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('users.created_at', '<=', $request->date_to);
        }

        // KYC filter pills (comma-separated values)
        if ($request->filled('kyc_filter') && $request->kyc_filter !== 'all') {
            $filters = explode(',', $request->kyc_filter);
            foreach ($filters as $filter) {
                switch (trim($filter)) {
                    case 'aadhar_verified':
                        $query->where('user_kyc.aadhar_verified', 1);
                        break;
                    case 'aadhar_unverified':
                        $query->where(function ($q) {
                            $q->whereNull('user_kyc.aadhar_verified')
                              ->orWhere('user_kyc.aadhar_verified', 0);
                        });
                        break;
                    case 'pan_verified':
                        $query->where('user_kyc.pan_verified', 1);
                        break;
                    case 'pan_unverified':
                        $query->where(function ($q) {
                            $q->whereNull('user_kyc.pan_verified')
                              ->orWhere('user_kyc.pan_verified', 0);
                        });
                        break;
                    case 'account_verified':
                        $query->where('user_kyc.account_verified', 1);
                        break;
                    case 'account_unverified':
                        $query->where(function ($q) {
                            $q->whereNull('user_kyc.account_verified')
                              ->orWhere('user_kyc.account_verified', 0);
                        });
                        break;
                    case 'kyc_complete':
                        $query->where('user_kyc.kyc_completed', 1);
                        break;
                    case 'kyc_incomplete':
                        $query->where(function ($q) {
                            $q->whereNull('user_kyc.kyc_completed')
                              ->orWhere('user_kyc.kyc_completed', 0);
                        });
                        break;
                }
            }
        }

        // Sort — prefix with table name for joined columns
        $sortColumn = in_array($sortBy, ['id', 'name', 'email', 'mobile', 'created_at', 'role'])
            ? 'users.' . $sortBy
            : 'users.id';
        $query->orderBy($sortColumn, $sortDir);

        // Paginate
        $paginated = $query->paginate($perPage);

        // Add admin_name
        $paginated->getCollection()->transform(function ($u) {
            $admin = User::select('name')->where('mid', $u->admin_mid)->first();
            $u->admin_name = $admin ? $admin->name : null;
            $u->aadhar_verified = (bool) $u->aadhar_verified;
            $u->pan_verified = (bool) $u->pan_verified;
            $u->account_verified = (bool) $u->account_verified;
            $u->kyc_completed = (bool) $u->kyc_completed;
            return $u;
        });

        return response()->json([
            'status' => 1,
            'data' => $paginated->items(),
            'total' => $paginated->total(),
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
        ]);
    }

    // Create User (Admin)
    public function storeUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mobile' => 'required|digits:10|unique:users,mobile',
            'name' => 'required|string',
            'role' => 'required|integer',
            'aadhar_number' => 'required|string',
            'refer_by' => 'required|string',
            'status' => 'required|integer',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }
        $referUser = User::where('mid', $request->refer_by)->first();
        if (!$referUser) {
            return response()->json([
                'status' => 0,
                'message' => 'Refer ID not found.'
            ], 200);
        }

        $lastUser = Mid::where('status', 0)->first();
        $nextMid = $lastUser->mid;
        $lastUser->markAsUsed();

        $user = User::create([
            'mid' => $nextMid,
            'mkey' => Str::random(32),
            'admin_mid' => $referUser->role == 2 ? $referUser->mid : $referUser->admin_mid,
            'mobile' => $request->mobile,
            'name' => $request->name,
            'email' => $request->email ?? null,
            'role' => $request->role,
            'root' => $referUser->root . ',' . $request->id,
            'refer_by' => $request->refer_by,
            'status' => $request->status,
            'aadhar_number' => $request->aadhar_number,
            'password' => Hash::make($request->mobile),
        ]);
        // Assign permissions and commissions from role template
        $this->assignRolePermissionsAndCommissions($user->id, $user->role);
        return response()->json([
            'status' => 1,
            'message' => 'User created successfully',
            'user' => $user
        ]);
    }

    // Get single user
    public function getUser($id)
    {
        $user = User::leftJoin('roles', 'users.role', '=', 'roles.id')
            ->select('users.*', 'roles.name as role_name')
            ->where('users.id', $id)
            ->first();
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'User not found'
            ], 200);
        }
        return response()->json([
            'status' => 1,
            'user' => $user
        ]);
    }

    // Update user
    public function updateUser(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'User not found'
            ], 200);
        }
        $validator = Validator::make($request->all(), [
            'mobile' => 'required|digits:10|unique:users,mobile,' . $id,
            'name' => 'required|string',
            'role' => 'required|integer'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $user->mobile = $request->mobile;
        $user->name = $request->name;
        $user->email = $request->email ?? null;
        $user->role = $request->role;
        $user->status = $request->status ?? 1; // Default to active if not provided
        $user->aadhar_number = $request->aadhar_number ?? null;
        $user->save();
        return response()->json([
            'status' => 1,
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    // Delete user
    public function deleteUser($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'User not found'
            ], 200);
        }
        $user->delete();
        return response()->json([
            'status' => 1,
            'message' => 'User deleted successfully'
        ]);
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


    public function createMpin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mpin' => 'required|digits:4',
            'confrm_mpin' => 'required|digits:4|same:mpin',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $token = $request->header('Token');
        if (!$token) {
            return response()->json([
                'status' => 0,
                'message' => 'Unauthorized',
            ], 200);
        }

        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 200);
        }

        $user->mpin = Hash::make($request->mpin);
        $user->save();

        return response()->json([
            'status' => 1,
            'message' => 'MPIN created successfully',
        ]);
    }


    public function forgetMpin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mpin' => 'required|digits:4',
            'confrm_mpin' => 'required|digits:4|same:mpin',
            'otp' => 'required|digits:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $token = $request->header('Token');
        if (!$token) {
            return response()->json([
                'status' => 0,
                'message' => 'Unauthorized',
            ], 200);
        }

        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 200);
        }

        $otp = $request->otp;
        $number = $user->mobile;

        $user2 = DB::table('otps')->where('mobile', $number)->first();
        if (!$user2) {
            return response()->json([
                'status' => 0,
                'message' => 'OTP expired or not found',
            ], 200);
        } else {
            if ($user2->otp != $otp) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid OTP',
                ], 200);
            }
        }

        DB::table('otps')->where('mobile', $number)->delete();

        $user->mpin = Hash::make($request->mpin);
        $user->save();

        return response()->json([
            'status' => 1,
            'message' => 'MPIN reset successfully',
        ]);
    }

    public function verifyMpin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mpin' => 'required|digits:4',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $token = $request->header('Token');
        if (!$token) {
            return response()->json([
                'status' => 0,
                'message' => 'Unauthorized',
            ], 200);
        }

        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 200);
        }

        if (!Hash::check($request->mpin, $user->mpin)) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid MPIN',
            ], 200);
        }

        return response()->json([
            'status' => 1,
            'message' => 'MPIN verified successfully',
        ]);
    }


    public function saveContact(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'contacts' => 'required|json',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $token = $request->header('Token');
        if (!$token) {
            return response()->json([
                'status' => 0,
                'message' => 'Unauthorized',
            ], 200);
        }

        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 200);
        }

        DB::table('contacts')->where('user_id', $user->id)->delete();
        DB::table('contacts')->insert([
            'user_id' => $user->id,
            'contacts' => $request->contacts,
        ]);


        return response()->json([
            'status' => 1,
            'message' => 'Contact saved successfully',
        ]);
    }


    private function getAdminId()
    {
        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
        $baseUrl .= "://" . $_SERVER['HTTP_HOST'];
        $site = $_SERVER['HTTP_X_FORWARDED_SITE']
            ?? $_SERVER['HTTP_ORIGIN']
            ?? $_SERVER['HTTP_REFERER']
            ?? null;

        if ($site) {
            // Parse domain
            $host = parse_url($site, PHP_URL_HOST); // gives "banking.cashbez.com"

            // Extract only main domain (last 2 parts)
            $parts = explode('.', $host);
            $count = count($parts);

            if ($count >= 2) {
                $mainDomain = $parts[$count - 2] . '.' . $parts[$count - 1];
                // "cashbez.com"
            } else {
                $mainDomain = $host;
            }
        } else {
            $mainDomain = null;
        }


        $baseUrl = $mainDomain ?? $baseUrl;
        $setting = Setting::where('website', $baseUrl)->first();

        if ($setting) {
            $adminUser = User::where('id', $setting->user_id)->first();
            if ($adminUser) {
                return ['id' => $adminUser->id, 'mid' => $adminUser->admin_mid, 'baseUrl' => $baseUrl];
            } else {
                return ['id' => 3, 'mid' => 'ENX0000002', 'baseUrl' => $baseUrl]; // Default admin ID
            }
        } else {
            return ['id' => 3, 'mid' => 'ENX0000002', 'baseUrl' => $baseUrl]; // Default admin ID
        }
    }
    // QR Login Flow
    public function initQrLogin()
    {
        $challengeId = Str::uuid()->toString();
        // Expires in 60 seconds
        Cache::put('qr_login_' . $challengeId, ['status' => 'PENDING'], 60);

        return response()->json([
            'status' => 1,
            'challenge_id' => $challengeId,
            'expires_in' => 60
        ]);
    }

    public function approveQrLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'challenge_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $challengeId = $request->challenge_id;
        $cacheKey = 'qr_login_' . $challengeId;
        $data = Cache::get($cacheKey);

        if (!$data) {
            return response()->json([
                'status' => 0,
                'message' => 'QR code expired or invalid'
            ], 200);
        }

        if ($data['status'] !== 'PENDING') {
            return response()->json([
                'status' => 0,
                'message' => 'QR code already processed'
            ], 200);
        }

        // Get authenticated user (from middleware)
        $token = $request->header('Token');
        if (!$token) {
            return response()->json([
                'status' => 0,
                'message' => 'Unauthorized',
            ], 200);
        }

        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 200);
        }


        // Generate new token for web session
        $webToken = $user->remember_token; // skipping making new token

        $this->logVisitors($request, $user->mid);
        // Update Cache
        Cache::put($cacheKey, [
            'status' => 'APPROVED',
            'access_token' => $webToken,
            'user' => $user
        ], 60); // Keep it for another 60s so web can pick it up

        return response()->json([
            'status' => 1,
            'message' => 'Login approved successfully'
        ]);
    }

    public function streamQrLogin($challengeId)
    {
        $response = new \Symfony\Component\HttpFoundation\StreamedResponse(function() use ($challengeId) {
            // Disable output buffering for this stream
            if (ob_get_level()) ob_end_clean();
            
            $cacheKey = 'qr_login_' . $challengeId;
            $startTime = time();
            
            while (true) {
                if (time() - $startTime > 60) {
                    echo "event: timeout\n";
                    echo "data: " . json_encode(['message' => 'Timeout']) . "\n\n";
                    flush();
                    break;
                }

                $data = Cache::get($cacheKey);
                
                if (!$data) {
                    echo "event: error\n";
                    echo "data: " . json_encode(['message' => 'Expired']) . "\n\n";
                    flush();
                    break;
                }

                if ($data['status'] === 'APPROVED') {
                    echo "event: approved\n";
                    echo "data: " . json_encode([
                        'access_token' => $data['access_token'],
                        'user' => $data['user']
                    ]) . "\n\n";
                    flush();
                    break;
                }

                // Send heartbeat to keep connection alive
                echo ": heartbeat\n\n";
                flush();

                if (connection_aborted()) {
                    break;
                }

                sleep(2);
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('Connection', 'keep-alive');
        $response->headers->set('X-Accel-Buffering', 'no'); // Nginx

        return $response;
    }

    public function getLoginQrImage($challengeId)
    {
        $data = json_encode([
            'type' => 'login',
            'challenge_id' => $challengeId
        ]);

        try {
            $pngData = $this->generateQrPngWithLogo($data);
            
            return response($pngData, 200)
                ->header('Content-Type', 'image/png')
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'Failed to generate QR'], 500);
        }
    }

    private function generateQrPngWithLogo($data)
    {
        // Generate base QR code as PNG
        $builder = new Builder(
            writer: new PngWriter(),
            data: $data,
            encoding: new Encoding('UTF-8'),
            size: 620,
            margin: 0
        );

        $result = $builder->build();
        $qrImageString = $result->getString();

        // Create QR image resource from string
        $qrImage = imagecreatefromstring($qrImageString);
        if (!$qrImage) {
            throw new \Exception('Failed to create QR code image');
        }

        // Get admin data for colors and logo
        $adminData = $this->getAdminWithurl();
        
        // Canvas settings
        $qrSize = 620;
        $canvasSize = 680;
        $centerOffset = ($canvasSize - $qrSize) / 2;

        // Create canvas
        $canvas = imagecreatetruecolor($canvasSize, $canvasSize);
        imagesavealpha($canvas, true);
        
        // Fill with white background
        $white = imagecolorallocate($canvas, 255, 255, 255);
        imagefill($canvas, 0, 0, $white);

        // Parse border colors
        $color1Rgb = $this->hexToRgb($adminData['color1'] ?? '#21736a');
        $color2Rgb = $this->hexToRgb($adminData['color2'] ?? '#acdd49');
        
        $borderColor1 = imagecolorallocate($canvas, $color1Rgb[0], $color1Rgb[1], $color1Rgb[2]);
        $borderColor2 = imagecolorallocate($canvas, $color2Rgb[0], $color2Rgb[1], $color2Rgb[2]);

        // Draw outer border (solid)
        $outerPadding = 25;
        $borderWidth = 4;
        for ($i = 0; $i < $borderWidth; $i++) {
            imagerectangle(
                $canvas,
                $centerOffset - $outerPadding + $i,
                $centerOffset - $outerPadding + $i,
                $canvasSize - ($centerOffset - $outerPadding) - $i - 1,
                $canvasSize - ($centerOffset - $outerPadding) - $i - 1,
                $borderColor1
            );
        }

        // Draw inner border (dashed effect)
        $innerPadding = 15;
        $this->drawDashedRect(
            $canvas,
            $centerOffset - $innerPadding,
            $centerOffset - $innerPadding,
            $qrSize + ($innerPadding * 2),
            $qrSize + ($innerPadding * 2),
            $borderColor2,
            $borderWidth,
            16,
            8
        );

        // Copy QR code to canvas
        imagecopy($canvas, $qrImage, $centerOffset, $centerOffset, 0, 0, $qrSize, $qrSize);
        imagedestroy($qrImage);

        // Add logo overlay
        $logoPath = $adminData['favicon'];
        if (file_exists($logoPath) && is_readable($logoPath)) {
            $this->addLogoToCanvas($canvas, $logoPath, $canvasSize);
        }

        // Output PNG
        ob_start();
        imagepng($canvas, null, 9); // Maximum compression
        $pngData = ob_get_clean();
        imagedestroy($canvas);

        return $pngData;
    }

    
    public function getAdminWithurl()
    {
        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
        $baseUrl .= "://" . $_SERVER['HTTP_HOST'];
        $site = $_SERVER['HTTP_X_FORWARDED_SITE']
            ?? $_SERVER['HTTP_ORIGIN']
            ?? $_SERVER['HTTP_REFERER']
            ?? null;

        if ($site) {
            // Parse domain
            $host = parse_url($site, PHP_URL_HOST); // gives "banking.cashbez.com"

            // Extract only main domain (last 2 parts)
            $parts = explode('.', $host);
            $count = count($parts);

            if ($count >= 2) {
                $mainDomain = $parts[$count - 2] . '.' . $parts[$count - 1];
                // "cashbez.com"
            } else {
                $mainDomain = $host;
            }
        } else {
            $mainDomain = null;
        }
        $baseUrl = $mainDomain ?? $baseUrl;

        $logoPath = public_path('favicon-1735711203.webp');
        $logo = 'https://cashbez.com/public//footer_logo-1733140069.webp';
        $footer_logo = url('uploads/enexa-logo-mix-white.png');
        $name = 'Enexa IT Solutions';
        $about = 'Unified Open Banking & API Platform';
        $color1 = '#21736a';
        $color2 = '#acdd49';

        $setting = Setting::where('website', $baseUrl)->first();

        if ($setting) {
            // Handle favicon path - can be URL or relative path
            if (!empty($setting->favicon)) {
                // Check if it's a full URL
                if (filter_var($setting->favicon, FILTER_VALIDATE_URL)) {
                    // Extract path from URL
                    $faviconUrlPath = parse_url($setting->favicon, PHP_URL_PATH);
                    if ($faviconUrlPath) {
                        // Remove leading slash and 'public/' if present
                        $cleanPath = ltrim($faviconUrlPath, '/');
                        $cleanPath = preg_replace('#^public/#', '', $cleanPath);
                        $logoPath = public_path($cleanPath);
                    }
                } else {
                    // It's already a relative path or filename
                    $cleanPath = ltrim($setting->favicon, '/');
                    $cleanPath = preg_replace('#^public/#', '', $cleanPath);
                    $logoPath = public_path($cleanPath);
                }
            }
            
            $logo = $setting->logo;
            $footer_logo = $setting->footer_logo;
            $name = $setting->company_name;
            $about = $setting->about;
            $color1 = $setting->theme_color_primary;
            $color2 = $setting->theme_color_secondary;
        }

        $var = [
            'logo' => $logo,
            'footer_logo' => $footer_logo,
            'favicon' => $logoPath,  // This is now a full system path
            'name' => $name,
            'about' => $about,
            'color1' => $color1,
            'color2' => $color2,
            'imagick' => extension_loaded('imagick') ? true : false,
        ];
        return $var;
    }


    private function addLogoToCanvas($canvas, $logoPath, $canvasSize)
    {
        try {
            // Load logo based on file type
            $imageInfo = getimagesize($logoPath);
            if (!$imageInfo) {
                return;
            }

            $mimeType = $imageInfo['mime'];
            $logo = null;

            switch ($mimeType) {
                case 'image/jpeg':
                    $logo = imagecreatefromjpeg($logoPath);
                    break;
                case 'image/png':
                    $logo = imagecreatefrompng($logoPath);
                    break;
                case 'image/gif':
                    $logo = imagecreatefromgif($logoPath);
                    break;
                case 'image/webp':
                    $logo = imagecreatefromwebp($logoPath);
                    break;
                default:
                    return;
            }

            if (!$logo) {
                return;
            }

            // Enable alpha blending for logo
            imagealphablending($logo, true);
            imagesavealpha($logo, true);

            // Calculate logo size (18% of QR size)
            $logoSize = 620 * 0.18;
            $logoW = imagesx($logo);
            $logoH = imagesy($logo);
            
            // Maintain aspect ratio
            $scale = $logoSize / max($logoW, $logoH);
            $newLogoW = $logoW * $scale;
            $newLogoH = $logoH * $scale;

            // Calculate center position
            $center = $canvasSize / 2;
            $logoX = $center - ($newLogoW / 2);
            $logoY = $center - ($newLogoH / 2);

            // Draw white circle background
            $circleRadius = ($logoSize + 20) / 2;
            $white = imagecolorallocate($canvas, 255, 255, 255);
            imagefilledellipse($canvas, $center, $center, $circleRadius * 2, $circleRadius * 2, $white);

            // Resize and place logo
            imagecopyresampled(
                $canvas,
                $logo,
                $logoX,
                $logoY,
                0,
                0,
                $newLogoW,
                $newLogoH,
                $logoW,
                $logoH
            );

            imagedestroy($logo);

        } catch (\Exception $e) {
            // Log error
        }
    }

    private function drawDashedRect($image, $x, $y, $width, $height, $color, $thickness, $dashLength, $gapLength)
    {
        imagesetthickness($image, $thickness);
        
        // Top line
        $this->drawDashedLine($image, $x, $y, $x + $width, $y, $color, $dashLength, $gapLength);
        
        // Right line
        $this->drawDashedLine($image, $x + $width, $y, $x + $width, $y + $height, $color, $dashLength, $gapLength);
        
        // Bottom line
        $this->drawDashedLine($image, $x + $width, $y + $height, $x, $y + $height, $color, $dashLength, $gapLength);
        
        // Left line
        $this->drawDashedLine($image, $x, $y + $height, $x, $y, $color, $dashLength, $gapLength);
        
        imagesetthickness($image, 1);
    }

    private function drawDashedLine($image, $x1, $y1, $x2, $y2, $color, $dashLength, $gapLength)
    {
        $length = sqrt(pow($x2 - $x1, 2) + pow($y2 - $y1, 2));
        $dx = ($x2 - $x1) / $length;
        $dy = ($y2 - $y1) / $length;
        
        $position = 0;
        while ($position < $length) {
            $startX = $x1 + $dx * $position;
            $startY = $y1 + $dy * $position;
            $endPos = min($position + $dashLength, $length);
            $endX = $x1 + $dx * $endPos;
            $endY = $y1 + $dy * $endPos;
            
            imageline($image, $startX, $startY, $endX, $endY, $color);
            $position += $dashLength + $gapLength;
        }
    }

    private function hexToRgb($hex)
    {
        $hex = ltrim($hex, '#');
        
        if (strlen($hex) == 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        
        return [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2))
        ];
    }



    public function logVisitors(Request $request, $uid = null)
    {
        // Get JSON body
        $data = $request->json()->all();
        $page = $data['page'] ?? null;

        // Visitor IP
        $ip = $request->ip();

        // IPStack API
        $ipstackKey = '294cdeb445c20dbd745ffbfe6323ece8';
        $geo = [];

        try {
            $response = Http::timeout(5)->get("http://api.ipstack.com/{$ip}", [
                'access_key' => $ipstackKey
            ]);

            if ($response->successful()) {
                $geo = $response->json();
            }
        } catch (\Exception $e) {
            // silently fail (same as @file_get_contents)
        }

        $now = date('Y-m-d H:i:s');
        $time_window = date('Y-m-d H:i:s', strtotime('-5 minutes'));

        // Check recent visit from same IP
        $existing = DB::table('visitor_logs')
            ->where('ip_address', $ip)
            ->where('visited_at', '>=', $time_window)
            ->orderByDesc('visited_at')
            ->first();

        $insert = [
            'uid' => $uid,
            'ip_address' => $ip,
            'ip_routing_type' => $geo['ip_routing_type'] ?? null,
            'continent_code' => $geo['continent_code'] ?? null,
            'continent_name' => $geo['continent_name'] ?? null,
            'country' => $geo['country_name'] ?? null,
            'region' => $geo['region_name'] ?? null,
            'city' => $geo['city'] ?? null,
            'zip' => $geo['zip'] ?? null,
            'lat' => $geo['latitude'] ?? null,
            'lon' => $geo['longitude'] ?? null,

            'location_geoname_id' => $geo['location']['geoname_id'] ?? null,
            'location_capital' => $geo['location']['capital'] ?? null,
            'location_languages' => isset($geo['location']['languages'])
                ? json_encode($geo['location']['languages'])
                : null,

            'country_flag' => $geo['location']['country_flag'] ?? null,
            'country_calling_code' => $geo['location']['calling_code'] ?? null,
            'is_eu' => $geo['location']['is_eu'] ?? null,

            'time_zone_id' => $geo['time_zone']['id'] ?? null,
            'time_zone_current_time' => isset($geo['time_zone']['current_time'])
                ? date('Y-m-d H:i:s', strtotime($geo['time_zone']['current_time']))
                : null,
            'time_zone_gmt_offset' => $geo['time_zone']['gmt_offset'] ?? null,
            'time_zone_code' => $geo['time_zone']['code'] ?? null,
            'time_zone_is_dst' => $geo['time_zone']['is_daylight_saving'] ?? null,

            'currency_code' => $geo['currency']['code'] ?? null,
            'currency_name' => $geo['currency']['name'] ?? null,
            'currency_symbol' => $geo['currency']['symbol'] ?? null,

            'connection_asn' => $geo['connection']['asn'] ?? null,
            'connection_isp' => $geo['connection']['isp'] ?? null,
            'connection_org' => $geo['connection']['organization'] ?? null,
            'connection_domain' => $geo['connection']['domain'] ?? null,
            'connection_type' => $geo['connection_type'] ?? ($geo['connection']['type'] ?? null),

            'security_is_proxy' => $geo['security']['is_proxy'] ?? null,
            'security_is_tor' => $geo['security']['is_tor'] ?? null,
            'security_is_spam' => $geo['security']['is_spam'] ?? null,
            'security_is_threat' => $geo['security']['is_threat'] ?? null,
            'security_threat_score' => $geo['security']['threat_score'] ?? null,

            'user_agent' => $request->userAgent(),
            'page' => json_encode([$page]),
            'visited_at' => $now,
            'total_visits' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        if ($existing) {
            // Append page
            $pages = json_decode($existing->page, true);
            if (!is_array($pages)) {
                $pages = $existing->page ? [$existing->page] : [];
            }
            $pages[] = $page;

            DB::table('visitor_logs')
                ->where('id', $existing->id)
                ->update([
                    'page' => json_encode($pages),
                    'visited_at' => $now,
                    'total_visits' => DB::raw('total_visits + 1'),
                    'updated_at' => $now,
                ]);
        } else {
            DB::table('visitor_logs')->insert($insert);
        }

        return response()->json(['status' => true]);
    }

    /**
     * Handle public contact form submission
     */
    public function submitContactUs(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'    => 'required|string|max:150',
            'email'   => 'required|email|max:150',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 0,
                'message' => 'Validation error',
                'error'   => $validator->errors()
            ], 200);
        }

        try {
            $name    = htmlspecialchars($request->input('name'));
            $email   = htmlspecialchars($request->input('email'));
            $subject = htmlspecialchars($request->input('subject'));
            $userMsg = nl2br(htmlspecialchars($request->input('message')));

            // Get admin setting for branding & SMTP
            $setting = Setting::first();
            $companyName = $setting->company_name ?? 'Banking Service';
            $adminId = $setting->user_id ?? 1;

            // 1. Send notification email to support team (ads@bharatpays.in)
            $adminSubject = "New Contact Inquiry: " . $subject;
            $adminBody = "
            <div style='font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                <h2 style='color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;'>New Contact Form Submission</h2>
                <p><strong>Sender Name:</strong> {$name}</p>
                <p><strong>Sender Email:</strong> <a href='mailto:{$email}'>{$email}</a></p>
                <p><strong>Subject:</strong> {$subject}</p>
                <div style='background-color: #f9f9f9; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0;'>
                    <p style='margin: 0; white-space: pre-wrap;'><strong>Message:</strong><br>{$userMsg}</p>
                </div>
                <p style='font-size: 12px; color: #777;'>Received on: " . date('Y-m-d H:i:s') . "</p>
            </div>";

            sentMail('ads@bharatpays.in', $adminSubject, $adminId, urlencode($adminBody));

            // 2. Send acknowledgment / welcome email to sender
            $userSubject = "We received your inquiry - " . $companyName;
            $userBody = "
            <div style='font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                <h2 style='color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;'>Thank You for Contacting {$companyName}</h2>
                <p>Dear <strong>{$name}</strong>,</p>
                <p>Thank you for reaching out to us. We have received your message regarding <strong>'{$subject}'</strong>.</p>
                <p>Our support team is reviewing your request and will get back to you as soon as possible (usually within 24 hours).</p>
                <div style='background-color: #f0fdf4; padding: 15px; border: 1px solid #bbf7d0; border-radius: 6px; margin: 20px 0;'>
                    <p style='margin: 0; color: #166534; font-size: 14px;'><strong>For Urgent Queries:</strong><br>
                    Office Support (Call & WhatsApp): 8436132456<br>
                    API Support (Call & WhatsApp): 9093030417<br>
                    Email: ads@bharatpays.in
                    </p>
                </div>
                <p style='margin-top: 30px; font-size: 13px; color: #666;'>Best regards,<br><strong>{$companyName} Support Team</strong></p>
            </div>";

            sentMail($email, $userSubject, $adminId, urlencode($userBody));

            return response()->json([
                'status'  => 1,
                'message' => 'Thank you! Your message has been sent successfully. We will respond soon.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 0,
                'message' => 'Failed to send message. Please try again later.'
            ], 200);
        }
    }

}

