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
use App\Models\Beneficiary;
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
use App\Models\Passbook;
use App\Models\TxnCategory;
use App\Services\CatchLogService;


class MerchantController extends Controller
{
   
    // Constants
    private const AEPS_API_TIMEOUT = 120;
    private const BASE_URL = 'https://icchhamatidataservice.com/api/';
    private const SUPER_MERCHANT_ID       = '1262';
    private const SUPER_MERCHANT_USERNAME = 'bharatpaysd';
    private const SUPER_MERCHANT_PASSWORD = '1234d';
    private const SUPER_MERCHANT_GST_IN   = '19AAVCA0758M1ZW';
    private const IP_ADDRESS              = '194.164.148.127';
    private const API_TIMEOUT             = 30;
    private const SECRET_KEY = "6149c45503d6d3a60c5b775b56adc52b533fa428b060109c4d59e935e6d1524";
    private const MID = "AGENT1475";
    private const MKEY = "8ECgqn6xep6FPdVvzOs4ketqWQxG9qGY";




    public function aepsDraft(Request $request) {

        try {
            // Sanitize: trim all string inputs
            $input = array_map(function ($value) {
                return is_string($value) ? trim($value) : $value;
            }, $request->all());

            // Production-grade validation with format enforcement
            $validator = Validator::make($input, [
                'latitude'       => 'required|numeric|between:-90,90',
                'longitude'      => 'required|numeric|between:-180,180',
                'shop_city'      => 'required|string|min:2|max:255',
                'shop_address'   => 'required|string|min:5|max:255',
                'state_id'       => 'required|string|max:255',
                'shop_district'  => 'required|string|min:2|max:255',
                'shop_pin_code'  => ['required', 'string', 'regex:/^\d{6}$/'],
                'shop_name'      => 'required|string|min:2|max:255',
                'pan_no'         => ['required', 'string', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]$/'],
                'aadhaar_number' => ['required', 'string', 'regex:/^\d{12}$/'],
                'full_name'      => 'required|string|min:2|max:255',
                'phone'          => ['required', 'string', 'regex:/^\d{10}$/'],
                'email'          => 'required|email:rfc,dns|max:255',
                'account_number' => ['required', 'string', 'regex:/^\d{9,18}$/'],
                'ifsc_code'      => ['required', 'string', 'regex:/^[A-Z]{4}0[A-Z0-9]{6}$/'],
                'bank_name'      => 'required|string|min:2|max:255',
                'bank_branch'    => 'required|string|min:2|max:255',
                'video_url'      => 'required|string|max:255',
                'shop_inner'     => 'required|string|max:255',
                'shop_outer'     => 'required|string|max:255',
            ], [
                'latitude.required'        => 'Location latitude is required',
                'latitude.numeric'         => 'Latitude must be a valid number',
                'latitude.between'         => 'Latitude must be between -90 and 90',
                'longitude.required'       => 'Location longitude is required',
                'longitude.numeric'        => 'Longitude must be a valid number',
                'longitude.between'        => 'Longitude must be between -180 and 180',
                'shop_city.required'       => 'Shop city is required',
                'shop_city.min'            => 'Shop city must be at least 2 characters',
                'shop_address.required'    => 'Shop address is required',
                'shop_address.min'         => 'Shop address must be at least 5 characters',
                'state_id.required'        => 'State is required',
                'shop_district.required'   => 'Shop district is required',
                'shop_district.min'        => 'Shop district must be at least 2 characters',
                'shop_pin_code.required'   => 'Pin code is required',
                'shop_pin_code.regex'      => 'Pin code must be exactly 6 digits',
                'shop_name.required'       => 'Shop name is required',
                'shop_name.min'            => 'Shop name must be at least 2 characters',
                'pan_no.required'          => 'PAN number is required',
                'pan_no.regex'             => 'Invalid PAN format (e.g. ABCDE1234F)',
                'aadhaar_number.required'  => 'Aadhaar number is required',
                'aadhaar_number.regex'     => 'Aadhaar number must be exactly 12 digits',
                'full_name.required'       => 'Full name is required',
                'full_name.min'            => 'Full name must be at least 2 characters',
                'phone.required'           => 'Phone number is required',
                'phone.regex'              => 'Phone number must be exactly 10 digits',
                'email.required'           => 'Email address is required',
                'email.email'              => 'Please enter a valid email address',
                'account_number.required'  => 'Account number is required',
                'account_number.regex'     => 'Account number must be 9 to 18 digits',
                'ifsc_code.required'       => 'IFSC code is required',
                'ifsc_code.regex'          => 'Invalid IFSC format (e.g. SBIN0001234)',
                'bank_name.required'       => 'Bank name is required',
                'bank_name.min'            => 'Bank name must be at least 2 characters',
                'bank_branch.required'     => 'Bank branch is required',
                'bank_branch.min'          => 'Bank branch must be at least 2 characters',
                'video_url.required'       => 'Selfie with pan is required',
                'shop_inner.required'      => 'Shop inner image is required',
                'shop_outer.required'      => 'Shop outer image is required',
            ]);

            $validator->stopOnFirstFailure();

            if ($validator->fails()) {
                
                return response()->json([
                    'status'  => 0,
                    'message' => $validator->errors()->first(),
                ], 200);
            }

            $draftData['latitude'] = $input['latitude'];
            $draftData['longitude'] = $input['longitude'];
            $draftData['shop_city'] = $input['shop_city'];
            $draftData['shop_address'] = $input['shop_address'];
            $draftData['state_id'] = $input['state_id'];
            $draftData['shop_district'] = $input['shop_district'];
            $draftData['shop_pin_code'] = $input['shop_pin_code'];
            $draftData['shop_name'] = $input['shop_name'];
            $draftData['pan_no'] = $input['pan_no'];
            $draftData['aadhaar_number'] = $input['aadhaar_number'];
            $draftData['full_name'] = $input['full_name'];
            $draftData['phone'] = $input['phone'];
            $draftData['email'] = $input['email'];
            $draftData['account_number'] = $input['account_number'];
            $draftData['ifsc_code'] = $input['ifsc_code'];
            $draftData['bank_name'] = $input['bank_name'];
            $draftData['bank_branch'] = $input['bank_branch'];

            $existingUser = User::where('mobile', $request->phone)->first();
            if ($existingUser) {
                
                $nextMid = $existingUser->mid;
                $mid = $existingUser->admin_mid;

                $kycData=UserKyc::where('user_id', $existingUser->id)->first();

                if($kycData) {
                    $draftData['phone_verified_at'] = 1;
                }

                if($kycData && $kycData->aadhar_verified==1) {
                    $draftData['aadhaar_verified_at'] = 1;
                    $draftData['aadharData'] = $kycData->response_aadhar;
                }

                if($kycData && $kycData->pan_verified==1) {
                    $draftData['pan_verified_at'] = 1;
                    $draftData['panData'] = $kycData->response_pan;
                }

                if($kycData && $kycData->account_verified==1) {
                    $draftData['bank_verified_at'] = 1;
                    $draftData['accountData'] = $kycData->response_account;
                }


            } else {
                $lastUser = Mid::where('status', 0)->first();
                if (!$lastUser) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'No available MID found',
                    ], 200);
                }
                $nextMid = $lastUser->mid;
                $lastUser->markAsUsed();
                $mid = $request->header('mid');
            }


            $existingDraft = AepsDraft::where('pan_no', $request->pan_no)->first();
            if($existingDraft){
                return response()->json([
                    'status'  => 0,
                    'message' => 'AEPS already registered',
                ], 200);
            }



             $kycData=[
                'phone_verified_at'=>$draftData['phone_verified_at'] ?? null,
                'aadhaar_verified_at'=>$draftData['aadhaar_verified_at'] ?? null,
                'pan_verified_at'=>$draftData['pan_verified_at'] ?? null,
                'bank_verified_at'=>$draftData['bank_verified_at'] ?? null,
                "panData"=>$draftData['panData'] ?? null,
                "aadharData"=>$draftData['aadharData'] ?? null,
                "accountData"=>$draftData['accountData'] ?? null
            ];


            $vkycData=[
                'video_url'=>$request->video_url,
                'shop_inner'=>$request->shop_inner,
                'shop_outer'=>$request->shop_outer,
                'video_kyc_status'=>1
            ];


            $url = self::BASE_URL."v2/aeps/draft";

            $data = [
                "latitude"        => $request->latitude,
                "longitude"       => $request->longitude,
                "shop_name"       => $request->shop_name,
                "shop_address"    => $request->shop_address,
                "shop_city"       => $request->shop_city,
                "shop_district"   => $request->shop_district,
                "state_id"        => $request->state_id,
                "shop_pin_code"   => $request->shop_pin_code,
                "full_name"       => $request->full_name,
                "phone"           => $request->phone,
                "email"           => $request->email,
                "pan_no"           => $request->pan_no,
                "aadhaar_number"  => $request->aadhaar_number,
                "account_number"  => $request->account_number,
                "ifsc_code"       => $request->ifsc_code,
                "bank_name"       => $request->bank_name,
                "bank_branch"     => $request->bank_branch,
                "kycData"         => $kycData,
                "vkyc"            => $vkycData
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


                $existingUser1 = User::where('mid', $mid)->first();
                // Prepare data for creation

                $draftData['video_kyc_status'] = 1;
            
                $draftData['mid'] = $nextMid;
                $draftData['created_by'] = $existingUser1->id ?? null;
                $draftData['admin_id'] = $existingUser1->id ?? null;
                $draftData['bid'] = $json_response['data']['id'] ?? null;
                $draftData['bmid'] = $json_response['data']['mid'] ?? null;

                // Filter $draftData to only include valid fillable attributes of AepsDraft
                $fillable = (new AepsDraft())->getFillable();
                $draftData = array_intersect_key($draftData, array_flip($fillable));

                $draft = AepsDraft::create($draftData);

            }



            DB::table('logs')->insert([
                'mid'          => $draft->mid ?? '',
                'type'         => 'DRAFT',
                'platform'     => 'WEB',
                'headers'      => json_encode([
                    'Accept'       => 'application/json',
                    'Content-Type' => 'application/json',
                    'mid' => self::MID,
                    'mkey' => self::MKEY,
                ]),
                'request_data'  => json_encode($data),
                'response_data'  => json_encode($json_response),
                'url'           => $url,
                'txnid'         => 0,
                'status'        => 0,
                'timestamp'    => now(),
                'created_at'   => now()->format('Y-m-d H:i:s'),
            ]);
    











        if(isset($json_response['status']) && $json_response['status']==1){
         
          

            $draft->outletId = $draft->mid;

            $credit_user_id='';
            $is_api_partner = false;
            $adminData = $existingUser1 ? User::where('id',$existingUser1->id)->first() : null;
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
                            "type" => "outletId",  // must be JSON string
                            "outletId" => $nextMid,
                            "pan"=>$request->pan_no      // must be JSON string
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
                        CatchLogService::logException($request, 'aepsDraft.callback', $e, [
                            'api' => $setting->call_back_url,
                            'context' => 'Callback to API partner failed',
                        ]);
                    }   

                }
            }

            
            return response()->json([
                'status' => 1,
                'message' => 'AEPS draft created successfully',
                'data' => $draft
            ], 200);

        } else {
            return response()->json([
                'status' => 0,
                'message' => $json_response['message'] ?? 'Something went wrong',
                'data' => $json_response
            ], 200);
        }

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'aepsDraft', $e, [
                'context' => 'AEPS Draft Error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Internal Server Error',
                'ref_id' => $refId,
            ], 500);
        }
    }


    public function aepsDraftData(Request $request)
    {        
        $validator = Validator::make($request->all(), [
            'outletId' => 'required|string|max:255'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $existingUser = AepsDraft::where('mid', $request->outletId)->first();

       

        if (!$existingUser) {
            return response()->json([
                'status' => 0,
                'message' => 'No draft found for the provided MID',
            ], 200);
        }

        // Auto sync verification status from user_kyc table if data exists
        $userObj = User::where('mobile', $existingUser->phone)
                    ->orWhere('mid', $existingUser->mid)
                    ->first();

        $kycData = null;
        if ($userObj) {
            $kycData = UserKyc::where('user_id', $userObj->id)->first();
        }
        if (!$kycData) {
            $kycData = UserKyc::where(function($q) use ($existingUser) {
                if (!empty($existingUser->phone)) {
                    $q->orWhere('mobile', $existingUser->phone);
                }
                if (!empty($existingUser->pan_no)) {
                    $q->orWhere('pan_number', $existingUser->pan_no);
                }
                if (!empty($existingUser->aadhaar_number)) {
                    $q->orWhere('aadhar_number', $existingUser->aadhaar_number);
                }
            })->first();
        }

        if ($kycData) {
            $updated = false;

            if ($existingUser->phone_verified_at == 0) {
                $existingUser->phone_verified_at = 1;
                $updated = true;
            }

            if ($existingUser->email_verified_at == 0) {
                $existingUser->email_verified_at = 1;
                $updated = true;
            }

            if ($kycData->pan_verified == 1 || !empty($kycData->response_pan)) {
                if ($existingUser->pan_verified_at == 0) {
                    $existingUser->pan_verified_at = 1;
                    $updated = true;
                }
                if (empty($existingUser->panData) && !empty($kycData->response_pan)) {
                    $existingUser->panData = is_string($kycData->response_pan) ? $kycData->response_pan : json_encode($kycData->response_pan);
                    $updated = true;
                }
            }

            if ($kycData->aadhar_verified == 1 || !empty($kycData->response_aadhar)) {
                if ($existingUser->aadhaar_verified_at == 0) {
                    $existingUser->aadhaar_verified_at = 1;
                    $updated = true;
                }
                if (empty($existingUser->aadharData) && !empty($kycData->response_aadhar)) {
                    $existingUser->aadharData = is_string($kycData->response_aadhar) ? $kycData->response_aadhar : json_encode($kycData->response_aadhar);
                    $updated = true;
                }
            }

            if ($kycData->account_verified == 1 || !empty($kycData->response_account)) {
                if ($existingUser->bank_verified_at == 0) {
                    $existingUser->bank_verified_at = 1;
                    $updated = true;
                }
                if (empty($existingUser->accountData) && !empty($kycData->response_account)) {
                    $existingUser->accountData = is_string($kycData->response_account) ? $kycData->response_account : json_encode($kycData->response_account);
                    $updated = true;
                }
            }

            if ($updated) {
                $existingUser->save();
            }
        }

        $admin_id = $existingUser->admin_id;

        $user1 = User::where('id', $admin_id)->first();
        $sett = DB::table('settings')->where('user_id', $user1->id ?? null)->select('logo', 'website')->first();
        $existingUser->logo = $sett->logo ?? 'https://enexa.in/images/enexa-logo-mix-white.png?id=83e17363ed5f59867f1cb9c59b3c5f56';
        $existingUser->website = ($sett && $sett->website) ? 'https://'.$sett->website : url('');

        return response()->json([
            'status' => 1,
            'data' => $existingUser
        ], 200);
    }

    public function sendMobileOtp(Request $request){
        $validator = Validator::make($request->all(), [
            'pan_no' => 'required|string|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $aepsDraft = AepsDraft::where('pan_no', $request->pan_no)->first();

        if (!$aepsDraft) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid Pan Details'
            ], 200);
        }


        $number=$aepsDraft->phone;
        $otp = rand(100000, 999999);

        $setting = Setting::where('user_id', $aepsDraft->admin_id)->first();

        if($setting && !empty($setting->sender_id)){

            $adminId =$aepsDraft->admin_id;
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

        DB::table('otps')->where('mobile', $aepsDraft->phone)->delete();
       
        DB::table('otps')->insert([
            'mobile' => $aepsDraft->phone,
            'otp' => $otp,
        ]);

        return response()->json([
            'status' => 1,
            'message' => 'Verification OTP sent'
        ]);
    }

    public function verifyMobileOtp(Request $request){
        $validator = Validator::make($request->all(), [
            'pan_no' => 'required|string|max:10',
            'otp'    => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $aepsDraft = AepsDraft::where('pan_no', $request->pan_no)->first();

        if (!$aepsDraft) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid Pan Details'
            ], 200);
        }

        $otpData = DB::table('otps')->where('mobile', $aepsDraft->phone)->first();
        if (!$otpData) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid OTP'
            ], 200);
        } else {

            if ($otpData->otp != $request->otp) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid OTP'
                ], 200);
            } else {
                $aepsDraft->phone_verified_at = 1;
                $aepsDraft->save();
                DB::table('otps')->where('mobile', $aepsDraft->phone)->delete();
                return response()->json([
                    'status' => 1,
                    'message' => 'OTP verified successfully'
                ], 200);
            }
            
        }
    }

    public function sendEmailOtp(Request $request){
        $validator = Validator::make($request->all(), [
            'pan_no' => 'required|string|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $aepsDraft = AepsDraft::where('pan_no', $request->pan_no)->first();

        if (!$aepsDraft) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid Pan Details'
            ], 200);
        }
        $toEmail=$aepsDraft->email;
        $otp = rand(100000, 999999);
        $messageType='VerificationOTP';
        $subject='Mail Verify OTP';

        $setting = Setting::where('user_id', $aepsDraft->admin_id)->first();

        if ($setting && !empty($setting->smtp_password)) {

            $adminId =$aepsDraft->admin_id;
            $messageRow = getMessageRow("VerificationOTP", $adminId);
            if(!$messageRow) {
                return [
                    'status' => 0,
                    'message' => 'Message template not found for type: ' . $messageType
                ];
            }

            $messageTemplate = $messageRow->message;
            eval("\$message = \"$messageTemplate\";");

            sentMail($toEmail, $subject, $adminId, $message);

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

            sentMail($toEmail, $subject, $adminId, $message);
        }

        DB::table('otps')->where('mobile', $aepsDraft->email)->delete();
       
        DB::table('otps')->insert([
            'mobile' => $aepsDraft->email,
            'otp' => $otp,
        ]);

        return response()->json([
            'status' => 1,
            'message' => 'Verification OTP sent'
        ]);
    }

    public function verifyEmailOtp(Request $request){
        $validator = Validator::make($request->all(), [
            'pan_no' => 'required|string|max:10',
            'otp'    => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $aepsDraft = AepsDraft::where('pan_no', $request->pan_no)->first();

        if (!$aepsDraft) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid Pan Details'
            ], 200);
        }

        $otpData = DB::table('otps')->where('mobile', $aepsDraft->email)->first();
        if (!$otpData) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid OTP'
            ], 200);
        } else {

            if ($otpData->otp != $request->otp) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid OTP'
                ], 200);
            } else {
                $aepsDraft->email_verified_at = 1;
                $aepsDraft->save();
                DB::table('otps')->where('mobile', $aepsDraft->email)->delete();
                return response()->json([
                    'status' => 1,
                    'message' => 'OTP verified successfully'
                ], 200);
            }
            
        }
    }

    
    public function sendAadhaarOtp(Request $request) {

      $user = $request->get('user');
        $admin = $request->get('admin');
        $validator = Validator::make($request->all(), [
            'pan_no' => 'required|string|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $aepsDraft = AepsDraft::where('pan_no', $request->pan_no)->first();

        if (!$aepsDraft) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid Pan Details'
            ], 200);
        }

        try {
            $adminUser = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$adminUser) {
                return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
            }

            $aadharNumber = $request->aadhaar ?? $aepsDraft->aadhaar_number;

            if (!$aadharNumber) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Please Enter Aadhaar Number'
                ], 200);
            }

            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url('').'/api/v2/verify/aadhar-send-otp',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode(["aadhaar_number" => $aadharNumber]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . $adminUser->mid,
                    'mkey: ' . $adminUser->mkey
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);

            // Handle enexaerp api format: no 'data' nesting, structure directly on root object
            $rj = json_decode($response, true);

            if(isset($rj['status']) && $rj['status']==1){

                return response()->json([
                    'status' => 1,
                    'message' => 'OTP sent successfully',
                    'txnid' => $rj['data']['request_id']
                ], 200);

            }
            else
            {
                return response()->json(['status' => 0, 'message' => $rj['message'] ?? 'Technical Issue Try again', 'data' => null], 200);
            }


        } catch (\Exception $e) {
            CatchLogService::logException($request, 'sendAadhaarOtp', $e, [
                'api' => url('').'/api/v2/aeps/send-aadhaar-otp',
                'context' => 'Aadhaar OTP Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to send OTP'
            ]);
        }
    }

    public function verifyAadhaarOtp(Request $request){

        $user = $request->get('user');
        $admin = $request->get('admin');
        $validator = Validator::make($request->all(), [
            'pan_no' => 'required|string|max:10',
            'txnid' => 'required',
            'otp'    => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }


        $aepsDraft = AepsDraft::where('pan_no', $request->pan_no)->first();

        if (!$aepsDraft) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid Pan Details'
            ], 200);
        }

        try {

            $adminUser = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$adminUser) {
                return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
            }

            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url('').'/api/v2/verify/aadhaar-verify-otp',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode([
                    "otp" => $request->otp,
                    "refid" => $request->txnid,
                    "outletId" => $aepsDraft->mid
                ]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . $adminUser->mid,
                    'mkey: ' . $adminUser->mkey
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);
            $rj = json_decode($response, true);

            if(isset($rj['status']) && $rj['status']==1){

                $mockAadhaarData = [
                    'status' => 1,
                    'message' => 'Success',
                    'data' => $rj['data']
                ];

                AepsDraft::where('id', $aepsDraft->id)->update([
                    'aadharData'   => json_encode($mockAadhaarData),
                    'aadhaar_verified_at' => 1
                ]);

                return response()->json([
                    'status' => 1,
                    'message' => 'Aadhaar verified successfully'
                ], 200);

            } else {
                $message = (!empty($rj)) ? ($rj['message'] ?? 'OTP entered is invalid') : 'OTP entered is invalid';
                return response()->json(['status' => 0, 'message' => $message, 'data' => []], 200);
            }

        } catch (\Exception $e) {
            CatchLogService::logException($request, 'verifyAadhaarOtp', $e, [
                'api' => url('').'/api/v2/aeps/verify-aadhaar-otp',
                'context' => 'Aadhaar OTP verification failed',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Verification failed '. $e->getMessage()
            ]);
        }
    }

    public function verifyPan(Request $request) {

        $user = $request->get('user');
        $admin = $request->get('admin');
        $txnid = "MPAN".time().rand(1111111, 9999999);

        $validator = Validator::make($request->all(), [
            'pan_no' => 'required|string|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        try {

            $aepsDraft = AepsDraft::where('pan_no', $request->pan_no)->first();

            if (!$aepsDraft) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid Pan Details'
                ], 200);
            }

            $adminUser = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$adminUser) {
                return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
            }

            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url('').'/api/v2/verify/pan',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode(["pan_number" => $request->pan_no,"outletId" => $aepsDraft->mid]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . $adminUser->mid,
                    'mkey: ' . $adminUser->mkey
                ),
            ));

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $curlError = curl_error($curl);
            curl_close($curl);

            if ($curlError || empty($response) || $httpCode !== 200) {
                return response()->json(['status' => 0, 'message' => 'PAN verification service unavailable', 'data' => NULL], 200);
            }

            $rj = json_decode($response, true);

            if (!is_array($rj)) {
                return response()->json(['status' => 0, 'message' => 'Invalid response from PAN service', 'data' => NULL], 200);
            }

            if (isset($rj['status']) && $rj['status'] == 1) {

                $name=$aepsDraft->full_name;
                $name = str_replace(' ', '', strtoupper($name));

                $name1 = str_replace(' ', '', strtoupper($rj['data']['RegisteredName'] ?? ''));

                if ($name1 == $name) {

                    $mockPanData = [
                        'status' => 1,
                        'message' => 'Success',
                        'data' => $rj['data']
                    ];

                    AepsDraft::where('id', $aepsDraft->id)->update([
                        'panData'   => json_encode($mockPanData),
                        'pan_verified_at' => 1
                    ]);

                    return response()->json([
                        'status' => 1,
                        'message' => 'PAN verified successfully'
                    ]);

                } elseif ($name1 == '') {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Pan not verified. Name mismatch.'
                    ]);

                } else {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Pan not verified. Details mismatch.'
                    ]);
                }
            } else {
                return response()->json(['status' => 0, 'message' => $rj['message'] ?? 'Service Down. try again..', 'data' => NULL], 200);
            }

        } catch (\Exception $e) {
            CatchLogService::logException($request, 'verifyPan', $e, [
                'api' => url('').'/api/v2/aeps/verify-pan',
                'context' => 'PAN Verification Error',
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
            'pan_no' => 'required|string|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        try {

            $aepsDraft = AepsDraft::where('pan_no', $request->pan_no)->first();

            if (!$aepsDraft) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid Pan Details'
                ], 200);
            }

            $adminUser = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$adminUser) {
                return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
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
                    "accountno" => $aepsDraft->account_number,
                    "ifsccode" => $aepsDraft->ifsc_code,
                    "outletId" => $aepsDraft->mid,
                ]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . $adminUser->mid,
                    'mkey: ' . $adminUser->mkey
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

            curl_close($curl);
            $rj = json_decode($response, true);
            $ifscCode = $aepsDraft->ifsc_code;

            if (isset($rj['status']) && $rj['status'] == 1) {

                $name=$aepsDraft->full_name;
                $name = str_replace(' ', '', strtoupper($name));

                $name1 = str_replace(' ', '',strtoupper($rj['data']['AccountName'] ?? ''));

                if ($name1 == $name) {

                    $mockAccountData = [
                        'status' => 1,
                        'message' => 'Success',
                        'data' => $rj['data']
                    ];

                    AepsDraft::where('id', $aepsDraft->id)->update([
                        'accountData'   => json_encode($mockAccountData),
                        'bank_verified_at' => 1
                    ]);

                    $userForBenificiary = $admin;
                    if($userForBenificiary){

                        $ifscVerification = [ 
                            'verified' => true,
                            'branch' => $rj['data']['branch'] ?? null,
                            'bank' => $rj['data']['bank_name'] ?? null,
                            'city' => $rj['data']['city'] ?? null,
                        ];

                        $beneficiaryData = [
                            'user_id' => $userForBenificiary->id,
                            'name' => $aepsDraft->full_name,
                            'mobile' => $aepsDraft->phone,
                            'account' => $aepsDraft->account_number,
                            'ifsc' => $aepsDraft->ifsc_code	,
                            'bank' => $aepsDraft->bank_name,
                            'branch' => $aepsDraft->bank_branch,
                            'type' => 3,
                            'status' => 1,
                            'admin_id' => $aepsDraft->admin_id,
                            'created_by' => $userForBenificiary->id,
                            'ifsc_verified' => 1,
                            'account_verified' => 1,
                            'verification_data' => json_encode([
                                'ifsc_data' => $ifscVerification,
                                'account_data' => $aepsDraft->accountData,
                                'verified_at' => now()->toISOString()
                            ])
                        ];

                        Beneficiary::create($beneficiaryData);
                    }

                    return response()->json([
                        'status' => 1,
                        'message' => 'Bank account verified successfully'
                    ]);

                } elseif ($name1 == '') {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Account not verified. Name mismatch.'
                    ]);

                } else {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Account name is '.($rj['data']['AccountName']??'').' & '."\n".'  Aadhar name is '.$aepsDraft->full_name
                    ]);
                }

            } else {
                return response()->json(['status' => 0, 'message' => $rj['message'] ?? 'Service Error', 'data' => NULL], 200);
            }

        } catch (\Exception $e) {
            CatchLogService::logException($request, 'verifyBankAccount', $e, [
                'api' => url('').'/api/v2/aeps/verify-bank-account',
                'context' => 'Bank Account Verification Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Bank account verification failed'
            ]);
        }
    }

    public function aepsOnboard(Request $request)
    {
        try {

            // Validate request body
            $request->validate([
                'aeps_draft_id'       => 'required',
                'pan_no'   => 'required',
            ]);

            $existingUser = AepsDraft::where('id', $request->aeps_draft_id)
            ->where('pan_no', $request->pan_no)
            ->where('status', 'draft')
            ->first();

            if (!$existingUser) {
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 1,
                    'message' => 'No draft found with the provided ID and PAN number',
                ], 200);
            }

            if($existingUser->phone_verified_at==0){
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 2,
                    'message' => 'Phone number not verified',
                ], 200);
            }

            if($existingUser->email_verified_at==0){
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 3,
                    'message' => 'Email not verified',
                ], 200);
            }

            if($existingUser->aadhaar_verified_at==0){
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 4,
                    'message' => 'Aadhar not verified',
                ], 200);
            }

            if($existingUser->pan_verified_at==0){
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 5,
                    'message' => 'PAN not verified',
                ], 200);
            }

            if($existingUser->bank_verified_at==0){
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 6,
                    'message' => 'Bank not verified',
                ], 200);
            }

      
            $url = self::BASE_URL."v2/aeps/onboard";

            $data = [
                "aeps_draft_id" => $existingUser->bid,
                "outletId"      => $existingUser->bmid,
                "pan_no"        => $existingUser->pan_no,
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



             DB::table('logs')->insert([
                'mid'          => $existingUser->mid ?? '',
                'type'         => 'AEPS Onboarding',
                'platform'     => 'WEB',
                'headers'      => json_encode([
                    'Accept'       => 'application/json',
                    'Content-Type' => 'application/json',
                    'mid' => self::MID,
                    'mkey' => self::MKEY,
                ]),
                'request_data'  => json_encode($data),
                'response_data'  => json_encode($json_response),
                'url'           => $url,
                'txnid'         => 0,
                'status'        => 0,
                'timestamp'    => now(),
                'created_at'   => now()->format('Y-m-d H:i:s'),
            ]);

            if(isset($json_response['status']) && $json_response['status']==1){
                $existingUser->request_data = json_encode($data);
                $existingUser->response_data = json_encode($json_response);
                $existingUser->aeps_status = 1;
                $existingUser->save();


                return response()->json([
                    'status'  => 1,
                    'message' => 'AEPS Onboarding successful',
                    'data'    => ['mid'=>$existingUser->mid],
                ], 200);
            }

            return response()->json([
                'status'  => 0,
                'message' => $json_response['message'] ?? 'AEPS Onboarding failed',
                'data'    => $json_response
            ], 200);

        } catch (\Exception $e) {
         
            $refId = CatchLogService::logException($request, 'aepsOnboardingFinal', $e, [
                'context' => 'AEPS Onboarding Final Error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Internal Server Error',
                'ref_id' => $refId,
            ], 500);
        }
    }

    public function aepsStateList(){

        $curl = curl_init();

        curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://fingpayap.tapits.in/fpaepsweb/api/onboarding/getstates',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'GET',
        CURLOPT_POSTFIELDS =>'{"billerId": "BILAVAIRTEL001", "circle": "Bihar & Jharkhand"}',
        CURLOPT_HTTPHEADER => array(
            'Content-Type: application/json',
            'mid: CW0000001',
            'mkey: cNGHE78SD3Qo1qBO91w28vtddB1JAuXo'
        ),
        ));

        $response = curl_exec($curl);

        curl_close($curl);
      
         return response()->json([
                'status' => 1,
                'message' => 'State fetch successfully',
                'data' => json_decode($response)
            ], 200);


    }


    public function doKyc(Request $request)
    {
        try {
             // Validate request body
            $validator = Validator::make($request->all(), [
                'latitude'      => 'required|numeric',
                'longitude'     => 'required|numeric',
                'deviceIMEI'    => 'required|string',
                'pan_no'        => 'required|string|max:10',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Missing required parameter(s): ' . implode(', ', $validator->errors()->keys()),
                    'data'    => null
                ], 400);
            }

            $existingUser = AepsDraft::where('pan_no', $request->pan_no)
            ->where('status', 'draft')
            ->first();

            if (!$existingUser) {
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 1,
                    'message' => 'No Agent found with the provided PAN number',
                ], 200);
            }

            // Validate and format mobile number
            $mobileNumber = preg_replace('/\D/', '', $existingUser->phone); // Remove non-digits
            if (strlen($mobileNumber) === 11 && substr($mobileNumber, 0, 1) === '0') {
                $mobileNumber = substr($mobileNumber, 1); // Remove leading 0
            }
            if (strlen($mobileNumber) === 12 && substr($mobileNumber, 0, 2) === '91') {
                $mobileNumber = substr($mobileNumber, 2); // Remove country code +91
            }
            if (strlen($mobileNumber) !== 10) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Invalid mobile number format. Must be 10 digits.',
                    'debug'   => 'Original: ' . $existingUser->phone . ', Processed: ' . $mobileNumber
                ], 400);
            }




            $urls = self::BASE_URL."v2/aeps/change-device";

            $datas = [
                "outletId"    => $existingUser->bmid,
                "pan_no"    => $existingUser->pan_no,
                "deviceIMEI"    => $request->deviceIMEI,
                "deviceName"        => "Mantra MFS100",
                "mposSerialNumber"        => "",
            ];

            $chs = curl_init($urls);

            curl_setopt_array($chs, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => json_encode($datas),
                CURLOPT_HTTPHEADER     => [
                    "Content-Type: application/json",
                    "Accept: application/json",
                    "mid: ".self::MID,
                    "mkey: ".self::MKEY
                ],
                CURLOPT_TIMEOUT        => 60,
                CURLOPT_CONNECTTIMEOUT => 20
            ]);

            $responses = curl_exec($chs);



            $url = self::BASE_URL."v2/aeps/get-otp";

            
            $data = [
                "outletId"      => $existingUser->bmid,
                "latitude"      => $existingUser->latitude,
                "longitude"     => $existingUser->longitude,
                "deviceIMEI"    => $request->deviceIMEI,
                "pan_no"        => $existingUser->pan_no,
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
                'mid'          => $existingUser->mid ?? '',
                'type'         => 'E-KYC Send OTP',
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

     
                return response()->json($json_response, 200);

            } 

             return response()->json([
                    'status'  => 0,
                    'message' => 'EKYC OTP sent failed',
                    'data'    => [
                        'status'=>false,
                        'message' => 'EKYC OTP sent failed',
                        'primaryKeyId'=>"",
                        'encodeFPTxnId'=>"",
                    ]
                ], 200);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'doKyc', $e, [
                'api' => 'https://fpekyc.tapits.in/fpekyc/api/ekyc/merchant/v1/sendotp',
                'context' => 'Critical error in doKyc',
            ]);

            return response()->json([
                'status'  => 0,
                'message' => 'Internal Server Error',
                'ref_id'  => $refId,
            ], 500);
        }
    }


    public function verifyOtp(Request $request)
    {
        try {
             // Validate request body


            $validator = Validator::make($request->all(), [
                'pan_no'        => 'required|string|max:10',
                'deviceIMEI'    => 'required|string',
                'otp'      => 'required|numeric',
                'primaryKeyId'     => 'required|string',
                'encodeFPTxnId'    => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Missing required parameter(s): ' . implode(', ', $validator->errors()->keys()),
                    'data'    => null
                ], 400);
            }

            $existingUser = AepsDraft::where('pan_no', $request->pan_no)
            ->where('status', 'draft')
            ->first();

            if (!$existingUser) {
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 1,
                    'message' => 'No Agent found with the provided PAN number',
                ], 200);
            }

         
            $url = self::BASE_URL."v2/aeps/verify-otp";

            $data = [
                "outletId"      => $existingUser->bmid,
                "primaryKeyId"    => $request->primaryKeyId,
                "encodeFPTxnId"    => $request->encodeFPTxnId,
                "deviceIMEI"    => $request->deviceIMEI,
                "pan_no"        => $existingUser->pan_no,
                "otp"           => $request->otp,
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
                'mid'          => $existingUser->mid ?? '',
                'type'         => 'E-KYC Verify OTP',
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



                $existingUser->aeps_status = 2;
                $existingUser->primaryKeyId = $json_response['data']['data']['primaryKeyId'];
                $existingUser->encodeFPTxnId = $json_response['data']['data']['encodeFPTxnId'];
                $existingUser->save();


                return response()->json([
                    'status'  => 1,
                    'message' => 'E-KYC OTP Verify successfully'
                ], 200);

            } 

            $existingUser->aeps_status = 1;
            $existingUser->save();

             return response()->json([
                    'status'  => 0,
                    'message' => 'E-KYC OTP Verify failed'
                ], 200);

        } catch (\Exception $e) {
          
            
            $refId = CatchLogService::logException($request, 'verifyOtp', $e, [
                'context' => 'AEPS E-KYC verify OTP Final Error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Internal Server Error',
                'ref_id' => $refId,
            ], 500);
        }
    }

    public function biometricEkyc(Request $request)
    {
        try {
            // -----------------------------
            // ✅ Validate request
            // -----------------------------
            $validator = Validator::make($request->all(), [
                'pan_no'         => 'required|string|max:10',
                'deviceIMEI'     => 'required|string',
                'xml'            => 'required',
                'primaryKeyId'   => 'required|string',
                'encodeFPTxnId'  => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Missing required parameter(s): ' . implode(', ', $validator->errors()->keys()),
                    'data'    => null
                ], 400);
            }

            // -----------------------------
            // ✅ Fetch draft user
            // -----------------------------
            $existingUser = AepsDraft::where('pan_no', $request->pan_no)
                ->where('status', 'draft')
                ->first();

            if (!$existingUser) {
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 1,
                    'message' => 'No Agent found with the provided PAN number',
                ], 200);
            }


            $url = self::BASE_URL."v2/aeps/biometric-ekyc";

            $data = [
                "outletId"      => $existingUser->bmid,
                "primaryKeyId"    => $request->primaryKeyId,
                "encodeFPTxnId"    => $request->encodeFPTxnId,
                "deviceIMEI"    => $request->deviceIMEI,
                "pan_no"        => $existingUser->pan_no,
                "xml"           => $request->xml,
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
                'mid'          => $existingUser->mid ?? '',
                'type'         => 'Biometric E-Kyc',
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

                $existingUser->aeps_status = 3;
                $existingUser->save();


                return response()->json([
                    'status'  => 1,
                    'message' => 'Biometric E-kyc successfully'
                ], 200);

            } 

             if(isset($json_response['status']) && $json_response['status']==0){


                

                if(isset($json_response['data']['statusCode']) &&  $json_response['data']['statusCode'] == "10005"){
                    
                    $existingUser->aeps_status = 1;
                    $existingUser->save();
                }

                return response()->json([
                    'status'  => 0,
                    'message' => $json_response['data']['message'] ?? 'Biometric E-kyc failed'
                ], 200);
             }



            return response()->json([
                'status'  => 0,
                'message' => 'Biometric E-kyc failed'
            ], 200);
          

        } catch (\Throwable $e) {
          

            $refId = CatchLogService::logException($request, 'biometricEkyc', $e, [
                'context' => 'Biometric E-kyc Final Error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Internal Server Error',
                'ref_id' => $refId,
            ], 500);
        }
    }


    public function twoFA(Request $request)
    {
        try {
            // ✅ Validate request body
            $validator = Validator::make($request->all(), [
                'pan_no'         => 'required|string|max:10',
                'deviceIMEI'     => 'required|string',
                'xml'            => 'required'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Missing required parameter(s): ' . implode(', ', $validator->errors()->keys()),
                    'data'    => null
                ], 400);
            }

            // ✅ Find agent draft
            $existingUser = AepsDraft::where('pan_no', $request->pan_no)
                ->where('status', 'draft')
                ->first();

            if (!$existingUser) {
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 1,
                    'message' => 'No Agent found with the provided PAN number',
                ], 200);
            }

          
            
            // ✅ Extract merchantLoginId and aadhaarNumber for payload
            $merchantLoginId = $existingUser->mid;
            $aadhaarNumber = $existingUser->aadhaar_number;
            $time=now()->timestamp;

       

            $url = self::BASE_URL."v2/aeps/2fa";

            $data = [
                "outletId"      => $existingUser->bmid,
                "deviceIMEI"    => $request->deviceIMEI,
                "pan_no"        => $existingUser->pan_no,
                "xml"           => $request->xml
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
                'mid'          => $existingUser->mid ?? '',
                'type'         => '2FA',
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

                $existingUser->aeps_status = 4;
                $existingUser->save();


                $is_api_partner = false;
                $adminData = User::where('id',$existingUser->admin_id)->select("id","is_api_partner")->first();
                if($adminData && $adminData->is_api_partner==true) {
                    $credit_user_id = $adminData->id;
                    $is_api_partner = true;
                } else {
                    $userData = User::where('mid',$existingUser->mid)->select("id")->first();
                    $credit_user_id = $userData->id;
                }


                $account = Account::where('user_id', $credit_user_id)->where('primary_status', true)->first();
                if ($account) {

                    // Resolve category_id from category_code if provided
                    $categoryId = null;
                    $category = TxnCategory::where('code', strtoupper('AEPS'))->first();
                    $categoryId = $category ? $category->id : null;

                    // Create passbook entry
                    $passbookData = [
                        'account_id' => $account->id,
                        'transaction_id' => '2FA' . rand(111111, 999999),
                        'type' => 'DR',
                        'pre_balance' => $account->balance,
                        'amount' => 1,
                        'balance' => $account->balance - 1,
                        'description' => '2FA Charge - ' . $existingUser->phone,
                        'category_id' => $categoryId,
                        'created_by' => $credit_user_id,
                        'admin_id' => $existingUser->admin_id,
                        'user_id' => $credit_user_id,
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                    
                    // Create the passbook entry
                    $passbook = Passbook::create($passbookData);
                    
                    
                    
                    // Send callback to partner URL
                    if($is_api_partner == true) {
                        $setting = Setting::where('user_id', $credit_user_id)->first();
                        if($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)) {
                            try {
                                $postData = [
                                    "type" => "2fa",
                                    "data" => [
                                        "outletId" => $existingUser->mid,
                                        "charge" => 1,
                                        "timestamp" => date('Y-m-d H:i:s'),
                                        "message" => 'AEPS 2FA Charge - ' . $existingUser->mobile,
                                    ]
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
                    
                }



                return response()->json([
                    'status'  => 1,
                    'message' => 'TwoFA Completed'
                ], 200);

            } 



            return response()->json([
                'status'  => 0,
                'message' => 'TwoFA Failed'
            ], 200);

           

        } catch (\Exception $e) {
          
          
            
            $refId = CatchLogService::logException($request, 'twofa', $e, [
                'context' => '2FA Final Error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Internal Server Error',
                'ref_id' => $refId,
            ], 500);
        }
    }


    /*
        route: api/v2/aeps/do_aeps
        Currently we are sending deviceIMEI as imei from request;

        ## And we are not using deviceIMEI in the API request
        ## direct aepsdraft data deviceIMEI used in the request for now for easy transaction

        TODO: integrate current deviceIMEI in each API request (deviceIMEI: imei / serial no. of scanner)

        Requirement:
        deviceIMEI: In case of web you need to send the scanner’s serial number which
        is integrated in your system for performing transactions, based on the IMEI will
        assign the terminal.
    */


    public function sendAepsOtp(Request $request)
    {
        try {
            // ✅ Validate request body according to Fingpay OTP specification
            $validator = Validator::make($request->all(), [
                'customerMobile' => 'required|string|regex:/^[6-9]\d{9}$/',
                'aadhaarNumber'  => 'required|string',
                'bankID'         => 'required|string',
                'aepsType'       => 'required|string|in:CW,M',
                'amount'         => 'required|numeric|min:5000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Missing or invalid parameter(s): ' . implode(', ', $validator->errors()->all()),
                    'data'    => null
                ], 200);
            }

            // Clean Aadhaar number (remove spaces)
            $cleanAadhaar = str_replace(' ', '', $request->aadhaarNumber);
            if (strlen($cleanAadhaar) !== 12 || !ctype_digit($cleanAadhaar)) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Invalid Aadhaar number format. Must be 12 digits.',
                    'data'    => null
                ], 200);
            }

            $outletId = $request->outletId ?? $request->mid;

            if (empty($outletId)) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Outlet ID (MID) is required.',
                    'data'    => null
                ], 200);
            }

            // ✅ Find agent draft
            $existingUser = AepsDraft::where('mid', $outletId)
                ->where('status', 'draft')
                ->first();

            if (!$existingUser) {
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 1,
                    'message' => 'No Agent found with the provided MID',
                ], 200);
            }

            if ($existingUser->video_kyc_status == 0) {
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 1,
                    'message' => 'Video KYC is not completed. Please contact your distributor.',
                ], 200);
            }

            $aepsType = $request->aepsType; // CW or M
          
            $url = self::BASE_URL."v2/aeps/send-aeps-otp";

            $data = [
                "outletId" => $existingUser->bmid,
                "customerMobile"    => (string) $request->customerMobile,
                "aadhaarNumber"        => (string) $request->aadhaarNumber,
                "bankID"           => (string) $request->bankID,
                "aepsType"       => $aepsType,
                "amount"    => floatval($request->amount)
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


            $response_data = json_decode($response, true);

            return response()->json($response_data);

        } catch (\Exception $e) {
           
            return response()->json([
                'status'  => 0,
                'message' => 'Internal Server Error'
            ], 500);
        }
    }


    public function doAeps(Request $request)
    {
        try {
            // ✅ Validate request body
            $validator = Validator::make($request->all(), [
                'xml'            => 'required',
                'customerMobile' => 'required|string|regex:/^[6-9]\d{9}$/',
                'aadhaarNumber'  => 'required|string|regex:/^\d{12}$/',
                'bankID'         => 'required|string',
                'deviceType'     => 'required|string',
                'aepsType'       => 'required|string|in:BE,CW,MS,M',
                'amount'         => 'required_if:aepsType,CW,M|nullable|numeric|min:1|max:50000',
                'bankName'       => 'required|string|max:100',
            ]);

			
            if ($validator->fails()) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Missing required parameter(s): ' . implode(', ', $validator->errors()->keys()),
                    'data'    => null
                ], 200);
            }

            $request->outletId = $request->outletId ?? $request->mid;

            if(empty($request->outletId)){
                 return response()->json([
                    'status'  => 0,
                    'message' => 'Outlet ID (MID) is required.',
                    'data'    => null
                ], 200);
            }

            // ✅ Find agent draft
            $existingUser = AepsDraft::where('mid', $request->outletId)
                ->where('status', 'draft')
                ->first();

            if (!$existingUser) {
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 1,
                    'message' => 'No Agent found with the provided MID',
                ], 200);
            }

            // blocking any transaction if video kyc is not completed
            if ($existingUser->video_kyc_status == 0) {
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 1,
                    'message' => 'Video KYC is not completed. Please contact your distributor.',
                ], 200);
            }

            $aepsType = $request->aepsType;

            // if (in_array($aepsType, ['CW', 'M'])) {
            //     // Temporary restriction after update
            //     return response()->json([
            //         'status'  => 0,
            //         'message' => 'Cash Withdrawal and Aadhaar Pay services are temporarily unavailable due to a system update. Your money is safe. Please use Balance Enquiry or Mini Statement for now and try again shortly.',
            //         'data'    => null
            //     ], 200);
            // }


            $amount = 0;
            if (in_array($aepsType, ['CW', 'M'])) {
                $amount = $request->amount;
            }

            $is_api_partner = false;
            $adminData = User::where('id',$existingUser->admin_id)->first();
            if($adminData && $adminData->is_api_partner==true) {

                $balanceAccount = Account::where('user_id',$adminData->id)->where('primary_status',true)->first();
                $credit_user_id = $adminData->id;
                $is_api_partner = true;
            } else {
                $userData = User::where('mid',$existingUser->mid)->first();
                $balanceAccount = Account::where('user_id',$userData->id)->where('primary_status',true)->first();
                $credit_user_id = $userData->id;

            }


            if(!$balanceAccount){
                return response()->json([
                    'status'  => 0,
                    'message' => 'No wallet found, please create your wallet and make primary.',
                    'data'    => null
                ], 200);
            }


            if($aepsType=='M'){
                 if(!$balanceAccount || $balanceAccount->balance < 100){
                    return response()->json([
                        'status'  => 0,
                        'message' => 'Insufficient balance in your wallet. 100.00 INR is required for Aadhar Pay.',
                        'data'    => null
                    ], 200);
                }
            }


            $timestamp = date('YmdHis');
            $randomNumber = rand(11,99);
            $merchantLoginId = $existingUser->mid;
            $merchantTranId = $merchantLoginId . $timestamp . $randomNumber;

            $history = AepsTransaction::create([
                'mid'                => $existingUser->mid,
                'machine_json_data'  => '',
                'customer_mobile'    => $request->customerMobile,
                'aadhaar_number'     => $request->aadhaarNumber,
                'longitude'        => floatval($existingUser->longitude),
                'latitude'         => floatval($existingUser->latitude),
                'bank_id'           => $request->bankID,
                'bank_name'         => $request->bankName,
                'device_type'       => $request->deviceType,
                'aeps_type'         => $aepsType,
                'amount'           => $amount,
                'admin_id'         => $existingUser->admin_id,
                'created_by'      => $existingUser->created_by,
                'merchant_txn_id' => $merchantTranId,
            ]);



            $url = self::BASE_URL."v2/aeps/doAeps";

         
            $data = [
                "outletId"         => $existingUser->bmid,
                "customerMobile"   => $existingUser->phone,
                "aadhaarNumber"    => $request->aadhaarNumber,
                "bankID"           => (string) $request->bankID,
                "bankName"         => $request->bankName,
                "deviceType"       => $request->deviceType,
                "aepsType"         => $request->aepsType,
                "amount"           => $request->amount,   
                "xml" => $request->xml,
            ];
            
            // ✅ Log request/response
            DB::table('logs')->insert([
                'mid'          => $existingUser->mid,
                'type'         => 'Transaction - ' . $aepsType,
                'platform'     => 'WEB',
                'headers'      => json_encode([
                    'Accept'       => 'application/json',
                    'Content-Type' => 'application/json',
                    'mid' => self::MID,
                    'mkey' => self::MKEY,
                ]),
                'request_data'  => json_encode($data),
                'url'           => $url,
                'txnid'         => $merchantTranId,
                'status'        => 0,
                'timestamp'    => now(),
                'created_at'   => now()->format('Y-m-d H:i:s'),
            ]);

            
         

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

            DB::table('logs')
            ->where('txnid', $merchantTranId)
            ->update([
                'response_data' => json_encode($json_response),
                'status'        => $json_response['status'] ?? 0,
                'updated_at'    => now(),
            ]);


      

            $history->update([
                "request" => json_encode($data),
                "response" => json_encode($json_response),
                "response_status" => $json_response['status'] ?? null,
                "response_status_code" => $json_response['statusCode'] ?? null,
                "response_message" => $json_response['message'] ?? null,
                "auth3way" => 0
            ]);



            if($is_api_partner == true){
                $setting = Setting::where('user_id', $credit_user_id)->first();
                if($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)){
                    // Send callback to partner URL
                    try {
                        

                        $history->update([
                            "response_status_code" => 1
                        ]);

                          
                        $db_response_data = DB::table('aeps_transactions')->where('id', $history->id)
                        ->select(
                            'mid as outletId',
                            'customer_mobile',
                            'aadhaar_number',
                            'bank_id',
                            'bank_name',
                            'device_type',
                            'aeps_type',
                            'amount',
                            'merchant_txn_id',
                            'response'
                        )
                        ->first();

        
                        $postData = [
                            "type" => "aeps_transaction",
                            "data" => $db_response_data
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

           

            // ✅ Update user status
            if ($json_response['status'] == 1) {

                $fpTransactionId=$json_response['data']['fpTransactionId'];
                $bankRRN=$json_response['data']['bankRRN'];

                $history->update([
                    "merchant_txn_id" => $fpTransactionId,
                    "bank_id" => $bankRRN
                ]);

                
                if ($aepsType == 'CW') {

                    $account = Account::where('user_id', $credit_user_id)->where('primary_status', true)->first();
                   
                    // Determine category based on AEPS type
                    $categoryCode = 'AEPS';

                    $type= $aepsType;
                    
                    // Step 1: Prepare transaction data
                    $transactionData1 = [
                        'account_id' => $account->id,
                        'type' => 'CR',
                        'amount' => $amount,
                        'description' => $type.' - Transaction '.$aadhaarNumber,
                        'transaction_id' => $merchantTranId,
                        'created_by' => $existingUser->created_by,
                        'admin_id' => $existingUser->admin_id,
                        'user_id' => $credit_user_id,
                        'category_code' => $categoryCode
                    ];

                    // Step 2: Create the transaction
                    $transaction = createTransaction($transactionData1);

                    $commissionTransactionData = [
                        'user_id' => $credit_user_id,
                        'amount' => $amount,
                        'sub_module_id' => 1,
                        'category_code' => 'AEPS',
                        'description' => $aepsType.' - Commission '.$aadhaarNumber,
                        'admin_id' => $existingUser->admin_id
                    ];

                    processCommissionCharge($commissionTransactionData);

                }


            

                if ($aepsType == 'MS') {

                    $account = Account::where('user_id', $credit_user_id)->where('primary_status', true)->first();
                    
                    if($account) {
                         // Step 1: Prepare transaction data
                        $requestData=[
                            'account_id' => $account->id,
                            'type' => 'CR',
                            'amount' => 1,
                            'description' => $aepsType.' - Commission '.$aadhaarNumber,
                            'transaction_id' => 'MSCOM' . rand(111111, 999999),
                            'created_by' => $credit_user_id,
                            'admin_id' => $existingUser->admin_id,
                            'user_id' => $credit_user_id,
                            'category_code' => 'AEPS'
                        ];
                        
                        $resResponse=createTransaction($requestData);

                        // Create passbook entry for DR txns
                        $categoryId = null;
                        $category = TxnCategory::where('code', strtoupper('AEPS'))->first();
                        $categoryId = $category ? $category->id : null;

                        $passbookData = [
                            'account_id' => $account->id,
                            'transaction_id' => 'TDS' . rand(111111, 999999),
                            'type' => 'DR',
                            'pre_balance' => $account->balance,
                            'amount' => 0.02,
                            'balance' => $account->balance - 0.02,
                            'description' => 'TDS',
                            'category_id' => $categoryId,
                            'created_by' => $credit_user_id,
                            'admin_id' => $existingUser->admin_id,
                            'user_id' => $credit_user_id,
                            'created_at' => now(),
                            'updated_at' => now()
                        ];
                        
                        // Create the passbook entry
                        $passbook = Passbook::create($passbookData);
                        
                    }

                }

        
                return response()->json([
                    'status'  => 1,
                    'message' => 'Transaction successful',
                    'data'    => $json_response['data'],
                    'logo'    => $this->getCompanyLogo($existingUser->admin_id)
                ]);

            } else {
              
                // ✅ Enhanced error logging for specific error code
                $errorMessage = $responseJson['message'] ?? 'API request failed';
       
                
                return response()->json([
                    'status'  => 0,
                    'message' => $errorMessage,
                    'data'    => $json_response['data'],
                    'shop_name' => $existingUser->shop_name,
                    'shop_phone' => $existingUser->phone,
                    'logo'    => $this->getCompanyLogo($existingUser->admin_id)
                ]);
            }





        } catch (\Exception $e) {
          

            $refId = CatchLogService::logException($request, 'doAeps', $e, [
                'context' => 'doAeps Error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Internal Server Error',
                'ref_id' => $refId,
                'logo'    => $this->getCompanyLogo(1)
            ], 500);
        }
    }


    public function checkAepsCommission(){
            $commissionTransactionData = [
                'user_id' => 11,
                'amount' => 2000,
                'sub_module_id' => 1,
                'category_code' => 'AEPS',
                'description' => 'CW - Commission 823539636200',
                'admin_id' => 1
            ];

            $ss=processCommissionCharge($commissionTransactionData);

            return response()->json([
                'status'  => 1,
                'message' => 'Commission Distribute successful',
                'data'    => $ss,
            ]);
    }

    public function bankList()
    {
        try {
            // Path to banklist.txt in public folder
            $path = public_path('banklist.txt');

            if (!File::exists($path)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'File not found',
                ], 404);
            }

            // Get file contents
            $fileData = File::get($path);

            // Decode JSON
            $data = json_decode($fileData, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid JSON format in file',
                ], 500);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Bank list retrieved',
                'data' => $data['data'] ?? [],
            ]);

        } catch (\Exception $e) {
            CatchLogService::logException(request(), 'bankList', $e, [
                'context' => 'Bank list retrieval error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve bank list',
            ], 500);
        }
    }


    public function userKyc(Request $request)
    {
        try {
            

            // Get from header or request
            $mid = $request->header('mid') ?? $request->input('mid');
            $mkey = $request->header('mkey') ?? $request->input('mkey');

            if ($mid && $mkey) {
                $user = User::where('mid', $mid)
                            ->where('mkey', $mkey)
                            ->first();

                if (!$user) {
                    //auth()->logout(); // Clear any existing auth session
                    return response()->json([
                        'status' => 0,
                        'message' => 'Invalid MID or MKEY',
                    ], 401);
                }

                if ($user->is_api_partner == "1") {
                    //auth()->logout(); // Clear any existing auth session
                    return response()->json([
                        'status' => 0,
                        'message' => 'User Kyc is not available for api partner',
                    ], 401);
                }
            }

            // ✅ Find agent draft
            $existingUser = UserKyc::where('user_id', $request->get('user')->id)->first();

            if (!$existingUser) {
                return response()->json([
                    'status'  => 0,
                    'pending_status'  => 1,
                    'message' => 'No KYC data found for the user',
                ], 200);
            }


            return response()->json([
                'status'  => 1,
                'message' => 'KYC data retrieved successfully',
                'data'    => $existingUser
            ], 200);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'userKyc', $e, [
                'context' => 'User KYC retrieval error',
            ]);
          
            return response()->json([
                'status'  => 0,
                'message' => 'Internal Server Error',
                'ref_id'  => $refId,
            ], 500);
        }
    }


    public function aepsHistory(Request $request)
    {
        $perPage = min($request->input('per_page', 50), 500);
        $page = max($request->input('page', 1), 1);

        $mid = $request->outletId;
        $admin = $request->get('admin');
        $user = $request->get('user');

        $selectColumns = [
            'aeps_transactions.id',
            'aeps_transactions.customer_mobile', 'aeps_transactions.aadhaar_number', 'aeps_transactions.bank_name',
            'aeps_transactions.device_type', 'aeps_transactions.aeps_type', 'aeps_transactions.amount',
            'aeps_transactions.auth3way', 'aeps_transactions.merchant_txn_id', 'aeps_transactions.request', 'aeps_transactions.response',
            'aeps_transactions.response_status', 'aeps_transactions.response_message', 'aeps_transactions.response_status_code',
            'aeps_transactions.created_at',
            'aeps_drafts.shop_name', 'aeps_drafts.full_name', 'aeps_drafts.phone as shop_phone',
            'aeps_transactions.mid as outletId',
            'users.root as root_chain','users.id as user_table_id'
        ];

        if(isset($request->type) && $request->type=='matm'){
            $query = AepsTransaction::join('aeps_drafts', 'aeps_drafts.mid', '=', 'aeps_transactions.mid')
            ->join('users', 'users.mid', '=', 'aeps_drafts.mid')
            ->where(function ($q) {
                $q->where('aeps_transactions.aeps_type', 'MATMCW')
                ->orWhere('aeps_transactions.aeps_type', 'MATMBE');
            })
            ->orderBy('aeps_transactions.id', 'DESC');


        } else {
           
          $query = AepsTransaction::join('aeps_drafts', 'aeps_drafts.mid', '=', 'aeps_transactions.mid')
            ->join('users', 'users.mid', '=', 'aeps_drafts.mid')
            ->whereNotIn('aeps_transactions.aeps_type', ['MATMCW', 'MATMBE'])
            ->orderBy('aeps_transactions.id', 'DESC');

        }
        // Base join with aeps_drafts and users
       

        // Role-wise filter
        if ($user->role == 1) {
            // Super Admin → no filter
            $query = $query->select($selectColumns);
        } elseif ($user->role == 2) {

            if($admin->is_api_partner==1){

                if (!empty($request->selected_admin_id) && $request->selected_admin_id !== 'all') {
                
                    $query = $query->where('aeps_transactions.admin_id', $admin->id)
                        ->select($selectColumns);

                    $selectedId = $request->selected_admin_id;

                    $query->where(function ($q) use ($selectedId) {
                        $q->whereRaw("FIND_IN_SET(?, users.root)", [$selectedId])
                        ->orWhere('users.id', $selectedId);
                    });
                    
                } else{
                    $query = $query->where('aeps_transactions.mid', $mid)
                    ->select($selectColumns);
                }
            } else {

                // Admin → filter by admin_id
                $query = $query->where('aeps_transactions.admin_id', $admin->id)
                        ->select($selectColumns);
            }
            


        } else {
        

            if (!empty($request->selected_admin_id) && $request->selected_admin_id !== 'all') {
                
                $query = $query->where('aeps_transactions.admin_id', $admin->id)
                        ->select($selectColumns);

                $selectedId = $request->selected_admin_id;

                $query->where(function ($q) use ($selectedId) {
                    $q->whereRaw("FIND_IN_SET(?, users.root)", [$selectedId])
                    ->orWhere('users.id', $selectedId);
                });

            } else{
            // Dealer/Retailer → filter by mid
            $query = $query->where('aeps_transactions.mid', $mid)
                ->select($selectColumns);
            }
        }

        // Date range filter
        if (!empty($request->from_date)) {
            $query->whereDate('aeps_transactions.created_at', '>=', $request->from_date);
        }
        if (!empty($request->to_date)) {
            $query->whereDate('aeps_transactions.created_at', '<=', $request->to_date);
        }

        // AEPS type filter
        if (!empty($request->aeps_type) && $request->aeps_type !== 'all') {
            $query->where('aeps_transactions.aeps_type', $request->aeps_type);
        }

        /**
         * 🌟 Admin Hierarchy Filter
         * Filter by selected_admin_id → search in users.root
         * Example root: "1,15,33,58"
         */
        if (!empty($request->selected_admin_id) && $request->selected_admin_id !== 'all') {
            $selectedId = $request->selected_admin_id;

            $query->where(function ($q) use ($selectedId) {
                $q->whereRaw("FIND_IN_SET(?, users.root)", [$selectedId])
                ->orWhere('users.id', $selectedId);
            });
        }


        


        // \DB::enableQueryLog(); // put above paginate()
        $data = $query->paginate($perPage, ['*'], 'page', $page);
        // $lastQuery = \DB::getQueryLog(); // get last query

        if (!$data || $data->isEmpty()) {
            return response()->json([
                'status'     => 0,
                'message'    => 'No transaction history found',
                'data'       => null,
                'user_role'  => $admin->role
            ], 200);
        }
        
        // Transform data to include IST formatted timestamps and extract RRN from response JSON
        $data->getCollection()->transform(function ($item) {
            if ($item->created_at) {
                $item->created_at = \Carbon\Carbon::parse($item->created_at)
                    ->setTimezone('Asia/Kolkata')
                    ->format('Y-m-d H:i:s');
            }
            return $item;
        });

  
        $setting = DB::table('settings')->where('user_id',  $admin->id ?? null)->select('logo', 'website','mobile_no')->first();
        $aepsDraft = DB::table('aeps_drafts')->where('mid',  $mid ?? null)->select('shop_name', 'full_name','shop_address')->first();

        
      
        return response()->json([
            'status'     => 1,
            'message'    => 'Transaction history retrieved successfully',
            'data'       => $data,
            'logo'       => $setting->logo,
            'user_role'  => $admin->role,
            'support_number'   => $setting->mobile_no,
            'website'   => $setting->website,
            'shop_name' => $aepsDraft->shop_name,
            'shop_owner' => $aepsDraft->full_name,
            'shop_address' => $aepsDraft->shop_address,
        ], 200);
    }

    public function aepsShopList(Request $request){
        try {
            $admin = $request->get('admin');

            // Check if user has permission to view shops list (only roles 1 & 2)
            if (!in_array($admin->role, [1, 2])) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Unauthorized access to shop list',
                    'data'    => []
                ], 403);
            }

            // Build query to get unique shops
            $query = AepsTransaction::join('aeps_drafts', 'aeps_drafts.mid', '=', 'aeps_transactions.mid')
                ->select('aeps_transactions.mid as outletId', 'aeps_drafts.shop_name', 'aeps_drafts.full_name')
                ->distinct();
            
            // Apply admin filter for role 2
            if ($admin->role == 2) {
                $query->where('aeps_transactions.admin_id', $admin->id);
            }
            
            $shops = $query->get();

            return response()->json([
                'status'  => 1,
                'message' => 'Shop list retrieved successfully',
                'data'    => $shops
            ], 200);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'getShops', $e, [
                'context' => 'Shop list retrieval error',
            ]);
            return response()->json([
                'status'  => 0,
                'message' => 'Internal Server Error',
                'ref_id'  => $refId,
            ], 500);
        }
    }

    /**
     * Get hierarchical filter data for AEPS transaction filtering
     * Returns admins, roles hierarchy based on user role
     */
    public function aepsFilterHierarchy(Request $request){
        try {
            $admin = $request->get('admin');
            $user = $request->get('user');
            
            $response = [
                'status' => 1,
                'message' => 'Filter hierarchy retrieved successfully',
                'user_role' => $admin->role,
            ];

            // Role 1 (Super Admin): Get all admins
            if ($admin->role == 1) {
                $admins = DB::table('users')
                    ->where('role', 2)
                    ->select('id', 'name', 'mid', 'mobile')
                    ->orderBy('name', 'asc')
                    ->get();
                $response['admins'] = $admins;
                
                // For Super Admin, get roles from user_id = 1 (super admin created roles)
                $roles = DB::table('roles')
                    ->where('user_id', 1)
                    ->where('id', '!=', 1) // Exclude Super Admin role
                    ->orderBy('guest', 'asc')
                    ->select('id', 'name', 'guest')
                    ->get();
            } else {
                // Get roles for current admin (ordered by guest asc)
                $roles = DB::table('roles')
                    ->where('user_id', $admin->id)
                    ->where('id', '!=', $admin->role)
                    ->orderBy('guest', 'asc')
                    ->select('id', 'name', 'guest')
                    ->get();
            }
            
            $response['roles'] = $roles;

            // Get first role users for immediate dropdown population
            if ($roles->count() > 0) {
                $firstRole = $roles->first();
                $firstRoleUsers = DB::table('users')
                    ->where('role', $firstRole->id)
                    ->select('id', 'name', 'mid', 'mobile', 'root')
                    ->orderBy('name', 'asc')
                    ->get();
                $response['first_role_users'] = $firstRoleUsers;
            }

            return response()->json($response, 200);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'getFilterData', $e, [
                'context' => 'Filter data retrieval error',
            ]);
            return response()->json([
                'status'  => 0,
                'message' => 'Internal Server Error',
                'ref_id'  => $refId,
            ], 500);
        }
    }

    /**
     * Get all admin users (role = 2) for filtering
     * Used by Super Admin to filter data by admin
     */
    public function getAllAdmins(Request $request){
        try {
            $admin = $request->get('admin');
            $apiPartner = $request->api ?? 0;
            
            // Only allow super admin (role = 1) to access this
            if ($admin->role != 1) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $admins = DB::table('users')
                ->where('role', 2)
                ->when($apiPartner == 1, function ($query) {
                    $query->where('is_api_partner', 1);
                })
                ->select('id', 'name', 'mid', 'mobile')
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'status' => 1,
                'message' => 'Admins retrieved successfully',
                'admins' => $admins
            ], 200);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'getAllAdmins', $e, [
                'context' => 'Admin list retrieval error',
            ]);
            return response()->json([
                'status'  => 0,
                'message' => 'Internal Server Error',
                'ref_id'  => $refId,
            ], 500);
        }
    }

  
    /**
     * Get users by role under a parent user (for cascading dropdown)
     */
    public function aepsUsersByRole(Request $request){
        try {
            $roleId = $request->get('role_id');
            $parentUserId = $request->get('parent_user_id');
            
            if (!$roleId) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Role ID is required'
                ], 400);
            }

            $query = DB::table('users')
                ->where('role', $roleId)
                ->select('id', 'name', 'mid', 'mobile', 'root');

            // Filter by parent user if provided (using LIKE on root column)
            if ($parentUserId) {
                $query->where(function($q) use ($parentUserId) {
                    $q->where('root', 'LIKE', '%,' . $parentUserId . ',%')
                      ->orWhere('root', 'LIKE', '%,' . $parentUserId)
                      ->orWhere('root', 'LIKE', $parentUserId . ',%')
                      ->orWhere('root', $parentUserId);
                });
            }

            $users = $query->orderBy('name', 'asc')->get();

            return response()->json([
                'status' => 1,
                'message' => 'Users retrieved successfully',
                'users' => $users
            ], 200);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'getUsersByRole', $e, [
                'context' => 'Users by role retrieval error',
            ]);
            return response()->json([
                'status'  => 0,
                'message' => 'Internal Server Error',
                'ref_id'  => $refId,
            ], 500);
        }
    }

    /**
     * Get shops (outlets) for filtering - filtered by selected user hierarchy
     */
    public function aepsShopsByHierarchy(Request $request){
        try {
            $admin = $request->get('admin');
            $selectedUserId = $request->get('selected_user_id');
            
            $query = AepsTransaction::join('aeps_drafts', 'aeps_drafts.mid', '=', 'aeps_transactions.mid')
                ->select('aeps_transactions.mid as outletId', 'aeps_drafts.shop_name', 'aeps_drafts.full_name')
                ->distinct();

            // If specific user selected, filter shops under that user's hierarchy
            if ($selectedUserId && $selectedUserId !== 'all') {
                // Get user's mid
                $selectedUser = DB::table('users')->where('id', $selectedUserId)->first();
                if ($selectedUser) {
                    // Find all users under this user in hierarchy
                    $userMids = DB::table('users')
                        ->where(function($q) use ($selectedUserId) {
                            $q->where('root', 'LIKE', '%,' . $selectedUserId . ',%')
                              ->orWhere('root', 'LIKE', '%,' . $selectedUserId)
                              ->orWhere('root', 'LIKE', $selectedUserId . ',%')
                              ->orWhere('root', $selectedUserId)
                              ->orWhere('id', $selectedUserId);
                        })
                        ->pluck('mid')
                        ->toArray();
                    
                    if (!empty($userMids)) {
                        $query->whereIn('aeps_transactions.mid', $userMids);
                    }
                }
            } else {
                // Apply role-based filter
                if ($admin->role == 2) {
                    // Admin sees only their users' shops
                    $userMids = DB::table('users')
                        ->where(function($q) use ($admin) {
                            $q->where('root', 'LIKE', '%,' . $admin->id . ',%')
                              ->orWhere('root', 'LIKE', '%,' . $admin->id)
                              ->orWhere('root', 'LIKE', $admin->id . ',%')
                              ->orWhere('root', $admin->id)
                              ->orWhere('id', $admin->id);
                        })
                        ->pluck('mid')
                        ->toArray();
                    
                    if (!empty($userMids)) {
                        $query->whereIn('aeps_transactions.mid', $userMids);
                    }
                }
                // Role 1 sees all shops (no additional filter)
            }

            $shops = $query->get();

            return response()->json([
                'status' => 1,
                'message' => 'Shops retrieved successfully',
                'shops' => $shops
            ], 200);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'getShopsByUser', $e, [
                'context' => 'Shops by user retrieval error',
            ]);
            return response()->json([
                'status'  => 0,
                'message' => 'Internal Server Error',
                'ref_id'  => $refId,
            ], 500);
        }
    }

    public function aepsRolesByUser(Request $request)
    {
        $adminId = $request->admin_id ?? null;
        $rootId  = $request->root_id ?? null;

        /*
        ---------------------------------
        MODE 1 → ADMIN_ID FLOW (your old logic)
        ---------------------------------
        */
        if ($adminId) {

            if ($adminId === 'all') {
                return response()->json(['status'=>1,'data'=>[]]);
            }

            $admin = User::find($adminId);
            if (!$admin) {
                return response()->json(['status'=>0,'message'=>'User not found']);
            }

            $checkadmin = User::where('mid', $admin->admin_mid)->first();
            if (!$checkadmin) {
                return response()->json(['status'=>0,'message'=>'Admin parent not found']);
            }

            $children = User::whereRaw("FIND_IN_SET(?, users.root)", [$admin->id])
                ->where('users.id','!=',$checkadmin->id)
                ->join('roles','roles.id','=','users.role')
                ->select(
                    'users.id',
                    'users.name',
                    'users.mid',
                    'users.role',
                    'roles.guest',
                    'roles.name as role_name'
                )
                ->orderBy('roles.guest','ASC')
                ->get();

            return $this->formatRoleResponse($children, 'admin_mode');
        }

        /*
        ---------------------------------
        MODE 2 → ROOT PARTNER FLOW
        ---------------------------------
        */
        if ($rootId) {

            $user = $request->get('user');
            if (!($user->role == 1 || $user->id == 21 || ($user->role == 2 && $user->is_api_partner == 1))) {
                 return response()->json([
                    'status'=>1,
                    'data'=>[],
                    'message'=>'You are not authorized to perform this action'
                ]);
            }

            $rootUser = User::find($rootId);
            if (!$rootUser) {
                return response()->json(['status'=>0,'message'=>'Root user not found']);
            }

            $children = AepsDraft::where('aeps_drafts.mid','!=',$rootUser->mid)
                ->where('aeps_drafts.admin_id', $rootId)
                ->select(
                    'aeps_drafts.id',
                    'aeps_drafts.shop_name as name',
                    'aeps_drafts.mid',
                    'aeps_drafts.admin_id',
                    DB::raw('3 as role'),
                    DB::raw('3 as guest'),
                    DB::raw('"Api Partner Merchant" as role_name')
                )
                ->where(function ($q) use ($user) {
                    if ($user->role == 1) {
                        $q->where('aeps_drafts.admin_id', '!=', $user->id);
                    } else if ($user->role == 2 && $user->is_api_partner == 1) {
                        $q->where('aeps_drafts.admin_id', $user->id);
                    }
                })
                ->get();

            return $this->formatRoleResponse($children, 'root_mode');
        }

        /*
        ---------------------------------
        MODE 3 → DEFAULT → API PARTNER LIST
        ---------------------------------
        */

    
        $user = $request->get('user');
        $admin = $request->get('admin');
        if (!($user->role == 1 || $user->id == 21 || ($user->role == 2 && $user->is_api_partner == 1))) {
                return response()->json([
                'status'=>1,
                'data'=>[],
                'message'=>'You are not authorized to perform this action'
            ]);
        }
    
        $partners = User::where('is_api_partner',1)
            ->join('roles','roles.id','=','users.role')
            ->select(
                'users.id',
                'users.name',
                'users.mid',
                'users.role',
                'roles.guest',
                'roles.name as role_name'
            )
            ->where(function ($q) use ($user,$admin) {
                if ($user->role == 1) {
                    $q->where('id', '!=', $user->id);
                } else if ($user->role == 2 && $user->is_api_partner == 1) {
                    $q->where('admin_mid', $admin->mid);
                }
            })
            ->orderBy('roles.guest','ASC')
            ->get();

        if ($partners->isEmpty()) {
            return response()->json([
                'status'=>1,
                'data'=>[]
            ]);
        }

        $firstGuest = $partners->min('guest');
        $filtered = $partners->where('guest',$firstGuest)->values();

        return response()->json([
            'status'=>1,
            'data'=>[
                'guest'=>$firstGuest,
                'role_id'=>$filtered->first()->role,
                'role_name'=>$filtered->first()->role_name,
                'users'=>$filtered->map(fn($u)=>[
                    'id'=>$u->id,
                    'name'=>$u->name,
                    'mid'=>$u->mid,
                    'role'=>$u->role
                ])
            ]
        ]);

    }

    private function formatRoleResponse($children, $type)
    {
        if ($children->isEmpty()) {
            return response()->json([
                'status'=>1,
                'type'=>$type,
                'data'=>[]
            ]);
        }

        $firstGuest = $children->min('guest');
        $filtered = $children->where('guest',$firstGuest)->values();

        return response()->json([
            'status'=>1,
            'type'=>$type,
            'data'=>[
                'guest'=>$firstGuest,
                'role_id'=>$filtered->first()->role,
                'role_name'=>$filtered->first()->role_name,
                'users'=>$filtered->map(fn($u)=>[
                    'id'=>$u->id,
                    'name'=>$u->name,
                    'mid'=>$u->mid,
                    'role'=>$u->role
                ])
            ]
        ]);
    }



    private function getCompanyLogo($user_id)
    {
       
        $setting = Setting::where('user_id', $user_id)->first();
        if ($setting && $setting->logo) {
            return $setting->logo;
        }
        return 'https://bharatuploads.b-cdn.net/settings/logos/98bd2f2f75b82a84ded825411d655c1d.PNG';

    }

    public function changeTwoFa(Request $request)
    {
        try {
            // ✅ Log the changeTwoFa operation (before update)
            $logId = DB::table('logs')->insertGetId([
                'mid'           => "ENEXACRON",
                'type'          => 'Change Two FA CRON',
                'platform'      => 'WEB',
                'headers'       => json_encode($request->headers->all()),
                'request_data'  => json_encode($request->all()),
                'response_data' => null,
                'url'           => $request->fullurl(''),
                'status'        => '0',
                'created_at'    => now()->format('Y-m-d H:i:s'),
            ]);

            $updated = AepsDraft::where('aeps_status', '>', 3)->update(['aeps_status' => 3, 'ap_status' => 0]);

            // ✅ Update log with result after the operation
            DB::table('logs')->where('id', $logId)->update([
                'response_data' => json_encode(['updated_records' => $updated]),
                'status'        => '1',
                'updated_at'    => now()->format('Y-m-d H:i:s'),
            ]);

            return response()->json([
                'status'  => 1,
                'message' => 'Two FA status updated successfully',
                'updated' => $updated
            ]);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'changeTwoFa', $e, [
                'context' => 'Change Two FA CRON failed',
            ]);
            return response()->json([
                'status'  => 0,
                'message' => 'Internal Server Error',
                'ref_id'  => $refId,
            ], 500);
        }
    }


    public function check3way()
    {
        try {
            $processedCount = 0;
            $errorCount = 0;
            $errorDetails = [];
            $debugInfo = [];

            // Get CW transactions
            $cwTransactions = AepsTransaction::where('aeps_type', 'CW')
                ->where('auth3way', 0)
                ->get();

            $debugInfo['cw_transactions_found'] = $cwTransactions->count();

            foreach ($cwTransactions as $transaction) {
                try {
                    $this->perform3WayCheck($transaction);
                    $processedCount++;
                } catch (\Exception $e) {
                    $errorCount++;
                    $errorDetail = [
                        'transaction_id' => $transaction->id,
                        'transaction_type' => 'CW',
                        'merchant_txn_id' => $transaction->merchant_txn_id,
                        'error_message' => $e->getMessage(),
                        'error_line' => $e->getLine(),
                        'error_file' => basename($e->getFile())
                    ];
                    $errorDetails[] = $errorDetail;
                    \Log::error("3-way check failed for CW transaction {$transaction->id}: " . $e->getMessage(), $errorDetail);
                }
            }

            // Get M transactions
            $mTransactions = AepsTransaction::where('aeps_type', 'M')
                ->where('auth3way', 0)
                ->get();

            $debugInfo['m_transactions_found'] = $mTransactions->count();

            foreach ($mTransactions as $transaction) {
                try {
                    $this->perform3WayCheck($transaction);
                    $processedCount++;
                } catch (\Exception $e) {
                    $errorCount++;
                    $errorDetail = [
                        'transaction_id' => $transaction->id,
                        'transaction_type' => 'M',
                        'merchant_txn_id' => $transaction->merchant_txn_id,
                        'error_message' => $e->getMessage(),
                        'error_line' => $e->getLine(),
                        'error_file' => basename($e->getFile())
                    ];
                    $errorDetails[] = $errorDetail;
                    \Log::error("3-way check failed for M transaction {$transaction->id}: " . $e->getMessage(), $errorDetail);
                }
            }

            // Get M transactions
            $mTransactionss = AepsTransaction::where('aeps_type', 'MATMCW')
                ->where('auth3way', 0)
                ->get();

            $debugInfo['matm_transactions_found'] = $mTransactionss->count();

            foreach ($mTransactionss as $transaction) {
                try {
                    $this->perform3WayMATMCheck($transaction);
                    $processedCount++;
                } catch (\Exception $e) {
                    $errorCount++;
                    $errorDetail = [
                        'transaction_id' => $transaction->id,
                        'transaction_type' => 'MATMCW',
                        'merchant_txn_id' => $transaction->merchant_txn_id,
                        'error_message' => $e->getMessage(),
                        'error_line' => $e->getLine(),
                        'error_file' => basename($e->getFile())
                    ];
                    $errorDetails[] = $errorDetail;
                    \Log::error("3-way check failed for M transaction {$transaction->id}: " . $e->getMessage(), $errorDetail);
                }
            }




            $responseData = [
                'processed' => $processedCount,
                'errors'    => $errorCount,
                'debug_info' => $debugInfo
            ];

            // Include error details for debugging if there are errors
            if ($errorCount > 0) {
                $responseData['error_details'] = $errorDetails;
            }

            return response()->json([
                'status'  => 1,
                'message' => '3-way check completed',
                'data'    => $responseData
            ], 200);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException(request(), 'run3WayCheck', $e, [
                'context' => '3-way check process failed',
            ]);
            return response()->json([
                'status'  => 0,
                'message' => 'Internal Server Error',
                'ref_id'  => $refId,
            ], 500);
        }
    }

    private function perform3WayMATMCheck($transaction)
    {
        try {
            // ✅ Decode transaction response
            $transaction_response = is_array($transaction->response)
                ? $transaction->response
                : json_decode($transaction->response, true);

        if ($transaction_response && isset($transaction_response['fpTransactionId']) && isset($transaction_response['bankRRN'])) {
     

           
            
            $payload = [
                [
                    "merchantTransactionId" => $transaction_response['merchantRefNo'] ?? null,
                    "fingpayTransactionId"  => $transaction_response['fpTransactionId'] ?? null,
                    "transactionRrn"        => $transaction_response['bankRRN'] ?? null,
                    "responseCode"          => '00',
                    "transactionDate"       => $transaction->created_at->format("d-m-Y"),
                    "serviceType"           => "CW",
                ]
            ];

            // ✅ Validate required fields
            if (empty($payload[0]['fingpayTransactionId']) || empty($payload[0]['transactionRrn'])) {
                $debugInfo = [
                    'transaction_id' => $transaction->id,
                    'merchant_txn_id' => $transaction_response['merchantRefNo'] ?? 'MISSING',
                    'response_data' => $transaction_response,
                    'fpTransactionId' => $transaction_response['fpTransactionId'] ?? 'MISSING',
                    'bankRRN' => $transaction_response['bankRRN'] ?? 'MISSING'
                ];
                throw new \Exception("Missing required transaction data (fpTransactionId or bankRRN) for transaction ID: {$transaction->id}. Debug: " . json_encode($debugInfo));
            }

            // ✅ Credentials
            $SECRET_KEY           = self::SECRET_KEY;
            $superMerchantLoginId = self::SUPER_MERCHANT_USERNAME;
            $superMerchantId      = self::SUPER_MERCHANT_ID;

            // ✅ JS Date.now() → milliseconds
            $timestamp = (string) round(microtime(true) * 1000);

            // ✅ Hash = payload + loginId + secret
            $concatenated = json_encode($payload) . $superMerchantLoginId . $SECRET_KEY;
            $hash = base64_encode(hash("sha256", $concatenated, true));

            // ✅ API URL
            $url = "https://fpanalytics.tapits.in/fpcollectservice/api/ma/threeway/aggregators";

            // ✅ Headers
            $headers = [
                "Accept"               => "application/json",
                "Content-Type"         => "application/json",
                "txnDate"              => $timestamp,
                "hash"                 => $hash,
                "superMerchantLoginId" => $superMerchantLoginId,
                "superMerchantId"      => $superMerchantId,
            ];

            // ✅ Call API
            $response = Http::withHeaders($headers)
                ->timeout(self::API_TIMEOUT)
                ->post($url, $payload);

            if (!$response->successful()) {
                $debugInfo = [
                    'transaction_id' => $transaction->id,
                    'url' => $url,
                    'headers' => $headers,
                    'payload' => $payload,
                    'response_status' => $response->status(),
                    'response_body' => $response->body()
                ];
                throw new \Exception("API call failed with status: " . $response->status() . ". Debug: " . json_encode($debugInfo));
            }

            $responseJson = $response->json();

            // ✅ Log the 3-way check request/response
            DB::table('logs')->insert([
                'mid'          => $transaction->mid,
                'type'         => 'MATM 3-Way Check',
                'platform'     => 'WEB',
                'headers'      => json_encode($headers),
                'request_data'  => json_encode($payload),
                'response_data' => json_encode($responseJson),
                'url'           => $url,
                'status'        => $responseJson['status'] ?? null,
                'timestamp'    => now(),
                'created_at'   => now()->format('Y-m-d H:i:s'),
            ]);

            // ✅ Update DB
            $transaction->update([
                "auth3way"                => 1,
                "response_3way"           => json_encode($responseJson),
                "response_3way_status"    => $responseJson["status"] ?? null,
                "response_3way_status_code" => $responseJson["statusCode"] ?? null,
                "response_3way_message"   => $responseJson["message"] ?? null,
            ]);

            \Log::info("3-Way check completed for transaction ID: {$transaction->id}");
        }

        } catch (\Exception $e) {
            $debugInfo = [
                'transaction_id' => $transaction->id ?? 'unknown',
                'merchant_txn_id' => $transaction->merchant_txn_id ?? 'unknown',
                'error_message' => $e->getMessage(),
                'error_line' => $e->getLine(),
                'error_file' => $e->getFile(),
                'transaction_response_exists' => isset($transaction_response),
                'transaction_response_data_exists' => isset($transaction_response['data'])
            ];
            
            \Log::error("3-Way Check failed for transaction ID {$transaction->id}: " . $e->getMessage(), $debugInfo);
            
            // Mark as attempted even if failed to avoid infinite retries
            $transaction->update([
                "auth3way" => 2, // Use 2 to indicate failed attempt
                "response_3way" => json_encode([
                    'error' => $e->getMessage(),
                    'debug' => $debugInfo
                ]),
                "response_3way_message" => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    private function perform3WayCheck($transaction)
    {
        try {
            // ✅ Decode transaction response
            $transaction_response = is_array($transaction->response)
                ? $transaction->response
                : json_decode($transaction->response, true);

            if (!$transaction_response || !isset($transaction_response['data'])) {
                throw new \Exception("Invalid transaction response data for transaction ID: {$transaction->id}");
            }

            // ✅ Format transaction date properly
            $transactionDate = isset($transaction_response['data']['created_at']) 
                ? date("d-m-Y", strtotime($transaction_response['data']['created_at']))
                : $transaction->created_at->format("d-m-Y");

            // ✅ Payload must be wrapped in an array

            $responseCode='00';
            if ($transaction->aeps_type=="M"){
                $tt = "AP";
            } else if ($transaction->aeps_type=="CW") {
                $tt = "CW";
            } else {
                $tt = $transaction->aeps_type;
            }
            
            $payload = [
                [
                    "merchantTransactionId" => $transaction->merchant_txn_id,
                    "fingpayTransactionId"  => $transaction_response['data']['fpTransactionId'] ?? null,
                    "transactionRrn"        => $transaction_response['data']['bankRRN'] ?? null,
                    "responseCode"          => $responseCode,
                    "transactionDate"       => $transactionDate,
                    "serviceType"           => $tt,
                ]
            ];

            // ✅ Validate required fields
            if (empty($payload[0]['fingpayTransactionId']) || empty($payload[0]['transactionRrn'])) {
                $debugInfo = [
                    'transaction_id' => $transaction->id,
                    'merchant_txn_id' => $transaction->merchant_txn_id,
                    'response_data' => $transaction_response,
                    'fpTransactionId' => $transaction_response['data']['fpTransactionId'] ?? 'MISSING',
                    'bankRRN' => $transaction_response['data']['bankRRN'] ?? 'MISSING'
                ];
                throw new \Exception("Missing required transaction data (fpTransactionId or bankRRN) for transaction ID: {$transaction->id}. Debug: " . json_encode($debugInfo));
            }

            // ✅ Credentials
            $SECRET_KEY           = self::SECRET_KEY;
            $superMerchantLoginId = self::SUPER_MERCHANT_USERNAME;
            $superMerchantId      = self::SUPER_MERCHANT_ID;

            // ✅ JS Date.now() → milliseconds
            $timestamp = (string) round(microtime(true) * 1000);

            // ✅ Hash = payload + loginId + secret
            $concatenated = json_encode($payload) . $superMerchantLoginId . $SECRET_KEY;
            $hash = base64_encode(hash("sha256", $concatenated, true));

            // ✅ API URL
            $url = "https://fpanalytics.tapits.in/fpcollectservice/api/threeway/aggregators";
            
            // Aadhar Pay 3 Way
            if($transaction->aeps_type=='M'){
                $url = "https://fpanalytics.tapits.in/fpcollectservice/api/threeway/aggregators/ap";
            }

            // ✅ Headers
            $headers = [
                "Accept"               => "application/json",
                "Content-Type"         => "application/json",
                "txnDate"              => $timestamp,
                "hash"                 => $hash,
                "superMerchantLoginId" => $superMerchantLoginId,
                "superMerchantId"      => $superMerchantId,
            ];

            // ✅ Call API
            $response = Http::withHeaders($headers)
                ->timeout(self::API_TIMEOUT)
                ->post($url, $payload);

            if (!$response->successful()) {
                $debugInfo = [
                    'transaction_id' => $transaction->id,
                    'url' => $url,
                    'headers' => $headers,
                    'payload' => $payload,
                    'response_status' => $response->status(),
                    'response_body' => $response->body()
                ];
                throw new \Exception("API call failed with status: " . $response->status() . ". Debug: " . json_encode($debugInfo));
            }

            $responseJson = $response->json();

            // ✅ Log the 3-way check request/response
            DB::table('logs')->insert([
                'mid'          => $transaction->mid,
                'type'         => '3-Way Check',
                'platform'     => 'WEB',
                'headers'      => json_encode($headers),
                'request_data'  => json_encode($payload),
                'response_data' => json_encode($responseJson),
                'url'           => $url,
                'status'        => $responseJson['status'] ?? null,
                'timestamp'    => now(),
                'created_at'   => now()->format('Y-m-d H:i:s'),
            ]);

            // ✅ Update DB
            $transaction->update([
                "auth3way"                => 1,
                "response_3way"           => json_encode($responseJson),
                "response_3way_status"    => $responseJson["status"] ?? null,
                "response_3way_status_code" => $responseJson["statusCode"] ?? null,
                "response_3way_message"   => $responseJson["message"] ?? null,
            ]);

            \Log::info("3-Way check completed for transaction ID: {$transaction->id}");

        } catch (\Exception $e) {
            $debugInfo = [
                'transaction_id' => $transaction->id ?? 'unknown',
                'merchant_txn_id' => $transaction->merchant_txn_id ?? 'unknown',
                'error_message' => $e->getMessage(),
                'error_line' => $e->getLine(),
                'error_file' => $e->getFile(),
                'transaction_response_exists' => isset($transaction_response),
                'transaction_response_data_exists' => isset($transaction_response['data'])
            ];
            
            \Log::error("3-Way Check failed for transaction ID {$transaction->id}: " . $e->getMessage(), $debugInfo);
            
            // Mark as attempted even if failed to avoid infinite retries
            $transaction->update([
                "auth3way" => 2, // Use 2 to indicate failed attempt
                "response_3way" => json_encode([
                    'error' => $e->getMessage(),
                    'debug' => $debugInfo
                ]),
                "response_3way_message" => $e->getMessage()
            ]);
            
            throw $e;
        }
    }



    public function checks3way($mtid)
    {
       
        $transaction = AepsTransaction::where('aeps_type', 'CW')
            ->where('merchant_txn_id', $mtid)
            ->first();

        if (!$transaction) {
            throw new \Exception("No pending 3-Way Check transaction found.");
        }

        $transaction_response = is_array($transaction->response)
            ? $transaction->response
            : json_decode($transaction->response, true);

        if (!$transaction_response || !isset($transaction_response['data'])) {
            return response()->json(["error" => "Invalid transaction response data for transaction ID: {$transaction->id}"], 400);
        }

        // ✅ Format transaction date properly
        $transactionDate = isset($transaction_response['data']['created_at']) 
            ? date("d-m-Y", strtotime($transaction_response['data']['created_at']))
            : $transaction->created_at->format("d-m-Y");

        // ✅ Payload must be wrapped in an array
        $payload = [
            [
                "merchantTransactionId" => $transaction->merchant_txn_id,
                "fingpayTransactionId"  => $transaction_response['data']['fpTransactionId'] ?? null,
                "transactionRrn"        => $transaction_response['data']['bankRRN'] ?? null,
                "responseCode"          => "00",
                "transactionDate"       => $transactionDate,
                "serviceType"           => $transaction->aeps_type ?? "CW",
            ]
        ];

    


        // ✅ Credentials
        $SECRET_KEY           = self::SECRET_KEY;
        $superMerchantLoginId = self::SUPER_MERCHANT_USERNAME;
        $superMerchantId      = self::SUPER_MERCHANT_ID;

        // ✅ JS Date.now() → milliseconds
        $timestamp = (string) round(microtime(true) * 1000);

        // ✅ Hash = payload + loginId + secret
        $concatenated = json_encode($payload) . $superMerchantLoginId . $SECRET_KEY;
        $hash = base64_encode(hash("sha256", $concatenated, true));

        // ✅ API URL
        $url = "https://fpanalytics.tapits.in/fpcollectservice/api/threeway/aggregators";

        // ✅ Headers
        $headers = [
            "Accept"               => "application/json",
            "Content-Type"         => "application/json",
            "txnDate"              => $timestamp,
            "hash"                 => $hash,
            "superMerchantLoginId" => $superMerchantLoginId,
            "superMerchantId"      => $superMerchantId,
        ];

        // ✅ Call API
        $response = Http::withHeaders($headers)
            ->timeout(self::API_TIMEOUT)
            ->post($url, $payload);

        

        $responseJson = $response->json();

        // ✅ Log the 3-way check request/response
        DB::table('logs')->insert([
            'mid'          => $transaction->mid,
            'type'         => '3-Way Check',
            'platform'     => 'WEB',
            'headers'      => json_encode($headers),
            'request_data'  => json_encode($payload),
            'response_data' => json_encode($responseJson),
            'url'           => $url,
            'status'        => $responseJson['status'] ?? null,
            'timestamp'    => now(),
            'created_at'   => now()->format('Y-m-d H:i:s'),
        ]);

        // ✅ Update DB
        $transaction->update([
            "auth3way"                => 1,
            "response_3way"           => json_encode($responseJson),
            "response_3way_status"    => $responseJson["status"] ?? null,
            "response_3way_status_code" => $responseJson["statusCode"] ?? null,
            "response_3way_message"   => $responseJson["message"] ?? null,
        ]);

       $res= [
            'Request' => $payload,
            'Response'    => $responseJson
        ];

        echo '<pre>';
        print_r($res);

    }

    public function manualPerform3WayMATM(Request $request)
    {
        try {
            if (isset($request->fpTransactionId) && isset($request->bankRRN)) {

                $payload = [
                    [
                        "merchantTransactionId" => $request->merchantRefNo ?? null,
                        "fingpayTransactionId"  => $request->fpTransactionId ?? null,
                        "transactionRrn"        => $request->bankRRN ?? null,
                        "responseCode"          => '00',
                        "transactionDate"       => $request->transactionDate ?? null,
                        "serviceType"           => "CW",
                    ]
                ];

            

                // ✅ Credentials
                $SECRET_KEY           = self::SECRET_KEY;
                $superMerchantLoginId = self::SUPER_MERCHANT_USERNAME;
                $superMerchantId      = self::SUPER_MERCHANT_ID;

                // ✅ JS Date.now() → milliseconds
                $timestamp = (string) round(microtime(true) * 1000);

                // ✅ Hash = payload + loginId + secret
                $concatenated = json_encode($payload) . $superMerchantLoginId . $SECRET_KEY;
                $hash = base64_encode(hash("sha256", $concatenated, true));

                // ✅ API URL
                $url = "https://fpanalytics.tapits.in/fpcollectservice/api/ma/threeway/aggregators";

                // ✅ Headers
                $headers = [
                    "Accept"               => "application/json",
                    "Content-Type"         => "application/json",
                    "txnDate"              => $timestamp,
                    "hash"                 => $hash,
                    "superMerchantLoginId" => $superMerchantLoginId,
                    "superMerchantId"      => $superMerchantId,
                ];

                // ✅ Call API
                $response = Http::withHeaders($headers)
                    ->timeout(self::API_TIMEOUT)
                    ->post($url, $payload);

                $responseJson = $response->json();

                // ✅ Log the 3-way check request/response
                DB::table('logs')->insert([
                    'mid'          => $request->mid,
                    'type'         => 'MATM 3-Way Check',
                    'platform'     => 'WEB',
                    'headers'      => json_encode($headers),
                    'request_data'  => json_encode($payload),
                    'response_data' => json_encode($responseJson),
                    'url'           => $url,
                    'status'        => $responseJson['status'] ?? null,
                    'timestamp'    => now(),
                    'created_at'   => now()->format('Y-m-d H:i:s'),
                ]);

            
            }
        } catch (\Exception $e) {
           
        }
    }


    private function transformXmlResponse($requestxml) {
        try {
            // Load XML
            $xmlObject = simplexml_load_string($requestxml, "SimpleXMLElement", LIBXML_NOCDATA);
            if ($xmlObject === false) {
                throw new \Exception('Unable to parse XML.');
            }

            // Extract Skey and its attribute 'ci'
            $skeyNode = $xmlObject->Skey; 
            $ci = isset($skeyNode['ci']) ? (string)$skeyNode['ci'] : null;

            // Convert XML to array
            $xmlArray = json_decode(json_encode($xmlObject), true);

            // Ensure 'ci' is included
            $xmlArray['ci'] = $ci;

            // Extract Resp and DeviceInfo attributes
            $resp = $xmlArray['Resp']['@attributes'] ?? [];
            $deviceInfo = $xmlArray['DeviceInfo']['@attributes'] ?? [];

            // Handle Skey content
            $skey = '';
            if (is_string($xmlArray['Skey'] ?? null)) {
                $skey = $xmlArray['Skey'];
            } elseif (is_array($xmlArray['Skey'] ?? null)) {
                $skey = $xmlArray['Skey']['@content'] ?? $xmlArray['Skey'];
                $ci = $xmlArray['Skey']['@attributes']['ci'] ?? $ci;
            }

            // Handle Data content
            $piddata = '';
            $pidDatatype = 'X';
            if (is_string($xmlArray['Data'] ?? null)) {
                $piddata = $xmlArray['Data'];
            } elseif (is_array($xmlArray['Data'] ?? null)) {
                $piddata = $xmlArray['Data']['@content'] ?? $xmlArray['Data'];
                $pidDatatype = $xmlArray['Data']['@attributes']['type'] ?? 'X';
            }

            // Transform to desired format
            $transformedResponse = [
                'errCode'    => $resp['errCode'] ?? null,
                'errInfo'    => $resp['errInfo'] ?? 'Success.',
                'fCount'     => isset($resp['fCount']) ? (int)$resp['fCount'] : 1,
                'fType'      => isset($resp['fType']) ? (int)$resp['fType'] : 2,
                'iCount'     => 0,
                'iType'      => isset($resp['iType']) ? (int)$resp['iType'] : null,
                'pCount'     => 0,
                'pType'      => 0,
                'nmPoints'   => isset($resp['nmPoints']) ? (int)$resp['nmPoints'] : 49,
                'qScore'     => isset($resp['qScore']) ? (int)$resp['qScore'] : 89,
                'dpID'       => $deviceInfo['dpId'] ?? null,
                'rdsID'      => $deviceInfo['rdsId'] ?? null,
                'rdsVer'     => $deviceInfo['rdsVer'] ?? null,
                'dc'         => $deviceInfo['dc'] ?? null,
                'mi'         => $deviceInfo['mi'] ?? null,
                'mc'         => $deviceInfo['mc'] ?? null,
                'ci'         => $ci,
                'sessionKey' => $skey,
                'hmac'       => $xmlArray['Hmac'] ?? null,
                'PidDatatype'=> $pidDatatype,
                'Piddata'    => $piddata
            ];

            return $transformedResponse;

        } catch (\Throwable $ex) {
            return response()->json([
                'status'  => 0,
                'message' => 'Invalid XML format',
                'error'   => $ex->getMessage()
            ], 400);
        }
    }


    private function transformXmlResponseFace($requestxml) {
        try {
            
            // Load XML
            $xmlObject = simplexml_load_string($requestxml, "SimpleXMLElement", LIBXML_NOCDATA);
            if ($xmlObject === false) {
                throw new \Exception('Unable to parse XML.');
            }

            // Extract Skey and its attribute 'ci'
            $skeyNode = $xmlObject->Skey; 
            $ci = isset($skeyNode['ci']) ? (string)$skeyNode['ci'] : null;

            // Convert XML to array
            $xmlArray = json_decode(json_encode($xmlObject), true);

            // Ensure 'ci' is included
            $xmlArray['ci'] = $ci;

            // Extract Resp and DeviceInfo attributes
            $resp = $xmlArray['Resp']['@attributes'] ?? [];
            $deviceInfo = $xmlArray['DeviceInfo']['@attributes'] ?? [];

            // Handle Skey content
            $skey = '';
            if (is_string($xmlArray['Skey'] ?? null)) {
                $skey = $xmlArray['Skey'];
            } elseif (is_array($xmlArray['Skey'] ?? null)) {
                $skey = $xmlArray['Skey']['@content'] ?? $xmlArray['Skey'];
                $ci = $xmlArray['Skey']['@attributes']['ci'] ?? $ci;
            }

            // Handle Data content
            $piddata = '';
            $pidDatatype = 'X';
            if (is_string($xmlArray['Data'] ?? null)) {
                $piddata = $xmlArray['Data'];
            } elseif (is_array($xmlArray['Data'] ?? null)) {
                $piddata = $xmlArray['Data']['@content'] ?? $xmlArray['Data'];
                $pidDatatype = $xmlArray['Data']['@attributes']['type'] ?? 'X';
            }

            // Transform to desired format
            $transformedResponse = [
                'errCode'    => $resp['errCode'] ?? null,
                'errInfo'    => $resp['errInfo'] ?? 'Success.',
                'fCount'     => isset($resp['fCount']) ? (int)$resp['fCount'] : 1,
                'fType'      => isset($resp['fType']) ? (int)$resp['fType'] : 2,
                'iCount'     => isset($resp['iCount']) ? (int)$resp['iCount'] : 1,
                'iType'      => isset($resp['iType']) ? (int)$resp['iType'] : null,
                'pCount'     => isset($resp['pCount']) ? (int)$resp['pCount'] : 1,
                'pType'      => isset($resp['pType']) ? (int)$resp['pType'] : null,
                'nmPoints'   => isset($resp['nmPoints']) ? (int)$resp['nmPoints'] : 49,
                'qScore'     => isset($resp['qScore']) ? (int)$resp['qScore'] : 89,
                'dpID'       => $deviceInfo['dpId'] ?? null,
                'rdsID'      => $deviceInfo['rdsId'] ?? null,
                'rdsVer'     => $deviceInfo['rdsVer'] ?? null,
                'dc'         => $deviceInfo['dc'] ?? null,
                'mi'         => $deviceInfo['mi'] ?? null,
                'mc'         => $deviceInfo['mc'] ?? null,
                'ci'         => $ci,
                'sessionKey' => $skey,
                'hmac'       => $xmlArray['Hmac'] ?? null,
                'PidDatatype'=> $pidDatatype,
                'Piddata'    => $piddata
            ];

            // Extract Opts & Uses if available
            $optsNode = $xmlObject->Opts;
            if ($optsNode) {
                $optsAttrs = [];
                foreach ($optsNode->attributes() as $a => $b) {
                    $optsAttrs[$a] = (string)$b;
                }
                $transformedResponse['opts'] = $optsAttrs;
                if (isset($optsAttrs['otp'])) {
                    $transformedResponse['otp'] = (string)$optsAttrs['otp'];
                }
            }

            $usesNode = $xmlObject->Uses;
            if ($usesNode) {
                $usesAttrs = [];
                foreach ($usesNode->attributes() as $a => $b) {
                    $usesAttrs[$a] = (string)$b;
                }
                $transformedResponse['uses'] = $usesAttrs;
            }

            return $transformedResponse;

        } catch (\Throwable $ex) {
            return response()->json([
                'status'  => 0,
                'message' => 'Invalid XML format',
                'error'   => $ex->getMessage()
            ], 400);
        }
    }


    public function banners(Request $request)
    {
        try {
        
            $banners=DB::table('banners')->select('image')
            ->where('admin_id',$request->get('admin')->id)
            ->where('status', 1)
            ->where('type', $request->type?$request->type:'home')
            ->get();

            return response()->json([
                'status'  => 1,
                'message' => 'Banners retrieved successfully',
                'data'    => $banners
            ], 200);

        } catch (\Exception $e) {
            CatchLogService::logException($request, 'banners', $e, [
                'context' => 'Banners retrieval error',
            ]);
            return response()->json([
                'status'  => 0,
                'message' => 'Internal Server Error',
            ], 500);
        }
    }


    public function referrals(Request $request)
    {
        try {
            $period = $request->get('period', 'all'); // day, month, year, all
            $withBusinessData = $request->get('business_data', false); // Include business analytics
            
            $levels = [];
            $currentUids = [$request->get('user')->mid];

            // Define date filters based on period
            $dateFilter = $this->getDateFilter($period);

            for ($i = 1; $i <= 3; $i++) {
                if (!empty($currentUids)) {

                     $rows = DB::table('users')
                        ->select('id', 'name', 'mobile', 'email', 'mid', 'refer_by', 'created_at', 'status')
                        ->whereIn('refer_by', $currentUids)
                        ->get();

                    if ($rows->isNotEmpty()) {
                        $processedRows = [];

                        
                        
                        foreach ($rows as $row) {

                             $rows1 = DB::table('users')
                            ->select('id', 'name', 'mobile', 'email', 'mid', 'refer_by', 'created_at', 'status')
                            ->where('mid', $row->refer_by)
                            ->first();

                            $userData = [
                                'id' => $row->id,
                                'name' => $row->name,
                                'mobile' => $row->mobile,
                                'email' => $row->email,
                                'mid' => $row->mid,
                                'refer_by' => $row->refer_by,
                                'refer_by_data' => $rows1 ? $rows1 : null,
                                'created_at' => $row->created_at,
                                'status' => $row->status
                            ];

                            // Add business data if requested
                            if ($withBusinessData) {
                                $userData['business_data'] = $this->getReferralUserBusinessData($row, $period, $dateFilter);
                            }

                            $processedRows[] = $userData;
                        }

                        $levels[$i] = $processedRows;

                        $nextUids = [];
                        foreach ($rows as $row) {
                            if (!empty($row->mid)) $nextUids[] = $row->mid;
                        }

                        $currentUids = $nextUids;
                    } else {
                        $levels[$i] = [];
                        $currentUids = [];
                    }
                } else {
                    $levels[$i] = [];
                }
            }

            return response()->json([
                'status'  => 1,
                'message' => 'Referrals retrieved successfully',
                'data' => [
                    'period' => $period,
                    'levels' => $levels,
                    'business_data_included' => $withBusinessData
                ]
            ], 200);

        } catch (\Exception $e) {
            CatchLogService::logException($request, 'referrals', $e, [
                'context' => 'Referrals retrieval error',
            ]);
            return response()->json([
                'status'  => 0,
                'message' => 'Internal Server Error',
            ], 500);
        }
    }

    /**
     * Get date filter closure based on period
     */
    private function getDateFilter($period)
    {
        return function ($query) use ($period) {
            switch ($period) {
                case 'day':
                    return $query->whereDate('created_at', Carbon::today());
                case 'month':
                    return $query->where('created_at', '>=', Carbon::now()->startOfMonth());
                case 'year':
                    return $query->where('created_at', '>=', Carbon::now()->startOfYear());
                default:
                    return $query; // No filter for 'all'
            }
        };
    }

    /**
     * Get comprehensive business data for a referral user
     */
    private function getReferralUserBusinessData($user, $period, $dateFilter)
    {
        try {
            $businessData = [];

            // AEPS Transactions
            $aepsData = [];
            $aepsTypes = ['CW' => 'cash_withdrawal', 'M' => 'aadhaar_pay', 'BE' => 'balance_enquiry', 'MS' => 'mini_statement'];
            
            foreach ($aepsTypes as $dbType => $displayName) {
                $query = AepsTransaction::where('mid', $user->mid)->where('aeps_type', $dbType);
                $query = $dateFilter($query);
                
                $stats = [
                    'count' => $query->count(),
                    'success_count' => (clone $query)->where('response_status', true)->count(),
                    'failed_count' => (clone $query)->where('response_status', false)->count(),
                ];

                // Add amount for transactions that have amounts
                if (in_array($dbType, ['CW', 'M'])) {
                    $stats['total_amount'] = (float) $query->sum('amount');
                    $stats['success_amount'] = (float) (clone $query)->where('response_status', true)->sum('amount');
                }

                $aepsData[$displayName] = $stats;
            }

            $businessData['aeps'] = $aepsData;

            // Utility Services (Recharge table)
            $utilityData = [];
            $utilityTypes = [1 => 'mobile_recharge', 2 => 'dth_recharge', 3 => 'bill_payment'];
            
            foreach ($utilityTypes as $type => $displayName) {
                $query = Recharge::where('user_id', $user->id)->where('type', $type);
                $query = $dateFilter($query);

                $utilityData[$displayName] = [
                    'count' => $query->count(),
                    'success_count' => (clone $query)->where('status', 'success')->count(),
                    'failed_count' => (clone $query)->where('status', 'failed')->count(),
                    'pending_count' => (clone $query)->where('status', 'pending')->count(),
                    'total_amount' => (float) $query->sum('amount'),
                    'success_amount' => (float) (clone $query)->where('status', 'success')->sum('amount'),
                ];
            }

            $businessData['utility_services'] = $utilityData;

            // Payouts
            $payoutQuery = Payout::where('user_id', $user->id);
            $payoutQuery = $dateFilter($payoutQuery);

            $businessData['payouts'] = [
                'count' => $payoutQuery->count(),
                'success_count' => (clone $payoutQuery)->where('status', 'success')->count(),
                'failed_count' => (clone $payoutQuery)->where('status', 'failed')->count(),
                'pending_count' => (clone $payoutQuery)->where('status', 'pending')->count(),
                'total_amount' => (float) $payoutQuery->sum('amount'),
                'success_amount' => (float) (clone $payoutQuery)->where('status', 'success')->sum('amount'),
            ];

            // Add Fund Transactions
            $addFundData = [
                'count' => 0,
                'success_count' => 0,
                'failed_count' => 0,
                'pending_count' => 0,
                'total_amount' => 0,
                'success_amount' => 0,
            ];

            try {
                if (DB::getSchemaBuilder()->hasTable('accounts_add_money')) {
                    $addFundQuery = AccountsAddMoney::where('user_id', $user->id);
                    $addFundQuery = $dateFilter($addFundQuery);

                    $addFundData = [
                        'count' => $addFundQuery->count(),
                        'success_count' => (clone $addFundQuery)->where('status', 'success')->count(),
                        'failed_count' => (clone $addFundQuery)->where('status', 'failed')->count(),
                        'pending_count' => (clone $addFundQuery)->where('status', 'pending')->count(),
                        'total_amount' => (float) $addFundQuery->sum('amount'),
                        'success_amount' => (float) (clone $addFundQuery)->where('status', 'success')->sum('amount'),
                    ];
                }
            } catch (\Exception $e) {
                \Log::warning('Add fund data not available for user ' . $user->id . ': ' . $e->getMessage());
            }

            $businessData['add_fund'] = $addFundData;

            // Cash Deposit Transactions
            $cashDepositQuery = CashDeposit::where('mid', $user->mid);
            $cashDepositQuery = $dateFilter($cashDepositQuery);

            $businessData['cash_deposit'] = [
                'count' => $cashDepositQuery->count(),
                'success_count' => (clone $cashDepositQuery)->where('status', 'success')->count(),
                'failed_count' => (clone $cashDepositQuery)->where('status', 'failed')->count(),
                'pending_count' => (clone $cashDepositQuery)->where('status', 'pending')->count(),
                'total_amount' => (float) $cashDepositQuery->sum('amount'),
                'success_amount' => (float) (clone $cashDepositQuery)->where('status', 'success')->sum('amount'),
            ];

            // Account Balance Information
            $accountData = Account::where('user_id', $user->id)->where('primary_status', true)->first();
            
            if ($accountData) {
                // Get latest balance from passbook
                $latestPassbook = DB::table('passbooks')
                    ->where('account_id', $accountData->id)
                    ->orderBy('created_at', 'desc')
                    ->first();

                $businessData['account_balance'] = [
                    'total_balance' => $latestPassbook ? (float) $latestPassbook->balance : 0,
                    'hold_balance' => (float) $accountData->hold_amount,
                    'available_balance' => $latestPassbook ? 
                        (float) ($latestPassbook->balance - $accountData->hold_amount) : 
                        (float) (-$accountData->hold_amount),
                    'account_status' => $accountData->status,
                    'account_created' => $accountData->created_at,
                ];
            } else {
                $businessData['account_balance'] = [
                    'total_balance' => 0,
                    'hold_balance' => 0,
                    'available_balance' => 0,
                    'account_status' => 0,
                    'account_created' => null,
                ];
            }

            // Calculate total business volume
            $totalVolume = 0;
            $totalSuccessVolume = 0;

            // Add AEPS amounts
            if (isset($aepsData['cash_withdrawal']['success_amount'])) {
                $totalSuccessVolume += $aepsData['cash_withdrawal']['success_amount'];
            }
            if (isset($aepsData['aadhaar_pay']['success_amount'])) {
                $totalSuccessVolume += $aepsData['aadhaar_pay']['success_amount'];
            }

            // Add utility amounts
            foreach ($utilityData as $utility) {
                $totalSuccessVolume += $utility['success_amount'];
            }

            // Add payout amounts
            $totalSuccessVolume += $businessData['payouts']['success_amount'];

            // Add fund amounts
            $totalSuccessVolume += $businessData['add_fund']['success_amount'];

            // Add cash deposit amounts
            $totalSuccessVolume += $businessData['cash_deposit']['success_amount'];

            $businessData['summary'] = [
                'total_success_volume' => $totalSuccessVolume,
                'period' => $period,
                'last_updated' => now()->toISOString(),
            ];

            return $businessData;

        } catch (\Exception $e) {
            \Log::error('Error getting business data for user ' . $user->id . ': ' . $e->getMessage());
            return [
                'error' => 'Unable to fetch business data',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get detailed business data for a specific referral user
     */
    public function referralUserDashboard(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_mid' => 'required|string',
                'period' => 'sometimes|string|in:day,month,year,all'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $period = $request->get('period', 'all');
            $userMid = $request->get('user_mid');

            // Find the referral user
            $referralUser = User::where('mid', $userMid)->first();

            if (!$referralUser) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Referral user not found'
                ], 404);
            }

            // Check if the current user has access to this referral user
            $currentUser = $request->get('user');
            $hasAccess = $this->checkReferralAccess($currentUser, $referralUser);

            if (!$hasAccess) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Access denied. This user is not in your referral network.'
                ], 403);
            }

            $dateFilter = $this->getDateFilter($period);
            $businessData = $this->getReferralUserBusinessData($referralUser, $period, $dateFilter);

            return response()->json([
                'status' => 1,
                'message' => 'Referral user dashboard data retrieved successfully',
                'data' => [
                    'user_info' => [
                        'id' => $referralUser->id,
                        'name' => $referralUser->name,
                        'mobile' => $referralUser->mobile,
                        'email' => $referralUser->email,
                        'mid' => $referralUser->mid,
                        'status' => $referralUser->status,
                        'created_at' => $referralUser->created_at,
                    ],
                    'period' => $period,
                    'business_data' => $businessData
                ]
            ], 200);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'referralUserDashboard', $e, [
                'context' => 'Referral user dashboard error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Internal Server Error',
                'ref_id' => $refId,
            ], 500);
        }
    }

    /**
     * Check if current user has access to referral user (within 3 levels)
     */
    private function checkReferralAccess($currentUser, $referralUser)
    {
        $currentUids = [$currentUser->mid];
        
        // Check up to 3 levels deep
        for ($i = 1; $i <= 3; $i++) {
            if (empty($currentUids)) {
                break;
            }

            $directReferrals = User::whereIn('refer_by', $currentUids)
                ->pluck('mid')
                ->toArray();

            if (in_array($referralUser->mid, $directReferrals)) {
                return true;
            }

            $currentUids = $directReferrals;
        }

        return false;
    }

    public function changeDevice(Request $request)
    {
        try {
            $outletId = $request->input('outletId') ?? $request->input('mid') ?? $request->header('mid');
            $panNo = $request->input('pan_no');
            $deviceIMEI = $request->input('deviceIMEI') ?? $request->input('new_deviceIMEI');
            $deviceName = $request->input('deviceName') ?? 'Mantra';
            $mposSerialNumber = $request->input('mposSerialNumber');

            $validator = Validator::make([
                'deviceIMEI' => $deviceIMEI,
                'deviceName' => $deviceName,
            ], [
                'deviceIMEI' => 'required|string',
                'deviceName' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => $validator->errors()->first() ?? 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Find existing draft by mid, pan_no, or user mobile
            $existingUser = null;
            if ($outletId) {
                $existingUser = AepsDraft::where('mid', $outletId)->first();
            }
            if (!$existingUser && $panNo) {
                $existingUser = AepsDraft::where('pan_no', $panNo)->first();
            }
            if (!$existingUser && $outletId) {
                $user = User::where('mid', $outletId)->first();
                if ($user) {
                    $existingUser = AepsDraft::where('phone', $user->mobile)
                        ->orWhere('pan_no', $user->pan_no ?? '')
                        ->first();
                }
            }

            if (!$existingUser) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No AEPS draft record found for the provided Outlet ID or PAN.'
                ], 404);
            }

            $existingUser->deviceName = $deviceName;
            $existingUser->deviceIMEI = $deviceIMEI;
            if ($mposSerialNumber !== null) {
                $existingUser->mposSerialNumber = $mposSerialNumber;
            }
            $existingUser->save();



            $urls = self::BASE_URL."v2/aeps/change-device";

            $datas = [
                "outletId"    => $existingUser->bmid,
                "pan_no"    => $existingUser->pan_no,
                "deviceIMEI"    => $deviceIMEI,
                "deviceName"        => $deviceName,
                "mposSerialNumber"        => $mposSerialNumber??"",
            ];

            $chs = curl_init($urls);

            curl_setopt_array($chs, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => json_encode($datas),
                CURLOPT_HTTPHEADER     => [
                    "Content-Type: application/json",
                    "Accept: application/json",
                    "mid: ".self::MID,
                    "mkey: ".self::MKEY
                ],
                CURLOPT_TIMEOUT        => 60,
                CURLOPT_CONNECTTIMEOUT => 20
            ]);

            $responses = curl_exec($chs);


            return response()->json([
                'status' => 1,
                'message' => 'Device information updated successfully',
                'data' => [
                    'outletId' => $existingUser->mid,
                    'deviceName' => $existingUser->deviceName,
                    'deviceIMEI' => $existingUser->deviceIMEI,
                    'mposSerialNumber' => $existingUser->mposSerialNumber
                ]
            ], 200);

        } catch (\Exception $e) {
            CatchLogService::logException($request, 'updateDeviceInfo', $e, [
                'context' => 'Device info update error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Internal Server Error',
            ], 500);
        }
    }


    public function getaepshistory(Request $request){
        $setting = Setting::where('user_id', $request->user_id)->first();
        if($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)){
            // Send callback to partner URL
            try {
                
                    
                $db_response_data = DB::table('aeps_transactions')->where('id', $request->history_id)
                ->select(
                    'mid as outletId',
                    'customer_mobile',
                    'aadhaar_number',
                    'bank_id',
                    'bank_name',
                    'device_type',
                    'aeps_type',
                    'amount',
                    'merchant_txn_id',
                    'response'
                )
                ->first();


                $postData = [
                    "type" => "aeps_transaction",
                    "data" => $db_response_data
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

                return response()->json([
                    'status' => 1,
                    'message' => $response
                ], 200);
                
            } catch (\Exception $e) {
                return response()->json([
                'status' => 0,
                'message' => $e->getMessage()
            ], 400);
            }   

        } else{
            return response()->json([
                'status' => 0,
                'message' => 'Callback URL not configured for this user'
            ], 400);    
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
            
        } catch (\Exception $e) {
            return [
                'verified' => false,
                'error' => $e->getMessage(),
                'response' => null
            ];
        }
    }

    // Cash Collection Initialization api
    public function cmsKeys(Request $request){
        try {
           
            $data = AepsDraft::where('mid', $request->outletId)->select('mid','phone','password','aeps_status')->first();
            if($data){
                if($data->aeps_status == '4'){
                    $merchantPin = !empty($data->password) ? base64_decode($data->password) : $data->phone;
                    return response()->json([
                    'status' => 1,
                    'message' => 'Data found',
                    'data' => [
                        'merchantId'=> $data->mid,
                        'secretKey'=> self::SECRET_KEY,
                        'superMerchantId'=> self::SUPER_MERCHANT_ID,
                        'mobileNumber'=> $data->phone,
                        'merchantLoginId'=>  $data->mid,
                        'merchantLoginPin'=> $merchantPin,
                        'transactionType'=> 'CMS',
                        ]
                    ], 200);
                } else {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Please do 2FA verification',
                        'data' => []
                    ], 200);
                }
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => 'No data found',
                    'data' => []
                ], 200);
            }
            
        } catch (\Exception $e) {
            CatchLogService::logException($request, 'cmsKeys', $e, [
                'context' => 'CMS Keys retrieval error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve CMS keys'
            ], 400);
        }
    }

    /**
     * Upload shop image (inside or outside)
     * Accepts either direct CDN URL (image_url) or file upload (image)
     * Used in AEPS Video KYC flow
     */
    public function uploadShopImage(Request $request)
    {
        // Validate - either image_url OR image file is required
        $validator = Validator::make($request->all(), [
            'pan_no' => 'required|string|max:10',
            'image_url' => 'nullable|url', // CDN URL from direct upload
            'image' => 'nullable|file|mimes:jpg,jpeg,png|max:5120', // 5MB max fallback
            'image_type' => 'required|in:shop_inner,shop_outer',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 200);
        }

        // Ensure at least one image source is provided
        if (!$request->has('image_url') && !$request->hasFile('image')) {
            return response()->json([
                'status' => 0,
                'message' => 'Either image_url or image file is required'
            ], 200);
        }

        try {
            $aepsDraft = AepsDraft::where('pan_no', $request->pan_no)->first();
            
            if (!$aepsDraft) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No draft found for the provided PAN'
                ], 200);
            }

            $imageType = $request->image_type;
            $lat = $request->latitude ?? 0;
            $lng = $request->longitude ?? 0;
            
            // Priority: Use image_url if provided (direct CDN upload from Flutter)
            if ($request->has('image_url') && filter_var($request->image_url, FILTER_VALIDATE_URL)) {
                $imageUrl = $request->image_url;
                Log::info("AEPS Shop Image URL received (direct CDN upload)", [
                    'pan_no' => $request->pan_no,
                    'image_type' => $imageType,
                    'url' => $imageUrl
                ]);
            }
            // Fallback: Handle file upload through server
            elseif ($request->hasFile('image')) {
                $timestamp = now()->format('YmdHis');
                
                // Create directory if it doesn't exist
                $uploadPath = public_path('uploads/aeps/shop_images');
                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0755, true);
                }
                
                // Generate filename with extension
                $extension = $request->file('image')->getClientOriginalExtension();
                $filename = "{$aepsDraft->mid}_{$imageType}_{$timestamp}_lat{$lat}_lng{$lng}.{$extension}";
                
                // Move file to public directory
                $request->file('image')->move($uploadPath, $filename);
                
                // Generate public URL
                $imageUrl = asset('uploads/aeps/shop_images/' . $filename);
                
                Log::info("AEPS Shop Image Uploaded (server upload)", [
                    'pan_no' => $request->pan_no,
                    'image_type' => $imageType,
                    'url' => $imageUrl
                ]);
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => 'No valid image source provided'
                ], 200);
            }

            // Update draft with image URL
            $aepsDraft->update([
                $imageType => $imageUrl
            ]);

            Log::info("AEPS Shop Image Saved", [
                'pan_no' => $request->pan_no,
                'image_type' => $imageType,
                'url' => $imageUrl,
                'gps' => ['lat' => $lat, 'lng' => $lng]
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Image uploaded successfully',
                'data' => [
                    'image_url' => $imageUrl,
                    'image_type' => $imageType
                ]
            ], 200);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'uploadAepsShopImage', $e, [
                'context' => 'AEPS Shop Image Upload Error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Failed to upload image',
                'ref_id' => $refId,
            ], 500);
        }
    }

    /**
     * Generate pre-signed upload token for direct Bunny.net uploads
     * Used for secure client-side video uploads without exposing API keys
     */
    public function generateVideoUploadToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pan_no' => 'required|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 200);
        }

        try {
            $aepsDraft = AepsDraft::where('pan_no', $request->pan_no)->first();
            
            if (!$aepsDraft) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No draft found for the provided PAN'
                ], 200);
            }

            $bunnyService = new \App\Services\BunnyStreamService();
            
            if (!$bunnyService->isConfigured()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Video upload service not configured'
                ], 500);
            }

            // Generate upload token (default 60 minutes expiration)
            $videoTitle = "KYC_{$aepsDraft->mid}_" . now()->format('YmdHis');
            $token = $bunnyService->generateUploadToken($videoTitle, 60);

            Log::info("AEPS Video Upload Token Generated", [
                'pan_no' => $request->pan_no,
                'video_id' => $token['video_id'],
                'expires_at' => date('Y-m-d H:i:s', $token['auth_expire'])
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Upload token generated successfully',
                'data' => $token
            ], 200);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'generateVideoUploadToken', $e, [
                'context' => 'AEPS Video Upload Token Generation Error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Failed to generate upload token',
                'ref_id' => $refId,
            ], 500);
        }
    }

    /**
     * Save Video KYC URL (uploaded directly to Bunny.net by client)
     * Used in AEPS Video KYC flow 
     */
    public function uploadVideoKyc(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pan_no' => 'required|string|max:10',
            'video_url' => 'required|url',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 200);
        }

        try {
            $aepsDraft = AepsDraft::where('pan_no', $request->pan_no)->first();
            
            if (!$aepsDraft) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No draft found for the provided PAN'
                ], 200);
            }

            // Update draft with video URL and GPS coordinates
            $aepsDraft->update([
                'video_url' => $request->video_url,
                'latitude' => $request->latitude ?? $aepsDraft->latitude,
                'longitude' => $request->longitude ?? $aepsDraft->longitude,
            ]);

            Log::info("AEPS Video KYC URL Saved", [
                'pan_no' => $request->pan_no,
                'video_url' => $request->video_url,
                'gps' => [
                    'lat' => $request->latitude,
                    'lng' => $request->longitude
                ]
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Video URL saved successfully',
                'data' => [
                    'video_url' => $request->video_url
                ]
            ], 200);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'uploadVideoKyc', $e, [
                'context' => 'AEPS Video KYC URL Save Error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Failed to save video URL',
                'ref_id' => $refId,
            ], 500);
        }
    }


    public function saveDeviceUsed(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'mid' => 'required|string|max:50',
                'device_certificate' => 'required|string', // Base64 L1 certificate
                'vendor' => 'required|string|max:50',
                'model' => 'required|string|max:50',
                'dp_id' => 'nullable|string|max:50',
                'rds_id' => 'nullable|string|max:50',
                'rds_ver' => 'nullable|string|max:20',
                'dc' => 'nullable|string|max:100',
                'mc' => 'nullable|string|max:100',
                'mobile_device_id' => 'required|string|max:100',
                'os_info' => 'nullable|string|max:50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Compute SHA-256 fingerprint of the device certificate
            // This becomes the cryptographic device identity
            $certFingerprint = hash('sha256', $request->device_certificate);

            // Upsert: Insert new record or update last_seen_at + increment txn_count
            DB::table('aeps_device_evidence')->updateOrInsert(
                [
                    'mid' => $request->mid,
                    'device_cert_fingerprint' => $certFingerprint,
                ],
                [
                    'vendor' => $request->vendor,
                    'model' => $request->model,
                    'dp_id' => $request->dp_id,
                    'rds_id' => $request->rds_id,
                    'rds_ver' => $request->rds_ver,
                    'dc' => $request->dc,
                    'mc' => $request->mc,
                    'mobile_device_id' => $request->mobile_device_id,
                    'os_info' => $request->os_info,
                    'last_seen_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // Increment transaction count
            DB::table('aeps_device_evidence')
                ->where('mid', $request->mid)
                ->where('device_cert_fingerprint', $certFingerprint)
                ->increment('txn_count');

            return response()->json([
                'status' => 1,
                'message' => 'Device evidence saved',
                'data' => [
                    'fingerprint' => $certFingerprint,
                ]
            ], 200);

        } catch (\Exception $e) {
            // Silent failure - don't block transaction flow
            CatchLogService::logException($request, 'saveDeviceUsed', $e, [
                'context' => 'Device evidence save failed',
            ]);
            
            return response()->json([
                'status' => 0,
                'message' => 'Internal Server Error',
            ], 500);
        }
    }

}
