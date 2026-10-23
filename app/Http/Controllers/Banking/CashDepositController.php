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
use App\Services\CatchLogService;

class CashDepositController extends Controller
{
   
    // Constants
    private const AEPS_API_TIMEOUT = 120;
    private const SUPER_MERCHANT_ID       = '1262';
    private const SUPER_MERCHANT_USERNAME = 'bharatpaysd';
    private const SUPER_MERCHANT_PASSWORD = '1234d';
    private const SUPER_MERCHANT_GST_IN   = '19AAVCA0758M1ZW';
    private const IP_ADDRESS              = '194.164.148.127';
    private const API_TIMEOUT             = 30;
    private const BASE_URL = 'https://icchhamatidataservice.com/api/';
    private const MID = "AGENT1475";
    private const MKEY = "8ECgqn6xep6FPdVvzOs4ketqWQxG9qGY";



    private function encryptMD5($password)
    {
        return md5($password);
    }

    private function generateSha256Hash($data)
    {
        return base64_encode(hash('sha256', $data, true));
    }

    // enryption mode changed from AES-128-CBC to AES-128-ECB
    private function encryptSessionKey($sessionKey)
    {
        $publicKey = openssl_pkey_get_public(self::PUBLIC_RSA_KEY);
        if (!$publicKey) {
            throw new \Exception("Invalid RSA Public Key");
        }
        if (!openssl_public_encrypt($sessionKey, $encrypted, $publicKey, OPENSSL_PKCS1_PADDING)) {
            throw new \Exception("RSA Encryption failed");
        }
        return base64_encode($encrypted);
    }

    private function encryptPayload($json, $sessionKey)
    {
        // AES-128-ECB (matches Java's default: Cipher.getInstance("AES") → AES/ECB/PKCS5Padding)
        $encrypted = openssl_encrypt(
            $json,
            'AES-128-ECB',
            $sessionKey,
            OPENSSL_RAW_DATA
        );
        return base64_encode($encrypted);
    }

    private function extractXmlContent($xmlData)
    {
        if (is_string($xmlData)) {
            return trim($xmlData);
        }
        if (is_array($xmlData)) {
            // Try different possible content keys
            if (isset($xmlData['content'])) {
                return trim($xmlData['content']);
            }
            if (isset($xmlData['@content'])) {
                return trim($xmlData['@content']);
            }
            if (isset($xmlData['0'])) {
                return trim($xmlData['0']);
            }
            // Handle nested content
            if (isset($xmlData['@attributes']) && count($xmlData) > 1) {
                // Skip attributes and get the actual content
                foreach ($xmlData as $key => $value) {
                    if ($key !== '@attributes' && is_string($value)) {
                        return trim($value);
                    }
                }
            }
            // If it's a simple array with just content, return it as string
            if (count($xmlData) === 1 && !isset($xmlData['@attributes'])) {
                $value = reset($xmlData);
                return is_string($value) ? trim($value) : (string)$value;
            }
            // If all else fails, try to convert to string
            return trim((string)$xmlData);
        }
        return "";
    }

