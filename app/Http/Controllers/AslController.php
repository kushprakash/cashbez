<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\Setting;
use App\Models\Passbook;
use App\Models\Commission;
use App\Models\FundTransfer;
use DB; 
class AslController extends Controller
{
    protected function getUserByCredentials($mid, $mkey = null)
    {
        $setting = Setting::where('mid', $mid);

        if ($mkey) {
            $setting->where('mkey', $mkey);
        }

        $setting = $setting->first();

        if (!$setting) {
            throw new Exception('Invalid credentials');
        }

        return $setting->user;
    }
    
    protected function makeApiCalls($endpoint, $mode ,$payload, $userId = null)
    {
        $startTime = microtime(true);
        
        if($mode=='aeps'){ $base_url='https://payzone.2ndproject.net/apipartner/apiservice/aeps/v1'; }
        if($mode=='payout'){ $base_url=''; }
        
        $payload['associateId']='3831';
        $payload['apiToken']='51088393bc005468d59215f2031bd918';
        
        try {
           
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $base_url.$endpoint);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($payload)); 
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);

            $responseData = json_decode($response, true);

            if ($responseData === null && json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Invalid JSON response: " . json_last_error_msg() . ". Raw response: {$response}");
            }

           
            return $responseData;
        } catch (Exception $e) {
            
            throw $e;
        }
    } 
    
    protected function makeApiCall($endpoint, $mode ,$payload, $userId = null)
    {
        $startTime = microtime(true);
        
        if($mode=='aeps'){ $base_url='https://payzone.2ndproject.net/apipartner/apiservice/aeps/v1'; }
        if($mode=='payout'){ $base_url='https://payzone.2ndproject.net/apipartner/apiservice/payout/v1'; }
        
        $payload['associateId']='3831';
        $payload['apiToken']='51088393bc005468d59215f2031bd918';
        
        try {
           
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $base_url.$endpoint);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload)); 
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);

            $responseData = json_decode($response, true);

            if ($responseData === null && json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Invalid JSON response: " . json_last_error_msg() . ". Raw response: {$response}");
            }

           
            return $responseData;
        } catch (Exception $e) {
            
            throw $e;
        }
    }
   
    
    public function registerAgent(Request $request){
        
        
        $mid = $request->header('mid');
        $mkey = $request->header('mkey');

        if ($mid && $mkey) {
            $user = $this->getUserByCredentials($mid, $mkey);

            // Check if Cashbez AEPS is enabled for this user
            $settings = $user->settings->first();
            if (!$settings || !$settings->aeps) {
                 return response()->json([
                    'status' => false,
                    'message' => 'AEPS service is not enabled'
                ]);
            }
            $userId = $user->id;
        } else {
            $userId = null;
        }
        
        $exists = DB::table('asl_retailers')
        ->where('aadharNo', $request->aadharNo)
        ->exists();

        if ($exists) {
             return response()->json([
                    'status' => false,
                    'message' => 'AEPS User Exits from this Aadhar number'
                ]);
        } else {
      
            $input = $request->only([
                'retailerAadhaarFrontImage',
                'retailerAadhaarBackImage',
                'retailerPanFrontImage',
                'retailerPanBackImage',
                'retailerShopImage',
            ]);
            
            // Step 1: Basic URL validation
            $validator = Validator::make($input, [
                'retailerAadhaarFrontImage' => 'required|url',
                'retailerAadhaarBackImage' => 'required|url',
                'retailerPanFrontImage' => 'required|url',
                'retailerPanBackImage' => 'required|url',
                'retailerShopImage' => 'required|url',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ]);
            }
            
            function createFileArray($url, $label)
            {
                
                
                
                try {
                    $response = Http::head($url);
            
                    if (!$response->ok()) {
                        throw new \Exception("File not reachable");
                    }
            
                    $mime = $response->header('Content-Type', 'application/octet-stream');
            
                    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/jpg'])) {
                        throw new \Exception("Invalid image type: $mime");
                    }
            
                    return [
                        'tmp_name' => $url,
                        'type' => $mime,
                        'name' => basename($url),
                    ];
                } catch (\Exception $e) {
                    throw new \Exception("Invalid file for $label: " . $e->getMessage());
                }
            }
            
            $retailerAadhaarFrontImage = createFileArray($input['retailerAadhaarFrontImage'], 'Aadhaar Front');
            $retailerAadhaarBackImage = createFileArray($input['retailerAadhaarBackImage'], 'Aadhaar Back');
            $retailerPanFrontImage = createFileArray($input['retailerPanFrontImage'], 'PAN Front');
            $retailerPanBackImage = createFileArray($input['retailerPanBackImage'], 'PAN Back');
            $retailerShopImage = createFileArray($input['retailerShopImage'], 'Shop Image');
    
                    
            $body= [
                'retailerDob' => $request->retailerDob,
                'retailerCity' => $request->retailerCity,
                'retailerState' => $request->retailerState,
                'retailerCountry' => $request->retailerCountry,
                'retailerPincode' => $request->retailerPincode,
                'panNo' => $request->panNo,
                'phone' => $request->phone,
                'aadharNo' => $request->aadharNo,
                'retailerEmail' => $request->retailerEmail,
                'bankAccHolderName' => $request->bankAccHolderName,
                'bankName' => $request->bankName,
                'bankAccountNo' => $request->bankAccountNo,
                'bankIfsc' => $request->bankIfsc,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'retailerShopName' => $request->retailerShopName,
                'companyOrShopPan' => $request->companyOrShopPan,
                'shopAddress' => $request->shopAddress,
                'gstinNumber' => $request->gstinNumber,
                'shopCity' => $request->shopCity,
                'shopDistrict' => $request->shopDistrict,
                'shopState' => $request->shopState,
                'shopPincode' => $request->shopPincode,
                'shopLatitude' => $request->shopLatitude,
                'shopLongitude' => $request->shopLongitude,
                'retailerName' => $request->retailerName,
                'retailerAadhaarFrontImage' => $retailerAadhaarFrontImage,
                'retailerAadhaarBackImage' => $retailerAadhaarBackImage,
                'retailerPanFrontImage' => $retailerPanFrontImage,
                'retailerPanBackImage' => $retailerPanBackImage,
                'retailerShopImage' => $retailerShopImage
            ];
            
            $response = $this->makeApiCalls('/onboarding','aeps' ,$body, $userId);
            
            if (isset($response['status']) && $response['status'] == 'SUCCESS') {
            
                DB::table('asl_retailers')->insert([
                    'user_id' => $userId,
                    'uniqueID' => $response['uniqueID'],
                    'retailerDob' => $request->retailerDob,
                    'retailerCity' => $request->retailerCity,
                    'retailerState' => $request->retailerState,
                    'retailerCountry' => $request->retailerCountry,
                    'retailerPincode' => $request->retailerPincode,
                    'panNo' => $request->panNo,
                    'phone' => $request->phone,
                    'aadharNo' => $request->aadharNo,
                    'retailerEmail' => $request->retailerEmail,
                    'bankAccHolderName' => $request->bankAccHolderName,
                    'bankName' => $request->bankName,
                    'bankAccountNo' => $request->bankAccountNo,
                    'bankIfsc' => $request->bankIfsc,
                    'latitude' => $request->latitude,
                    'longitude' => $request->longitude,
                    'retailerShopName' => $request->retailerShopName,
                    'companyOrShopPan' => $request->companyOrShopPan,
                    'shopAddress' => $request->shopAddress,
                    'gstinNumber' => $request->gstinNumber,
                    'shopCity' => $request->shopCity,
                    'shopDistrict' => $request->shopDistrict,
                    'shopState' => $request->shopState,
                    'shopPincode' => $request->shopPincode,
                    'shopLatitude' => $request->shopLatitude,
                    'shopLongitude' => $request->shopLongitude,
                    'retailerName' => $request->retailerName,
                    'retailerAadhaarFrontImage' => $request->retailerAadhaarFrontImage,
                    'retailerAadhaarBackImage' => $request->retailerAadhaarBackImage,
                    'retailerPanFrontImage' => $request->retailerPanFrontImage,
                    'retailerPanBackImage' => $request->retailerPanBackImage,
                    'retailerShopImage' => $request->retailerShopImage,
                    'status' => 0, // or set as per logic
                    'otpReferenceID' => $response['data']['otpReferenceID'],
                    'hash' => $response['data']['hash'],
                    'requestData' => json_encode($request->all()),
                    'responseData' => json_encode($response),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                return response()->json([
                    'status' => true,
                    'message' => $response['message'],
                    'uniqueID' => $response['uniqueID'],
                    'otpReferenceID' => $response['data']['otpReferenceID'],
                    'hash' => $response['data']['hash'],
                ]);
                
            } else {
            
                return response()->json([
                    'status' => false,
                    'message' => $response['message']
                ]);
            
            }
        }
    }
    
    public function otpValidate(Request $request){
        
        $mid = $request->header('mid');
        $mkey = $request->header('mkey');

        if ($mid && $mkey) {
            $user = $this->getUserByCredentials($mid, $mkey);

            // Check if Cashbez AEPS is enabled for this user
            $settings = $user->settings->first();
            if (!$settings || !$settings->aeps) {
                 return response()->json([
                    'status' => false,
                    'message' => 'AEPS service is not enabled'
                ]);
            }
            $userId = $user->id;
        } else {
            $userId = null;
        }
        
        $exists = DB::table('asl_retailers')
        ->where('aadharNo', $request->aadharNo)
        ->where('status', 1)
        ->exists();

        if ($exists) {
             return response()->json([
                    'status' => false,
                    'message' => 'otpValidation already done from this Aadhar number'
                ]);
        } else {
            
            $retailer = DB::table('asl_retailers')
            ->where('aadharNo', $request->aadharNo)
            ->first();
        
            $body= [
                'aadhaarNo' => $retailer->aadharNo,
                'otpReferenceID' => $retailer->otpReferenceID,
                'hash' => $retailer->hash,
                'otp' => $request->otp,
                'uniqueID' => $retailer->uniqueID,
                'otpType' => 'aadhaar'
            ];
            
        
           
            $response = $this->makeApiCall('/otpValidate','aeps' ,$body, $userId);
          
            
            if (isset($response['status']) && $response['status'] == 'SUCCESS') {
            
                DB::table('asl_retailers')
                ->where('aadharNo', $request->aadharNo) // condition
                ->update([
                    'outletId' => $response['data']['outletId'],
                    'otpVlidateResponse' => json_encode($response),
                    'status' => 1,
                    'updated_at' => now(),
                ]);
                
                return response()->json([
                    'status' => true,
                    'message' => $response['message'],
                    'outletId' => $response['data']['outletId']
                ]);
                
            } else {
            
                return response()->json([
                    'status' => false,
                    'message' => $response['message']
                ]);
            
            }
            
        }
    }
    
    public function twoFactorAuthenticate(Request $request){
        
        $mid = $request->header('mid');
        $mkey = $request->header('mkey');
        $outletId = $request->header('outletId');
        
        if ($mid && $mkey) {
            $user = $this->getUserByCredentials($mid, $mkey);

            // Check if Cashbez AEPS is enabled for this user
            $settings = $user->settings->first();
            if (!$settings || !$settings->aeps) {
                 return response()->json([
                    'status' => false,
                    'message' => 'AEPS service is not enabled'
                ]);
            }
            $userId = $user->id;
        } else {
            $userId = null;
        }
        
        $exists = DB::table('asl_retailers')
        ->where('outletId', $outletId)
        ->first();

        if (!$exists) {
            
            return response()->json([
                    'status' => false,
                    'message' => 'Invalid outletId & Agent ID'
                ]);
            
                
        } else {
            
            
            if($exists->status==0){
                 return response()->json([
                    'status' => false,
                    'mode' =>1,
                    'message' => 'Aadhar OTP not verified'
                ]);
            } else {
                
                $today = date('Y-m-d');

                $check2fa = DB::table('asl_two_fa')
                ->where('outletId', $outletId)
                ->whereDate('created_at', $today)
                ->first();
                
                if(!$check2fa){
            
                    $retailer = DB::table('asl_retailers')
                    ->where('outletId', $outletId)
                    ->first();
                
                    $body= [
                        'aadhaarNo' => $retailer->aadharNo,
                        'outletId' => $retailer->outletId,
                        'uniqueID' => $retailer->uniqueID,
                        'latitude' => $retailer->shopLatitude,
                        'longitude' => $retailer->shopLongitude,
                        'transactionId' => rand(11111111,99999999),
                        'captureType' => 'FINGER',
                        'biometricData' => $request->biometricData,
                        'serviceType' => 'CashDeposit',
                        'type' => '"DAILY_LOGIN',
                    ];
                    
                    $response = $this->makeApiCall('/two-factor-authenticate','aeps' ,$body, $userId);
                  
                    
                    if (isset($response['status']) && $response['status'] == 'SUCCESS') {
                    
                        DB::table('asl_retailers')
                        ->where('outletId', $outletId) // condition
                        ->update([
                            'twoFAResponse' => json_encode($response),
                            'status' => 2,
                            'updated_at' => now(),
                        ]);
                        
                     
                        DB::table('asl_two_fa')->insert([
                            'user_id' => $userId,
                            'outletId' => $outletId,
                            'status' => 1,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        
                        return response()->json([
                            'status' => true,
                            'message' => $response['message']
                        ]);
                        
                    } else {
                    
                        return response()->json([
                            'status' => false,
                            'message' => $response['message']
                        ]);
                    
                    }
            
            
                } else {
                    
                    return response()->json([
                        'status' => false,
                        'mode' =>3,
                        'message' => 'Two Factor Authenticate already done'
                    ]);
                    
                }
                
                
            }
            
        }
    }
    
    public function aepsTransaction(Request $request){
        
        $mid = $request->header('mid');
        $mkey = $request->header('mkey');
        $outletId = $request->header('outletId');
        
        if ($mid && $mkey) {
            $user = $this->getUserByCredentials($mid, $mkey);

            // Check if Cashbez AEPS is enabled for this user
            $settings = $user->settings->first();
            if (!$settings || !$settings->aeps) {
                 return response()->json([
                    'status' => false,
                    'message' => 'AEPS service is not enabled'
                ]);
            }
            $userId = $user->id;
        } else {
            $userId = null;
        }
        
        $exists = DB::table('asl_retailers')
        ->where('outletId', $outletId)
        ->where('status', 2)
        ->exists();

        if (!$exists) {
             return response()->json([
                    'status' => false,
                    'message' => 'Complete Two Factor Authenticate first'
                ]);
        } else {
            
            $retailer = DB::table('asl_retailers')
            ->where('outletId', $outletId)
            ->first();
        
            $body= [
                'outletId' => $retailer->outletId,
                'uniqueID' => $retailer->uniqueID,
                'latitude' => $retailer->shopLatitude,
                'longitude' => $retailer->shopLongitude,
                'transactionId' => rand(11111111,99999999),
                'captureType' => 'FINGER',
                'aadhaarNo' => $request->aadharNo,
                'biometricData' => $request->biometricData,
                'txnType' => $request->txnType,
                'bankiin' => $request->bankiin,
                'mobile' => $request->mobile,
                'amount' => $request->amount,
            ];

           
            $response = $this->makeApiCall('/aepsTransaction','aeps' ,$body, $userId);
          
            
            if (isset($response['status']) && $response['status'] == 'SUCCESS') {
                
                $isOnusTxn=false;
                if($request->txnType=='"CW'){
                    $isOnusTxn=true;
                }
            
                DB::table('asl_aeps_transactions')->insert([
                    'user_id' => $userId,
                    'outletId' => $retailer->outletId,
                    'externalRef' => $response['data']['externalRef'],
                    'txnReferenceId' => $response['data']['txnReferenceId'],
                    'bankName' => $response['data']['bankName'],
                    'accountNumber' => $response['data']['accountNumber'],
                    'ipayId' => $response['data']['ipayId'],
                    'transactionMode' => $response['data']['transactionMode'],
                    'payableValue' => $response['data']['payableValue'],
                    'transactionValue' => $response['data']['transactionValue'],
                    'openingBalance' => $response['data']['openingBalance'],
                    'closingBalance' => $response['data']['closingBalance'],
                    'operatorId' => $response['data']['operatorId'],
                    'walletIpayId' => $response['data']['walletIpayId'],
                    'bankAccountBalance' => $response['data']['bankAccountBalance'],
                    'miniStatement' => json_encode($response['data']['miniStatement']),
                    'status' => 1,
                    'isOnusTxn' => $isOnusTxn,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                
                return response()->json([
                    'status' => true,
                    'message' => 'Transaction success',
                    'data'=>$response['data']
                ]);
                
            } else {
            
                return response()->json([
                    'status' => false,
                    'message' => $response['message']
                ]);
            
            }
            
        }
    }
    
    public function transactionStatus(Request $request){
        
        $mid = $request->header('mid');
        $mkey = $request->header('mkey');

        if ($mid && $mkey) {
            $user = $this->getUserByCredentials($mid, $mkey);

            // Check if Cashbez AEPS is enabled for this user
            $settings = $user->settings->first();
            if (!$settings || !$settings->aeps) {
                 return response()->json([
                    'status' => false,
                    'message' => 'AEPS service is not enabled'
                ]);
            }
            $userId = $user->id;
        } else {
            $userId = null;
        }
        
        $exists = DB::table('asl_aeps_transactions')
        ->where('txnReferenceId', $request->txnReferenceId)
        ->first();

        if (!$exists) {
             return response()->json([
                    'status' => false,
                    'message' => 'Invalid txnReferenceId'
                ]);
        } else {
            
        
          $ddata = DB::table('asl_retailers')
            ->where('outletId', $exists->outletId)
            ->first();

            $body= [
                'outletId' => $ddata->outletId,
                'uniqueID' => $ddata->uniqueID,
                'transactionDate' => $request->transactionDate,
                'txnReferenceId' => $request->txnReferenceId,
                'source' => "ORDER",
            ];

           
            $response = $this->makeApiCall('//transactionStatus','aeps' ,$body, $userId);
          
            
            if (isset($response['status']) && $response['status'] == 'SUCCESS') {
                
               
                return response()->json([
                    'status' => true,
                    'message' => 'Transaction success',
                    'data'=>$response['data']
                ]);
                
            } else {
            
                return response()->json([
                    'status' => false,
                    'message' => $response['message']
                ]);
            
            }
            
        }
    }
    
    public function payout(Request $request){
        
        $mid = $request->header('mid');
        $mkey = $request->header('mkey');
        $outletId = $request->header('outletId');
        
        if ($mid && $mkey) {
            $user = $this->getUserByCredentials($mid, $mkey);

            // Check if Cashbez AEPS is enabled for this user
            $settings = $user->settings->first();
            if (!$settings || !$settings->aeps) {
                 return response()->json([
                    'status' => false,
                    'message' => 'AEPS service is not enabled'
                ]);
            }
            $userId = $user->id;
        } else {
            $userId = null;
        }
        
        $exists = DB::table('asl_retailers')
        ->where('outletId', $outletId)
        ->first();

        if (!$exists) {
             return response()->json([
                    'status' => false,
                    'message' => 'Invalid outletId & Agent Code'
                ]);
        } else {
            
        
            $ddata = DB::table('asl_retailers')
            ->where('outletId', $outletId)
            ->first();

            $body= [
                'latitude' => $ddata->shopLatitude,
                'longitude' => $ddata->shopLongitude,
                'mobile' => $request->mobile,
                'accountNumber' => $request->accountNumber,
                'amount' => $request->amount,
                'paymentMode' => 'IMPS',
                'bankName' => $request->bankName,
                'ifscCode' => $request->ifscCode,
                'beneficiaryName' => $request->beneficiaryName,
            ];


        
            $response = $this->makeApiCall('//payout','payout' ,$body, $userId);
          
            
            if (isset($response['status']) && $response['status'] == 'SUCCESS') {
                
                DB::table('asl_payouts')->insert([
                    'user_id' => $userId,
                    'outletId' => $outletId,
                    'bankName' => $request->bankName,
                    'ifscCode' => $request->ifscCode,
                    'beneficiaryName' => $request->beneficiaryName,
                    'mobile' => $request->mobile,
                    'accountNumber' => $request->accountNumber,
                    'amount' => $request->amount,
                    'txn_id' => $request->txn_id,
                    'charge' => $charge,
                    'status' => 'SUCCESS',
                    'utr' => $response['orderID'],
                    'remarks' => 'Transaction success',
                    'api_response' => json_encode($response),
                    'call_back_url' => $request->callback
                ]);
                                
               
                return response()->json([
                    'status' => true,
                    'message' => 'Transaction success',
                    'orderID'=>$response['orderID']
                ]);
                
            } else {
            
                return response()->json([
                    'status' => false,
                    'message' => $response['remark']
                ]);
            
            }
            
        }
    }
    
    public function check2FAAuth(Request $request){
        $mid = $request->header('mid');
        $mkey = $request->header('mkey');
        $outletId = $request->header('outletId');

        if ($mid && $mkey) {
            $user = $this->getUserByCredentials($mid, $mkey);

            // Check if Cashbez AEPS is enabled for this user
            $settings = $user->settings->first();
            if (!$settings || !$settings->aeps) {
                 return response()->json([
                    'status' => false,
                    'message' => 'AEPS service is not enabled'
                ]);
            }
            $userId = $user->id;
        } else {
            $userId = null;
        }
        
        
        $exists = DB::table('asl_retailers')
        ->where('outletId', $outletId)
        ->first();

        if (!$exists) {
             return response()->json([
                    'status' => false,
                    'message' => 'Invalid outletId & Agent Code'
                ]);
        } else {
            
            if($exists->status==0){
                 return response()->json([
                    'status' => false,
                    'mode' =>1,
                    'message' => 'Aadhar OTP not verified'
                ]);
            } else {
                
                $today = date('Y-m-d');

                $check2fa = DB::table('asl_two_fa')
                ->where('outletId', $outletId)
                ->whereDate('created_at', $today)
                ->first();
                
                if(!$check2fa){
                    return response()->json([
                        'status' => false,
                        'mode' =>2,
                        'message' => 'Please Complete 2FA'
                    ]); 
                } else {
                    
                    return response()->json([
                        'status' => true,
                        'mode' =>3,
                        'message' => '2FA completed'
                    ]);
                    
                }
                
                
            }
            
        }
        
    }
    
}