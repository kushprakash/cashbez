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
use App\Models\User;
use App\Models\Employee;
use App\Models\Lead;
use App\Models\UserKyc;
use App\Models\Account;
use App\Models\AepsDraft;
use App\Models\AepsTransaction;
use DB;

use Illuminate\Support\Facades\Cache;
use Exception;
use App\Services\CatchLogService;

class CallbackController extends Controller
{

    public function matmCallback(Request $request)
    {
        try {


            //{"ipaddress":"172.20.3.94","amount":200,"transactionStatus":"S",
            // "merchantRefNo":"MATM17691592226944","fpTransactionId":"MACA7422236230126143711480W",
            // "aadhaarNumber":null,"typeOfTransaction":"MATMCW","latitude":26.121114,
            // "longitude":85.358278,"mobile":"9835153380","errorMessage":"Success",
            // "bankRRN":"602314898002","merchantName":"Chandrabhushan Prakash",
            // "terminalID":"NSDBLKAV","bankName":"IDBI BANK",
            // "requestedTimestamp":"23\/01\/2026 14:37:11","merchantID":"ENX0000018",
            // "deviceIMEI":"0:0:0:0:0:0:0:1","cardNumber":"652266******3251",
            // "cardType":"RuPay","balance":4802.67,"mposSerialNumber":"63250514414070"}


            $typeOfTransaction = $request->typeOfTransaction ?? null;

            DB::table('logs')->insert([
                'mid' => $request->merchantID ?? null,
                'type' => $typeOfTransaction . ' Callback',
                'platform' => 'Webhook',
                'headers' => NULL,
                'request_data' => json_encode($request->all()),
                'url' => 'MATM Callback',
                'txnid' => $request->fpTransactionId ?? null,
                'status' => 0,
                'timestamp' => now(),
                'created_at' => now()->format('Y-m-d H:i:s'),
            ]);

            if (!($request->merchantID && $request->fpTransactionId)) {
                return response()->json([
                    'message' => 'Invalid request',
                ], 400);
            }

            $reqdata = json_encode($request->all());

            $msg = 'pending';
            $status = 0;
            if ($request->transactionStatus == 'S') {
                $status = 1;
                $msg = 'successful';
            }


            $apiResponse = [
                'outletId' => $request->merchantID,
                'mobile' => $request->mobile,
                'data' => [
                    'terminalId' => $request->terminalID,
                    'requestTransactionTime' => $request->requestedTimestamp,
                    'transactionAmount' => $request->amount,
                    'transactionStatus' => $msg,
                    'balanceAmount' => $request->balance ?? 0,
                    'bankRRN' => $request->bankRRN,
                    'transactionType' => 'MATMCW',
                    'fpTransactionId' => $request->fpTransactionId,
                    'errorCode' => '00',
                    'errorMessage' => $request->errorMessage ?? 'Success',
                    'merchantTransactionId' => $request->merchantRefNo,
                    'arpc' => NULL,
                    'cardType' => $request->cardType,
                    'bankName' => $request->bankName,
                    'cardNumber' => $request->cardNumber
                ],
            ];


            $checkTxn = AepsTransaction::where('mid', $request->merchantID)
                ->where('merchant_txn_id', $request->fpTransactionId)
                ->count();

            if ($checkTxn < 2) {

                $existingUser = AepsDraft::where('mid', $request->merchantID)->first();


                $txnResult = AepsTransaction::updateOrCreate(
                [
                    // condition (match karne ke liye)
                    'merchant_txn_id' => $request->fpTransactionId,
                ],
                [
                    'mid' => $request->merchantID,
                    'machine_json_data' => '',
                    'customer_mobile' => $request->mobile,
                    'aadhaar_number' => null,
                    'longitude' => floatval($existingUser->longitude),
                    'latitude' => floatval($existingUser->latitude),
                    'bank_id' => null,
                    'bank_name' => $request->bankName,
                    'device_type' => 'MATM',
                    'aeps_type' => 'MATMCW',
                    'amount' => $request->amount,
                    'admin_id' => $existingUser->admin_id,
                    'created_by' => $existingUser->created_by,
                    'merchant_txn_id' => $request->fpTransactionId,
                    "request" => json_encode($apiResponse),
                    "response" => $reqdata,
                    "response_status" => $status ?? null,
                    "response_status_code" => "00" ?? null,
                    "response_message" => $request->errorMessage ?? null,
                    "mposSerialNumber" => $request->mposSerialNumber ?? $existingUser->mposSerialNumber,
                    "auth3way" => 0
                ]);

                $is_api_partner = false;
                $adminData = User::where('id', $existingUser->admin_id)->first();
                if ($adminData && $adminData->is_api_partner == true) {
                    $credit_user_id = $adminData->id;
                    $is_api_partner = true;
                }
                else {
                    $userData = User::where('mid', $existingUser->mid)->first();
                    $credit_user_id = $userData->id;
                }


                if ($status == 1) {

                    $txnResult->update([
                        "response_message" => 'Success',
                    ]);


                    $account = Account::where('user_id', $credit_user_id)->where('primary_status', true)->first();

                    // Determine category based on MATM type
                    $categoryCode = 'MATM';
                    $amount = $request->amount;
                    $cardNumber = $request->cardNumber;
                    // Step 1: Prepare transaction data
                    $transactionData1 = [
                        'account_id' => $account->id,
                        'type' => 'CR',
                        'amount' => $amount,
                        'description' => $typeOfTransaction . ' - Transaction ' . $cardNumber,
                        'transaction_id' => $request->fpTransactionId,
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
                        'sub_module_id' => 75,
                        'category_code' => $categoryCode,
                        'description' => $typeOfTransaction . ' - Commission ' . $cardNumber,
                        'admin_id' => $existingUser->admin_id
                    ];

                    processCommissionCharge($commissionTransactionData);


                }


                if ($is_api_partner == true && $status == 1) {

                    $setting = Setting::where('user_id', $credit_user_id)->first();
                    if ($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)) {
                        // Send callback to partner URL
                        try {

                            $db_response_data = DB::table('aeps_transactions')->where('merchant_txn_id', $request->fpTransactionId)
                                ->select(
                                'mid as outletId',
                                'customer_mobile',
                                'aadhaar_number',
                                'bank_id',
                                'bank_name',
                                'device_type',
                                'aeps_type',
                                'amount',
                                'response_status',
                                'merchant_txn_id',
                                'mposSerialNumber',
                                'request as response'
                            )
                                ->first();


                            $postData = [
                                "type" => "matm_transaction",
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

                            curl_exec($ch);

                        }
                        catch (\Exception $e) {
                            \Log::error('Callback to API partner failed: ' . $e->getMessage());
                        }

                    }
                }

            }

        }
        catch (\Throwable $th) {
            $refId = CatchLogService::logException($request, 'NATN Callback', $th, [
                'context' => 'MATM Callback error',
            ]);
        }
    }