    private function safeGetArrayValue($array, $keys, $default = "")
    {
        $current = $array;
        foreach ($keys as $key) {
            if (!is_array($current) || !isset($current[$key])) {
                return $default;
            }
            $current = $current[$key];
        }
        return $current;
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
                'iType'      => null,
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

            return $transformedResponse;

        } catch (\Throwable $ex) {
            return response()->json([
                'status'  => 0,
                'message' => 'Invalid XML format',
                'error'   => $ex->getMessage()
            ], 400);
        }
    }

    public function bankList(Request $request)
    {
        
        $banks = DB::table("cd_banks")->orderBy('bankName','asc')->get();
       
        return response()->json([
            'status'  => 1,
            'message' => 'Cash Deposit API is working',
            'data'    => $banks
        ], 200);
    }

   

    public function doDeposit(Request $request)
    {
        try {
            // ✅ Validate request body
            $validator = Validator::make($request->all(), [
                'xml'            => 'required',
                'customerMobile' => 'required|string|regex:/^[6-9]\d{9}$/',
                'aadhaarNumber'  => 'required|string|regex:/^\d{12}$/',
                'bankID'         => 'required|string',
                'deviceType'     => 'required|string',
                'aepsType'       => 'required|string|in:BE,CD,MS,M',
                'amount'         => 'required_if:aepsType,CD,M|nullable|numeric|min:1|max:50000',
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

            $amount = $request->amount ?? 0;

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

            $amount1=$amount;


            if($balanceAccount->balance < $amount1){
               return response()->json([
                    'status'  => 0,
                    'message' => 'Insufficient balance in your wallet. Your Bal '.$balanceAccount->balance,
                    'data'    => null
                ], 200);
            }


            
            $account = Account::where('user_id', $credit_user_id)->where('primary_status', true)->first();
            
            // Determine category based on AEPS type
            $categoryCode = 'CASH_DEPOSIT';
            $type = 'CD';
            
            
            // Step 1: Prepare transaction data
            $transactionData1 = [
                'account_id' => $account->id,
                'type' => 'DR',
                'amount' => $amount,
                'description' => $type.' - Transaction '.$aadhaarNumber,
                'transaction_id' => $merchantTranId,
                'created_by' => $existingUser->created_by,
                'admin_id' => $existingUser->admin_id,
                'user_id' => $credit_user_id,
                'category_code' => $categoryCode
            ];

            // Step 2: Create the transaction
            $transactionData = createTransaction($transactionData1);

            if($transactionData['status'] == 0){
                return response()->json([
                    'status'  => 0,
                    'message' => 'Insufficient balance in your wallet. Your Bal '.$balanceAccount->balance,
                    'data'    => null
                ], 200);
            }


          

            $timestamp = date('YmdHis');
            $timestamp2 = date('d/m/Y H:i:s'); // dd/MM/yyyy HH:mm:ss
            $randomNumber = rand(11,99);
            $merchantLoginId = $existingUser->mid;
            $merchantTranId = $merchantLoginId . $timestamp . $randomNumber;

            $history = AepsTransaction::create([
                'mid'              => $existingUser->mid,
                'machine_json_data'  => '',
                'customer_mobile'   => $request->customerMobile,
                'aadhaar_number'    => $request->aadhaarNumber,
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

            $url = self::BASE_URL."v2/cash-deposit/process";

         
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
                    'trnTimestamp' => $merchantTranId
                ]),
                'request_data'  => json_encode($data),
                'url'           => $url,
                'txnid'         => $merchantTranId,
                'status'        => 0
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


            $responseJson = json_decode($response, true);

            DB::table('logs')
            ->where('txnid', $merchantTranId)
            ->update([
                'response_data' => json_encode($responseJson),
                'status'        => $responseJson['status'] ?? 0,
                'updated_at'    => now(),
            ]);


            $history->update([
                "request" => json_encode($data),
                "response" => json_encode($responseJson),
                "response_status" => $responseJson['data']['status'] ?? null,
                "response_status_code" => $responseJson['data']['statusCode'] ?? null,
                "response_message" => $responseJson['data']['message'] ?? null,
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
            if ($responseJson['data']['status'] === true && $responseJson['data']['statusCode'] === 10000) {
                
                    
                $commissionTransactionData = [
                    'user_id' => $credit_user_id,
                    'amount' => $amount,
                    'sub_module_id' => 52, // AEPS Cash Deposit
                    'category_code' => 'CASH_DEPOSIT',
                    'description' => 'CD - Commission '.$aadhaarNumber,
                    'admin_id' => $existingUser->admin_id
                ];

                processCommissionCharge($commissionTransactionData);


        
                return response()->json([
                    'status'  => 1,
                    'message' => 'Transaction successful',
                    'data'    => $responseJson,
                    'logo'    => $this->getCompanyLogo($request->get('user')->id)
                ]);

            } 
            else 
            {
            
                $statusCode = $responseJson['statusCode'] ?? null;
                $errorMessage = $responseJson['message'] ?? 'API request failed';

                // Step 1: Prepare transaction data
                $transactionData1 = [
                    'account_id' => $account->id,
                    'type' => 'CR',
                    'amount' => $amount,
                    'description' => $type.' - Failed & Refund '.$aadhaarNumber,
                    'transaction_id' => $merchantTranId,
                    'created_by' => $existingUser->created_by,
                    'admin_id' => $existingUser->admin_id,
                    'user_id' => $credit_user_id,
                    'category_code' => $categoryCode
                ];

                // Step 2: Create the transaction
                $transactionData = createTransaction($transactionData1);

                
    
                
                return response()->json([
                    'status'  => 0,
                    'message' => $errorMessage,
                    'data'    => $responseJson['data']
                ]);
            }


        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'doAeps', $e, [
                'api' => 'https://fpuat.tapits.in/fpaepsv2/api/aeps2fa/merchant/v2/balanceenquiry',
                'context' => 'AEPS Transaction Error',
            ]);

             if (isset($history)) {
                $history->update([
                    "response" => $e->getMessage()
                ]);
            }
          
            return response()->json([
                'status'  => 0,
                'message' => 'Internal Server Error',
                'ref_id'  => $refId,
            ], 500);
        }
    }


    //history
    public function cashDepositHistory(Request $request){

        $request->outletId = $request->outletId ?? $request->mid;

        if(empty($request->outletId)){
                return response()->json([
                'status'  => 0,
                'message' => 'Outlet ID (MID) is required.',
                'data'    => null
            ], 200);
        }

        // Get per_page from request with default 100 and max 500 for security
        $perPage = min($request->get('per_page', 100), 500);
        
        // Get page number from request, default to 1
        $page = max($request->get('page', 1), 1);
        $mid = $request->outletId;
        $key = 'mid';

        // If an admin_id header is provided, use it as the lookup key.
        // Avoid using isset() on the header() call; header() returns null when absent.
    
        if (empty($mid)) {
            $mid=$request->get('admin')->id;
            $key = 'admin_id';
        }
        
        $data = CashDepositHistory::where($key, $mid)
            ->select('mid','merchant_tran_id','request_id','customer_mobile','aadhaar_number','amount','status','device_imei','device_type','ip_address','latitude','longitude','created_at')
            ->paginate($perPage, ['*'], 'page', $page);

        if (!$data || $data->isEmpty()) {
            return response()->json([
                'status'  => 0,
                'message' => 'No transaction history found',
                'data1'=>null
            ], 200);
        }

        return response()->json([
            'status'  => 1,
            'message' => 'Transaction history retrieved successfully',
            'data'    => $data,
            'logo'    => $this->getCompanyLogo($request->get('admin')->id),
            
        ], 200);
    }


}
