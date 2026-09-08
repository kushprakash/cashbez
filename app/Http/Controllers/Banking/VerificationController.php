<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Models\Mid;
use App\Models\AepsTransaction;
use App\Models\Account;
use App\Models\UserKyc;
use App\Models\Settting;
use DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use App\Models\AepsDraft;
use App\Models\Setting;
use App\Models\CashDeposit;
use App\Models\Recharge;
use App\Models\Payout;
use App\Models\AccountsAddMoney;
use Carbon\Carbon;


class VerificationController extends Controller
{
    public function sendAadhaarOtp(Request $request){

        $user = $request->get('user');

        $validator = Validator::make($request->all(), [
            'aadhaar_number' => 'required|string|size:12|regex:/^[0-9]{12}$/'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        try {

            $url = "https://api.quickekyc.com/api/v1/aadhaar-v2/generate-otp";

            $data = [
                "key"       => "d8299066-ad56-4052-ace3-e849d125d512",
                "id_number" => $request->aadhaar_number
            ];

            $ch = curl_init($url);

            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($data),
                CURLOPT_HTTPHEADER => [
                    "Content-Type: application/json"
                ],
                CURLOPT_TIMEOUT => 30,
            ]);

            $response = curl_exec($ch);
            
            if(empty($response)){
                return response()->json(['status' => 0, 'message' => "Aadhar server down", 'data' => NULL], 200);die;
            }

               
            $rj = (json_decode($response, true));
            
           if(isset($rj['status']) && $rj['status']=='success' && isset($rj['data']['otp_sent']) && $rj['data']['otp_sent']===true) {
              
                $data = [
                    'user_id'=>$user->id,
                    'type'=>'Aadhaar',
                    'number'=>$request->aadhaar_number,
                    'refid'=>$rj['request_id'] ?? null,
                    'status'=>0,
                    'first_res' => $response,
                    'created_at'=>now(),
                    'updated_at'=>now(),
                ];

                DB::table('verifications')->insert($data);
      
                return response()->json(['status' => 1, 'message' => 'Success', 'data' => $rj], 200);
            
            } 
            else 
            {
                return response()->json(['status' => 0, 'message' => 'Technical Issue Try again', 'data' => $rj], 200);
            }

        } catch (\Exception $e) {
            //Log::error('Aadhaar OTP Error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to send OTP'
            ]);
        }
    }

   
    public function verifyAadhaarOtp(Request $request){
        
        $user = $request->get('user');
        $admin = $request->get('admin');
        $txnid = rand(11111111, 99999999);
        $validator = Validator::make($request->all(), [
            'refid' => 'required',
            'otp'    => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }


        try {

            $Draft=DB::table('verifications')->where('refid', $request->refid)->first();
            $setting = DB::table('settings')->where('user_id', $admin->id ?? null)->first();

            if (!$Draft) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid Refrence ID or OTP Details'
                ], 200);
            }

            $check = DB::table('verifications')->where('number', $Draft->number)->where('status', 1)->first();
            
            if ($check && !empty($check->second_res)) {

                $keysToRemove = ['Fees', 'Bal', 'bal'];
                $response = array_diff_key(json_decode($check->second_res, true), array_flip($keysToRemove));

                if($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)){
                    try {
                      
                        $postData = [
                            "type" => "aadhar_verification",
                            "number" => $Draft->number,
                            "outletId" => $request->outletId??null,
                            "data" => $response
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

                        curl_exec($ch);
                        
                    } catch (\Exception $e) {
                        \Log::error('Callback to API partner failed: ' . $e->getMessage());
                    }   

                }
              
                return response()->json([
                    'status' => 1,
                    'message' => 'Aadhar Validated Successfully',
                    'data' => $response
                ], 200); die;
            }


            

            $account = DB::table('accounts')->where('user_id', $user->id)->where('primary_status', false)->first();
      
         
            if(!$account) {
                return response()->json(['status' => 0, 'message' => 'Primary account not found', 'data' => NULL], 200);
            }

            // Step 1: Prepare transaction data
            $transactionData1 = [
                'account_id' => $account->id,
                'type' => 'DR',
                'amount' => 4,
                'description' => 'Aadhar Verification - '.$Draft->number,
                'transaction_id' => $txnid,
                'created_by' => $user->id,
                'admin_id' => $admin->id,
                'user_id' => $user->id,
                'category_code' => 'COMMISSION'
            ];

            // Step 2: Create the transaction
            $transactionData = createTransaction($transactionData1);

            if($transactionData['status'] === 1) {

                $refid = $request->refid;
                $otp = $request->otp;
             

                $url = "https://api.quickekyc.com/api/v1/aadhaar-v2/submit-otp";

                $data = [
                    "key"        => "d8299066-ad56-4052-ace3-e849d125d512",
                    "request_id" => $refid,
                    "otp"        => $otp
                ];

                $ch = curl_init();

                curl_setopt_array($ch, [
                    CURLOPT_URL => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST => true,
                    CURLOPT_POSTFIELDS => json_encode($data),
                    CURLOPT_HTTPHEADER => [
                        "Content-Type: application/json"
                    ],
                    CURLOPT_TIMEOUT => 30,
                ]);

                $response1 = curl_exec($ch);


                $rj1 = (json_decode($response1, true));

                if (isset($rj1['status']) && $rj1['status'] == 'success') {
                    $sts='SUCCESS';
                } else {
                    $sts=$rj1['status'];
                }

                $rj = [
                    'txnid'   => $rj1['request_id'] ?? '',
                    'status'  => $sts,
                    'refid'   => $rj1['request_id'] ?? '',
                    'address' => trim(
                        implode(', ', array_filter([
                            $rj1['data']['address']['house'] ?? '',
                            $rj1['data']['address']['street'] ?? '',
                            $rj1['data']['address']['loc'] ?? '',
                            $rj1['data']['address']['vtc'] ?? '',
                            $rj1['data']['address']['subdist'] ?? '',
                            $rj1['data']['address']['dist'] ?? '',
                            $rj1['data']['address']['state'] ?? '',
                            $rj1['data']['address']['country'] ?? '',
                            $rj1['data']['zip'] ?? ''
                        ]))
                    ),
                    'split_address' => [
                        'country'  => $rj1['data']['address']['country'] ?? '',
                        'dist'     => $rj1['data']['address']['dist'] ?? '',
                        'house'    => $rj1['data']['address']['house'] ?? '',
                        'landmark' => $rj1['data']['address']['landmark'] ?? '',
                        'pincode'  => $rj1['data']['zip'] ?? '',
                        'po'       => $rj1['data']['address']['po'] ?? '',
                        'state'    => $rj1['data']['address']['state'] ?? '',
                        'street'   => $rj1['data']['address']['street'] ?? '',
                        'subdist'  => $rj1['data']['address']['subdist'] ?? '',
                        'vtc'      => $rj1['data']['address']['vtc'] ?? '',
                        'locality' => $rj1['data']['address']['loc'] ?? '',
                    ],
                    'dob'    => !empty($rj1['data']['dob'])
                        ? date('d-m-Y', strtotime($rj1['data']['dob']))
                        : '',
                    'mobile' => '',
                    'gender' => $rj1['data']['gender'] ?? '',
                    'email'  => '',
                    'name'   => $rj1['data']['full_name'] ?? '',
                    'photo'  => $rj1['data']['profile_image'] ?? '',
                    'resText'=> $rj1['message'] ?? '',
                ];

                $response=json_encode($rj);
                DB::table('verifications')->where('refid', $request->refid)->update(['second_res' => $response]);
                
                if(isset($rj['status'])  && $rj['status']=='SUCCESS'){

               
                    DB::table('verifications')->where('refid', $request->refid)->update(['status' => 1]);

                    if($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)){
                        try {
                        
                            $postData = [
                                "type" => "aadhar_verification",
                                "number" => $Draft->number,
                                "outletId" => $request->outletId??null,
                                "data" => $rj
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

                            curl_exec($ch);
                            
                        } catch (\Exception $e) {
                            \Log::error('Callback to API partner failed: ' . $e->getMessage());
                        }   

                    }
                    
                    return response()->json(['status' => 1, 'message' => 'Aadhar Validated Successfully', 'data' => $rj], 200);
                
                } else {
                    DB::table('verifications')->where('refid', $request->refid)->update(['status' => 2]);
                    return response()->json(['status' => 0, 'message' => 'Technical Issue try again..', 'data' => []], 200);
                }

            } else {
                return response()->json(['status' => 0, 'message' => $transactionData['message'] ?? 'Transaction failed', 'data' => NULL], 200);
            }


        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Verification failed'
            ]);
        }
    }

    public function verifyPan(Request $request){

        $user = $request->get('user');
        $admin = $request->get('admin');
        $txnid = rand(11111111, 99999999);

        $validator = Validator::make($request->all(), [
            'pan_number' => 'required|string|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        
        try {

            $check = DB::table('verifications')->where('number', $request->pan_number)->where('status', 1)->first();
            $setting = DB::table('settings')->where('user_id', $admin->id ?? null)->first();
             
            if ($check && !empty($check->second_res)) {

                $keysToRemove = ['Fees', 'Bal', 'bal'];
                $response = array_diff_key(json_decode($check->second_res, true), array_flip($keysToRemove));

                if($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)){
                    try {
                    
                        $postData = [
                            "type" => "pan_verification",
                            "number" => $request->pan_number,
                            "outletId" => $request->outletId??null,
                            "data" => $response
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

                        curl_exec($ch);
                        
                    } catch (\Exception $e) {
                        \Log::error('Callback to API partner failed: ' . $e->getMessage());
                    }   

                }
                
                
                
                return response()->json([
                    'status' => 1,
                    'message' => 'Pan Validated Successfully',
                    'data' => $response
                ], 200); die;
                
            }

        
            $account = DB::table('accounts')->where('user_id', $user->id)->where('primary_status', false)->first();
          

            if(!$account) {
                return response()->json(['status' => 0, 'message' => 'Primary account not found', 'data' => NULL], 200);
            }

            // Step 1: Prepare transaction data
            $transactionData1 = [
                'account_id' => $account->id,
                'type' => 'DR',
                'amount' => 4,
                'description' => 'Pan Verification - '.$request->pan_number,
                'transaction_id' => $txnid,
                'created_by' => $user->id,
                'admin_id' => $admin->id,
                'user_id' => $user->id,
                'category_code' => 'COMMISSION'
            ];

            // Step 2: Create the transaction
            $transactionData = createTransaction($transactionData1);

            if($transactionData['status'] === 1) {
            
             
                // use the validated field `pan_number` when building the request
                $pan_no = $request->pan_number;
                $url = "https://planapi.in/Api/Ekyc/PanVerification";

                $postData = [
                    'Panid'   => $pan_no,
                    'ApiMode' => '1'
                ];

                $headers = [
                    'TokenID: 7f2e980e-da2f-4ec0-aedb-6bf05f9dc5ff',
                    'ApiUserID: 6315',
                    'ApiPassword: SANDIPs7384@#$',
                    'Content-Type: application/x-www-form-urlencoded'
                ];

                $ch = curl_init();

                curl_setopt_array($ch, [
                    CURLOPT_URL            => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST           => true,
                    CURLOPT_POSTFIELDS     => http_build_query($postData),
                    CURLOPT_HTTPHEADER     => $headers,
                    CURLOPT_TIMEOUT        => 30,
                ]);

                $response = curl_exec($ch);

                $data = [
                    'user_id'=>$user->id,
                    'type'=>'Pan',
                    'refid' => $txnid,
                    'number'=>$request->pan_number,
                    'status'=>0,
                    'second_res' => $response,
                    'created_at'=>now(),
                    'updated_at'=>now(),
                ];

                DB::table('verifications')->insert($data);

                $curlError = curl_error($ch);
                // HTTP Status Code
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

                // handle curl/network errors or empty responses
                if ($curlError || empty($response) || $httpCode !== 200) {
                    DB::table('verifications')->where('number', $request->pan_number)->update(['status' => 2]);
                    return response()->json(['status' => 0, 'message' => 'PAN verification service unavailable', 'data' => $response], 200);
                }

                $rj = json_decode($response, true);

                // ensure we have a valid decoded array before accessing offsets
                if (!is_array($rj)) {
                    DB::table('verifications')->where('number', $request->pan_number)->update(['status' => 2]);
                    return response()->json(['status' => 0, 'message' => 'Invalid response from PAN service', 'data' => NULL], 200);
                }

                if (isset($rj['status']) && $rj['status'] == 'Success') {
                    $sts='SUCCESS';
                } else {
                    $sts=$rj['status'];
                }

               

                if (isset($rj['status']) && $sts == 'SUCCESS') {
                   

                    $rj2 = [
                        "Txnid"            => rand(111111,999999),
                        "status"           => $sts,
                        "pan"              => $rj['response']['pan_no'],
                        "RegisteredName"   => $rj['response']['registered_name'],
                        "FatherName"       => $rj['response']['father_name'],
                        "type"             => $rj['response']['pan_type'],
                        "resText"          => $rj['msg'],
                    ];

                    DB::table('verifications')->where('number', $request->pan_number)->update(['status' => 1,'second_res' => json_encode($rj2)]);

                    if($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)){
                        try {
                        
                            $postData = [
                                "type" => "pan_verification",
                                "number" => $request->pan_number,
                                "outletId" => $request->outletId??null,
                                "data" => $rj2
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

                            curl_exec($ch);
                            
                        } catch (\Exception $e) {
                            \Log::error('Callback to API partner failed: ' . $e->getMessage());
                        }   

                    }
                    return response()->json(['status' => 1, 'message' => 'Success', 'data' => $rj2], 200);
                } else {
                    DB::table('verifications')->where('number', $request->pan_number)->update(['status' => 2]);
                    return response()->json(['status' => 0, 'message' => $rj['msg']??'Technical Issue Try Again', 'data' => $rj], 200);
                }
            } else {
                return response()->json(['status' => 0, 'message' => $transactionData['message'] ?? 'Transaction failed', 'data' => NULL], 200);
            }

        } catch (\Exception $e) {
            Log::error('PAN Verification Error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'PAN verification failed',
                'error' => $e->getMessage(),
                'debug' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ]);
        }
    }

    public function verifyBankAccount(Request $request)
    {
        $user = $request->get('user');
        $admin = $request->get('admin');
        $txnid = rand(11111111, 99999999);
        $validator = Validator::make($request->all(), [
            'accountno' => 'required|string',
            'ifsccode' => 'required|string|max:11',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        try {

            $check = DB::table('verifications')->where('number', $request->accountno)->where('status', 1)->first();
            $setting = DB::table('settings')->where('user_id', $admin->id ?? null)->first();

            if ($check && !empty($check->second_res)) {

                $keysToRemove = ['Fees', 'Bal', 'bal'];
                $response = array_diff_key(json_decode($check->second_res, true), array_flip($keysToRemove));

                if($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)){
                    try {
                    
                        $postData = [
                            "type" => "account_verification",
                            "number" => $request->accountno,
                            "outletId" => $request->outletId??null,
                            "data" => $response
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

                        curl_exec($ch);
                        
                    } catch (\Exception $e) {
                        \Log::error('Callback to API partner failed: ' . $e->getMessage());
                    }   

                }

                return response()->json([
                    'status' => 1,
                    'message' => 'Account Validated Successfully',
                    'data' => $response
                ], 200); die;

            }

         
           
            $account = DB::table('accounts')->where('user_id', $user->id)->where('primary_status', false)->first();
        

            if(!$account) {
                return response()->json(['status' => 0, 'message' => 'Primary account not found', 'data' => NULL], 200);
            }

            // Step 1: Prepare transaction data
            $transactionData1 = [
                'account_id' => $account->id,
                'type' => 'DR',
                'amount' => 4,
                'description' => 'Account Verification - '.$request->accountno,
                'transaction_id' => $txnid,
                'created_by' => $user->id,
                'admin_id' => $admin->id,
                'user_id' => $user->id,
                'category_code' => 'COMMISSION'
            ];

            // Step 2: Create the transaction
            $transactionData = createTransaction($transactionData1);

           

            if($transactionData['status'] === 1) {
        
                $ifscCode = $request->ifsccode;
                $url = "https://ifsc.razorpay.com/" . urlencode($ifscCode);

                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);

                $ifsc_response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $curlError = curl_error($ch);
                curl_close($ch);

                if ($curlError) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Internal Server Error.'
                    ]);
                } elseif ($httpCode === 200) {
                    $ifsc_data = json_decode($ifsc_response, true);
                } else {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Invalid IFSC Code.'
                    ]);
                }

                $accountno = $request->accountno;
                $ifsccode = $request->ifsccode;

                $url = "https://api.quickekyc.com/api/v1/bank-verification/pd";

                $data = [
                    "key"       => "d8299066-ad56-4052-ace3-e849d125d512",
                    "id_number" => $accountno, // Account Number
                    "ifsc"      => $ifsccode   // IFSC Code
                ];

                $ch = curl_init();

                curl_setopt_array($ch, [
                    CURLOPT_URL => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST => true,
                    CURLOPT_POSTFIELDS => json_encode($data),
                    CURLOPT_HTTPHEADER => [
                        "Content-Type: application/json"
                    ],
                    CURLOPT_TIMEOUT => 30,
                ]);

                $response = curl_exec($ch);
             
                
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

                $response = str_replace($prefixes, '', $response);
                
                $rj1 = (json_decode($response, true));

                $rj = [
                    'txnid'         => $rj1['data']['txn_ref_id'] ?? '',
                    'status'        => ($rj1['status'] ?? '') == 'success' ? 'SUCCESS' : 'FAILED',
                    'AccountName'   => $rj1['data']['full_name'] ?? '',
                    'AccountNumber' => $accountno, 
                    'accountStatus' => ($rj1['data']['account_exists'] ?? false) ? 'VALID' : 'INVALID',
                    'bank_name'     => $ifsc_data['BANK'] ?? '',
                    'utr'           => $rj1['request_id'] ?? '',
                    'city'          => $ifsc_data['CITY'] ?? '',
                    'branch'        => $ifsc_data['BRANCH'] ?? '',
                    'micr'          => $ifsc_data['MICR'] ?? '',
                    'resText'       => $rj1['message'] ?? 'Beneficiary Verification Success',
                ];
               
                $data = [
                    'user_id'=>$user->id,
                    'type'=>'Account',
                    'refid' => $txnid,
                    'number'=>$request->accountno,
                    'status'=>0,
                    'first_res' => $ifscCode,
                    'second_res' => json_encode($rj),
                    'created_at'=>now(),
                    'updated_at'=>now(),
                ];

                DB::table('verifications')->insert($data);
                    
                
                if(isset($rj['status']) && $rj['status']=='SUCCESS'){
                 
                    DB::table('verifications')->where('number', $request->accountno)->update(['status' => 1]);
                    
                    if($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)){
                        try {
                        
                            $postData = [
                                "type" => "account_verification",
                                "number" => $request->accountno,
                                "outletId" => $request->outletId??null,
                                "data" => $rj
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

                            curl_exec($ch);
                            
                        } catch (\Exception $e) {
                            \Log::error('Callback to API partner failed: ' . $e->getMessage());
                        }   

                    }
                    return response()->json(['status' => 1, 'message' => 'Success', 'data' => $rj], 200);
                } else {
                
                    return response()->json(['status' => 0, 'message' => $rj['resText'], 'data' => $rj], 200);
                }

            } else {
                return response()->json(['status' => 0, 'message' => $transactionData['message'] ?? 'Transaction failed', 'data' => NULL], 200);
            }
          
        } catch (\Exception $e) {
            Log::error('Bank Account Verification Error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Bank account verification failed'
            ]);
        }
    }

    public function verifyIfscCode(Request $request)
    {
        $user = $request->get('user');

        $validator = Validator::make($request->all(), [
            'ifsccode' => 'required|string|max:11',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        try {
         
        
            $account = DB::table('accounts')->where('user_id', $user->id)->where('primary_status', false)->first();
      
            
            if(!$account) {
                return response()->json(['status' => 0, 'message' => 'Primary account not found', 'data' => NULL], 200);
            }

            // Step 1: Prepare transaction data
            $transactionData1 = [
                'account_id' => $account->id,
                'type' => 'DR',
                'amount' => 4,
                'description' => 'IFSC Verification - '.$request->ifsccode,
                'transaction_id' => $txnid,
                'created_by' => $user->id,
                'admin_id' => $admin->id,
                'user_id' => $user->id,
                'category_code' => 'COMMISSION'
            ];

            // Step 2: Create the transaction
            $transactionData = createTransaction($transactionData1);

            if($transactionData['status'] === 1) {

                $check = DB::table('verifications')->where('number', $request->ifsccode)->where('status', 1)->first();
            
                if ($check && !empty($check->second_res)) {

                return response()->json([
                        'status' => 1,
                        'message' => 'Account Validated Successfully',
                        'data' => json_decode($check->second_res, true)
                    ], 200); die;

                }

        
                $ifscCode = $request->ifsccode;
                $url = "https://ifsc.razorpay.com/" . urlencode($ifscCode);

                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);

                $ifsc_response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $curlError = curl_error($ch);
                curl_close($ch);

                $data = [
                    'user_id'=>$user->id,
                    'type'=>'IFSC',
                    'refid' => $txnid,
                    'number'=>$request->ifsccode,
                    'status'=>0,
                    'second_res' => $ifsc_response,
                    'created_at'=>now(),
                    'updated_at'=>now(),
                ];

                DB::table('verifications')->insert($data);

                if ($curlError) {
                    DB::table('verifications')->where('number', $request->ifsccode)->update(['status' => 2]);
                    return response()->json([
                        'status' => 0,
                        'message' => 'Internal Server Error.'
                    ]);
                } elseif ($httpCode === 200) {

                    $ifsc_data = json_decode($ifsc_response, true);

                    DB::table('verifications')->where('number', $request->ifsccode)->update(['status' => 1]);
                    
                    return response()->json(['status' => 1, 'message' => 'Success', 'data' => $ifsc_data], 200);

                } else {

                    DB::table('verifications')->where('number', $request->ifsccode)->update(['status' => 2]);
                    return response()->json([
                        'status' => 0,
                        'message' => 'Invalid IFSC Code.'
                    ]);
                }
            } else {
                return response()->json(['status' => 0, 'message' => $transactionData['message'] ?? 'Transaction failed', 'data' => NULL], 200);
            }
          
        } catch (\Exception $e) {
            Log::error('Bank Account Verification Error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Bank account verification failed'
            ]);
        }
    }

}