    public function matmRequest(Request $request)
    {


        try {
            $mid = $request->outletId;
            $mobile = $request->mobile;
            $platform = $request->platform ?? 'APP';
            $data = (object)$request->data;
            $transactionType = isset($data->transactionType) ? $data->transactionType : null;
            $errorCode = $data->errorCode;
            $errorMessage = $data->errorMessage;

            if ($errorCode == '00') {
                $status = 1;
            }
            else {
                $status = 0;
            }

            if ($transactionType == 'BAL') {
                $type = 'Balance Enquiry';
                $mode = 'MATMBE';
            }
            else {
                $type = 'Cash Withdrawal';
                $mode = 'MATMCW';
                $errorMessage = 'Pending Settlement';
            }

            DB::table('logs')->insert([
                'mid' => $mid,
                'type' => 'Request MATM ' . $type,
                'platform' => $platform,
                'headers' => NULL,
                'request_data' => json_encode($request->all()),
                'url' => 'MATM Request',
                'txnid' => $data->fpTransactionId,
                'status' => 0,
                'timestamp' => now(),
                'created_at' => now()->format('Y-m-d H:i:s'),
            ]);

            if ($transactionType == 'BAL' || ($transactionType != 'BAL' && $status == 0)) {
                // ✅ Find agent draft
                $existingUser = AepsDraft::where('mid', $mid)->first();

                if (!$existingUser) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'No Agent found with the provided outletId',
                    ], 200);
                }

                $alldata = $request->except(['isAdmin', 'isSuper', 'admin', 'user']);

                $history = AepsTransaction::create([
                    'mid' => $existingUser->mid,
                    'machine_json_data' => '',
                    'customer_mobile' => $request->mobile,
                    'aadhaar_number' => null,
                    'longitude' => floatval($existingUser->longitude),
                    'latitude' => floatval($existingUser->latitude),
                    'bank_id' => null,
                    'bank_name' => $data->bankName,
                    'device_type' => 'MATM',
                    'aeps_type' => $mode,
                    'amount' => $data->transactionAmount,
                    'admin_id' => $existingUser->admin_id,
                    'created_by' => $existingUser->created_by,
                    'merchant_txn_id' => $data->fpTransactionId,
                    "request" => trim(json_encode($alldata)),
                    "response" => null,
                    "response_status" => $status ?? null,
                    "response_status_code" => $errorCode ?? null,
                    "response_message" => $errorMessage ?? null,
                    "mposSerialNumber" => $request->mposSerialNumber ?? $existingUser->mposSerialNumber,
                    "auth3way" => 0
                ]);

