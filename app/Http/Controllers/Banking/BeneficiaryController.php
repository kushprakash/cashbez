<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\Beneficiary;
use App\Models\User;
use App\Models\Payout;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use DB;
use App\Models\AepsDraft;
use App\Services\CatchLogService;

class BeneficiaryController extends Controller
{
    private const BASE_URL = 'https://icchhamatidataservice.com/api/';
    private const MID = "AGENT1475";
    private const MKEY = "8ECgqn6xep6FPdVvzOs4ketqWQxG9qGY";

    /**
     * Display a listing of beneficiaries
     */
    public function index(Request $request)
    {
        try {
            $user = $request->get('user');
            $perPage = $request->get('per_page', 50);

            // Generate cache key based on user_id and filters
            $cacheKey = 'beneficiaries_user_' . $user->id . 
                        '_search_' . ($request->filled('search') ? md5($request->search) : 'none') .
                        '_verified_' . ($request->filled('verified') ? $request->verified : 'all') .
                        '_page_' . ($request->get('page', 1)) .
                        '_per_page_' . $perPage;

            // Cache for 60 minutes (3600 seconds)
            $beneficiaries = Cache::remember($cacheKey, 3600, function () use ($request, $user, $perPage) {
                $query = Beneficiary::with(['user', 'admin', 'creator','setting'])
                    ->leftJoin(DB::raw('(SELECT beneficiary_id, MAX(created_at) as last_payment_date, COUNT(*) as payment_count FROM payouts GROUP BY beneficiary_id) as latest_payouts'), 'beneficiaries.id', '=', 'latest_payouts.beneficiary_id')
                    ->select('beneficiaries.*', 'latest_payouts.last_payment_date', 'latest_payouts.payment_count')
                    ->forUser($user->id)
                    ->orderBy('latest_payouts.last_payment_date', 'desc')
                    ->orderBy('beneficiaries.created_at', 'desc')
                    ->where('beneficiaries.type', '<', 3);

                // Apply search filter
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('beneficiaries.name', 'LIKE', "%{$search}%")
                          ->orWhere('beneficiaries.mobile', 'LIKE', "%{$search}%")
                          ->orWhere('beneficiaries.account', 'LIKE', "%{$search}%")
                          ->orWhere('beneficiaries.ifsc', 'LIKE', "%{$search}%")
                          ->orWhere('beneficiaries.branch', 'LIKE', "%{$search}%");
                    });
                }

                // Apply verification status filter
                if ($request->filled('verified')) {
                    if ($request->verified === 'true') {
                        $query->verified();
                    } elseif ($request->verified === 'false') {
                        $query->where(function ($q) {
                            $q->where('beneficiaries.account_verified', false)
                              ->orWhere('beneficiaries.ifsc_verified', false);
                        });
                    }
                }

                return $query->paginate($perPage);
            });

            return response()->json([
                'status' => 1,
                'message' => 'Beneficiaries retrieved successfully',
                'data' => $beneficiaries
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve beneficiaries: ' . $e->getMessage()
            ], 500);
        }
    }


    public function movetoaccounts(Request $request)
    {
        try {

            $user = $request->get('user');
            $Beneficiary = Beneficiary::where('user_id', $user->id)
            ->select('id','name','account','ifsc','branch','bank')
            ->where('type', 3)
            ->get();

            $root = $user->root; // e.g. "1,5,23,87"
            $rootArray = explode(',', $root);
            $lastValue = end($rootArray);
            
            $userData = User::where('id', $lastValue)
            ->select('id','name','mobile')
            ->get();

            return response()->json([
                'status' => 1,
                'message' => 'Move to Account retrieved successfully',
                'data' => $Beneficiary,
                'distributerData'=>$userData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve beneficiaries: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * Store a newly created beneficiary
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'mobile' => 'required|string|regex:/^[6-9]\d{9}$/',
                'account' => 'required|string|max:20',
                'confirmAccount' => 'required|string|same:account',
                'ifsc' => 'required|string|size:11|regex:/^[A-Z]{4}0[A-Z0-9]{6}$/',
                'type' => 'required',
                'otp' => 'required|string|size:6'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $user = $request->get('user');
            $admin = $request->get('admin');

            $otp = $request->otp;

            $mobile = $user->mobile;

            $user2 = DB::table('otps')->where('mobile', $mobile)->first();
            if (!$user2) {
                return ['status' => 0, 'message' => 'OTP expired or not found'];
            } else {

                if ($user2->otp != $otp) {
                    return ['status' => 0, 'message' => 'Invalid OTP'];
                }
            }

            // For type 3 (Move To Account), beneficiary name must match user's own KYC name
            if ((int)$request->type === 3 && !empty($user->mid)) {
                $userKyc = DB::table('user_kyc')->where('user_id', $user->id)->first();
               

                if (!$userKyc || empty($userKyc->name)) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Your KYC is not completed. Cannot add Move To Account beneficiary.'
                    ], 200);
                }

                $draft = DB::table('aeps_drafts')->where('mid', $user->mid)->first();
                $error = 1;
                $messages = 'For Move To Account, beneficiary name must match your KYC name (' . $userKyc->name . ')'
                    . (isset($draft) ? ' or your Shop name (' . $draft->shop_name . ')' : '')
                    . '. Only self-transfers are allowed.';

                // KYC name se match ho to error nahi
                if (strtolower(trim($request->name)) == strtolower(trim($userKyc->name))) {
                    $error = 0;
                }

                // Ya shop name se match ho to error nahi
                if (isset($draft) && strtolower(trim($request->name)) == strtolower(trim($draft->shop_name))) {
                    $error = 0;
                }

                if ($error == 1) {
                    return response()->json([
                        'status' => 0,
                        'message' => $messages
                    ], 200);
                }
            }

            // Check for duplicate beneficiary
            $existingBeneficiary = Beneficiary::where('user_id', $user->id)
                ->where('account', $request->account)
                ->where('ifsc', $request->ifsc)
                ->where('type', $request->type)
                ->first();

            if ($existingBeneficiary) {
                $typeLabel = $request->type == 1 ? 'Self' : 'Customer';
                return response()->json([
                    'status' => 0,
                    'message' => "Beneficiary with this account and IFSC already exists for {$typeLabel} type"
                ], 200);
            }


            $url = self::BASE_URL."v2/beneficiaries";


            $data = [
                "name"      => $request->name,
                "mobile"    => $request->mobile,
                "account"    => $request->account,
                "confirmAccount"    => $request->confirmAccount,
                "ifsc"        => $request->ifsc,
                "type"  =>5,
                "otp"=> $request->otp
            ];

            $ch = curl_init($url);

            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => json_encode($data),
                CURLOPT_HTTPHEADER     => [
                    "Content-Type: application/json",
                    "Accept: application/json",
                    "mid: ".self::MID,
                    "mkey: ".self::MKEY
                ],
                CURLOPT_TIMEOUT        => 60,
                CURLOPT_CONNECTTIMEOUT => 20
            ]);

            $response = curl_exec($ch);


             DB::table('logs')->insert([
                'mid'          => $user->mid ?? '',
                'type'         => 'Add Beneficiary',
                'platform'     => 'WEB',
                'headers'      => json_encode([
                    'Accept'       => 'application/json',
                    'Content-Type' => 'application/json',
                    'mid' => self::MID,
                    'mkey' => self::MKEY,
                ]),
                'request_data'  => json_encode($data),
                'response_data'  => $response,
                'url'           => $url,
                'txnid'         => 0,
                'status'        => 0,
                'timestamp'    => now(),
                'created_at'   => now()->format('Y-m-d H:i:s'),
            ]);


            $json_response = json_decode($response, true);

            if(isset($json_response['status']) && $json_response['status']==1){

            // Verify IFSC and get branch details
            $ifscVerification = $this->verifyIfsc($request->ifsc);

            $beneficiaryData = [
                'user_id' => $user->id,
                'bid'   => $json_response['data']['id'],
                'name' => $request->name,
                'mobile' => $request->mobile,
                'account' => $request->account,
                'ifsc' => $request->ifsc,
                'branch' => $ifscVerification['branch'] ?? null,
                'bank' => $ifscVerification['bank'] ?? null,
                'type' => $request->type,
                'status' => 1,
                'admin_id' => $admin->id,
                'created_by' => $user->id,
                'ifsc_verified' => $ifscVerification['verified'],
                'account_verified' => 'verified',
                'verification_data' => json_encode([
                    'ifsc_data' => $ifscVerification,
                    // 'account_data' => $accountVerification,
                    'verified_at' => now()->toISOString()
                ])
            ];

            $beneficiary = Beneficiary::create($beneficiaryData);

          
            return response()->json([
                'status' => 1,
                'message' => 'Beneficiary added successfully',
                'data'  =>  $beneficiary
            ]);

        } else {

               return response()->json([
                'status' => 0,
                'message' => $json_response['message'] ?? 'Beneficiary added failed',
            ]);
        }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to add beneficiary: ' . $e->getMessage()
            ], 500);
        }
    }


    public function createBeneficiary(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'mobile' => 'required|string|regex:/^[6-9]\d{9}$/',
                'account' => 'required|string|max:20',
                'confirmAccount' => 'required|string|same:account',
                'ifsc' => 'required|string|size:11|regex:/^[A-Z]{4}0[A-Z0-9]{6}$/'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $user = $request->get('user');
            $admin = $request->get('admin');
            $mobile = $user->mobile;

            if(isset($request->type)){
                $type = $request->type;
            } else {
                $type = 2;
            }
            

            // Check for duplicate beneficiary
            $existingBeneficiary = Beneficiary::where('user_id', $user->id)
                ->where('account', $request->account)
                ->where('ifsc', $request->ifsc)
                ->where('type', $type)
                ->first();

            if ($existingBeneficiary) {
                return response()->json([
                    'status' => 1,
                    'message' => "Beneficiary added successfully",
                    'data' => $existingBeneficiary // for api user have multiple account this helps in adding multiple account
                ], 200);
            }



            // Verify IFSC and get branch details
            $ifscVerification = $this->verifyIfsc($request->ifsc);
            
            // Verify bank account with API
            $accountVerification = $this->verifyBankAccount($request->account, $request->ifsc, $user, $type, $admin);

            if (!$accountVerification['verified']) {
                return response()->json([
                    'status' => 0,
                    'message' => $accountVerification['error'] ?? 'Bank account verification failed',
                    'data' => $accountVerification['response'] ?? null
                ], 200);
            }


            $url = self::BASE_URL."v2/beneficiaries/create";

            $data = [
                "name"      => $request->name,
                "mobile"    => $request->mobile,
                "account"    => $request->account,
                "confirmAccount"    => $request->confirmAccount,
                "ifsc"        => $request->ifsc
            ];

            $ch = curl_init($url);

            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => json_encode($data),
                CURLOPT_HTTPHEADER     => [
                    "Content-Type: application/json",
                    "Accept: application/json",
                    "mid: ".self::MID,
                    "mkey: ".self::MKEY
                ],
                CURLOPT_TIMEOUT        => 60,
                CURLOPT_CONNECTTIMEOUT => 20
            ]);

            $response = curl_exec($ch);


            $json_response = json_decode($response, true);

            if(isset($json_response['status']) && $json_response['status']==1){

            $beneficiaryData = [
                'user_id' => $user->id,
                'name' => data_get($accountVerification, 'account_holder_name', $request->name),
                'mobile' => $request->mobile,
                'account' => $request->account,
                'ifsc' => $request->ifsc,
                'bank' => $ifscVerification['bank'] ?? null,
                'branch' => $ifscVerification['branch'] ?? null,
                'type' => $type,
                'status' => 0,
                'admin_id' => $admin->id,
                'created_by' => $user->id,
                'ifsc_verified' => $ifscVerification['verified'],
                'account_verified' => $accountVerification['verified'],
                'verification_data' => json_encode([
                    'ifsc_data' => $ifscVerification,
                    'account_data' => $accountVerification,
                    'verified_at' => now()->toISOString()
                ])
            ];

            $beneficiary = Beneficiary::create($beneficiaryData);

            // Clear beneficiary cache for this user
            $this->clearBeneficiaryCache($user->id);


            $beneficiary = Beneficiary::where('id' , $beneficiary->id)->select('id','name','mobile','account','ifsc','bank','branch','status','created_by')->first();

            return response()->json([
                'status' => 1,
                'message' => 'Beneficiary added successfully',
                'data' => $beneficiary
            ]);

        } else {


            return response()->json([
                'status' => 0,
                'message' => 'Failed to add beneficiary'
            ], 500);
        }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to add beneficiary: ' . $e->getMessage()
            ], 500);
        }
        
    }

    public function getBeneficiaryOtp(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'beneficiary_id' => 'required|integer|exists:beneficiaries,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $user = $request->get('user');

            $beneficiary = Beneficiary::where('id', $request->beneficiary_id)
                ->where('user_id', $user->id)
                ->first();

            if (!$beneficiary) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Beneficiary not found'
                ], 200);
            }

            if ($beneficiary->status != 0) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Beneficiary is already verified or active'
                ], 400);
            }
            
            $otp = rand(100000, 999999);
            $number = $beneficiary->mobile;

            $setting = DB::table('settings')->where('user_id', $request->get('admin')->id)->first();
            if($setting && !empty($setting->sender_id)){

                $adminId = $request->get('admin')->id;
                $messageRow = getMessageRow("VerificationOTP", $adminId);
                if(!$messageRow) {
                    return [
                        'status' => 0,
                        'message' => 'Message template not found for type: ' . $messageType
                    ];
                }

                $messageTemplate = $messageRow->message;
                eval("\$message = \"$messageTemplate\";");

                sendSms($message,$adminId,$number,$messageRow->template_id);

            } else {
                $adminId = 1;
                $messageRow = getMessageRow("VerificationOTP", $adminId);
                if(!$messageRow) {
                    return [
                        'status' => 0,
                        'message' => 'Message template not found for type: ' . $messageType
                    ];
                }
                $messageTemplate = $messageRow->message;
                eval("\$message = \"$messageTemplate\";");

                sendSms($message,$adminId,$number,$messageRow->template_id);

            } 

            DB::table('otps')->where('mobile', $number)->delete();
            DB::table('otps')->insert([
                'mobile' => $number,
                'otp' => $otp,
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'OTP sent successfully',
                'data' => ['expires_in' => 300] // 5 minutes
            ]);



        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to verify beneficiary: ' . $e->getMessage()
            ], 500);
        }
    }

    public function verifyBeneficiary(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'beneficiary_id' => 'required|integer|exists:beneficiaries,id',
                'otp' => 'required|string|size:6'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $user = $request->get('user');

            $beneficiary = Beneficiary::where('id', $request->beneficiary_id)
                ->where('user_id', $user->id)
                ->first();

            if (!$beneficiary) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Beneficiary not found'
                ], 200);
            }

            if ($beneficiary->status != 0) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Beneficiary is already verified or active'
                ], 400);
            }
            
            $otpdata = DB::table('otps')->where('mobile', $beneficiary->mobile)->first();
            if (!$otpdata) {
                return ['status' => 0, 'message' => 'OTP expired or not found'];
            } else {

                if ($otpdata->otp != $request->otp) {
                    return ['status' => 0, 'message' => 'Invalid OTP'];
                }
            }
            DB::table('otps')->where('mobile', $beneficiary->mobile)->delete();
            $beneficiary->status = 1;
            $beneficiary->save();

            // Clear beneficiary cache for this user
            $this->clearBeneficiaryCache($user->id);

            return response()->json([
                'status' => 1,
                'message' => 'Beneficiary verified successfully',
                'data' => $beneficiary
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to verify beneficiary: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Display the specified beneficiary
     */
    public function show(Request $request, $id)
    {
        try {
            $user = $request->get('user');
            
            $beneficiary = Beneficiary::with(['user', 'admin', 'creator'])
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$beneficiary) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Beneficiary not found'
                ], 200);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Beneficiary retrieved successfully',
                'data' => $beneficiary
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve beneficiary: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified beneficiary (soft delete)
     */
    public function destroy(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'otp' => 'required|string|size:6'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'OTP is required for deletion',
                    'errors' => $validator->errors()
                ], 400);
            }

            $user = $request->get('user');

            // Verify OTP for deletion
            if (!$this->verifyOtp($user->id, $request->otp)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid OTP'
                ], 400);
            }

            $beneficiary = Beneficiary::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$beneficiary) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Beneficiary not found'
                ], 200);
            }

            $beneficiary->delete();

            // Clear beneficiary cache for this user
            $this->clearBeneficiaryCache($user->id);

            return response()->json([
                'status' => 1,
                'message' => 'Beneficiary deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete beneficiary: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send OTP for beneficiary operations
     */
    public function sendOtp(Request $request)
    {
        try {
            $user = $request->get('user');
            
            // Generate and send OTP (implement your OTP service)
            $otp = sprintf('%06d', rand(0, 999999));

            $number = $user->mobile;
            $setting = Setting::where('user_id', $request->get('admin')->id)->first();

            if($setting && !empty($setting->sender_id)){

                $adminId = $request->get('admin')->id;
                $messageRow = getMessageRow("VerificationOTP", $adminId);
                if(!$messageRow) {
                    return [
                        'status' => 0,
                        'message' => 'Message template not found for type: ' . $messageType
                    ];
                }

                $messageTemplate = $messageRow->message;
                eval("\$message = \"$messageTemplate\";");

                sendSms($message,$adminId,$number,$messageRow->template_id);

            } else {
                $adminId = 1;
                $messageRow = getMessageRow("VerificationOTP", $adminId);
                if(!$messageRow) {
                    return [
                        'status' => 0,
                        'message' => 'Message template not found for type: ' . $messageType
                    ];
                }
                $messageTemplate = $messageRow->message;
                eval("\$message = \"$messageTemplate\";");

                sendSms($message,$adminId,$number,$messageRow->template_id);

            } 
            
            DB::table('otps')->where('mobile', $number)->delete();
            DB::table('otps')->insert([
                'mobile' => $number,
                'otp' => $otp,
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'OTP sent successfully',
                'data' => ['expires_in' => 300] // 5 minutes
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to send OTP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify IFSC code and get branch details
     */
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
            
        } catch (\Exception $e) {
            return [
                'verified' => false,
                'error' => $e->getMessage(),
                'response' => null
            ];
        }
    }

    /**
     * Verify bank account with API and internal logic
     */
    private function verifyBankAccount($accountNumber, $ifsc, $user, $type, $admin)
    {
        try {
            $txnid = rand(11111111, 99999999);
            $fee = 3; // Default fee for all types
            if ($user->is_api_partner == 1) {
                $fee = 4;
            }
            
            // Fee logic for Type 3 (Move To Account)
            if ((int)$type === 3) {
                // Check if user already has any Type 3 beneficiary (active/existing/deleted)
                // We use withTrashed() because "First" implies historical first. 
                // If user adds one (Free), deletes it, and adds another, the second one should be charged.
                $existingType3 = Beneficiary::withTrashed()
                    ->where('user_id', $user->id)
                    ->where('type', 3)
                    ->exists();
                
                // First Type 3 beneficiary is free
                if (!$existingType3) {
                    $fee = 0;
                }
            }

            // Deduct Fee if applicable
            if ($fee > 0) {

                $check = DB::table('verifications')
                    ->where('number', $accountNumber)
                    ->where('status', 1)
                    ->first();

                if ($check && !empty($check->second_res)) {

                    $decoded = json_decode($check->second_res, true);

                    if (is_array($decoded)) {
                        
                        $keysToRemove = ['Fees', 'Bal', 'bal'];
                        $response = array_diff_key($decoded, array_flip($keysToRemove));

                        $accountName = $response['AccountName']
                            ?? ($response['data']['AccountName'] ?? '');

                        return [
                            'verified' => true,
                            'message' => 'Account Validated Successfully',
                            'account_holder_name' => $accountName,
                            'data' => $response
                        ];
                    }

                }
                
                $account = DB::table('accounts')->where('user_id', $user->id)->where('primary_status', false)->first();

                if (!$account) {
                    return [
                        'verified' => false,
                        'error' => 'Primary account not found for fee deduction',
                        'response' => null
                    ];
                }

                $transactionData = [
                    'account_id' => $account->id,
                    'type' => 'DR',
                    'amount' => $fee,
                    'description' => 'Account Verification - ' . $accountNumber,
                    'transaction_id' => $txnid,
                    'created_by' => $user->id,
                    'user_id' => $user->id,
                    'admin_id' => $admin->id,
                    'category_code' => 'COMMISSION'
                ];

                // Assuming createTransaction is globally available helper
                $transaction = createTransaction($transactionData);

                if ($transaction['status'] !== 1) {
                    return [
                        'verified' => false,
                        'error' => $transaction['message'] ?? 'Fee deduction failed',
                        'response' => null
                    ];
                }
            }

            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url('').'/api/v2/verify/bank-account',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode([
                    "accountno" => $accountNumber,
                    "ifsccode" => $ifsc,
                    "outletId" => $user->mid,
                ]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . $user->mid,
                    'mkey: ' . $user->mkey
                ),
            ));

            $response = curl_exec($curl);

               
            $prefixes = [
                'Mr. ', 'MR. ', 'Mr ', 'MR ',
                'Mrs. ', 'MRS. ', 'Mrs ', 'MRS ',
                'Ms. ', 'MS. ', 'Ms ', 'MS ',
                'Miss ', 'MISS ','Miss. ', 'MISS. ',
                'Shri. ', 'SHRI. ', 'Shri ', 'SHRI ',
                'Sri. ', 'SRI. ', 'Sri ', 'SRI ',
                'Smt. ', 'SMT. ', 'Smt ', 'SMT ',
                'Dr. ', 'DR. ', 'Prof. ', 'PROF. ',
                'Mx. ', 'Master ', 'MASTER '
            ];

            $response = str_replace($prefixes, '', $response);
            $rj = json_decode($response, true);

            // Log verification attempt
            $verificationData = [
                'user_id' => $user->id,
                'type' => 'Account',
                'refid' => $txnid,
                'number' => $accountNumber,
                'status' => 0, // Pending/Failed initially
                'first_res' => $ifsc,
                'second_res' => json_encode($rj),
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            // Check success status from API
           if (isset($rj['status']) && $rj['status'] == 1) {
               
                // Update log status
                $verificationData['status'] = 1;

                $apiName = $rj['AccountName'] ?? '';
                // Fallback if AccountName is in data object
                if (empty($apiName) && isset($rj['data']['AccountName'])) {
                    $apiName = $rj['data']['AccountName'];
                }

                if ($user->is_api_partner == 1) {
                    // api partner can add different bank account still verify it
                     DB::table('verifications')->insert($verificationData);
                     return [
                        'verified' => true,
                        'account_holder_name' => $apiName,
                        'response' => $rj
                    ];
                }

            


                if ((int)$type === 3 && !empty($user->mid)) {
                    $userKyc = DB::table('user_kyc')->where('user_id', $user->id)->first();
                

                    if (!$userKyc || empty($userKyc->name)) {
                        DB::table('verifications')->insert($verificationData);
                        return response()->json([
                            'status' => 0,
                            'message' => 'Your KYC is not completed. Cannot add Move To Account beneficiary.'
                        ], 200);
                    }

                    $draft = DB::table('aeps_drafts')->where('mid', $user->mid)->first();
                    $error = 1;
                    $messages = 'For Move To Account, beneficiary name must match your KYC name (' . $userKyc->name . ')'
                        . (isset($draft) ? ' or your Shop name (' . $draft->shop_name . ')' : '')
                        . '. Only self-transfers are allowed.';

                    // KYC name se match ho to error nahi
                    if (strtoupper(trim($apiName)) == strtoupper(trim($userKyc->name))) {
                        $error = 0;
                    }

                    // Ya shop name se match ho to error nahi
                    if (isset($draft) && strtoupper(trim($apiName)) == strtoupper(trim($draft->shop_name))) {
                        $error = 0;
                    }

                    if ($error == 1) {

                        DB::table('verifications')->insert($verificationData);
                        
                        return response()->json([
                            'status' => 0,
                            'message' => $messages
                        ], 200);
                    }
                }
                
                DB::table('verifications')->insert($verificationData);
                return [
                    'verified' => true,
                    'account_holder_name' => $rj['AccountName'] ?? ($rj['data']['AccountName'] ?? ''),
                    'response' => $rj
                ];

            } else {
                DB::table('verifications')->insert($verificationData);
                return [
                    'verified' => false,
                    'error' => $rj['resText'] ?? 'Bank verification failed',
                    'response' => $rj
                ];
            }

        } catch (\Exception $e) {
            CatchLogService::logException(request(), 'verifyBankAccount', $e, [
                'context' => 'Bank Account Verification Error',
                'account' => $accountNumber,
                'ifsc' => $ifsc
            ]);
            return [
                'verified' => false,
                'error' => 'Verification exception: ' . $e->getMessage(),
                'response' => null
            ];
        }
    }

    /**
     * Verify OTP
     */
    private function verifyOtp($userId, $otp)
    {
        $user = $request->get('user');
        $number = $user->mobile;

        $otpdata = DB::table('otps')->where('mobile', $number)->first();
        if (!$otpdata) {
            return false;
        } else {

            if ($otpdata->otp != $otp) {
                return false;
            }
        }
        DB::table('otps')->where('mobile', $number)->delete();
        return true;
        
    }

    /**
     * Handle beneficiary payment
     */
    public function beneficiaryPayment(Request $request)
    {
        try {

            $request->merge([
                'txn_type' => $request->txn_type ?? 'NEFT'
            ]);
            
            $validator = Validator::make($request->all(), [
                'account_id' => 'required|int',
                'beneficiary_id' => 'required|int',
                'amount' => 'required|numeric|min:1',
                'details' => 'nullable|string',
                'mpin' => 'required|string|size:4',
                'transaction_id' => 'required|string',
                'channel' => 'required|int',
                'txn_type' => 'required|string|in:RTGS,IMPS,NEFT', // default pass NEFT
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $user = $request->get('user');
            $admin = $request->get('admin');
            // Get the beneficiary

            $beneficiary = Beneficiary::where('id', $request->beneficiary_id)
                ->where('user_id', $user->id)
                ->first();

            if (!$beneficiary) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Beneficiary not found'
                ], 200);
            }

            

            $category_code='DMT';
            if($beneficiary->type==3){
                $category_code='MOVE_TO';
            }

            // dynamic service check
            $settings_services = DB::table('settings_services')
                ->where('user_id', $admin->id)
                ->where('type', $category_code)
                ->where('txn_type', $request->txn_type)
                ->first();

            if ($settings_services && (int)$settings_services->status === 0) {
                $message = $settings_services->message 
                    ?? 'Service is temporarily unavailable. Please try again later.';

                return response()->json([
                    'status' => 0,
                    'message' => $message,
                    'data' => null
                ], 200);
            }

            $transactionData = [
                'account_id' => $request->account_id,
                'mpin' => $request->mpin,
                'type' => 'DR',
                'amount' => $request->amount,
                'transaction_amount' => $request->amount,
                'description' => $category_code.' - '.$beneficiary->account,
                'transaction_id' => $request->transaction_id,
                'category_code' => $category_code
            ];

            $transactionData = processTransaction($request, $transactionData);


            if($transactionData['status'] !== 1) {
                return response()->json(['status' => 0, 'message' => $transactionData['message'], 'data' => NULL], 200);
            }

            if(!empty($transactionData['status']) && $transactionData['status'] == 1) {


                $url = self::BASE_URL."v2/beneficiaries/beneficiary-payment";

                $data = [
                    "account_id"      => 2669,
                    "beneficiary_id"    => $beneficiary->bid,
                    "amount"    => $request->amount,
                    "details"    => $request->details,
                    "mpin"        => '1234',
                    "transaction_id"  => $request->transaction_id,
                    "channel"=> $request->channel,
                    "txn_type"=> $request->txn_type
                ];

                $ch = curl_init($url);

                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST           => true,
                    CURLOPT_POSTFIELDS     => json_encode($data),
                    CURLOPT_HTTPHEADER     => [
                        "Content-Type: application/json",
                        "Accept: application/json",
                        "mid: ".self::MID,
                        "mkey: ".self::MKEY
                    ],
                    CURLOPT_TIMEOUT        => 60,
                    CURLOPT_CONNECTTIMEOUT => 20
                ]);

                $response = curl_exec($ch);


                DB::table('logs')->insert([
                    'mid'          => $user->mid ?? '',
                    'type'         => 'Beneficiary Payout',
                    'platform'     => 'WEB',
                    'headers'      => json_encode([
                        'Accept'       => 'application/json',
                        'Content-Type' => 'application/json',
                        'mid' => self::MID,
                        'mkey' => self::MKEY,
                    ]),
                    'request_data'  => json_encode($data),
                    'response_data'  => $response,
                    'url'           => $url,
                    'txnid'         => 0,
                    'status'        => 0,
                    'timestamp'    => now(),
                    'created_at'   => now()->format('Y-m-d H:i:s'),
                ]);


                $json_response = json_decode($response, true);

                if(isset($json_response['status']) && $json_response['status']==1){


                    // Create payout record
                    $payout = Payout::create([
                        'user_id' => $user->id,
                        'beneficiary_id' => $beneficiary->id,
                        'account_id' => $request->account_id,
                        'bank_name' => $beneficiary->branch,
                        'ifsc' => $beneficiary->ifsc,
                        'name' => $beneficiary->name,
                        'mobile' => $beneficiary->mobile,
                        'account' => $beneficiary->account,
                        'amount' => $request->amount,
                        'transaction_id' => $request->transaction_id,
                        'charge' => 0,
                        'type' => $request->txn_type,
                        'status' => 'pending',
                        'status_number' => 0,
                        'call_back_url' => $request->callback_url,
                        'admin_id' => $admin->id,
                        'created_by' => $user->id
                    ]);

                    if($beneficiary->type==3){

                        $commissionTransactionData = [
                            'user_id' => $user->id,
                            'amount' => $request->amount,
                            'sub_module_id' => 51,
                            'description' => 'MOVE_TO Charge '.$beneficiary->account,
                            'admin_id' => $admin->id,
                            'category_code' => $category_code,
                            'txn_type' => 'debit',
                            'account_id' => $request->account_id
                        ];

                        processCommissionCharge($commissionTransactionData);

                    } else {

                        $commissionTransactionData = [
                            'user_id' => $user->id,
                            'amount' => $request->amount,
                            'sub_module_id' => 49,
                            'description' => 'DMT Charge '.$beneficiary->account,
                            'admin_id' => $admin->id,
                            'category_code' => $category_code,
                            'txn_type' => 'debit',
                            'account_id' => $request->account_id
                        ];

                        processCommissionCharge($commissionTransactionData);
                    }

                    return response()->json(['status' => 1, 'message' => 'Transaction Accepted', 'data'=>$transactionData], 200);
                } else {


                    $transactionData = [
                        'account_id' => $request->account_id,
                        'mpin' => $request->mpin,
                        'type' => 'CR',
                        'amount' => $request->amount,
                        'transaction_amount' => $request->amount,
                        'description' => $category_code.' - '.$beneficiary->account,
                        'transaction_id' => $request->transaction_id,
                        'category_code' => $category_code
                    ];

                    processTransaction($request, $transactionData);

                    return response()->json(['status' => 0, 'message' => 'Transaction failed', 'data' => NULL], 200);
                }
          
            } else {
                return response()->json(['status' => 0, 'message' => 'Transaction failed', 'data' => NULL], 200);
            }


        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'beneficiaryPayment', $e, [
                'api' => 'Beneficiary Payment API',
                'context' => 'Beneficiary Payment Error',
            ]);
          
       
            return response()->json([
                'status' => 0,
                'message' => 'Payment failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function beneficiaryPayment1(Request $request){
        try {
            $validator = Validator::make($request->all(), [
                'beneficiary_id' => 'required|int',
                'amount' => 'required|numeric|min:1|max:100000',
                'details' => 'nullable|string',
                'transaction_id' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 200);
            }

           

            $user = $request->get('user');
            $admin = $request->get('admin');

            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'User not found', 'data' => NULL], 200);
            }

            $credit_user_id = $request->get('user')->id;
            $account = DB::table('accounts')->where('user_id', $credit_user_id)->where('primary_status', false)->first();
        
            if(!$account) {
                return response()->json(['status' => 0, 'message' => 'Primary account not found', 'data' => NULL], 200);
            }

          

              
            // Get the beneficiary
            $beneficiary = Beneficiary::where('id', $request->beneficiary_id)
                ->where('user_id', $user->id)
                ->first();

            if (!$beneficiary) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Beneficiary not found'
                ], 200);
            }

         
            $category_code='DMT';
            $module_id=49;
            if($beneficiary->type==3){
                $category_code='MOVE_TO';
                $module_id=51;
            }



            $account1 = DB::table('payouts')->where('transaction_id', $request->transaction_id)->first();
        
            if($account1) {
                return response()->json(['status' => 0, 'message' => 'Duplicate transaction_id', 'data' => NULL], 200);
            }

            if($request->amount<1000) {
                return response()->json(['status' => 0, 'message' => 'Minimum amount is 1000', 'data' => NULL], 200);
            }

            if($request->amount>200000) {
                return response()->json(['status' => 0, 'message' => 'Maximum amount is 200000', 'data' => NULL], 200);
            }
                 

            // Step 1: Prepare transaction data
            $transactionData1 = [
                'account_id' => $account->id,
                'type' => 'DR',
                'amount' => $request->amount,
                'description' => $request->details,
                'transaction_id' => $request->transaction_id,
                'created_by' => $user->id,
                'admin_id' => $admin->id,
                'user_id' => $user->id,
                'category_code' => $category_code
            ];

            
            // Step 2: Create the transaction
            $transactionData = createTransaction($transactionData1);

          

            if($transactionData['status'] === 1) {

                // Create payout record
                $payout = Payout::create([
                    'user_id' => $user->id,
                    'beneficiary_id' => $beneficiary->id,
                    'account_id' => $account->id,
                    'bank_name' => $beneficiary->branch,
                    'ifsc' => $beneficiary->ifsc,
                    'name' => $beneficiary->name,
                    'mobile' => $beneficiary->mobile,
                    'account' => $beneficiary->account,
                    'amount' => $request->amount,
                    'transaction_id' => $request->transaction_id,
                    'charge' => 0,
                    'type' => 'IMPS',
                    'status' => 'pending',
                    'status_number' => 0,
                    'call_back_url' => '',
                    'admin_id' => $admin->id,
                    'created_by' => $user->id
                ]);

                 $commissionTransactionData = [
                        'user_id' => $user->id,
                        'amount' => $request->amount,
                        'sub_module_id' => $module_id,
                        'description' => $category_code.' Charge '.$beneficiary->account,
                        'admin_id' => $admin->id,
                        'category_code' => $category_code,
                        'txn_type' => 'debit',
                        'account_id' => $account->id
                    ];

                    processCommissionCharge($commissionTransactionData);

                    return response()->json(['status' => 1, 'message' => 'Transaction Accepted', 'data'=> $transactionData], 200);
              
                } else {
                    return response()->json(['status' => 0, 'message' => $transactionData['message'] ?? 'Transaction failed', 'data' => NULL], 200);
            }

        } catch (\Exception $e) {

            return response()->json([
                'status' => 0,
                'message' => 'Payment failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    // speacialy for api partners to sned payouts to api partner merchant
    public function merchantPayment(Request $request) {
        try {
            $validator = Validator::make($request->all(), [
                'outletId' => 'required|string|min:1|max:255',
                'amount' => 'required|numeric|min:100|max:100000',
                'txn_type' => 'required|string|in:RTGS,IMPS,NEFT', // default pass NEFT
                'transaction_id' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 200);
            }

           

            $user = $request->get('user');
            $admin = $request->get('admin');

            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'User not found', 'data' => NULL], 200);
            }

            $credit_user_id = $request->get('user')->id;
            $account = DB::table('accounts')->where('user_id', $credit_user_id)->where('primary_status', true)->first();
        
            if(!$account) {
                return response()->json(['status' => 0, 'message' => 'Primary account not found', 'data' => NULL], 200);
            }

            // TO DO: MERCHANT PAYOUT Beneficiary
            $aepsUser = AepsDraft::where('mid', $request->outletId)
            ->select('account_number','phone','ifsc_code','bank_name','bank_branch','bank_verified_at','status','accountData','aeps_status','mid','shop_name')
            ->first();
            if (!$aepsUser) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Please provide valid Outlet ID',
                ], 200);
            }

            if ($aepsUser->aeps_status < 3) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Please provide valid Outlet ID',
                ], 200);
            }
            
            $mid = $aepsUser->mid;
            $shop_name = $aepsUser->shop_name;
            $phone = $aepsUser->phone;

            $account_number = $aepsUser->account_number;
            $ifsc_code = $aepsUser->ifsc_code;
            $bank_name = $aepsUser->bank_name;
            $bank_branch = $aepsUser->bank_branch;
            $bank_verified_at = $aepsUser->bank_verified_at;
            $status = $aepsUser->status;
            $accountData = $aepsUser->accountData;

            $type = 3; // MOVE TO // BENEFICIARY TYPE

            // Check for duplicate beneficiary 
            $beneficiary = Beneficiary::where('user_id', $user->id)
                ->where('account', $account_number)
                ->where('ifsc', $ifsc_code)
                ->where('type', $type)
                ->first();

            // check if beneficiary is not approved
            if($beneficiary && $beneficiary->status != 1){
                return response()->json([
                    'status' => 0,
                    'message' => 'Beneficiary is not approved for merchant payout.',
                ], 200);
            }

            // if not then create beneficiary
            if (!$beneficiary) {
         
                // Verify IFSC and get branch details
                $ifscVerification = $this->verifyIfsc($ifsc_code);
                
                // Verify bank account (optional - implement based on available API)
                $accountVerification = $this->verifyBankAccount($account_number, $ifsc_code);

                $beneficiaryData = [
                    'user_id' => $user->id,
                    'name' => $shop_name,
                    'mobile' => $phone,
                    'account' => $account_number,
                    'ifsc' => $ifsc_code,
                    'bank' => $bank_name,
                    'branch' => $bank_branch,
                    'type' => $type,
                    'status' => 1, // verified by default aeps draft data
                    'admin_id' => $admin->id,
                    'created_by' => $user->id,
                    'ifsc_verified' => $ifscVerification['verified'],
                    'account_verified' => $accountVerification['verified'],
                    'verification_data' => json_encode([
                        'ifsc_data' => $ifscVerification,
                        'account_data' => $accountVerification,
                        'verified_at' => now()->toISOString()
                    ])
                ];

                $beneficiary = Beneficiary::create($beneficiaryData);
            }


            // MERCHANT PAYOUT NOT IMPLEMENTED
            // return response()->json(['status' => 0, 'message' => 'Merchant Payment Failed', 'data' => NULL], 200);

              
            // check the beneficiary
            if (!$beneficiary) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Beneficiary not found'
                ], 200);
            }

            $category_code = 'MOVE_TO'; // only move to

            $account1 = DB::table('payouts')->where('transaction_id', $request->transaction_id)->first();
        
            if($account1) {
                return response()->json(['status' => 0, 'message' => 'Duplicate transaction_id', 'data' => NULL], 200);
            }

            if($request->amount < 1000) {
                return response()->json(['status' => 0, 'message' => 'Minimum amount is 1000', 'data' => NULL], 200);
            }

            if($request->amount > 100000) {
                return response()->json(['status' => 0, 'message' => 'Maximum amount is 100000', 'data' => NULL], 200);
            }
                 

            // Step 1: Prepare transaction data
            $transactionData1 = [
                'account_id' => $account->id,
                'type' => 'DR',
                'amount' => $request->amount,
                'description' => $transaction_description,
                'transaction_id' => $transaction_id,
                'created_by' => $user->id,
                'admin_id' => $admin->id,
                'user_id' => $user->id,
                'category_code' => $category_code
            ];

            
            // Step 2: Create the transaction
            $transactionData = createTransaction($transactionData1);

          

            if($transactionData['status'] === 1) {

                // Create payout record
                $payout = Payout::create([
                    'user_id' => $user->id,
                    'beneficiary_id' => $beneficiary->id,
                    'account_id' => $account->id,
                    'bank_name' => $beneficiary->branch,
                    'ifsc' => $beneficiary->ifsc,
                    'name' => $beneficiary->name,
                    'mobile' => $beneficiary->mobile,
                    'account' => $beneficiary->account,
                    'amount' => $request->amount,
                    'transaction_id' => $transaction_id,
                    'charge' => 0,
                    'type' => $request->txn_type,
                    'status' => 'pending',
                    'status_number' => 0,
                    'call_back_url' => '',
                    'admin_id' => $admin->id,
                    'created_by' => $user->id
                ]);

                $tcharge = 0;
                $amount = (float) $request->amount;
                
                // api partner move to charge
                if($request->txn_type == 'IMPS'){
                    if($amount < 25000){
                        $tcharge = 5;
                    }else{
                        $tcharge = 10;
                    }
                }
                
                // Move to IMPS Charge
                if($tcharge > 0) {

                    $txnid = 'MOVE_TO' . rand(111111, 999999);
                    $account = DB::table('accounts')->where('user_id', $user->id)->where('primary_status', true)->first();

                    $transactionData1 = [
                        'account_id' => $account->id,
                        'type' => 'DR',
                        'amount' => $tcharge,
                        'description' => 'MOVE_TO Charge '.$beneficiary->account,
                        'transaction_id' => $txnid,
                        'created_by' => $user->id,
                        'admin_id' => $admin->id,
                        'user_id' => $user->id,
                        'category_code' => 'MOVE_TO'
                    ];

                    // Step 2: Create the transaction
                    $transactionData = createTransaction($transactionData1);

                }
                    
                return response()->json(['status' => 1, 'message' => 'Transaction Accepted', 'data'=> $transactionData], 200);
              
            } else {
                return response()->json(['status' => 0, 'message' => $transactionData['message'] ?? 'Transaction failed', 'data' => NULL], 200);
            }

        } catch (\Exception $e) {

            return response()->json([
                'status' => 0,
                'message' => 'Payment failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    public function payoutCallback(Request $request){
       
        DB::table('payouts_callbacks')->insert([
            'payouts_callbacks' => json_encode($request->input())
        ]);

       
        $payout = Payout::where('transaction_id', $request->input('txnid'))->first();

        // Get the beneficiary
        $beneficiary = Beneficiary::where('id', $payout->beneficiary_id)->first();

        
        $category_code='DMT';
        if($beneficiary){
            if($beneficiary->type==3){
                $category_code='MOVE_TO';
            }
        }
      
        $request['fees']=6;

        if(isset($payout->transaction_id)  && $payout->status=='PROCESSING'){

          
            $payout->update([
                'call_back_response' => json_encode($request->input()),
                'status' => $request->input('status'),
                'utr' => $request->input('utrno'),
                'message' => $request->input('message') ?? 'API response received'
            ]);
       

            $credit_user_id='';
            $is_api_partner = false;
            $adminData = User::where('id',$payout->admin_id)->first();

            if($adminData && $adminData->is_api_partner==true) {
                $credit_user_id = $adminData->id;
                $is_api_partner = true;
            } 

            if($is_api_partner == true){

                $setting = Setting::where('user_id', $credit_user_id)->first();
                if($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)){
                    // Send callback to partner URL
                    try {

                        
                        $postData = [
                            "type" => "payout",  // must be JSON string
                            "status" => $request->input('status'),
                            "message" => $request->input('message'),
                            "txnId" => $request->input('txnid'),
                            "name" => $request->input('name'),
                            "bankacc" => $request->input('bankacc'),
                            "ifsccode" => $request->input('ifsccode'),
                            "utr" => $request->input('utrno'),
                        ];

                        // Initialize cURL
                        $ch = curl_init($setting->call_back_url);

                        // Encode POST data as JSON
                        $payload = json_encode($postData);

                        // Set cURL options
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($ch, CURLOPT_POST, true);
                        curl_setopt($ch, CURLOPT_HTTPHEADER, [
                            'Content-Type: application/json',
                            'Content-Length: ' . strlen($payload)
                        ]);
                        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

                        // Execute and get response
                        $response = curl_exec($ch);

                    } catch (\Exception $e) {
                        \Log::error('Callback to API partner failed: ' . $e->getMessage());
                    }   

                }
            }
        
            
            if($request->input('status')=='FAILED'){

                $rem = "Technical Issue : Payment Failed & Refund";
                $payout->update(['status' => 'FAILED','message' => $rem,'status_number' => 2]);
                
                $transactionData1 = [
                    'account_id' => $payout->account_id,
                    'mpin' => '',
                    'type' => 'CR',
                    'amount' => $payout->amount,
                    'transaction_amount' => $payout->amount,
                    'description' => $rem,
                    'transaction_id' => $payout->transaction_id.'-0',
                    'category_code' => $category_code
                ];

                processTransaction($request, $transactionData1, false);

                $commissionTransactionData = [
                    'user_id' => $payout->user_id,
                    'amount' => $request->amount,
                    'sub_module_id' => 51,
                    'description' => 'Fund Transfer Charge Refund '.$payout->account,
                    'admin_id' => $payout->admin_id,
                    'txn_type' => 'refund',
                    'category_code' => $category_code,
                    'account_id' => $payout->account_id
                ];

                processCommissionCharge($commissionTransactionData);


            }
            
        }

        
    }


    public function payoutCallbackAnvineo(Request $request){
       
        DB::table('payouts_callbacks')->insert([
            'payouts_callbacks' => json_encode($request->input())
        ]);

       
        $payout = Payout::where('transaction_id', $request->input('txnid'))->first();

        // Get the beneficiary
        $beneficiary = Beneficiary::where('id', $payout->beneficiary_id)->first();

        
        $category_code='DMT';
        if($beneficiary){
            if($beneficiary->type==3){
                $category_code='MOVE_TO';
            }
        }
      
        $request['fees']=6;

        if(isset($payout->transaction_id)  && $payout->status=='PROCESSING'){

          
            $payout->update([
                'call_back_response' => json_encode($request->input()),
                'status' => $request->input('status'),
                'utr' => $request->input('utrno'),
                'message' => $request->input('message') ?? 'API response received'
            ]);
       

            $credit_user_id='';
            $is_api_partner = false;
            $adminData = User::where('id',$payout->admin_id)->first();

            if($adminData && $adminData->is_api_partner==true) {
                $credit_user_id = $adminData->id;
                $is_api_partner = true;
            } 

            if($is_api_partner == true){

                $setting = Setting::where('user_id', $credit_user_id)->first();
                if($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)){
                    // Send callback to partner URL
                    try {

                        
                        $postData = [
                            "type" => "payout",  // must be JSON string
                            "status" => $request->input('status'),
                            "message" => $request->input('message'),
                            "txnId" => $request->input('txnid'),
                            "name" => $request->input('name'),
                            "bankacc" => $request->input('bankacc'),
                            "ifsccode" => $request->input('ifsccode'),
                            "utr" => $request->input('utrno'),
                        ];

                        // Initialize cURL
                        $ch = curl_init($setting->call_back_url);

                        // Encode POST data as JSON
                        $payload = json_encode($postData);

                        // Set cURL options
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($ch, CURLOPT_POST, true);
                        curl_setopt($ch, CURLOPT_HTTPHEADER, [
                            'Content-Type: application/json',
                            'Content-Length: ' . strlen($payload)
                        ]);
                        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

                        // Execute and get response
                        $response = curl_exec($ch);

                    } catch (\Exception $e) {
                        \Log::error('Callback to API partner failed: ' . $e->getMessage());
                    }   

                }
            }
        
            
            if($request->input('status')=='FAILED'){

                $rem = "Technical Issue : Payment Failed & Refund";
                $payout->update(['status' => 'FAILED','message' => $rem,'status_number' => 2]);
                
                $transactionData1 = [
                    'account_id' => $payout->account_id,
                    'mpin' => '',
                    'type' => 'CR',
                    'amount' => $payout->amount,
                    'transaction_amount' => $payout->amount,
                    'description' => $rem,
                    'transaction_id' => $payout->transaction_id.'-0',
                    'category_code' => $category_code
                ];

                processTransaction($request, $transactionData1, false);

                $commissionTransactionData = [
                    'user_id' => $payout->user_id,
                    'amount' => $request->amount,
                    'sub_module_id' => 51,
                    'description' => 'Fund Transfer Charge Refund '.$payout->account,
                    'admin_id' => $payout->admin_id,
                    'txn_type' => 'refund',
                    'category_code' => $category_code,
                    'account_id' => $payout->account_id
                ];

                processCommissionCharge($commissionTransactionData);


            }
            
        }

        
    }

    public function payoutStatus(){

        $payouts = Payout::where('status', 'PROCESSING')->get();

       


        foreach($payouts as $payout){

            // Get the beneficiary
            $beneficiary = Beneficiary::where('id', $payout->beneficiary_id)->first();

        
            $category_code='DMT';
            if($beneficiary){
                if($beneficiary->type==3){
                    $category_code='MOVE_TO';
                }
            }

            $gpayParams = array();
            $gpayParams["mid"] = "G195064846";
            $gpayParams["mkey"] = "PRA3948146";
            $gpayParams["txnid"] = $payout->transaction_id;
            $post_data = json_encode($gpayParams, true);
            $url = "https://payment.goterpay.com/v3/payout/status";
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);

            $rj = (json_decode($response, true));
            
            $payout->update([
                'call_back_response' => $response,
                'status' => $rj['status'],
                'utr' => $rj['utrno'],
                'message' => $rj['message'] ?? 'API response received'
            ]);

            if(isset($payout->transaction_id)){

                $credit_user_id='';
                $is_api_partner = false;
                $adminData = User::where('id',$payout->admin_id)->first();

                if($adminData && $adminData->is_api_partner==true) {
                    $credit_user_id = $adminData->id;
                    $is_api_partner = true;
                } 

                if($is_api_partner == true){

                    $setting = Setting::where('user_id', $credit_user_id)->first();
                    if($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)){
                        // Send callback to partner URL
                        try {

                            //{"status":"SUCCESS","txnid":"GP72456278","utrno":"521717440424","bankacc":"0123456789",
                            // "ifsccode":"KKBK0001351","name":"Pooja SenGupta","amount":"20.00","fees":"4.72",
                            // "date":"2025-08-05 11:42:40","message":"Payment Transfer Success"}
                            $postData = [
                                "type" => "payout",  // must be JSON string
                                "status" => $rj['status'],
                                "message" => $rj['message'],
                                "txnId" => $rj['txnid'],
                                "name" => $rj['name'],
                                "bankacc" => $rj['bankacc'],
                                "ifsccode" => $rj['ifsccode'],
                                "utr" => $rj['utrno'],
                            ];

                            // Initialize cURL
                            $ch = curl_init($setting->call_back_url);

                            // Encode POST data as JSON
                            $payload = json_encode($postData);

                            // Set cURL options
                            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                            curl_setopt($ch, CURLOPT_POST, true);
                            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                                'Content-Type: application/json',
                                'Content-Length: ' . strlen($payload)
                            ]);
                            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

                            // Execute and get response
                            $response = curl_exec($ch);

                        } catch (\Exception $e) {
                            \Log::error('Callback to API partner failed: ' . $e->getMessage());
                        }   

                    }
                }
            
                
                if($rj['status']=='FAILED'){

                    $rem = $rj['message'];
                    $payout->update(['status' => 'FAILED','message' => $rem,'status_number' => 2]);
                    
                    $transactionData1 = [
                        'account_id' => $payout->account_id,
                        'type' => 'CR',
                        'amount' => $payout->amount,
                        'description' => $rem,
                        'transaction_id' => $payout->transaction_id.'-0',
                        'created_by' => $payout->user_id,
                        'admin_id' => $payout->admin_id,
                        'user_id' => $payout->user_id
                    ];

                    createTransaction($transactionData1);

                    $commissionTransactionData = [
                        'user_id' => $payout->user_id,
                        'amount' => $rj['amount'],
                        'sub_module_id' => 51,
                        'description' => 'Fund Transfer Charge Refund '.$payout->account,
                        'admin_id' => $payout->admin_id,
                        'txn_type' => 'refund',
                        'category_code' => $category_code,
                        'account_id' => $payout->account_id
                    ];

                    processCommissionCharge($commissionTransactionData);


                }
                
            }
        }
    }


    public function payouts(Request $request)
    {
        try {
            $user = $request->get('user');
            $perPage = $request->get('per_page', 15);
            $status = $request->input('status');
            $date_from = $request->input('date_from');
            $date_to = $request->input('date_to');

            $query = Payout::with(['beneficiary', 'user', 'admin', 'creator','setting'])
                ->forUser($user->id)
                ->orderBy('created_at', 'desc');

            // Apply search filter
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('transaction_id', 'LIKE', "%{$search}%")
                    ->orWhere('name', 'LIKE', "%{$search}%")
                    ->orWhere('account', 'LIKE', "%{$search}%")
                    ->orWhere('ifsc', 'LIKE', "%{$search}%")
                    ->orWhere('status', 'LIKE', "%{$search}%");
                });
            }


            // Apply status_number filter (status param maps to status_number)
            if ($request->filled('status')) {
                $query->where('status_number', $request->status);
            }

            // Apply created_at date range filter
            if ($request->filled('date_from') && $request->filled('date_to')) {
                $query->whereBetween('created_at', [$request->date_from . ' 00:00:00', $request->date_to . ' 23:59:59']);
            } elseif ($request->filled('date_from')) {
                $query->where('created_at', '>=', $request->date_from . ' 00:00:00');
            } elseif ($request->filled('date_to')) {
                $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
            }

            $payouts = $query->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'Payouts retrieved successfully',
                'data' => $payouts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve payouts: ' . $e->getMessage()
            ], 500);
        }
    }

    public function beneficiaryTransaction(Request $request, $id)
    {
        try {
            $user = $request->get('user');
            $perPage = $request->input('per_page', 15); // Default 15 per page
            $page = $request->input('page', 1); // Default to first page

            $query = Payout::where('beneficiary_id', $id)
                ->forUser($user->id)
                ->orderBy('created_at', 'desc');

            // Paginate data by page number
            $payouts = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'status' => 1,
                'message' => 'Payouts retrieved successfully',
                'data' => $payouts->items(), // actual data list
                'pagination' => [
                    'total' => $payouts->total(),
                    'current_page' => $payouts->currentPage(),
                    'last_page' => $payouts->lastPage(),
                    'per_page' => $payouts->perPage(),
                    'from' => $payouts->firstItem(),
                    'to' => $payouts->lastItem(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve payouts: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all payouts/money transfers for a specific user_id
     * Used for viewing user's payout history from admin panel
     */
    public function userPayoutHistory(Request $request, $userId)
    {
        try {
            $perPage = $request->input('per_page', 50);
            $page = $request->input('page', 1);

            $query = Payout::where('user_id', $userId)
                ->with(['beneficiary:id,name,account,ifsc,bank'])
                ->select([
                    'id', 'user_id', 'beneficiary_id', 'name', 'mobile', 
                    'account', 'ifsc', 'bank_name', 'amount', 'charge',
                    'status', 'type', 'utr', 'transaction_id', 'created_at'
                ])
                ->orderBy('created_at', 'desc');

            // Apply status filter if provided
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $payouts = $query->paginate($perPage, ['*'], 'page', $page);

            // Calculate summary
            $summary = Payout::where('user_id', $userId)
                ->selectRaw('
                    COUNT(*) as total_count,
                    SUM(amount) as total_amount,
                    SUM(CASE WHEN LOWER(status) = "success" THEN 1 ELSE 0 END) as success_count,
                    SUM(CASE WHEN LOWER(status) = "success" THEN amount ELSE 0 END) as success_amount,
                    SUM(CASE WHEN LOWER(status) = "pending" THEN 1 ELSE 0 END) as pending_count,
                    SUM(CASE WHEN LOWER(status) = "pending" THEN amount ELSE 0 END) as pending_amount,
                    SUM(CASE WHEN LOWER(status) = "failed" THEN 1 ELSE 0 END) as failed_count,
                    SUM(CASE WHEN LOWER(status) = "failed" THEN amount ELSE 0 END) as failed_amount
                ')
                ->first();

            return response()->json([
                'status' => 1,
                'message' => 'User payout history retrieved successfully',
                'data' => $payouts->items(),
                'summary' => $summary,
                'pagination' => [
                    'total' => $payouts->total(),
                    'current_page' => $payouts->currentPage(),
                    'last_page' => $payouts->lastPage(),
                    'per_page' => $payouts->perPage(),
                    'from' => $payouts->firstItem(),
                    'to' => $payouts->lastItem(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve user payout history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear all beneficiary cache for a specific user
     */
    private function clearBeneficiaryCache($userId)
    {
        // Clear all cache keys that start with beneficiaries_user_{userId}
        // Since Laravel doesn't support wildcard deletion easily, we'll use cache tags
        // or clear by pattern using the cache store directly
        
        // Using a simple pattern-based approach:
        // Clear cache with a pattern - note this works with Redis, Memcached, etc.
        $pattern = 'beneficiaries_user_' . $userId . '*';
        
        try {
            // For Redis cache driver
            if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
                $redis = Cache::getStore()->connection();
                $keys = $redis->keys($pattern);
                if (!empty($keys)) {
                    $redis->del($keys);
                }
            } else {
                // Fallback: Use cache tags if available (requires Redis or Memcached)
                // Or simply flush all cache (not recommended for production)
                // For now, we'll clear specific common keys
                $searchOptions = ['none'];
                $verifiedOptions = ['all', 'true', 'false'];
                $pages = range(1, 10); // Clear first 10 pages
                $perPageOptions = [15, 25, 50, 100];
                
                foreach ($searchOptions as $search) {
                    foreach ($verifiedOptions as $verified) {
                        foreach ($pages as $page) {
                            foreach ($perPageOptions as $perPage) {
                                $cacheKey = 'beneficiaries_user_' . $userId . 
                                          '_search_' . $search .
                                          '_verified_' . $verified .
                                          '_page_' . $page .
                                          '_per_page_' . $perPage;
                                Cache::forget($cacheKey);
                            }
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::warning('Failed to clear beneficiary cache: ' . $e->getMessage());
        }
    }


    public function beneaccount()
    {
        $existingUser = AepsDraft::where('bank_verified_at', 1)->get();

        foreach ($existingUser as $draft) {

            // check user exists
            $user = User::where('mid', $draft->mid)->first();
            if ($user) {

                // check beneficiary already exists
                $exists = Beneficiary::where('account', $draft->account_number)
                    ->where('user_id', $user->id)
                    ->where('type', 3)
                    ->first();

                if (!$exists) {

                    // IFSC verification API
                    $ifscVerification = $this->verifyIfsc($draft->ifsc_code);

                    $beneficiaryData = [
                        'user_id' => $user->id,
                        'name' => $draft->full_name,
                        'mobile' => $draft->phone,
                        'account' => $draft->account_number,
                        'ifsc' => $draft->ifsc_code,
                        'bank' => $draft->bank_name,
                        'branch' => $draft->bank_branch,
                        'type' => 3,
                        'status' => 1,
                        'admin_id' => $draft->admin_id,
                        'created_by' => $user->id,
                        'ifsc_verified' => 1,
                        'account_verified' => 1,
                        'verification_data' => json_encode([
                            'ifsc_data'   => $ifscVerification,
                            'account_data' => $draft->accountData ?? null,        // fixed
                            'verified_at' => now()->toDateTimeString()
                        ]),
                    ];

                    Beneficiary::create($beneficiaryData);
                }
            }
        }
    }




}
