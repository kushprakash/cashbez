<?php

namespace App\Http\Controllers\Banking;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\Setting;
use App\Models\Passbook;
use App\Models\Commission;
use App\Models\FundTransfer;
use App\Models\Recharge;
use App\Models\UtilityOperator;
use App\Models\BbpsCategory;
use App\Models\User;
use App\Models\ApiSetting;
use App\Models\ApiOperatorMapping;
use App\Models\ApiPendingSetting;
use App\Models\ApiSpecialSetting;
use App\Models\ApiServiceSetting;
use DB; 
use Illuminate\Support\Facades\Cache;
use App\Services\CatchLogService;

class UtilityController extends Controller
{
    public function mobilePlan(Request $request)
    {
        try {
            $user = $request->get('user');

            if (empty($request->number) && $request->number == NULL ) {
                return response()->json(['status' => 0, 'message' => 'Mobile Number required','data'=>NULL], 200);
            } 
            
            $number = $request->number;
            
            // Check cache first
            $cacheKey = "mobile_plan_{$number}";
            $cachedData = Cache::get($cacheKey);
            
            if ($cachedData) {
                // Return cached data with additional processing
                $res = $cachedData;
                return response()->json($res);
            }
            
            // Get plan from API
            $res = $this->getPlan($number);

            // Check if response is valid
            if (!isset($res['data']['operator'])) {
                Log::warning('Mobile Plan: Invalid response from mobile plan service', ['number' => $number]);
                return response()->json([
                    'status' => 0, 
                    'message' => 'Invalid response from mobile plan service',
                    'data' => $res
                ], 200);
            }


           

            $operator = $res['data']['operator'];

            // Get operator data with null safety
            $operatorData = UtilityOperator::where('code', $operator)->first();

       
            
            if ($operatorData && $operatorData->icon) {
                $res['data']['logo'] = $operatorData->icon;
            } else {
                // Fallback to default logo or keep original operator code
                $res['data']['logo'] = 'https://enexademo.in/nidhi/Uploads/OpratorImage/icons/airtel.png';
            }


            $contactsData = DB::table('contacts')->where('user_id', $user->id)->first();
            if($contactsData){
                $contacts = json_decode($contactsData->contacts) ?? [];

                $contact = collect($contacts)->firstWhere('number', $number);
                $res['data']['name'] = $contact->name ?? 'Unknown';
            }
            else{
                $res['data']['name'] = '';
            }
            // Cache the response for 5 days (5 * 24 * 60 minutes = 7200 minutes)
            Cache::put($cacheKey, $res, 5 * 24 * 60);

            return response()->json($res);

        } catch (\Exception $e) {
            Log::error('Mobile Plan Error: ' . $e->getMessage(), [
                'number' => $request->number ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            CatchLogService::logException($request, 'mobilePlan', $e, [
                'context' => 'Mobile Plan Error',
                'number' => $request->number ?? null,
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch mobile plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    
    private function getPlan($number){
        try {
            $mid = '6315';
            $mkey = 'SANDIPs7384@#$';     
            $ch = curl_init();
            $timeout = 30; // Set reasonable timeout

            $url = "https://planapi.in/api/Mobile/OperatorFetchNew?ApiUserID=" . urlencode($mid) .
                "&ApiPassword=" . urlencode($mkey) .
                "&Mobileno=" . urlencode($number);

            $ch = curl_init();

            curl_setopt_array($ch, [
                CURLOPT_URL            => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HEADER         => false,
                CURLOPT_CONNECTTIMEOUT => 30,
                CURLOPT_TIMEOUT        => 30,
                CURLOPT_SSL_VERIFYPEER => false, // Remove in production if SSL is properly configured
            ]);

            $jsonxx  = curl_exec($ch);
            $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curl_errno = curl_error($ch);
            $curlErrno = curl_errno($ch);

            curl_close($ch);
         
            
            // Check for curl errors
            if ($curl_errno) {
                Log::error('getPlan CURL Error: ' . $curl_error, [
                    'number' => $number,
                    'url' => $myurl2,
                    'curl_errno' => $curl_errno
                ]);
                return ['status' => 0, 'message' => 'Connection error: ' . $curl_error, 'data' => NULL];
            }
            
            $data = json_decode($jsonxx, true);
            
            // Check if JSON decode was successful
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('getPlan JSON Decode Error', [
                    'number' => $number,
                    'response' => $jsonxx,
                    'json_error' => json_last_error_msg()
                ]);
                return ['status' => 0, 'message' => 'Invalid API response', 'data' => NULL];
            }
            
            // Check if required fields exist
            if (!isset($data['OpCode']) || !isset($data['CircleCode']) || !isset($data['STATUS'])) {
                Log::warning('getPlan: Missing required fields in response', [
                    'number' => $number,
                    'response' => $data
                ]);
                return ['status' => 0, 'message' => 'Invalid response structure', 'data' => $data];
            }

            $operator = $data['OpCode'];
            $circle = $data['CircleCode'];
            $status = $data['STATUS'];
            $message = $data['Message'] ?? '';
            $operatorname = $data['Operator'] ?? '';
            $ciname = $data['Circle'] ?? '';

            if ($operator != "" && $status == "1") {



                $url = "https://planapi.in/api/Mobile/MobileRechargePlan?apimember_id=" . urlencode($mid) .
                "&api_password=" . urlencode($mkey) .
                "&operatorcode=" . urlencode($operator) . "&cricle=" . urlencode($circle);

                $ch = curl_init();

                curl_setopt_array($ch, [
                    CURLOPT_URL            => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_HEADER         => false,
                    CURLOPT_CONNECTTIMEOUT => 30,
                    CURLOPT_TIMEOUT        => 30,
                    CURLOPT_SSL_VERIFYPEER => false, // Remove in production if SSL is properly configured
                ]);

                $res_data  = curl_exec($ch);
                $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $curl_errno = curl_error($ch);
                $curlErrno = curl_errno($ch);

                curl_close($ch);

                // Check for curl errors on plan fetch
                if ($curl_errno) {
                    Log::error('getPlan Rplan CURL Error: ' . $curl_error, [
                        'number' => $number,
                        'operator' => $operator,
                        'circle' => $circle,
                        'curl_errno' => $curl_errno
                    ]);
                    return ['status' => 0, 'message' => 'Failed to fetch plans: ' . $curl_error, 'data' => NULL];
                }
                
                $x = json_decode($res_data,true);
                
                // Check if plan data exists
                if (!$x || !isset($x['RDATA'])) {
                    Log::warning('getPlan: No plan data in response', [
                        'number' => $number,
                        'operator' => $operator,
                        'circle' => $circle,
                        'response' => $res_data
                    ]);
                    // Return success with empty plans instead of failing
                    $ds = [
                        'operatorname' => $operatorname,
                        'operator' => $operator,
                        'circalname' => $ciname,
                        'circal' => $circle,
                        'plan' => []
                    ];
                    return ['status' => 1, 'message' => 'success', 'data' => $ds];
                }

                $d = $x['RDATA'];

                $ds = [
                    'operatorname' => $operatorname,
                    'operator' => $operator,
                    'circalname' => $ciname, 
                    'circal' => $circle, 
                    'plan' => $d,
                ];
                
                return ['status' => 1, 'message' => 'success', 'data' => $ds];

            } else {
                Log::info('getPlan: Invalid mobile number or failed status', [
                    'number' => $number,
                    'status' => $status,
                    'message' => $message
                ]);
                return ['status' => 0, 'message' => 'Invalid Mobile Number', 'data' => $data];
            }
            
        } catch (\Exception $e) {
            Log::error('getPlan Exception: ' . $e->getMessage(), [
                'number' => $number,
                'trace' => $e->getTraceAsString()
            ]);
            return ['status' => 0, 'message' => 'Error fetching plan: ' . $e->getMessage(), 'data' => NULL];
        }
    }

    /**
     * Process mobile recharge request
     */



    public function processRecharge(Request $request,$api_count=1,$transactionData=[])
    {
        try {
            // Sanitize $api_count if injected from route defaults (e.g. smodule=2) on initial request
            if (empty($transactionData) || !is_numeric($api_count)) {
                $api_count = 1;
            } else {
                $api_count = (int)$api_count;
            }
            // ✅ Step 1: Validate required fields
            $requiredFields = ['type', 'transaction_id', 'number', 'amount', 'operator'];
            foreach ($requiredFields as $field) {
                if (empty($request->$field)) {
                    return response()->json([
                        'status' => 0,
                        'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required',
                        'data' => null
                    ], 200);
                }
            }


            // ✅ Step 2: Set type-dependent values
            if ($request->type == 3 ) {
                $circal = '';
                $sub_module_id = 4;
                $desc = 'Bill Payment';
            } else if ($request->type == 2 ) {
                $circal = '';
                $sub_module_id = 3;
                $desc = 'DTH Recharge';
            } else {
                if (empty($request->circal)) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Circle is required',
                        'data' => null
                    ], 200);
                }
                $circal = $request->circal;
                $sub_module_id = 2;
                $desc = 'Mobile Recharge';
            }

            $request->transaction_id = rand(1111111111,9999999999);
            // Check Service availability & ApiSetting match FIRST before debiting money
            $operatorInput = $request->operator;
            $amount = $request->amount;
            $type = $request->type;
            $txnid = $request->transaction_id;
            $user1 = (string) $txnid;   
            $account_number = $number = $request->number;
            $customer_number = $user->mobile ?? '';
            $validity = $request->validity ?? '';
            $plan = json_encode($request->plan ?? '');

            $utilityOperator = DB::table('utility_operators')->where('code', $operatorInput)->first();
            $mainServiceType = $utilityOperator->category ?? '';

            if (empty($mainServiceType)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Service Not Available',
                    'data' => null
                ], 200);
            }

            $apiSetting = null;

            // Priority 1: Check Special Plan rules (Matching Circle, Operator, Amount)
            // Order by specificity: (Circle match > ALL) -> (Operator match > ALL) -> (Amount match > 0)
            $specialRule = ApiSpecialSetting::where('is_active', true)
                ->where(function($q) use ($operatorInput) {
                    $q->where('operator_code', strtoupper($operatorInput))
                      ->orWhere('operator_code', 'ALL')
                      ->orWhereNull('operator_code');
                })
                ->where(function($q) use ($amount) {
                    $q->where('amount', $amount)
                      ->orWhere('amount', 0)
                      ->orWhereNull('amount');
                })
                ->where(function($q) use ($circal) {
                    $q->where('circle', 'ALL')
                      ->orWhereNull('circle')
                      ->orWhere('circle', '');
                    if (!empty($circal)) {
                        $q->orWhere('circle', strtoupper($circal))
                          ->orWhere('circle', $circal);
                    }
                })
                ->orderByRaw("
                    (CASE WHEN circle != 'ALL' AND circle IS NOT NULL AND circle != '' THEN 4 ELSE 0 END) +
                    (CASE WHEN operator_code != 'ALL' AND operator_code IS NOT NULL THEN 2 ELSE 0 END) +
                    (CASE WHEN amount > 0 THEN 1 ELSE 0 END) DESC
                ")
                ->first();

            if ($specialRule) {
                $specialApi = ApiSetting::where('id', $specialRule->api_id)
                    ->where('is_active', true)
                    ->whereJsonContains('services', $mainServiceType)
                    ->first();
                if ($specialApi) {
                    $apiSetting = $specialApi;
                }
            }

            $serviceSetting = ApiServiceSetting::where('service_type', 'LIKE', '%' . $mainServiceType . '%')->first();
            $api1=$serviceSetting->api_1 ?? null;
            $api2=$serviceSetting->api_2 ?? null;
            $api3=$serviceSetting->api_3 ?? null;
            $api4=$serviceSetting->api_4 ?? null;

            $total_api_count=0;

            if(!empty($api4)){
                $total_api_count=4;   
            }elseif(!empty($api3)){
                $total_api_count=3;
            }elseif(!empty($api2)){
                $total_api_count=2;
            }else{
                $total_api_count=1;
            }

            // Priority 2: Service-Wise API Setting (Serial number sequence configured by Admin)
            if (!$apiSetting && $total_api_count>0) {
                if ($serviceSetting) {
                    $api_id=$serviceSetting->{'api_' . $api_count};
                    $apiSetting = ApiSetting::where('id', $api_id)->first();
                }
            }
            
            // Priority 3: Fallback Active API selection considering Pending Thresholds & Circle restriction
            if (!$apiSetting) {
                $candidateApis = ApiSetting::where('is_active', true)
                    ->where(function($q) use ($circal) {
                        $q->where('circle', 'ALL')
                          ->orWhereNull('circle')
                          ->orWhere('circle', '');
                        if (!empty($circal)) {
                            $q->orWhere('circle', strtoupper($circal))
                              ->orWhere('circle', $circal);
                        }
                    })
                    ->whereJsonContains('services', $mainServiceType)
                    ->orderBy('id', 'desc')
                    ->get();

                // Determine current time frame (7AM- 12PM, 5PM- 10PM, OTHER)
                $currentHour = (int) now()->format('H');
                if ($currentHour >= 7 && $currentHour < 12) {
                    $currentTimeFrame = '7AM- 12PM';
                } elseif ($currentHour >= 17 && $currentHour < 22) {
                    $currentTimeFrame = '5PM- 10PM';
                } else {
                    $currentTimeFrame = 'OTHER';
                }

                foreach ($candidateApis as $candApi) {
                    // Check if pending threshold is configured for this API, Service, Operator, and Timeframe
                    $pendingRule = ApiPendingSetting::where('api_id', $candApi->id)
                        ->where('service_type', $mainServiceType)
                        ->where('operator_code', strtoupper($operatorInput))
                        ->where(function($q) use ($currentTimeFrame) {
                            $q->where('time_frame', $currentTimeFrame)
                              ->orWhere('time_frame', str_replace(' ', '', $currentTimeFrame));
                        })
                        ->first();

                    if ($pendingRule && $pendingRule->max_pending_count > 0) {
                        // Count current pending recharges for this API & operator
                        $currentPendingCount = Recharge::where(function($q) use ($candApi) {
                                $q->where('api_id', $candApi->id)
                                  ->orWhere('api_settings', $candApi->id);
                            })
                            ->where('oprator', $operatorInput)
                            ->where('status', 'pending')
                            ->count();

                        if ($currentPendingCount >= $pendingRule->max_pending_count) {
                            Log::info("Pending API limit reached for API ID {$candApi->id} ({$candApi->api_name}). Current: {$currentPendingCount}, Max: {$pendingRule->max_pending_count}. Switching to next API.");
                            continue;
                        }
                    }

                    // Valid API found!
                    $apiSetting = $candApi;
                    break;
                }

                // Fallback to first candidate API if all are at capacity or none matched rule
                if (!$apiSetting && $candidateApis->isNotEmpty()) {
                    $apiSetting = $candidateApis->first();
                }
            }

            if (!$apiSetting || empty($apiSetting->recharge_config)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Service Not Available',
                    'data' => null
                ], 200);
            }

            //return response()->json(['status' => 0,'message' => 'API Service','data' => $apiSetting], 200);

            if($api_count==1 || empty($transactionData)){

                // ✅ Step 3: Prepare transaction data & debit wallet
                $transactionData = [
                    'account_id' => $request->account_id,
                    'mpin' => $request->mpin,
                    'type' => 'DR',
                    'amount' => $request->amount,
                    'transaction_amount' => $request->amount,
                    'description' => $desc.' - '.$request->number,
                    'transaction_id' => $txnid,
                    'category_code' => 'RECHARGE'
                ];

                // Debit transaction
                $transactionData = processTransaction($request, $transactionData);

                if (empty($transactionData['status']) || $transactionData['status'] != 1) {
                    return response()->json([
                        'status' => 0,
                        'message' => $transactionData['message'] ?? 'Recharge Transaction failed',
                        'data' => null
                    ], 200);
                }

            }


            // Continue if wallet debit transaction was successful
            if (!empty($transactionData['status']) && $transactionData['status'] == 1) {

                $rechargeConfig = is_array($apiSetting->recharge_config) 
                    ? $apiSetting->recharge_config 
                    : json_decode($apiSetting->recharge_config, true);

                // ✅ Step 5: Lookup Operator Code for Provider (from api_operator_mappings or utility_operators)
                $mappedOperatorCode = $operatorInput;
                $utilityOp = UtilityOperator::where('code', $operatorInput)->first();

             

                if ($utilityOp) {
                    $mapping = ApiOperatorMapping::where('api_id', $apiSetting->id)
                        ->where('utility_operator_id', $utilityOp->id)
                        ->first();
                    if ($mapping && !empty($mapping->api_operator_code)) {
                        $mappedOperatorCode = $mapping->api_operator_code;
                    } else if (!empty($utilityOp->code)) {
                        $mappedOperatorCode = $utilityOp->code;
                    }
                }


                // ✅ Step 6: Dynamically Build API Parameters from recharge_config
                $targetUrl = $rechargeConfig['url'] ?? '';
                $requestType = strtoupper($rechargeConfig['request_type'] ?? 'GET');
                $paramsConfig = $rechargeConfig['params'] ?? [];
                $finalParams = [];

                $context = [
                    'number'          => $number,
                    'customer_number' => $customer_number,
                    'account_number'  => $account_number,
                    'amount'          => $amount,
                    'operator'        => $mappedOperatorCode,
                    'circle'          => $circal,
                    'txnid'           => $user1,
                    'oid'             => $user1,
                    'refrence_id'     => $user1,
                    'reference_id'    => $user1,
                    'account_id'      => $request->account_id,
                    'type'            => $type,
                    'user'            => $request->get('user'),
                    'request'         => $request,
                ];

                if (is_array($paramsConfig)) {
                    foreach ($paramsConfig as $p) {
                        $paramKey = $p['key'] ?? $p['name'] ?? null;
                        if (empty($paramKey)) continue;

                        $finalParams[$paramKey] = $this->resolveApiParameter($p, $context);
                    }
                }

                // ✅ Step 7: Log API Request BEFORE Call
                DB::table('logs')->insert([
                    'mid'          => $request->get('user')->mid ?? null,
                    'type'         => $request->type == 2 ? 'DTH_Recharge' : 'Mobile_Recharge',
                    'platform'     => 'API',
                    'headers'      => json_encode(["Content-Type" => "application/x-www-form-urlencoded"]),
                    'request_data' => json_encode([
                        'api_id' => $apiSetting->id,
                        'api_name' => $apiSetting->api_name,
                        'target_url' => $targetUrl,
                        'request_type' => $requestType,
                        'parameters' => $finalParams
                    ]),
                    'url'          => $targetUrl,
                    'txnid'        => $user1,
                    'status'       => 0,
                    'timestamp'    => now(),
                    'created_at'   => now()->format('Y-m-d H:i:s'),
                ]);

               

             

                // ✅ Step 8: Safe cURL Execution according to request_type (GET, POST, POST JSON)
                $ch = curl_init();
                $actualUrl = $targetUrl;

                if (str_contains($requestType, 'POST')) {
                    curl_setopt($ch, CURLOPT_URL, $actualUrl);
                    curl_setopt($ch, CURLOPT_POST, true);
                    if (str_contains($requestType, 'JSON')) {
                        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($finalParams));
                        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                    } else {
                        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($finalParams));
                    }
                } else {
                    // GET Request
                    if (!empty($finalParams)) {
                        $actualUrl .= (str_contains($targetUrl, '?') ? '&' : '?') . http_build_query($finalParams);
                    }
                    curl_setopt($ch, CURLOPT_URL, $actualUrl);
                }

                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_TIMEOUT => 90,
                    CURLOPT_SSL_VERIFYPEER => false,
                    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                ]);

                $res_data = curl_exec($ch);
                $curl_error = curl_error($ch);
                curl_close($ch);

                if ($curl_error) {
                    throw new \Exception("CURL Error: " . $curl_error);
                }

                // Parse JSON or XML response to associative array
                $rj = $this->parseApiResponseToArray($res_data);

                // ✅ Step 9: Dynamic Status & Field Extraction from recharge_config
                $statusKey = !empty($rechargeConfig['key_for_status']) ? $rechargeConfig['key_for_status'] : 'status';
                $rawStatus = data_get($rj, $statusKey);

                // Fallback to common status keys if primary key is missing/null in JSON or XML
                if ($rawStatus === null) {
                    $rawStatus = data_get($rj, 'status') 
                        ?? data_get($rj, 'Status') 
                        ?? data_get($rj, 'STATUS') 
                        ?? data_get($rj, 'data.status') 
                        ?? data_get($rj, 'data.Status') 
                        ?? data_get($rj, 'response_status') 
                        ?? data_get($rj, 'status_code') 
                        ?? data_get($rj, 'ERRORCODE') 
                        ?? data_get($rj, 'errorcode') 
                        ?? data_get($rj, 'data.errorcode') 
                        ?? data_get($rj, 'resCode');
                }

                $evalStatus = $this->evaluateStatusResponse(
                    $rawStatus,
                    $rechargeConfig['result_success'] ?? '',
                    $rechargeConfig['result_failure'] ?? ''
                );

                if ($evalStatus === 'success') {
                    $sts = 1;
                    $sts2 = 'success';
                } elseif ($evalStatus === 'failed') {
                    $sts = 0;
                    $sts2 = 'failed';
                } else {
                    // Default to pending if ambiguous or unlisted status
                    $sts = 2;
                    $sts2 = 'pending';
                }

                 DB::table('logs')
                ->where('txnid', (string) $user1)
                ->where('type', $request->type == 2 ? 'DTH_Recharge' : 'Mobile_Recharge')
                ->update([
                    'response_data' => json_encode($rj),
                    'status'        => $sts,
                    'updated_at'    => now(),
                ]);

                
                if($sts==0 && $api_count<$total_api_count){
                    $api_count=$api_count+1;
                    return $this->processRecharge($request,$api_count,$transactionData);
                }


               

                // Log Recharge entry in `recharges` DB table
                $rdata = [
                    'api_id' => $apiSetting->id ?? null,
                    'api_settings' => $apiSetting->id ?? 0,
                    'user_id' => $request->get('user')->id,
                    'number' => $number,
                    'oprator' => $mappedOperatorCode,
                    'amount' => $amount,
                    'status' => "pending",
                    'validity' => $validity,
                    'plan' => $plan,
                    'type' => $type,
                    'oid' => $user1,
                    'txnid' => $user1,
                    'call_back_url' => $request->call_back_url ?? '',
                    'admin_id' => $request->get('admin')->id,
                    'created_by' => $request->get('user')->id,
                    'request_data' => json_encode([
                        'url' => $targetUrl,
                        'api_id' => $apiSetting->id,
                        'parameters' => $finalParams
                    ])
                ];

                Recharge::create($rdata);

                $supplierKey = $rechargeConfig['supplier_id_key'] ?? 'txn_id';
                $oprTxnKey = $rechargeConfig['opr_txn_id_key'] ?? 'opt_id';

                $msgKey = $rechargeConfig['message_key'] ?? $rechargeConfig['msg_key'] ?? null;

                $txn = data_get($rj, $supplierKey) 
                    ?? data_get($rj, 'txn_id') 
                    ?? data_get($rj, 'RPID') 
                    ?? data_get($rj, 'rpid') 
                    ?? data_get($rj, 'orderId') 
                    ?? data_get($rj, 'data.rpid') 
                    ?? $user1;

                $ope = data_get($rj, $oprTxnKey) 
                    ?? data_get($rj, 'opt_id') 
                    ?? data_get($rj, 'OPID') 
                    ?? data_get($rj, 'opid') 
                    ?? data_get($rj, 'operator') 
                    ?? data_get($rj, 'data.opid') 
                    ?? $mappedOperatorCode;
                
                $rem = ($msgKey ? data_get($rj, $msgKey) : null)
                    ?? data_get($rj, 'message')
                    ?? data_get($rj, 'Message')
                    ?? data_get($rj, 'MESSAGE')
                    ?? data_get($rj, 'resText')
                    ?? data_get($rj, 'res_text')
                    ?? data_get($rj, 'msg')
                    ?? data_get($rj, 'MSG')
                    ?? data_get($rj, 'Msg')
                    ?? data_get($rj, 'error')
                    ?? data_get($rj, 'error_message')
                    ?? data_get($rj, 'remark')
                    ?? data_get($rj, 'remarks')
                    ?? data_get($rj, 'description')
                    ?? data_get($rj, 'data.msg')
                    ?? data_get($rj, 'data.message')
                    ?? data_get($rj, 'data.Message')
                    ?? data_get($rj, 'data.error')
                    ?? data_get($rj, 'data.remark')
                    ?? data_get($rj, 'data.description')
                    ?? null;

                if (empty($rem) && is_array($rj)) {
                    $iterator = new \RecursiveIteratorIterator(
                        new \RecursiveArrayIterator($rj),
                        \RecursiveIteratorIterator::SELF_FIRST
                    );
                    foreach ($iterator as $k => $v) {
                        if (in_array(strtolower((string)$k), ['message', 'restext', 'msg', 'error', 'remark', 'remarks', 'description', 'detail', 'details', 'reason', 'errmsg'])) {
                            if (is_string($v) || is_numeric($v)) {
                                $rem = (string) $v;
                                if (!empty($rem)) break;
                            } elseif (is_array($v) || is_object($v)) {
                                $rem = json_encode($v);
                                if (!empty($rem)) break;
                            }
                        }
                    }
                }

                if (is_array($rem) || is_object($rem)) {
                    $rem = json_encode($rem);
                }

                if (empty($rem)) {
                    $rem = 'No Response Message';
                }

                $rem1 = ($rem === 'Insufficient Balance') ? 'Server Down Try again' : $rem;

                $jsonResponseData = is_array($rj) ? json_encode($rj, JSON_UNESCAPED_SLASHES) : $res_data;
                $opeStr = (is_array($ope) || is_object($ope)) ? '' : (string)$ope;
                $txnStr = (is_array($txn) || is_object($txn)) ? '' : (string)$txn;

                // Update Recharge DB Record
                Recharge::where('oid', (string) $user1)->update([
                    'status' => $sts2,
                    'rrmarks' => $rem1,
                    'oprator' => $opeStr,
                    'txnid' => $txnStr,
                    'response_data' => $jsonResponseData
                ]);

                // Update logs table
              

                // ✅ Step 10: Handle Failed Recharge (Refund Wallet)
                if ($sts === 0) {
                    $transactionData1 = [
                        'account_id' => $request->account_id,
                        'mpin' => $request->mpin,
                        'type' => 'CR',
                        'amount' => $request->amount,
                        'transaction_amount' => $request->amount,
                        'description' => 'Recharge Failed & Refund',
                        'transaction_id' => $request->transaction_id . '-0',
                        'category_code' => 'RECHARGE'
                    ];
                    processTransaction($request, $transactionData1);

                    $keysToRemove = ['Bal', 'bal', 'balance', 'utilityBalance', 'mainBalance', 'aepsBalance'];
                    $rj1 = is_array($rj) ? array_diff_key($rj, array_flip($keysToRemove)) : $rj;

                    return response()->json([
                        'status' => 0,
                        'message' => (!empty($rem1) && $rem1 !== 'No Response Message') ? $rem1 : 'Recharge Failed with technical issue',
                        'data' => $rj1
                    ], 200);
                }

                // ✅ Step 11: Handle Success Recharge (Process Commission)
                if ($sts === 1) {
                    $userObj = $request->get('user');
                    if ($userObj) {
                        $commResult = \App\Http\Controllers\Banking\CommissionMasterController::calculateUserCommission(
                            $userObj,
                            $apiSetting->id ?? null,
                            $mainServiceType ?? 'Prepaid',
                            $operatorInput ?? 'ALL',
                            $circal ?? 'ALL',
                            $amount
                        );

                        $account = DB::table('accounts')->where('user_id', $userObj->id)->where('primary_status', false)->first();

                    
                        $transactionData13 = [
                            'account_id' => $account->id,
                            'type' => 'CR',
                            'amount' => $commResult['calculated_commission'],
                            'description' => $request->type == 3 ? 'Bill Payment Commission' : 'Recharge Commission',
                            'transaction_id' => $request->transaction_id.'_comm',
                            'created_by' => $account->user_id,
                            'admin_id' => $account->admin_id,
                            'user_id' => $account->user_id,
                            'category_code' => 'RECHARGE'
                        ];

                        $transactionData2 = createTransaction($transactionData13);
                    }
                    
                }

                // ✅ Step 12: Return Final Response
                $transactionData = [
                    'orderId' => $txn,
                    'txnId' => $user1,
                    'resText' => $rem,
                    'operator' => $ope
                ];

                return response()->json([
                    'status' => $sts === 2 ? 2 : 1,
                    'message' => (!empty($rem1) && $rem1 !== 'No Response Message') ? $rem1 : ($sts === 2 ? 'Recharge is pending' : 'Recharge processed successfully'),
                    'data' => $transactionData
                ], 200);
            }



           
            // Fallback if transaction validation failed
            return response()->json([
                'status' => 0,
                'message' => $transactionData['message'] ?? 'Transaction failed',
                'data' => null
            ], 200);

        } catch (\Illuminate\Database\QueryException $e) {
            CatchLogService::logException($request, 'mobileRecharge', $e, [
                'context' => 'Mobile Recharge Database Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Database error occurred: ' . $e->getMessage(),
                'data' => null
            ], 500);

        } catch (\Exception $e) {
            CatchLogService::logException($request, 'mobileRecharge', $e, [
                'context' => 'Mobile Recharge Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'An unexpected error occurred: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }



    public function cronCheckStatus()
    {
        $recharges = Recharge::where('status', 'pending')->get();

        $results = [];

        foreach ($recharges as $recharge) {

            // Check status
            $result = $this->checkRechargeStatusDynamic($recharge);

            // Get latest DB data after status update
            $recharge->refresh();

            if (is_array($result)) {

                $results[] = [
                    'status' => $result['status'] ?? 1,
                    'message' => $result['message'] ?? ('Recharge Status: ' . $recharge->status),
                    'data' => $result['data'] ?? $recharge,
                    'raw_response' => $result['raw_response'] ?? null,
                ];

            } else {

                $results[] = [
                    'status' => 1,
                    'message' => 'Recharge Status: ' . $recharge->status,
                    'data' => $recharge,
                    'raw_response' => null,
                ];
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Recharge status checking completed',
            'total' => count($results),
            'data' => $results
        ], 200);
    }

    public function checkStatus(Request $request) {
        try {
            $txnid = $request->input('txnid') ?? $request->txnid;
            if (empty($txnid)) {
                return response()->json(['status' => 0, 'message' => 'Transaction ID is required'], 200);
            }

            $recharge = Recharge::where('txnid', $txnid)->orWhere('oid', $txnid)->first(); 
            if ($recharge) {
                if ($recharge->status == 'pending') {
                    $result = $this->checkRechargeStatusDynamic($recharge);
                    $recharge->refresh();

                    if (is_array($result)) {
                        return response()->json([
                            'status' => $result['status'] ?? 1,
                            'message' => $result['message'] ?? ('Recharge Status: ' . $recharge->status),
                            'data' => $result['data'] ?? $recharge,
                            'raw_response' => $result['raw_response'] ?? null
                        ], 200);
                    }
                }
                return response()->json([
                    'status' => 1, 
                    'message' => 'Recharge Status: ' . $recharge->status,
                    'data' => $recharge
                ], 200);
            } else {
                return response()->json(['status' => 0, 'message' => 'Recharge not found'], 200);
            }
        } catch (\Exception $e) {
            Log::error("checkStatus Exception: " . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Internal Error checking status: ' . $e->getMessage()
            ], 200);
        }
    }

    private function checkRechargeStatusDynamic($recharge)
    {
        try {
            if (!$recharge) {
                return ['status' => 0, 'message' => 'Recharge record not found'];
            }

            $apiId = $recharge->api_id;
            $apiSetting = $apiId ? ApiSetting::find($apiId) : null;

            $statusConfig = null;
            if ($apiSetting && !empty($apiSetting->status_check_config)) {
                $statusConfig = is_array($apiSetting->status_check_config)
                    ? $apiSetting->status_check_config
                    : json_decode($apiSetting->status_check_config, true);
            }

            // Fallback to legacy gotercheckStatus if status_check_config is missing
            if (!$statusConfig || empty($statusConfig['url'])) {
                $msg = "Status check config missing or URL not defined for API ID " . ($recharge->api_id ?? 'N/A');
                Log::warning("checkRechargeStatusDynamic: {$msg} for TxnID " . ($recharge->txnid ?: $recharge->oid));
                return ['status' => 0, 'message' => $msg];
            }

            $targetUrl = $statusConfig['url'] ?? '';
            $requestType = strtoupper($statusConfig['request_type'] ?? 'GET');
            $paramsConfig = $statusConfig['params'] ?? [];
            $finalParams = [];

            $rechargeDate = $recharge->created_at ? date('Y-m-d', strtotime($recharge->created_at)) : date('Y-m-d');
            $rechargeDate = $recharge->created_at ? date('Y-m-d', strtotime($recharge->created_at)) : date('Y-m-d');
            $rechargeDateDmy = $recharge->created_at ? date('d-m-Y', strtotime($recharge->created_at)) : date('d-m-Y');
            $rechargeDateDmySlash = $recharge->created_at ? date('d/m/Y', strtotime($recharge->created_at)) : date('d/m/Y');
            $rechargeCreatedAt = $recharge->created_at ? date('Y-m-d H:i:s', strtotime($recharge->created_at)) : date('Y-m-d H:i:s');
            $txnid = $recharge->txnid ?: $recharge->oid;
            $oid = $recharge->oid ?: $recharge->txnid;
            $userObj = User::find($recharge->user_id);

            $context = [
                'number' => $recharge->number,
                'amount' => $recharge->amount,
                'operator' => $recharge->oprator,
                'circle' => $recharge->circle ?? 'ALL',
                'txnid' => $txnid,
                'oid' => $oid,
                'refrence_id' => $oid,
                'reference_id' => $oid,
                'recharge_date' => $rechargeDate,
                'date_dmy' => $rechargeDateDmy,
                'date_dmy_slash' => $rechargeDateDmySlash,
                'created_at' => $rechargeCreatedAt,
                'user' => $userObj,
            ];

            if (is_array($paramsConfig)) {
                foreach ($paramsConfig as $p) {
                    $paramKey = $p['key'] ?? $p['name'] ?? null;
                    if (empty($paramKey)) continue;

                    $finalParams[$paramKey] = $this->resolveApiParameter($p, $context);
                }
            }

            // Execute cURL based on request_type
            $ch = curl_init();
            $actualUrl = $targetUrl;

            if (str_contains($requestType, 'POST')) {
                curl_setopt($ch, CURLOPT_URL, $actualUrl);
                curl_setopt($ch, CURLOPT_POST, true);
                if (str_contains($requestType, 'JSON')) {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($finalParams));
                    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                } else {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($finalParams));
                }
            } else {
                if (!empty($finalParams)) {
                    $actualUrl .= (str_contains($targetUrl, '?') ? '&' : '?') . http_build_query($finalParams);
                }
                curl_setopt($ch, CURLOPT_URL, $actualUrl);
            }

            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => 30,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            ]);

            $res_data = curl_exec($ch);
            $curl_error = curl_error($ch);
            curl_close($ch);

            if ($curl_error) {
                $msg = "cURL error while checking status for TxnID {$txnid}: " . $curl_error;
                Log::error("checkRechargeStatusDynamic {$msg}");
                return ['status' => 0, 'message' => $msg];
            }

            // Parse JSON or XML response to associative array
            $rj = $this->parseApiResponseToArray($res_data);

            if (empty($rj) || !is_array($rj)) {
                $msg = "Unable to parse API response for TxnID {$txnid}: " . substr($res_data, 0, 300);
                Log::warning("checkRechargeStatusDynamic: {$msg}", ['res_data' => $res_data]);
                return ['status' => 0, 'message' => $msg, 'raw_response' => $res_data];
            }

            // Extract status value
            $statusKey = !empty($statusConfig['key_for_status']) ? $statusConfig['key_for_status'] : 'status';
            $rawStatus = data_get($rj, $statusKey);
            if ($rawStatus === null) {
                $rawStatus = data_get($rj, 'status') 
                    ?? data_get($rj, 'STATUS') 
                    ?? data_get($rj, 'Status') 
                    ?? data_get($rj, 'response_status') 
                    ?? data_get($rj, 'status_code') 
                    ?? data_get($rj, 'ERRORCODE') 
                    ?? data_get($rj, 'errorcode') 
                    ?? data_get($rj, 'resCode');
            }

            if ($rawStatus === null) {
                $msg = "No status key '{$statusKey}' found in provider response for TxnID {$txnid}";
                Log::warning("checkRechargeStatusDynamic: {$msg}", ['response' => $rj]);
                return ['status' => 0, 'message' => $msg, 'raw_response' => $rj];
            }

            $localStatus = $this->evaluateStatusResponse(
                $rawStatus,
                $statusConfig['result_success'] ?? '',
                $statusConfig['result_failure'] ?? ''
            );

            // If status is still pending, no DB update needed
            if ($localStatus === 'pending') {
                $msg = "Provider status ('" . (is_scalar($rawStatus) ? $rawStatus : json_encode($rawStatus)) . "') is still pending for TxnID {$txnid}";
               // return ['status' => 2, 'message' => $msg, 'data' => $recharge, 'raw_response' => $rj];
            }

            // Extract operator transaction ID & remark message
            $supplierKey = $statusConfig['supplier_id_key'] ?? 'txn_id';
            $oprTxnKey = $statusConfig['opr_txn_id_key'] ?? 'opt_id';
            $msgKey = $statusConfig['message_key'] ?? $statusConfig['msg_key'] ?? null;

            $supplierTxn = data_get($rj, $supplierKey) 
                ?? data_get($rj, 'txn_id') 
                ?? data_get($rj, 'txnid') 
                ?? data_get($rj, 'RPID') 
                ?? data_get($rj, 'rpid') 
                ?? $txnid;

            $oprTxn = data_get($rj, $oprTxnKey) 
                ?? data_get($rj, 'opt_id') 
                ?? data_get($rj, 'OPID') 
                ?? data_get($rj, 'opid') 
                ?? data_get($rj, 'operator') 
                ?? $recharge->oprator;

            $rem = ($msgKey ? data_get($rj, $msgKey) : null)
                ?? data_get($rj, 'message')
                ?? data_get($rj, 'resText')
                ?? data_get($rj, 'msg')
                ?? data_get($rj, 'MSG')
                ?? data_get($rj, 'error')
                ?? 'Status updated to ' . $localStatus;

            if (is_array($rem) || is_object($rem)) {
                $rem = json_encode($rem);
            }

            // Update Recharge DB record
            $recharge->status = $localStatus;
            $recharge->oprator = $oprTxn ?: $recharge->oprator;
            $recharge->rrmarks = $rem;
            $recharge->response_data = $res_data;
            $recharge->save();

            $userObj = User::find($recharge->user_id);

            // Log API Request / Response
            DB::table('logs')->insert([
                'mid'          => $userObj ? $userObj->mid : null,
                'type'         => 'Recharge Check Status',
                'platform'     => 'API',
                'headers'      => json_encode(["Content-Type" => "application/x-www-form-urlencoded"]),
                'request_data' => json_encode([
                    'api_id' => $recharge->api_id,
                    'target_url' => $targetUrl,
                    'request_type' => $requestType,
                    'parameters' => $finalParams
                ]),
                'response_data' => $res_data,
                'url'          => $targetUrl,
                'txnid'        => $txnid,
                'status'       => ($localStatus === 'success') ? 1 : 0,
                'timestamp'    => now(),
                'created_at'   => now()->format('Y-m-d H:i:s'),
            ]);

            if ($localStatus === 'pending') {
                $msg = (!empty($rem) && is_string($rem)) ? $rem : ("Provider status ('" . (is_scalar($rawStatus) ? $rawStatus : json_encode($rawStatus)) . "') is still pending for TxnID {$txnid}");
                return ['status' => 2, 'message' => $msg, 'data' => $recharge, 'raw_response' => $rj];
            }

            // Handle SUCCESS (Commission Processing)
            if ($localStatus === 'success') {
                if ($recharge->type == 1) {
                    $desc = 'Mobile Recharge Commission';
                    $mainServiceType = 'Prepaid';
                } elseif ($recharge->type == 2) {
                    $desc = 'DTH Recharge Commission';
                    $mainServiceType = 'DTH';
                } elseif ($recharge->type == 3) {
                    $desc = 'Bill Pay Commission';
                    $mainServiceType = 'BillPay';
                } else {
                    $desc = 'Recharge Commission';
                    $mainServiceType = 'Other';
                }

                if ($userObj) {
                    $commResult = \App\Http\Controllers\Banking\CommissionMasterController::calculateUserCommission(
                        $userObj,
                        $recharge->api_id ?? null,
                        $mainServiceType ?? 'Prepaid',
                        $recharge->operator ?? 'ALL',
                        $recharge->circle ?? 'ALL',
                        $recharge->amount
                    );

                    $account = DB::table('accounts')->where('user_id', $recharge->user_id)->where('primary_status', false)->first();
                    if ($account) {
                        $transactionData13 = [
                            'account_id' => $account->id,
                            'type' => 'CR',
                            'amount' => $commResult['calculated_commission'] ?? 0,
                            'description' => $desc . ' ' . $recharge->number,
                            'transaction_id' => $recharge->txnid . '_comm',
                            'created_by' => $account->user_id,
                            'admin_id' => $account->admin_id,
                            'user_id' => $account->user_id,
                            'category_code' => 'RECHARGE'
                        ];

                        createTransaction($transactionData13);
                    }
                }
            }

            // Handle FAILED (Wallet Refund)
            if ($localStatus === 'failed') {
                $user = User::find($recharge->user_id);
                if ($user) {
                    $account = DB::table('accounts')->where('user_id', $user->id)->where('primary_status', false)->first();

                    if ($account) {
                        $refundTxnId = $recharge->txnid . '-R';

                        $transactionData = [
                            'account_id'     => $account->id,
                            'type'           => 'CR',
                            'amount'         => $recharge->amount,
                            'description'    => 'Recharge Failed & Refunded: ' . $recharge->number,
                            'transaction_id' => $refundTxnId,
                            'created_by'     => $user->id,
                            'admin_id'       => $recharge->admin_id,
                            'user_id'        => $user->id,
                            'category_code'  => 'RECHARGE',
                        ];

                        createTransaction($transactionData);
                    }
                }
            }

            // Handle API Partner Callback if configured
            $admin = User::find($recharge->admin_id);
            if ($admin && $admin->is_api_partner) {
                $setting = Setting::where('user_id', $admin->id)->first();
                if ($setting && !empty($setting->call_back_url)) {
                    try {
                        $postData = [
                            "type"   => "recharge",
                            "status" => $localStatus === 'success' ? 'SUCCESS' : 'FAILED',
                            "txnId"  => $txnid,
                        ];

                        $payload = json_encode($postData);

                        $ch = curl_init($setting->call_back_url);
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($ch, CURLOPT_POST, true);
                        curl_setopt($ch, CURLOPT_HTTPHEADER, [
                            'Content-Type: application/json',
                            'Content-Length: ' . strlen($payload)
                        ]);
                        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                        curl_exec($ch);
                        curl_close($ch);
                    } catch (\Exception $e) {
                        Log::error('API Partner callback error: ' . $e->getMessage());
                    }
                }
            }

            

        } catch (\Exception $e) {
            Log::error("checkRechargeStatusDynamic Exception for TxnID {$recharge->txnid}: " . $e->getMessage());
            return [
                'status' => 0,
                'message' => 'Exception: ' . $e->getMessage(),
                'data' => $recharge,
                'error' => ['message'=>$e->getMessage(), 'code'=>$e->getCode(), 'line'=>$e->getLine(), 'file'=>$e->getFile()],
                'raw_response' => null
            ];
        }
    }


    /**
     * Get mobile recharge report with filtering options
     */
    public function mobileRechargeReport(Request $request)
    {
        try {

            $user = $request->get('user');

            /*
            |--------------------------------------------------------------------------
            | Base Query
            |--------------------------------------------------------------------------
            */

            $query = Recharge::with([
                    'user:id,name,mobile,email',
                    'admin:id,name,mobile,email',
                    'creator:id,name,mobile,email'
                ])
                ->orderBy('recharges.created_at', 'desc');

            /*
            |--------------------------------------------------------------------------
            | Role Based Access
            |--------------------------------------------------------------------------
            */

            if ($user->role == 1) {
                // Super Admin → no restriction
            } elseif ($user->role == 2) {
                $query->where('admin_id', $user->id);
            } elseif ($user->role == 10) {
                $query->where('user_id', $user->id);
            } else {
                $query->whereHas('user', function ($q) use ($user) {
                    $q->where(function ($sub) use ($user) {
                        $sub->where('root', 'like', $user->id . ',%')
                            ->orWhere('root', 'like', '%,' . $user->id)
                            ->orWhere('root', 'like', '%,' . $user->id . ',%')
                            ->orWhere('id', $user->id);
                    });
                });
            }

            /*
            |--------------------------------------------------------------------------
            | Filters
            |--------------------------------------------------------------------------
            */

            if ($request->filled('status')) {
                $query->whereRaw('LOWER(status) = ?', [strtolower($request->status)]);
            }

            if ($request->filled('mobile_number')) {
                $query->where('number', 'LIKE', '%' . $request->mobile_number . '%');
            }

            if ($request->filled('operator')) {
                $query->where('oprator', $request->operator);
            }

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            if ($request->filled('amount_from')) {
                $query->where('amount', '>=', $request->amount_from);
            }

            if ($request->filled('amount_to')) {
                $query->where('amount', '<=', $request->amount_to);
            }

            if ($request->filled('date_from')) {
                $query->whereDate('recharges.created_at', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate('recharges.created_at', '<=', $request->date_to);
            }

            if ($request->filled('transaction_id')) {
                $query->where(function ($q) use ($request) {
                    $q->where('oid', 'LIKE', '%' . $request->transaction_id . '%')
                    ->orWhere('txnid', 'LIKE', '%' . $request->transaction_id . '%');
                });
            }

            /*
            |--------------------------------------------------------------------------
            | Pagination
            |--------------------------------------------------------------------------
            */

            $perPage = $request->get('per_page', 50);
            $recharges = $query->paginate($perPage);

            /*
            |--------------------------------------------------------------------------
            | Summary (Clean Aggregate Query)
            |--------------------------------------------------------------------------
            */

            $statsQuery = clone $query;

            // Remove ordering before aggregate
            $statsQuery->getQuery()->orders = null;

            $stats = $statsQuery
                ->selectRaw("
                    COUNT(*) as total,
                    SUM(status = 'Success') as success_count,
                    SUM(status = 'Failed') as failed_count,
                    SUM(status = 'Pending') as pending_count,
                    SUM(CASE WHEN status = 'Success' THEN amount ELSE 0 END) as total_amount
                ")
                ->first();

            $totalRecharges = $stats->total ?? 0;
            $successfulRecharges = $stats->success_count ?? 0;

            return response()->json([
                'status' => 1,
                'message' => 'Mobile recharge report fetched successfully',
                'data' => $recharges->items(),
                'pagination' => [
                    'current_page' => $recharges->currentPage(),
                    'per_page' => $recharges->perPage(),
                    'total' => $recharges->total(),
                    'last_page' => $recharges->lastPage(),
                    'has_more_pages' => $recharges->hasMorePages(),
                ],
                'summary' => [
                    'total_recharges' => $totalRecharges,
                    'successful_recharges' => $successfulRecharges,
                    'failed_recharges' => $stats->failed_count ?? 0,
                    'pending_recharges' => $stats->pending_count ?? 0,
                    'total_amount' => $stats->total_amount ?? 0,
                    'success_rate' => $totalRecharges > 0
                        ? round(($successfulRecharges / $totalRecharges) * 100, 2)
                        : 0,
                ]
            ], 200);

        } catch (\Exception $e) {

            Log::error('Mobile Recharge Report Error: ' . $e->getMessage());

            CatchLogService::logException($request, 'mobileRechargeReport', $e, [
                'context' => 'Mobile Recharge Report Error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch mobile recharge report',
                'error' => $e->getMessage()
            ], 500);
        }
    }




    public function mobileRechargeReportApp(Request $request)
    {
        try {
            $user = $request->get('user');
            
            // Base query
            $query = Recharge::with(['user:id,name', 'admin:id,name', 'creator:id,name'])
                ->where('user_id', $user->id)
                ->select('number', 'oprator', 'amount', 'status', 'rrmarks', 'type', 'txnid', 'plan', 'created_at')
                ->orderBy('created_at', 'desc');

            // Apply filters if provided
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            if ($request->has('mobile_number') && !empty($request->mobile_number)) {
                $query->where('number', 'LIKE', '%' . $request->mobile_number . '%');
            }

            if ($request->has('operator') && !empty($request->operator)) {
                $query->where('oprator', $request->operator);
            }

            if ($request->has('type') && !empty($request->type)) {
                $query->where('type', $request->type);
            }
            
            if ($request->has('date_from') && !empty($request->date_from)) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to') && !empty($request->date_to)) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }


            // Get paginated results
            $perPage = $request->get('per_page', 50);
            $recharges = $query->paginate($perPage);

            // Calculate summary statistics
            $totalRecharges = $query->count();
            $successfulRecharges = Recharge::where('user_id', $user->id)
            ->where('type', $request->type)
                ->where('status', 'Success')
                ->count();
            $failedRecharges = Recharge::where('user_id', $user->id)
                ->where('type', $request->type)
                ->where('status', 'Failed')
                ->count();
            $pendingRecharges = Recharge::where('user_id', $user->id)
                ->where('type', $request->type)
                ->where('status', 'Pending')
                ->count();
            
            $totalAmount = Recharge::where('user_id', $user->id)
                ->where('type', $request->type)
                ->where('status', 'Success')
                ->sum('amount');

            return response()->json([
                'status' => 1,
                'message' => 'Mobile recharge report fetched successfully',
                'data' => $recharges->items(),
                'pagination' => [
                    'current_page' => $recharges->currentPage(),
                    'per_page' => $recharges->perPage(),
                    'total' => $recharges->total(),
                    'last_page' => $recharges->lastPage(),
                    'has_more_pages' => $recharges->hasMorePages(),
                ],
                'summary' => [
                    'total_recharges' => $totalRecharges,
                    'successful_recharges' => $successfulRecharges,
                    'failed_recharges' => $failedRecharges,
                    'pending_recharges' => $pendingRecharges,
                    'total_amount' => $totalAmount,
                    'success_rate' => $totalRecharges > 0 ? round(($successfulRecharges / $totalRecharges) * 100, 2) : 0,
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Mobile Recharge Report Error: ' . $e->getMessage());
            CatchLogService::logException($request, 'mobileRechargeReportApp', $e, [
                'context' => 'Mobile Recharge Report App Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch mobile recharge report',
                'error' => $e->getMessage()
            ], 500);
        }
    }





    public function recentRecharge(Request $request)
    {
        try {
            $user = $request->get('user');

            if (!$user || !isset($user->id)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid user information'
                ], 400);
            }

            // Check cache first
            $cacheKey = "recent_recharge_user_{$user->id}";
            $cachedData = Cache::get($cacheKey);
            
            if ($cachedData) {
                // Return cached data
                return response()->json([
                    'status' => 1,
                    'message' => 'Recent recharges fetched successfully',
                    'data' => $cachedData ?? []
                ], 200);
            }

            // If not in cache, fetch from database
            // ✅ Fetch recharges grouped by number and count frequency (one row per number)
            $recharges = Recharge::where('type', 1)
                ->where('user_id', $user->id)
                ->select(
                    'recharges.number',
                    'recharges.user_id',
                    DB::raw('COUNT(recharges.number) as recharge_count'),
                    DB::raw('MAX(recharges.created_at) as last_recharge_at'),
                    DB::raw('MAX(recharges.amount) as amount'),
                    DB::raw('MAX(recharges.oprator) as oprator'),
                    DB::raw('(SELECT validity FROM recharges r2 WHERE r2.number = recharges.number AND r2.user_id = recharges.user_id AND r2.type = 1 ORDER BY r2.created_at DESC LIMIT 1) as validity')
                )
                ->groupBy('recharges.number', 'recharges.user_id')
                ->orderByDesc('recharge_count')
                ->orderByDesc('last_recharge_at')
                ->limit(10)
                ->get();

            // ✅ Join operator info manually
            $operatorCodes = $recharges->pluck('oprator')->unique()->toArray();
            $operators = DB::table('utility_operators')
                ->whereIn('code', $operatorCodes)
                ->get()
                ->keyBy('code');

            // ✅ Fetch contacts safely
            // ✅ Fetch contacts safely (handle null record)
            $contactsData = DB::table('contacts')->where('user_id', $user->id)->first();
            $contacts = [];
            if ($contactsData && !empty($contactsData->contacts)) {
                $decoded = json_decode($contactsData->contacts);
                $contacts = is_array($decoded) ? $decoded : [];
            }

            // ✅ Attach name, operator details, and expiry_date
            foreach ($recharges as $recharge) {
                $number = $recharge->number;

                // Find contact name
                $contact = collect($contacts)->firstWhere('number', $number);
                $recharge->name = $contact->name ?? 'Unknown';

                // Add operator info
                $opr = $operators[$recharge->oprator] ?? null;
                $recharge->operator_name = $opr->name ?? '';
                $recharge->operator_icon = $opr->icon ?? '';

                // ✅ Calculate expiry_date from validity and last_recharge_at
                $validityDays = 0;
                if (!empty($recharge->validity)) {
                    // Extract numeric part of validity, e.g., "28 days" => 28
                    if (preg_match('/(\d+)/', $recharge->validity, $matches)) {
                        $validityDays = (int)$matches[1];
                    }
                }

                $expiryDate = null;
                if (!empty($recharge->last_recharge_at) && $validityDays > 0) {
                    $expiryDate = \Carbon\Carbon::parse($recharge->last_recharge_at)
                        ->addDays($validityDays)
                        ->format('d M Y');
                }

                $recharge->expiry_date = $expiryDate;
            }

            // Cache the response for 1 hour (60 minutes)
            Cache::put($cacheKey, $recharges, 60);

            return response()->json([
                'status' => 1,
                'message' => 'Recent recharges fetched successfully',
                'data' => $recharges ?? []
            ], 200);

        } catch (\Exception $e) {
            Log::error('Recent Recharge Error: ' . $e->getMessage());
            CatchLogService::logException($request, 'recentRecharge', $e, [
                'context' => 'Recent Recharge Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch recent recharges',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Get operators by category
     */
    public function getOperator(Request $request)
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'category' => 'required|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $category = $request->input('category');

            // Check cache first
            $cacheKey = "operators_category_{$category}";
            $cachedData = Cache::get($cacheKey);
            
            if ($cachedData) {
                // Return cached data
                return response()->json([
                    'status' => 1,
                    'message' => 'Operators fetched successfully',
                    'operators' => $cachedData
                ], 200);
            }

            // If not in cache, fetch from database
            // Get operators by category
            $operators = UtilityOperator::byCategory($category)
                ->orderBy('name')
                ->get();

            // Cache the response for 1 month (30 * 24 * 60 minutes = 43200 minutes)
            Cache::put($cacheKey, $operators, 30 * 24 * 60);

            return response()->json([
                'status' => 1,
                'message' => 'Operators fetched successfully',
                'operators' => $operators
            ], 200);

        } catch (\Exception $e) {
            Log::error('Get Operator Error: ' . $e->getMessage());
            CatchLogService::logException($request, 'getOperator', $e, [
                'context' => 'Get Operator Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch operators',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get telecom circles list from utility_circles table
     */
    public function getCircles(Request $request)
    {
        try {
            $circles = DB::table('utility_circles')
                ->where('status', true)
                ->orderBy('id', 'asc')
                ->get();

            return response()->json([
                'status' => 1,
                'message' => 'Circles fetched successfully',
                'circles' => $circles
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch circles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bill payment categories from bbps_category
     */
    public function getBillCategories(Request $request)
    {
        try {
            $query = BbpsCategory::query();

            // Handle popular filter parameter (e.g. popular=1, popular=true, or type=popular)
            $popularInput = $request->input('popular') ?? $request->get('popular');
            if ($request->has('popular') && ($popularInput == 1 || $popularInput === '1' || strtolower($popularInput) === 'true' || strtolower($popularInput) === 'popular')) {
                $query->where('popular', 1);
            } else {
                $query->where('status', 0);
            }

            $categories = $query->orderBy('id', 'asc')->get();

            foreach ($categories as $category) {
                // Ensure image asset URL is properly formatted
                $img = $category->image ?? $category->biller_icon ?? '';
                if (!empty($img) && !filter_var($img, FILTER_VALIDATE_URL)) {
                    $category->biller_icon = asset('assets/icons/' . ltrim($img, '/'));
                } else {
                    $category->biller_icon = $img;
                }
                // Ensure category string property is populated
                if (empty($category->category)) {
                    $category->category = $category->name;
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Bill categories fetched successfully',
                'categories' => $categories
            ], 200);

        } catch (\Exception $e) {
            Log::error('Get Bill Categories Error: ' . $e->getMessage());
            CatchLogService::logException($request, 'getBillCategories', $e, [
                'context' => 'Get Bill Categories Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch bill categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get billers by category
     */
    public function getBillersByCategory(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'category' => 'required|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $category = $request->input('category');

            $billers = UtilityOperator::where(function($q) use ($category) {
                    $q->where('category', 'LIKE', '%' . $category . '%')
                      ->orWhere('type', 'LIKE', '%' . $category . '%');
                })
                ->where('is_active', 1)
                ->orderBy('name')
                ->get();

            return response()->json([
                'status' => 1,
                'message' => 'Billers fetched successfully',
                'billers' => $billers
            ], 200);

        } catch (\Exception $e) {
            Log::error('Get Billers Error: ' . $e->getMessage());
            CatchLogService::logException($request, 'getBillersByCategory', $e, [
                'context' => 'Get Billers By Category Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch billers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch bill details
     */
    public function fetchBill(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'biller_code' => 'nullable|string',
                'billerid' => 'nullable|string',
                'category' => 'nullable|string',
                'customer_id' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 200);
            }

            $geoIp = $this->getGeoLocationFromIp($request);
            $user = $request->get('user');

            $kyc = DB::table('user_kyc')->where('user_id', $user->id ?? 0)->first();
            $pincode = $kyc->pincode ?? null;
            $city = $kyc->dist ?? null;

            // OutletID passed in request or user's registered outlet_id
            $outletid = $request->outlet_id ?? $request->outletid ?? ($user->outlet_id ?? null);

            $aeps_drafts = DB::table('aeps_drafts')->where('mid', $user->mid ?? '')->first();
            if (!$pincode && $aeps_drafts) {
                $pincode = $aeps_drafts->shop_pin_code ?? ($geoIp['pincode'] ?? '110001');
                $city = $aeps_drafts->shop_district ?? null;
            }
            if (empty($outletid) && $aeps_drafts) {
                $outletid = $aeps_drafts->outlet_id ?? $aeps_drafts->outletid ?? null;
            }

            // Fallback to valid registered Nixopay OutletID ('500967')
            $outletid = (string)($outletid ?: '500967');

            // Real-time instant Latitude & Longitude from Request or Live IP Geolocation (formatted as float to 4 decimal places: e.g. 25.5941, 85.1376)
            $rawLat = $request->latitude ?? $request->lat ?? $geoIp['lat'];
            $rawLong = $request->longitude ?? $request->long ?? $geoIp['long'];

            $lat = number_format((float)$rawLat, 4, '.', '');
            $long = number_format((float)$rawLong, 4, '.', '');
            $geoCode = $request->geocode ?? ($lat . ',' . $long);

            //bill fetch api call 
            $url = 'https://nixopay.in/API/FetchBill';

            $params = [
                'UserID'           => '60',
                'Token'            => '1aaaabf3d07d13fd87b038f8bf77128e',
                'Account'          => $request->customer_id,
                'Amount'           => 0,
                'SPKey'            => $request->biller_code,
                'APIRequestID'     => rand(111111,999999),
                'GEOCode'          => $geoCode,
                'CustomerNumber'   => $user->mobile,
                'Pincode'          => $pincode ?? '110001',
                'Format'           => '1',
                'Optional1'        => $user->mobile,
                'OutletID'         => '10004'
            ];


            $url .= '?' . http_build_query($params);

            $ch = curl_init();

            curl_setopt_array($ch, [
                CURLOPT_URL            => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 60,
                CURLOPT_CONNECTTIMEOUT => 15,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_HTTPGET        => true,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            $curlErrno = curl_errno($ch);
            curl_close($ch);

            // Check for CURL errors
            if ($curlErrno) {
                Log::error('Fetch Bill CURL Error: ' . $curlError, [
                    'account' => $request->customer_id,
                    'curl_errno' => $curlErrno
                ]);
                return response()->json([
                    'status'  => 0,
                    'message' => 'Connection error while fetching bill: ' . $curlError,
                    'data'    => null
                ], 200);
            }

            // Check HTTP response status
            if ($httpCode != 200 || empty($response)) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Bill service unavailable (HTTP ' . $httpCode . ')',
                    'data'    => null
                ], 200);
            }

            // Decode JSON
            $rj = json_decode($response, true);
            if (!$rj || !is_array($rj)) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Invalid response from bill service',
                    'data'    => null,
                    'raw'     => $response
                ], 200);
            }




             // ✅ Step 7: Log API Request BEFORE Call
            DB::table('logs')->insert([
                'mid'          => $request->get('user')->mid ?? null,
                'type'         => 'Bill Fetch',
                'platform'     => 'API',
                'headers'      => json_encode(["Content-Type" => "application/x-www-form-urlencoded"]),
                'request_data' => json_encode([
                    'api_id' => 3,
                    'api_name' => 'Nixopay',
                    'target_url' => $url,
                    'request_type' => 'GET',
                    'parameters' => $params
                ]),
                'response_data' => $response,
                'url'          => $url,
                'txnid'        => '',
                'status'       => 0,
                'timestamp'    => now(),
                'created_at'   => now()->format('Y-m-d H:i:s'),
            ]);

            $nixoStatus = $rj['status'] ?? null;
            $nixoMsg = $rj['msg'] ?? ($rj['message'] ?? '');
            $nixoErrorCode = (string)($rj['errorcode'] ?? '');

            // Nixopay Success Status check (status == 2 or errorcode == 200 or msg == "Transaction Successful")
            if ($nixoStatus == 2 || $nixoErrorCode === '200' || strtolower(trim((string)$nixoMsg)) === 'transaction successful') {
                $dueAmount = isset($rj['dueamount']) && floatval($rj['dueamount']) > 0 
                    ? (string)$rj['dueamount'] 
                    : (isset($rj['amount']) ? (string)$rj['amount'] : '0');

                $data = [
                    'operator'     => $request->billerid ?? ($request->biller_code ?? '305'),
                    'status'       => $nixoStatus,
                    'message'      => $nixoMsg ?: 'Transaction Successful',
                    'dueAmount'    => $dueAmount,
                    'dueDate'      => $rj['duedate'] ?? date('Y-m-d'),
                    'customerName' => $rj['customername'] ?? ($request->customer_id ?? ''),
                    'billNumber'   => (string)($rj['billnumber'] ?? ($request->customer_id ?? '')),
                    'billDate'     => $rj['billdate'] ?? date('Y-m-d'),
                    'billPeriod'   => $rj['bilperiod'] ?? '',
                    'refId'        => (string)($rj['refid'] ?? ''),
                    'fetchBillID'  => $rj['fetchBillID'] ?? 0,
                    'editable'     => false,
                    'raw_response' => $rj
                ];

                return response()->json([
                    'status'  => 1,
                    'message' => 'success',
                    'data'    => $data
                ], 200);
            }


           
        

            return response()->json([
                'status'  => 0,
                'message' => $nixoMsg ?: 'Failed to fetch bill details',
                'data'    => $rj
            ], 200);

        } catch (\Exception $e) {
            CatchLogService::logException($request, 'fetchBill', $e, [
                'context' => 'Fetch Bill Error',
                'biller_code' => $request->biller_code ?? null,
                'customer_id' => $request->customer_id ?? null,
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch bill details',
                'error' => $e->getMessage()
            ], 200);
        }
    }

    /**
     * Process bill payment
     */
    public function billPayment(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'biller_code' => 'required|string',
                'customer_id' => 'required',
                'transaction_id' => 'required',
                'amount' => 'required|numeric|min:1',
                'bill_id' => 'nullable|string',
                'account_id' => 'required',
                'mpin' => 'required|string|size:4'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }


            $transactionData = [
                'account_id' => $request->account_id,
                'mpin' => $request->mpin,
                'type' => 'DR',
                'amount' => $request->amount,
                'transaction_amount' => $request->amount,
                'description' => 'Bill Payment of '.$request->customer_id,
                'transaction_id' => $request->transaction_id,
                'category_code' => 'BILL_PAY'
            ];

            $transactionData = processTransaction($request, $transactionData);


            if($transactionData['status'] !== 1) {
                return response()->json(['status' => 0, 'message' => $transactionData['message'], 'data' => NULL], 200);
            }

            if(!empty($transactionData['status']) && $transactionData['status'] == 1) {

                $user = Auth::user();

                $number=$request->customer_id;
                $amount=$request->amount;
                $operator=$request->biller_code;
                $type=3;
                $user1=$request->transaction_id;
                $user1 = "$user1";
                $mid='G195064846';
                $mkey='PRA3948146';
                $subwallet='GTGAIRW7051TULKQI304V';  
            
            
                date_default_timezone_set("Asia/Kolkata");	
                $addon=date('Y-m-d H:i:s');


                $url="https://dashboard.goterpay.com/api/BillPay?mid=$mid&mkey=$mkey&subwallet=$subwallet&txnid=$user1&number=$number&amount=$amount&operator=$operator";

                // ✅ Log API request BEFORE API call
                DB::table('logs')->insert([
                    'mid'          => $request->get('user')->mid ?? null,
                    'type'         => 'Bill_Payment',
                    'platform'     => 'API',
                    'headers'      => json_encode([
                        "Content-Type" => "application/x-www-form-urlencoded"
                    ]),
                    'request_data' => json_encode([
                        'txnid' => $user1,
                        'number' => $number,
                        'amount' => $amount,
                        'operator' => $operator,
                        'biller_code' => $request->biller_code
                    ]),
                    'url'          => $url,
                    'txnid'        => $user1,
                    'status'       => 0,
                    'timestamp'    => now(),
                    'created_at'   => now()->format('Y-m-d H:i:s'),
                ]);
            
                $ch = curl_init();
                $timeout = 90;
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_HEADER, 0);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
                curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
                
                $res_data = curl_exec($ch);
                $curl_error = curl_error($ch);
                $curl_errno = curl_errno($ch);
                curl_close($ch);
                
                // Check for curl errors
                if ($curl_errno) {
                    Log::error('Bill Payment CURL Error: ' . $curl_error, [
                        'txnid' => $user1,
                        'number' => $number,
                        'amount' => $amount,
                        'curl_errno' => $curl_errno
                    ]);
                    
                    // Update log with error
                    DB::table('logs')
                        ->where('txnid', $user1)
                        ->where('type', 'Bill_Payment')
                        ->update([
                            'response_data' => json_encode(['error' => $curl_error]),
                            'status' => 0,
                            'updated_at' => now(),
                        ]);
                    
                    // Refund the transaction
                    $transactionData1 = [
                        'account_id' => $request->account_id,
                        'mpin' => $request->mpin,
                        'type' => 'CR',
                        'amount' => $request->amount,
                        'transaction_amount' => $request->amount,
                        'description' => 'Bill Payment Failed (Connection Error) & Refund',
                        'transaction_id' => $request->transaction_id . '-0',
                        'category_code' => 'BILL_PAY'
                    ];
                    processTransaction($request, $transactionData1);
                    
                    return response()->json([
                        'status' => 0, 
                        'message' => 'Connection error while processing bill payment. Amount refunded.',
                        'data' => null
                    ], 200);
                }
                
                $rj = json_decode($res_data, TRUE);
                
                // Check for JSON decode errors
                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::error('Bill Payment JSON Decode Error', [
                        'txnid' => $user1,
                        'response' => $res_data,
                        'json_error' => json_last_error_msg()
                    ]);
                    
                    // Update log with error
                    DB::table('logs')
                        ->where('txnid', $user1)
                        ->where('type', 'Bill_Payment')
                        ->update([
                            'response_data' => $res_data,
                            'status' => 0,
                            'updated_at' => now(),
                        ]);
                    
                    // Refund the transaction
                    $transactionData1 = [
                        'account_id' => $request->account_id,
                        'mpin' => $request->mpin,
                        'type' => 'CR',
                        'amount' => $request->amount,
                        'transaction_amount' => $request->amount,
                        'description' => 'Bill Payment Failed (Invalid Response) & Refund',
                        'transaction_id' => $request->transaction_id . '-0',
                        'category_code' => 'BILL_PAY'
                    ];
                    processTransaction($request, $transactionData1);
                    
                    return response()->json([
                        'status' => 0, 
                        'message' => 'Invalid response from bill payment service. Amount refunded.',
                        'data' => null
                    ], 200);
                }
                

                if(!isset($rj['status']) || isset($rj['status']) && $rj['status']=='FAILED'){

                    $sts=$rj['status'];
                    $rem=$rj['resText'];
                    $txn=$rj['TxnId'];
                    $ope=$rj['operator']; 

                    $rdata = [    
                    'user_id' => $request->get('user')->id, // Current authenticated user
                    'number' => $number,
                    'oprator' => $ope,
                    'amount' => $amount,
                    'status' => 'failed',
                    'rrmarks' => $rem,
                    'type' => $type,
                    'txnid' => $txn,
                    'oid' => $user1,
                    'call_back_url' => $request->call_back_url,
                    'admin_id' => $request->get('admin')->id, // Admin processing the recharge
                    'created_by' => $request->get('user')->id, // User who created this record
                    'request_data' => json_encode([
                        'url' => $url,
                        'parameters' => [
                            'txnid' => $user1,
                            'type' => $type,
                            'number' => $number,
                            'amount' => $amount,
                            'operator' => $operator
                        ]
                    ]),
                    'response_data' => $res_data
                    ];
                
                    Recharge::create($rdata);

                    // ✅ Update log with API response (FAILED)
                    DB::table('logs')
                        ->where('txnid', $user1)
                        ->where('type', 'Bill_Payment')
                        ->update([
                            'response_data' => $res_data,
                            'status'        => 0,
                            'updated_at'    => now(),
                        ]);

                    $transactionData1 = [
                        'account_id' => $request->account_id,
                        'mpin' => $request->mpin,
                        'type' => 'CR',
                        'amount' => $request->amount,
                        'transaction_amount' => $request->amount,
                        'description' => 'Bill Payment Failed & Refund',
                        'transaction_id' => $request->transaction_id.'-0',
                        'category_code' => 'BILL_PAY'
                    ];

                    $transactionData1 = processTransaction($request, $transactionData1);

                    return response()->json(['status' => 0, 'message' => $rem], 200);
                
                } else {


                    $sts=$rj['status'];
                    $rem=$rj['resText'];
                    $txn=$rj['TxnId'];
                    $ope=$rj['operator']; 
            

                    $rdata = [    
                    'user_id' => $request->get('user')->id, // Current authenticated user
                    'number' => $number,
                    'oprator' => $ope,
                    'amount' => $amount,
                    'status' => strtolower($sts),
                    'rrmarks' => $rem,
                    'type' => $type,
                    'txnid' => $txn,
                    'oid' => $user1,
                    'call_back_url' => $request->call_back_url,
                    'admin_id' => $request->get('admin')->id, // Admin processing the recharge
                    'created_by' => $request->get('user')->id, // User who created this record
                    'request_data' => json_encode([
                        'url' => $url,
                        'parameters' => [
                            'txnid' => $user1,
                            'type' => $type,
                            'number' => $number,
                            'amount' => $amount,
                            'operator' => $operator,
                        ]
                    ]),
                    'response_data' => $res_data
                    ];
                
                    Recharge::create($rdata);

                    if ($sts=="SUCCESS") {
                        // only commission when success untill stay pending commission after webhook from goterpay
                        $commissionTransactionData = [
                            'user_id' => $request->get('user')->id,
                            'amount' => $request->amount,
                            'sub_module_id' => 3,
                            'category_code' => 'BILL_PAY',
                            'description' => 'Bill Pay Commission '.$number,
                            'admin_id' => $request->get('admin')->id
                        ];

                        processCommissionCharge($commissionTransactionData);
                    }

                    // ✅ Update log with API response (SUCCESS)
                    DB::table('logs')
                        ->where('txnid', $user1)
                        ->where('type', 'Bill_Payment')
                        ->update([
                            'response_data' => $res_data,
                            'status'        => 1,
                            'updated_at'    => now(),
                        ]);

                }
            
            
                $transactionData['orderId'] = $txn;
                $transactionData['txnId'] = $user1;
                $transactionData['resText'] = $rem;
                $transactionData['operator'] = $ope;

                return response()->json($transactionData, 200);
            } else {
                return response()->json(['status' => 0, 'message' => 'Transaction failed', 'data' => NULL], 200);
            }



        } catch (\Exception $e) {
            Log::error('Bill Payment Error: ' . $e->getMessage());
            CatchLogService::logException($request, 'billPayment', $e, [
                'context' => 'Bill Payment Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Payment failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bill payment report
     */
    public function billPaymentReport(Request $request)
    {
        try {
            $user = Auth::user();
            $perPage = $request->get('per_page', 15);
            
            $query = Recharge::with(['user', 'operator'])
                ->where('type', 'bill')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc');

            // Add date filters if provided
            if ($request->filled('start_date')) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }
            
            if ($request->filled('end_date')) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }

            // Add status filter if provided
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $payments = $query->paginate($perPage);

            // Calculate summary
            $totalPayments = $query->count();
            $successfulPayments = $query->where('status', 'success')->count();
            $failedPayments = $query->where('status', 'failed')->count();
            $pendingPayments = $query->where('status', 'pending')->count();
            $totalAmount = $query->where('status', 'success')->sum('amount');

            return response()->json([
                'status' => 1,
                'message' => 'Bill payment report fetched successfully',
                'data' => $payments->items(),
                'pagination' => [
                    'current_page' => $payments->currentPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total(),
                    'last_page' => $payments->lastPage(),
                    'has_more_pages' => $payments->hasMorePages(),
                ],
                'summary' => [
                    'total_payments' => $totalPayments,
                    'successful_payments' => $successfulPayments,
                    'failed_payments' => $failedPayments,
                    'pending_payments' => $pendingPayments,
                    'total_amount' => $totalAmount,
                    'success_rate' => $totalPayments > 0 ? round(($successfulPayments / $totalPayments) * 100, 2) : 0,
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Bill Payment Report Error: ' . $e->getMessage());
            CatchLogService::logException($request, 'billPaymentReport', $e, [
                'context' => 'Bill Payment Report Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch bill payment report',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Helper method to process CIBIL refund transaction
     */
    private function processCibilRefund(Request $request, $amount)
    {
        $refundData = [
            'account_id' => $request->account_id,
            'mpin' => $request->mpin,
            'type' => 'CR',
            'amount' => $amount,
            'transaction_amount' => $amount,
            'description' => 'Cibil Check Failed & Refund. TXN ID:' . $request->txnid,
            'transaction_id' => $request->txnid . '-' . time(), // Unique suffix to avoid collision
            'category_code' => 'CIBIL'
        ];
        return processTransaction($request, $refundData);
    }

    public function cibilCheck(Request $request)
    {

        try {
            $user = $request->get('user');
            $admin = $request->get('admin');

            // Null check for user and admin
            if (!$user || !$admin) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Authentication required',
                    'data' => null
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string',
                'address' => 'required|string',
                'pincode' => 'required',
                'mobile' => 'required',
                'pan' => 'required',
                'gender' => 'required|string',
                'txnid' => 'required|unique:cibils,txnid',
                'dob' => 'required',
                'account_id' => 'required',
                'mpin' => 'required|string|size:4'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Check if this transaction ID already exists and has been processed
            $dx = DB::table('cibils')->where('txnid', $request->txnid)->first();
    
            if($dx){
                return response()->json([
                    'status' => 0,
                    'message' => 'This transaction has already been processed.',
                    'data' => null
                ], 200);
            }
            
            $amount = 100;
            
            $transactionData = [
                'account_id' => $request->account_id,
                'mpin' => $request->mpin,
                'type' => 'DR',
                'amount' => $amount,
                'transaction_amount' => $amount,
                'description' => 'Cibil Check of '.$request->pan,
                'transaction_id' => $request->txnid,
                'category_code' => 'CIBIL'
            ];

            $transactionData = processTransaction($request, $transactionData);


            if($transactionData['status'] !== 1) {
                return response()->json(['status' => 0, 'message' => $transactionData['message'], 'data' => NULL], 200);
            }

            if(!empty($transactionData['status']) && $transactionData['status'] == 1) {


                $url = 'https://cyrusrecharge.in/api/total-kyc.aspx';
                
                $payload = [
                    "merchantId" => "AP443406",
                    "merchantKey"=> "6C3263189A",
                    "full_name"       => $request->name,
                    "dob"       => date('Y-m-d',strtotime($request->dob)),
                    "address"       => $request->address,
                    "pincode"       => $request->pincode,
                    "mobile"     => $request->mobile,
                    "pan"        => $request->pan,
                    "gender"     => $request->gender,
                    "type"       => "CREDIT_REPORT_EQ",
                    "txnid"      => $request->txnid // make this unique per request
                ];
            
            
            
                $ch = curl_init($url);
                
                $jsonData = json_encode($payload);

                // ✅ Log API request BEFORE API call
                DB::table('logs')->insert([
                    'mid'          => $request->get('user')->mid ?? null,
                    'type'         => 'CIBIL',
                    'platform'     => 'API',
                    'headers'      => json_encode($request->get('headers')),
                    'request_data' => $jsonData,
                    'url'          => $url,
                    'txnid'        => $request->txnid,
                    'status'       => 0,
                    'timestamp'    => now(),
                    'created_at'   => now()->format('Y-m-d H:i:s'),
                ]);


                $xdata = [
                    "user_id"    => $user->id,
                    "full_name"       => $request->name,
                    "mobile"     => $request->mobile,
                    "pan"        => $request->pan,
                    "dob"        => $request->dob,
                    "address"        => $request->address,
                    "pincode"       => $request->pincode,
                    "txnid"      => $request->txnid,
                    "admin_id"      => $admin->id,
                    "created_by"      => $user->id,
                    "created_at"      => now(),
                ];

                DB::table('cibils')->insert($xdata);

                
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST           => true,
                    CURLOPT_POSTFIELDS     => $jsonData,
                    CURLOPT_HTTPHEADER     => [
                        'Content-Type: application/json',
                        'Accept: application/json',
                        'Content-Length: ' . strlen($jsonData)
                    ],
                    // Optional but recommended
                    CURLOPT_TIMEOUT        => 30,
                    CURLOPT_CONNECTTIMEOUT => 10,
                    CURLOPT_SSL_VERIFYHOST => 2,
                    CURLOPT_SSL_VERIFYPEER => true,
                ]);
                
                $response = curl_exec($ch);
                $curl_error = curl_error($ch);
                $curl_errno = curl_errno($ch);
                
                // Check for curl errors BEFORE trying to decode
                if ($response === false || $curl_errno) {
                    curl_close($ch);
                    Log::error('Cibil Check CURL Error: ' . $curl_error, [
                        'txnid' => $request->txnid,
                        'curl_errno' => $curl_errno
                    ]);

                    // Update log with error
                    DB::table('logs')
                        ->where('txnid', $request->txnid)
                        ->where('type', 'CIBIL')
                        ->update([
                            'response_data' => json_encode(['error' => $curl_error, 'curl_errno' => $curl_errno]),
                            'status' => 0,
                            'updated_at' => now(),
                        ]);
                    
                    // Refund the transaction
                    $this->processCibilRefund($request, $amount);
                    

                    return response()->json([
                        'status' => 0,
                        'message' => 'Connection error while checking CIBIL: ' . $curl_error,
                        'data' => null
                    ], 200);
                }
                
                $data1 = json_decode($response, true);
                
                // Check for JSON decode errors
                if (json_last_error() !== JSON_ERROR_NONE) {
                    curl_close($ch);
                    Log::error('Cibil Check JSON Decode Error', [
                        'txnid' => $request->txnid,
                        'response' => $response,
                        'json_error' => json_last_error_msg()
                    ]);

                    // Update log with JSON decode error
                    DB::table('logs')
                        ->where('txnid', $request->txnid)
                        ->where('type', 'CIBIL')
                        ->update([
                            'response_data' => json_encode(['error' => 'JSON decode failed: ' . json_last_error_msg(), 'raw_response' => substr($response, 0, 500)]),
                            'status' => 0,
                            'updated_at' => now(),
                        ]);
                    
                    // Refund the transaction
                    $this->processCibilRefund($request, $amount);
                    

                    return response()->json([
                        'status' => 0,
                        'message' => 'Invalid response from CIBIL service',
                        'data' => null
                    ], 200);
                }

                // updated cibil response
                DB::table('cibils')->where('txnid', $request->txnid)->update(['response'=>$response,'updated_at'=>now()]);

                curl_close($ch);
                
                // Use $data1 which is already decoded above - with null-safe check
                if(isset($data1['status']) && $data1['status'] == 'SUCCESS') {

                    DB::table('cibils')->where('txnid', $request->txnid)->update(['status'=>1]);
                    
                    if(isset($data1['cibilReport']['data']['cCRResponse']['cIRReportDataLst'][0]['error']['errorDesc'])){
                        
                        DB::table('cibils')->where('txnid', $request->txnid)->update(['message'=>'No Cibil Score Found']);
                    
                        // Update log with CIBIL report error
                        DB::table('logs')
                            ->where('txnid', $request->txnid)
                            ->where('type', 'CIBIL')
                            ->update([
                                'response_data' => $response,
                                'status' => 0,
                                'updated_at' => now(),
                            ]);
                        
                        // Refund the transaction
                        $this->processCibilRefund($request, $amount);
                        
                        return response()->json([
                            'status' => 0,
                            'message' => $data1['cibilReport']['data']['cCRResponse']['cIRReportDataLst'][0]['error']['errorDesc'],
                            'data' => null
                        ], 200);

                    }


                    // ✅ Update log with API response (SUCCESS)
                    DB::table('logs')
                    ->where('txnid', $request->txnid)
                    ->where('type', 'CIBIL')
                    ->update([
                        'response_data' => $response,
                        'status'        => 1,
                        'updated_at'    => now(),
                    ]);


                    // TO DO:
                    // if is_api_partner==1 then give callback commission

                    // TO DO:
                    // commission when success untill stay pending commission after webhook from goterpay
                    // $commissionTransactionData = [
                    //     'user_id' => $request->get('user')->id,
                    //     'amount' => $amount,
                    //     'sub_module_id' => null, // add cibil sub module id
                    //     'category_code' => 'CIBIL',
                    //     'description' => 'Cibil Check Commission '.$number,
                    //     'admin_id' => $request->get('admin')->id
                    // ];

                    // processCommissionCharge($commissionTransactionData);
                    
                    
                    return response()->json([
                        'status' => 1,
                        'message' => 'Cibil Check Success',
                        'data' => $data1
                    ], 200);


                } else {

                    // Update log with API failure response
                    DB::table('logs')
                    ->where('txnid', $request->txnid)
                    ->where('type', 'CIBIL')
                    ->update([
                        'response_data' => $response,
                        'status' => 0,
                        'updated_at' => now(),
                    ]);
                    
                    // Refund the transaction
                    $this->processCibilRefund($request, $amount);


                    return response()->json([
                        'status' => 0,
                        'message' => 'Invalid Request. Try again later.',
                        'data' => null
                    ], 200);
                } 
            }
            else 
            {
                return response()->json(['status' => 0, 'message' => 'Transaction failed', 'data' => NULL], 200);
            }

        } catch (\Exception $e) {
            CatchLogService::logException($request, 'cibilCheck', $e, [
                'context' => 'Cibil Check Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch cibil details',
                'error' => $e->getMessage()
            ], 500);
        }

        
    }


    public function cibilCheckList(Request $request)
    {
        try {
            $user = $request->get('user');

            if($user->role==1){
                $cibils = DB::table('cibils')
                ->orderBy('created_at', 'desc')
                ->get();
            } else if($user->role==2){
                $cibils = DB::table('cibils')
                ->where('admin_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
            } else {
                $cibils = DB::table('cibils')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
            }
            
            return response()->json([
                'status' => 1,
                'message' => 'Cibil check list fetched successfully',
                'data' => $cibils
            ], 200);

        } catch (\Exception $e) {
            Log::error('Cibil Check List Error: ' . $e->getMessage());
            CatchLogService::logException($request, 'cibilCheckList', $e, [
                'context' => 'Cibil Check List Error',
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch cibil check list',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Register BBPS Complaint
     */
    public function registerBbpsComplain(Request $request)
    {
        try {
            $user = $request->get('user') ?? $request->user();
            $userId = is_object($user) ? ($user->id ?? null) : (is_array($user) ? ($user['id'] ?? $user['user_id'] ?? null) : null);

            $remark = $request->customer_remark ?? trim(($request->subject ?? '') . ' - ' . ($request->description ?? ''));

            $complain = \App\Models\BbpsComplain::create([
                'bbps_transaction_id' => (string)($request->bbps_transaction_id ?? ('CC' . date('YmdHis'))),
                'user_id'             => $userId,
                'mobile'              => $request->mobile,
                'customer_remark'     => $remark,
                'admin_remark'        => 'Complaint registered. Under review by support team.',
                'status'              => 'UNRESOLVED',
                'creation_date'       => date('Y-m-d')
            ]);

            return response()->json([
                'status'  => 1,
                'message' => 'Complaint registered successfully',
                'data'    => [
                    'complaint_id'       => 'CC' . str_pad($complain->id, 10, '0', STR_PAD_LEFT),
                    'id'                 => $complain->id,
                    'bbps_transaction_id'=> $complain->bbps_transaction_id,
                    'status'             => $complain->status,
                    'creation_date'      => $complain->creation_date
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to register complaint: ' . $e->getMessage()
            ], 200);
        }
    }

    /**
     * Track BBPS Complaint Status
     */
    public function trackBbpsComplain(Request $request)
    {
        try {
            $complaintId = $request->complaint_id ?? $request->bbps_transaction_id;

            if (!$complaintId) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Complaint ID or Transaction ID is required'
                ], 200);
            }

            $numericId = preg_replace('/[^0-9]/', '', $complaintId);

            $complain = \App\Models\BbpsComplain::where('bbps_transaction_id', $complaintId)
                ->orWhere('id', $numericId)
                ->orderBy('id', 'desc')
                ->first();

            if (!$complain) {
                return response()->json([
                    'status' => 1,
                    'message' => 'Complaint details fetched',
                    'data' => [
                        'complaint_id'        => $complaintId,
                        'bbps_transaction_id' => $complaintId,
                        'complaint_assigned'  => 'BBPS Resolution Desk',
                        'customer_remark'     => 'Transaction successful, account not updated',
                        'admin_remark'        => 'Updated by System',
                        'status'              => 'UNRESOLVED',
                        'creation_date'       => date('Y-m-d')
                    ]
                ], 200);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Complaint details fetched successfully',
                'data' => [
                    'complaint_id'        => 'CC' . str_pad($complain->id, 10, '0', STR_PAD_LEFT),
                    'id'                 => $complain->id,
                    'bbps_transaction_id' => $complain->bbps_transaction_id,
                    'mobile'             => $complain->mobile,
                    'customer_remark'    => $complain->customer_remark,
                    'admin_remark'       => $complain->admin_remark ?? 'Updated by System',
                    'complaint_assigned' => 'BBPS Resolution Team',
                    'status'             => $complain->status ?? 'UNRESOLVED',
                    'creation_date'      => $complain->creation_date ?? date('Y-m-d')
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to track complaint: ' . $e->getMessage()
            ], 200);
        }
    }

    /**
     * Get User BBPS Complaints List
     */
    /**
     * Get User / Admin BBPS Complaints List
     */
    public function getBbpsComplaints(Request $request)
    {
        try {
            $user = $request->get('user') ?? $request->user();
            $userId = is_object($user) ? ($user->id ?? null) : (is_array($user) ? ($user['id'] ?? $user['user_id'] ?? null) : null);
            $role = is_object($user) ? ($user->role ?? null) : (is_array($user) ? ($user['role'] ?? null) : null);

            $query = \App\Models\BbpsComplain::with('user:id,name,mid,mobile')->orderBy('id', 'desc');

            // If user is regular user (role > 2), filter by user_id
            if ($role && intval($role) > 2 && $userId) {
                $query->where('user_id', $userId);
            } elseif (!$role && $userId) {
                // Fallback check if role not loaded directly on request object
                $dbUser = \App\Models\User::find($userId);
                if ($dbUser && intval($dbUser->role) > 2) {
                    $query->where('user_id', $userId);
                }
            }

            $complaints = $query->get()->map(function ($item) {
                return [
                    'id'                  => $item->id,
                    'complaint_id'        => 'CC' . str_pad($item->id, 10, '0', STR_PAD_LEFT),
                    'transaction_id'      => $item->bbps_transaction_id,
                    'mobile'              => $item->mobile,
                    'subject'             => $item->customer_remark,
                    'customer_remark'     => $item->customer_remark,
                    'admin_remark'        => $item->admin_remark ?? 'Under review by support team',
                    'assigned_to'         => 'BBPS Resolution Team',
                    'status'              => $item->status ?? 'UNRESOLVED',
                    'created_at'          => $item->created_at ? $item->created_at->format('Y-m-d H:i:s') : ($item->creation_date ?? date('Y-m-d')),
                    'user_id'             => $item->user_id,
                    'user_name'           => $item->user->name ?? null,
                    'user_mid'            => $item->user->mid ?? null,
                    'user_mobile'         => $item->user->mobile ?? $item->mobile,
                ];
            });

            return response()->json([
                'status'  => 1,
                'message' => 'Complaints fetched successfully',
                'data'    => $complaints
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 0,
                'message' => 'Failed to fetch complaints: ' . $e->getMessage()
            ], 200);
        }
    }

    /**
     * Update BBPS Complaint Status & Admin Remark (Super Admin / Admin)
     */
    public function updateBbpsComplainStatus(Request $request)
    {
        try {
            $user = $request->get('user') ?? $request->user();
            
            $validator = Validator::make($request->all(), [
                'complaint_id' => 'required',
                'status'       => 'required|string',
                'admin_remark' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Validation error',
                    'errors'  => $validator->errors()
                ], 200);
            }

            $complaintId = $request->complaint_id;
            $numericId = preg_replace('/[^0-9]/', '', $complaintId);

            $complain = \App\Models\BbpsComplain::where('id', $numericId)
                ->orWhere('bbps_transaction_id', $complaintId)
                ->first();

            if (!$complain) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Complaint record not found'
                ], 200);
            }

            $complain->status = strtoupper(trim($request->status));
            if ($request->has('admin_remark')) {
                $complain->admin_remark = $request->admin_remark;
            }
            $complain->save();

            return response()->json([
                'status'  => 1,
                'message' => 'Complaint ticket updated successfully',
                'data'    => [
                    'id'           => $complain->id,
                    'complaint_id' => 'CC' . str_pad($complain->id, 10, '0', STR_PAD_LEFT),
                    'status'       => $complain->status,
                    'admin_remark' => $complain->admin_remark
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 0,
                'message' => 'Failed to update complaint: ' . $e->getMessage()
            ], 200);
        }
    }

    /**
     * Get instant real-time Geolocation (Lat, Long, Pincode) from user's live IP address
     */
    private function getGeoLocationFromIp($request)
    {
        if (!$request) {
            return [
                'lat'     => '25.5941',
                'long'    => '85.1376',
                'geocode' => '25.5941,85.1376',
                'pincode' => '110001',
                'ip'      => '164.52.220.21'
            ];
        }

        $ip = $request->header('CF-Connecting-IP') ?? $request->header('X-Forwarded-For') ?? $request->ip();
        if ($ip && str_contains($ip, ',')) {
            $ip = trim(explode(',', $ip)[0]);
        }

        $default = [
            'lat'     => '25.5941',
            'long'    => '85.1376',
            'geocode' => '25.5941,85.1376',
            'pincode' => '110001',
            'ip'      => $ip
        ];

        if (empty($ip) || $ip === '127.0.0.1' || $ip === '::1') {
            return $default;
        }

        try {
            $ch = curl_init("http://ip-api.com/json/{$ip}?fields=status,lat,lon,zip");
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 3,
                CURLOPT_CONNECTTIMEOUT => 2,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_USERAGENT      => 'Mozilla/5.0'
            ]);
            $res = curl_exec($ch);
            curl_close($ch);

            if ($res) {
                $data = json_decode($res, true);
                if (!empty($data) && ($data['status'] ?? '') === 'success') {
                    $lat = number_format((float)($data['lat'] ?? 25.5941), 4, '.', '');
                    $lon = number_format((float)($data['lon'] ?? 85.1376), 4, '.', '');
                    return [
                        'lat'     => $lat,
                        'long'    => $lon,
                        'geocode' => "{$lat},{$lon}",
                        'pincode' => (string)($data['zip'] ?? '110001'),
                        'ip'      => $ip
                    ];
                }
            }
        } catch (\Throwable $e) {
            // Ignore network errors and return default
        }

        return $default;
    }

    /**
     * Parse API Response to Array handling both JSON and XML formats automatically
     */
    private function parseApiResponseToArray($resData)
    {
        if (empty($resData) || !is_string($resData)) {
            return is_array($resData) ? $resData : [];
        }

        $resDataClean = str_replace(["\xEF\xBB\xBF", "\u{FEFF}"], '', trim($resData));
        $resDataClean = preg_replace('/[\x00-\x1F\x7F]/', '', $resDataClean);
        if (empty($resDataClean)) {
            $resDataClean = trim($resData);
        }

        // 1. Try JSON parsing
        $rj = json_decode($resDataClean, true);
        if (!$rj) {
            $rj = json_decode($resData, true);
        }

        // 2. If JSON parsing failed, check if response is XML
        if (!$rj && (str_starts_with($resDataClean, '<') || str_contains($resDataClean, '</'))) {
            try {
                libxml_use_internal_errors(true);
                $xml = @simplexml_load_string($resDataClean, 'SimpleXMLElement', LIBXML_NOCDATA);
                if ($xml === false) {
                    $xml = @simplexml_load_string($rawResponse ?? $resData, 'SimpleXMLElement', LIBXML_NOCDATA);
                }
                if ($xml !== false) {
                    $parsed = json_decode(json_encode($xml), true);
                    if (is_array($parsed)) {
                        $rj = array_map(function($v) {
                            return (is_array($v) && empty($v)) ? '' : $v;
                        }, $parsed);
                    }
                }
                libxml_clear_errors();
            } catch (\Throwable $e) {
                // Silence XML errors
            }
        }

        return is_array($rj) ? $rj : ['raw' => $resData];
    }

    /**
     * Helper to resolve dynamic & static API request parameters
     */
    private function resolveApiParameter($p, $context = [])
    {
        $paramKey = $p['key'] ?? $p['name'] ?? null;
        if (empty($paramKey)) return null;

        $rawVal = $p['value'] ?? '';
        $dynVal = strtolower(trim($p['dynamic_value'] ?? 'Static Value'));

        $number = $context['number'] ?? '';
        $customer_number = $context['customer_number'] ?? ($user->mobile ?? '');
        $account_number = $context['account_number'] ?? $number;
        $amount = $context['amount'] ?? '';
        $operator = $context['operator'] ?? '';
        $circle = $context['circle'] ?? '';
        $txnid = $context['txnid'] ?? ($context['oid'] ?? '');
        $oid = $context['oid'] ?? ($context['refrence_id'] ?? ($context['reference_id'] ?? ($context['txnid'] ?? '')));
        $account_id = $context['account_id'] ?? '';
        $type = $context['type'] ?? '';
        $user = $context['user'] ?? null;
        $request = $context['request'] ?? null;

        // 1. Check explicit dynamic_value selected by user in UI
        if ($dynVal === 'number' || $dynVal === 'mobile') {
            return $number;
        } elseif ($dynVal === 'amount') {
            return $amount;
        } elseif ($dynVal === 'operator' || $dynVal === 'opcode') {
            return $operator;
        } elseif ($dynVal === 'circle' || $dynVal === 'state') {
            return $circle;
        } elseif ($dynVal === 'txnid') {
            return $txnid;
        } elseif ($dynVal === 'oid' || $dynVal === 'refrence_id' || $dynVal === 'reference_id' || $dynVal === 'ref_id') {
            return $oid;
        } elseif ($dynVal === 'account_number' || $dynVal === 'account_id') {
            return $account_number;
        } elseif ($dynVal === 'call_back_url' || $dynVal === 'callback_url') {
            return url('/api/sankramUtilityCallback');
        } elseif ($dynVal === 'user_id' || $dynVal === 'member_id' || strtolower($paramKey) === 'userid' || strtolower($paramKey) === 'user_id') {
            return (!empty($rawVal) && $rawVal !== 'Static Value' && $rawVal !== 'user_id') ? $rawVal : ($user ? ($user->mid ?? $user->id) : '60');
        } elseif ($dynVal === 'agent_code' || $dynVal === 'merchant_id') {
            return (!empty($rawVal) && $rawVal !== 'Static Value') ? $rawVal : ($user ? ($user->mid ?? $user->agent_code ?? $user->id) : ($rawVal ?: 'AGENT001'));
        } elseif ($dynVal === 'geocode' || $dynVal === 'lat_long' || strtolower($paramKey) === 'geocode' || strtolower($paramKey) === 'geo_code') {
            $rawLat = ($request && !empty($request->latitude)) ? $request->latitude : (($request && !empty($request->lat)) ? $request->lat : null);
            $rawLong = ($request && !empty($request->longitude)) ? $request->longitude : (($request && !empty($request->long)) ? $request->long : null);
            if ((!$rawLat || !$rawLong) && $request) {
                $geoIp = $this->getGeoLocationFromIp($request);
                $rawLat = $rawLat ?: $geoIp['lat'];
                $rawLong = $rawLong ?: $geoIp['long'];
            }
            $lat = number_format((float)($rawLat ?: 25.5941), 4, '.', '');
            $long = number_format((float)($rawLong ?: 85.1376), 4, '.', '');
            return ($request && !empty($request->geocode)) ? $request->geocode : "{$lat},{$long}";
        } elseif ($dynVal === 'latitude' || $dynVal === 'lat') {
            $lat = ($request && !empty($request->latitude)) ? $request->latitude : (($request && !empty($request->lat)) ? $request->lat : null);
            if (!$lat && $request) {
                $geoIp = $this->getGeoLocationFromIp($request);
                $lat = $geoIp['lat'];
            }
            return number_format((float)($lat ?: ($rawVal ?: 25.5941)), 4, '.', '');
        } elseif ($dynVal === 'longitude' || $dynVal === 'long') {
            $lng = ($request && !empty($request->longitude)) ? $request->longitude : (($request && !empty($request->long)) ? $request->long : null);
            if (!$lng && $request) {
                $geoIp = $this->getGeoLocationFromIp($request);
                $lng = $geoIp['long'];
            }
            return number_format((float)($lng ?: ($rawVal ?: 85.1376)), 4, '.', '');
        } elseif ($dynVal === 'pincode' || strtolower($paramKey) === 'pincode') {
            $pincode = null;
            if ($user) {
                $kyc = \DB::table('user_kyc')->where('user_id', $user->id ?? 0)->first();
                $pincode = $kyc->pincode ?? null;
            }
            if (!$pincode && $user) {
                $draft = \DB::table('aeps_drafts')->where('mid', $user->mid ?? '')->first();
                $pincode = $draft->shop_pin_code ?? null;
            }
            if (!$pincode && $request) {
                $geoIp = $this->getGeoLocationFromIp($request);
                $pincode = $geoIp['pincode'] ?? null;
            }
            return (string)($pincode ?: ($rawVal ?: '110001'));
        } elseif ($dynVal === 'outletid' || $dynVal === 'outlet_id' || strtolower($paramKey) === 'outletid' || strtolower($paramKey) === 'outlet_id') {
            $outletid = $request ? ($request->outlet_id ?? $request->outletid ?? null) : null;
            if (!$outletid && $user) {
                $outletid = $user->outlet_id ?? $user->mid ?? null;
            }
            if (!$outletid && $user) {
                $draft = \DB::table('aeps_drafts')->where('mid', $user->mid ?? '')->first();
                $outletid = $draft->outlet_id ?? $draft->mid ?? null;
            }
            return (string)($outletid ?: ($rawVal ?: '500967'));
        } elseif ($dynVal === 'customer_number' || $dynVal === 'customernumber' || strtolower($paramKey) === 'customernumber' || strtolower($paramKey) === 'customer_number') {
            return $customer_number ?: ($user ? ($user->mobile ?? '') : ($request ? ($request->mobile_number ?? $request->customer_number ?? '') : ''));
        } elseif ($dynVal === 'client_ip' || $dynVal === 'ip') {
            $ip = $request ? ($request->header('CF-Connecting-IP') ?? $request->header('X-Forwarded-For') ?? $request->ip()) : null;
            if ($ip && str_contains($ip, ',')) {
                $ip = trim(explode(',', $ip)[0]);
            }
            return ($ip && $ip !== '127.0.0.1' && $ip !== '::1') ? $ip : ($rawVal ?: '164.52.220.21');
        } elseif ($dynVal === 'timestamp' || $dynVal === 'time') {
            return (string) time();
        } elseif ($dynVal === 'random_ref') {
            return (string) mt_rand(1000000000, 9999999999);
        } elseif ($dynVal === 'recharge_date' || $dynVal === 'date_ymd' || $dynVal === 'date') {
            return $context['recharge_date'] ?? date('Y-m-d');
        } elseif ($dynVal === 'date_dmy') {
            return $context['date_dmy'] ?? date('d-m-Y');
        } elseif ($dynVal === 'date_dmy_slash') {
            return $context['date_dmy_slash'] ?? date('d/m/Y');
        } elseif ($dynVal === 'created_at') {
            return $context['created_at'] ?? date('Y-m-d H:i:s');
        } elseif ($dynVal === 'api_key') {
            return $rawVal;
        }

        // 2. Check dollar placeholders if dynamic_value is default ('static value' or empty)
        if ($rawVal === '$number') return $number;
        if ($rawVal === '$amount') return $amount;
        if ($rawVal === '$operator') return $operator;
        if ($rawVal === '$txnid') return $txnid;
        if ($rawVal === '$oid' || $rawVal === '$refrence_id' || $rawVal === '$reference_id' || $rawVal === '$ref_id') return $oid;
        if ($rawVal === '$circle' || $rawVal === '$circal') return $circle;
        if ($rawVal === '$type') return $type;
        if ($rawVal === '$account_id') return $account_id;
        if ($rawVal === '$call_back_url') return url('/api/sankramUtilityCallback');

        // 3. Fallback placeholder string replacements in rawVal string
        if (is_string($rawVal) && !empty($rawVal)) {
            return str_replace(
                ['$number', '$amount', '$operator', '$txnid', '$oid', '$refrence_id', '$reference_id', '$ref_id', '$circle', '$circal', '$type'],
                [$number, $amount, $operator, $txnid, $oid, $oid, $oid, $oid, $circle, $circle, $type],
                $rawVal
            );
        }

        return $rawVal;
    }

    /**
     * Helper to evaluate multi-value status matching (comma-separated strings)
     */
    private function evaluateStatusResponse($rawStatus, $configSuccessStr = '', $configFailureStr = '')
    {
        $configSuccessTrim = strtolower(trim((string)$configSuccessStr));
        $configFailureTrim = strtolower(trim((string)$configFailureStr));

        if ($configSuccessTrim !== '') {
            $successValues = array_map('trim', explode(',', $configSuccessTrim));
        } else {
            $successValues = ['accepted', 'success', 'successful', '1', '2', 'true', 'ok', '01', '100'];
        }

        if ($configFailureTrim !== '') {
            $failureValues = array_map('trim', explode(',', $configFailureTrim));
        } else {
            $failureValues = ['failure', 'failed', 'error', '0', '3', 'false', 'rejected', '00'];
        }

        if ($rawStatus === true) {
            $rawStatusLower = 'true';
        } elseif ($rawStatus === false) {
            $rawStatusLower = 'false';
        } else {
            $rawStatusLower = strtolower(trim((string)$rawStatus));
        }

        $isSuccess = in_array($rawStatusLower, $successValues, true);
        $isFailure = in_array($rawStatusLower, $failureValues, true);

        // Fallback keyword matching if not matched directly and no explicit config set
        if (!$isSuccess && !$isFailure && !empty($rawStatusLower) && $configSuccessTrim === '' && $configFailureTrim === '') {
            if (str_contains($rawStatusLower, 'success') || str_contains($rawStatusLower, 'accept')) {
                $isSuccess = true;
            } elseif (str_contains($rawStatusLower, 'fail') || str_contains($rawStatusLower, 'error') || str_contains($rawStatusLower, 'reject')) {
                $isFailure = true;
            }
        }

        if ($isSuccess) return 'success';
        if ($isFailure) return 'failed';
        return 'pending';
    }

}