                $is_api_partner = false;
                $adminData = User::where('id', $existingUser->admin_id)->first();
                if ($adminData && $adminData->is_api_partner == true) {
                    $credit_user_id = $adminData->id;
                    $is_api_partner = true;
                }
                else {
                    $userData = User::where('mid', $existingUser->mid)->first();
                    $credit_user_id = $userData->id;
                }

                if ($is_api_partner == true) {
                    $setting = Setting::where('user_id', $credit_user_id)->first();
                    if ($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)) {
                        // Send callback to partner URL
                        try {

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
                                'response_status',
                                'merchant_txn_id',
                                'mposSerialNumber',
                                'request as response'
                            )
                                ->first();


                            $postData = [
                                "type" => "matm_transaction",
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

                        }
                        catch (\Exception $e) {
                            \Log::error('Callback to API partner failed: ' . $e->getMessage());
                        }

                    }
                }

                return response()->json([
                    'status' => 1,
                    'message' => 'MATM Request processed successfully',
                ], 200);

            }

        }
        catch (\Throwable $th) {
            $refId = CatchLogService::logException($request, 'MATM Request', $th, [
                'context' => 'MATM Request error',
            ]);
        }
    }


    public function matmConfig(Request $request)
    {
        try {
            $mid = $request->outletId;
            $type = $request->type;
            $existingUser = AepsDraft::where('mid', $mid)->first();
            if ($existingUser == null) {
                return response()->json(['status' => 0, 'message' => 'Invalid Outlet ID', 'data' => null], 200);
            }

            if ($type == 'login') {

                $loginRequestData = [
                    'merchantId' => $mid,
                    'merchantPin' => base64_decode($existingUser->password),
                    'superMerchantId' => 1262,
                ];

                $encryptedData = $this->encrypt(json_encode($loginRequestData));

                $status = 1;
                $message = 'Data fetched successfully';
                $data = $encryptedData;
            }

            if ($type == 'doTransaction') {
                $rdata = (object)$request->data;

                $loginRequestData = [
                    'mobileNumber' => $rdata->mobileNumber,
                    'remarks' => $rdata->remarks,
                    'txnType' => $rdata->txnType,
                    'amount' => $rdata->amount,
                    'merchantTransactionId' => 'MATM' . time() . rand(1111, 9999),
                    'deviceImei' => $existingUser->mposSerialNumber ?? rand(11111111111, 99999999999),
                    'latitude' => $rdata->latitude,
                    'longitude' => $rdata->longitude,
                ];

                $encryptedData = $this->encrypt(json_encode($loginRequestData));

                $status = 1;
                $message = 'Data fetched successfully';
                $data = $encryptedData;


            }


            return response()->json(['status' => $status, 'message' => $message, 'data' => $data], 200);


        }
        catch (\Throwable $th) {
            $refId = CatchLogService::logException($request, 'MATM Config', $th, [
                'context' => 'MATM Config error',
            ]);
        }
    }


    private function encrypt($data)
    {
        $key = '284908D75CAB6D9C9DE7281CBA76EF9D'; // same key

        // AES-256-ECB encryption
        $encrypted = openssl_encrypt(
            $data,
            'AES-256-ECB',
            $key,
            OPENSSL_RAW_DATA
        );

        // CryptoJS outputs Base64
        return base64_encode($encrypted);
    }

    public function autoLeadGenerate(Request $request)
    {
        try {

            $sevenDaysAgo = now()->subDays(7);

            $employees = Employee::with('user')
                ->where('admin_id', 21)
                ->orderBy('created_at', 'asc')
                ->get();

            if ($employees->isEmpty()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No employees found',
                ]);
            }

            $employeeIndex = 0;
            $employeeCount = $employees->count();

            $users = User::where('status', 1)
                ->where('role', 10)
                ->whereNotIn('mid', function ($query) use ($sevenDaysAgo) {
                $query->select('mid')
                    ->from('aeps_transactions')
                    ->where('aeps_type', 'CW')
                    ->where('created_at', '>=', $sevenDaysAgo);
            })
                ->get();

            foreach ($users as $user) {

                // ❌ Skip if lead generated in last 7 days
                $recentLead = Lead::where('phone', $user->mobile)
                    ->where('created_at', '>=', $sevenDaysAgo)
                    ->exists();

                if ($recentLead) {
                    continue;
                }

                // Get latest lead
                $existingLead = Lead::where('phone', $user->mobile)
                    ->orderBy('id', 'desc')
                    ->first();

                // ❌ Skip Not Interested & Rejected
                if ($existingLead && in_array($existingLead->status_id, [9, 11])) {
                    continue;
                }

                if ($existingLead) {

                    // ✅ Reopen with SAME employee
                    $existingLead->update([
                        'status_id' => 1,
                        'followup_date' => now(),
                        'details' => 'Re-opened: Call & Request to do minimum 2 CW transaction',
                    ]);

                }
                else {

                    // ✅ New lead → Round Robin assign
                    $employee = $employees[$employeeIndex];
                    $assignedUserId = $employee->user->id ?? null;

                    if (!$assignedUserId) {
                        continue;
                    }

                    Lead::create([
                        'lead_type_id' => 1,
                        'name' => $user->name,
                        'phone' => $user->mobile,
                        'email' => $user->email,
                        'source_id' => 1,
                        'assigned_user_id' => $assignedUserId,
                        'status_id' => 1,
                        'priority' => 'medium',
                        'details' => 'Call & Request to do minimum 2 transaction with Cashbez Payment Service',
                        'followup_date' => now(),
                        'created_by' => 21,
                        'admin_id' => 21,
                    ]);

                    // Move to next employee
                    $employeeIndex++;
                    if ($employeeIndex >= $employeeCount) {
                        $employeeIndex = 0;
                    }
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Auto lead generation completed successfully',
            ]);

        }
        catch (\Throwable $th) {

            $refId = CatchLogService::logException($request, 'Auto Lead Generate', $th, [
                'context' => 'Auto Lead Generate error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Something went wrong',
                'ref_id' => $refId
            ], 500);
        }
    }

    public function sankramUtilityCallback(Request $request)
    {
        try {
            DB::table('payouts_callbacks')->insert([
                'response_data' => json_encode($request->all() ?? [])
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Callback received successfully',
            ]);
        }
        catch (\Throwable $th) {
            $refId = CatchLogService::logException($request, 'Sankram Utility Callback', $th, [
                'context' => 'Sankram Utility Callback error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Something went wrong',
                'ref_id' => $refId
            ], 500);
        }
    }

    public function reffralProgramCron()
    {
        $users = DB::table('users')
            ->join('aeps_transactions', 'users.mid', '=', 'aeps_transactions.mid')
            ->join('users as refer_by_user', 'users.refer_by', '=', 'refer_by_user.mid')
            ->select(
            'users.id',
            'users.name',
            'users.mid',
            'users.refer_by',
            'refer_by_user.name as refer_name',
            'refer_by_user.id as refer_id',
            DB::raw('COUNT(aeps_transactions.id) as total_txn')
        )
            ->where('users.status', 1)
            ->where('users.role', 10)
            ->where('refer_by_user.status', 1)
            ->where('refer_by_user.role', 10)
            ->whereIn('aeps_transactions.aeps_type', ['CW', 'MATMCW', 'CD'])
            ->where('aeps_transactions.response_status', 1)

            ->whereNotExists(function ($query) {
            $query->select(DB::raw(1))
                ->from('passbooks')
                ->whereColumn('passbooks.user_id', 'refer_by_user.id')
                ->whereRaw("passbooks.description = CONCAT('Reffral Bonus ', users.mid)");
        })

            ->groupBy(
            'users.id',
            'users.name',
            'users.mid',
            'users.refer_by',
            'refer_by_user.name',
            'refer_by_user.id'
        )
            ->havingRaw('COUNT(aeps_transactions.id) >= 10')
            ->get();

        foreach ($users as $user) {

            $amount = 100;

            $account = Account::where('user_id', $user->refer_id)
                ->where('primary_status', true)
                ->first();

            if ($account) {

                $transactionData = [
                    'account_id' => $account->id,
                    'type' => 'CR',
                    'amount' => $amount,
                    'description' => 'Reffral Bonus ' . $user->mid,
                    'transaction_id' => mt_rand(1111111111, 9999999999),
                    'created_by' => 21,
                    'admin_id' => 21,
                    'user_id' => $user->refer_id,
                    'category_code' => 'AEPS'
                ];

                createTransaction($transactionData);
            }
        }
    }



}