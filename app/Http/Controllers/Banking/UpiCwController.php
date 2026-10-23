<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\AepsTransaction;
use App\Models\AepsDraft;
use App\Models\User;
use App\Models\Account;
use App\Services\CatchLogService;

class UpiCwController extends Controller
{
    // Constants
    private const API_TIMEOUT = 60;
    private const SECRET_KEY = "6149c45503d6d3a60c5b775b56adc52b533fa428b060109c4d59e935e6d1524";
    private const MID = "AGENT1475";
    private const MKEY = "8ECgqn6xep6FPdVvzOs4ketqWQxG9qGY";
    private const BASE_URL = 'https://icchhamatidataservice.com/api/';


    /**
     * II. UPI Cash Withdrawal Initiate Payment API
     */
    public function initiatePayment(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'amount'          => 'required|numeric|min:100|max:5000',
                'latitude'        => 'nullable|numeric',
                'longitude'       => 'nullable|numeric',
                'customer_mobile' => 'nullable|string|digits:10',
                'remarks'         => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Validation error: ' . implode(', ', $validator->errors()->all()),
                    'errors'  => $validator->errors()
                ], 200);
            }

            // Amount must be a multiple of 100 as mandated by NPCI & Fingpay spec
            if (fmod((float)$request->amount, 100) != 0) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Requested amount MUST be a multiple of 100 (e.g., 100, 200, 500, 1000).',
                ], 200);
            }

            $user = $request->get('user') ?? auth()->user();
            $outletId = $request->outletId ?? $request->mid ?? ($user ? $user->mid : null);

            if (empty($outletId)) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Merchant Outlet ID (MID) is required.',
                ], 200);
            }

            // Fetch AEPS Draft for Merchant details
            $existingUser = AepsDraft::where('mid', $outletId)
                ->where('status', 'draft')
                ->first();

            if (!$existingUser) {
                // Fallback attempt: find user by mid
                $existingUser = AepsDraft::where('mid', $outletId)->first();
            }

            if (!$existingUser) {
                return response()->json([
                    'status'  => false,
                    'message' => 'No onboarded merchant draft found for MID: ' . $outletId,
                ], 200);
            }

            $partnerRequestId = 'UPICW' . date('YmdHis') . rand(100, 999);

            $lat = (float)($request->latitude ?? $existingUser->latitude ?? 17.385044);
            $lng = (float)($request->longitude ?? $existingUser->longitude ?? 78.486671);

            $url = self::BASE_URL."v2/upicw/initiate-payment";

            $data = [
                "outletId"         => $existingUser->bmid,
                "amount"           => $request->amount, 
            ];

            // Save Initial Record in aeps_transactions Table
            $transaction = AepsTransaction::create([
                'mid'                  => $existingUser->mid,
                'customer_mobile'      => $request->customer_mobile ?? $existingUser->phone,
                'longitude'            => $lng,
                'latitude'             => $lat,
                'aeps_type'            => 'UPICW',
                'amount'               => (float)$request->amount,
                'merchant_txn_id'      => $partnerRequestId,
                'request'              => json_encode($data),
                'response_status'      => false,
                'response_message'     => 'Initiated',
                'admin_id'             => $existingUser->admin_id ?? ($user ? $user->admin_mid : '1'),
                'created_by'           => $existingUser->created_by ?? ($user ? $user->id : '1'),
            ]);

            // Log Request in system logs
            DB::table('logs')->insert([
                'mid'          => $existingUser->mid,
                'type'         => 'UPICW Initiate Payment',
                'platform'     => 'WEB',
                'headers'      => json_encode([
                    'Accept'          => 'application/json',
                    'Content-Type'    => 'application/json',
                    'trnTimestamp'    => $trnTimestamp,
                    'hash'            => $hash,
                    'eskey'           => $eskey,
                    'superMerchantId' => self::SUPER_MERCHANT_ID,
                ]),
                'request_data'  => json_encode($data),
                'url'           => $url,
                'txnid'         => $partnerRequestId,
                'status'        => 0,
                'created_at'    => now(),
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

            // Update System Logs
            DB::table('logs')
                ->where('txnid', $partnerRequestId)
                ->update([
                    'response_data' => json_encode($responseJson),
                    'status'        => ($responseJson['status'] ?? false) ? 1 : 0,
                    'updated_at'    => now(),
                ]);

            // Update Transaction Record
            $transaction->update([
                'response'             => $responseJson,
                'response_status'      => $responseJson['status'] ?? false,
                'response_status_code' => (string)($responseJson['statusCode'] ?? "10001"),
                'response_message'     => $responseJson['message'] ?? 'Response Received',
            ]);

            if (isset($responseJson['status']) && $responseJson['status'] == 1) {
                return response()->json([
                    'status'          => true,
                    'message'         => $responseJson['message'] ?? 'UPI Cash Withdrawal Initiated Successfully',
                    'data'            => $responseJson['data'] ?? [],
                    'statusCode'      => $responseJson['statusCode'] ?? 10000,
                    'partnerRequestId'=> $responseJson['partnerRequestId'],
                    'transaction_id'  => $responseJson['transaction_id']
                ], 200);
            } else {
                return response()->json([
                    'status'     => false,
                    'message'    => $responseJson['message'] ?? 'Payment initiation failed',
                    'statusCode' => $responseJson['data']['statusCode'] ?? 10001,
                    'data'       => $responseJson['data'] ?? null
                ], 200);
            }

        } catch (\Exception $e) {
            CatchLogService::logException($request, 'upicwInitiatePayment', $e, [
                'context' => 'UPI Cash Withdrawal Initiate Payment Exception',
            ]);

            return response()->json([
                'status'  => false,
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * IV. UPI Cash Withdrawal Status Check API
     */
    public function checkStatus(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'partnerRequestId' => 'required|string',
                'fingpayTxnId'     => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Missing parameter(s): ' . implode(', ', $validator->errors()->all())
                ], 200);
            }

            $plainPayload = [
                "fingpayTxnId"     => $request->fingpayTxnId,
                "partnerRequestId" => $request->partnerRequestId,
            ];

            
            $url = self::BASE_URL."v2/upicw/check-status";

            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => json_encode($plainPayload),
                CURLOPT_TIMEOUT        => self::API_TIMEOUT,
                CURLOPT_HTTPHEADER     => [
                    'Accept: application/json',
                    'Content-Type: application/json',
                    'mid: ' . self::MID,
                    'mkey: ' . self::MKEY,
                ],
            ]);
            
            $rawResponse = curl_exec($ch);
            curl_close($ch);

            $responseJson = json_decode($rawResponse, true);

            // Update transaction table record if exists
            $txnRecord = AepsTransaction::where('merchant_txn_id', $request->partnerRequestId)
                ->where('aeps_type', 'UPICW')
                ->first();

            if ($txnRecord && isset($responseJson['status'])) {
                $txnRecord->update([
                    'response'         => $responseJson,
                    'aadhaar_number'   => $responseJson['data']['payerVpa'] ?? null,
                    'response_status'  => $responseJson['status'],
                    'response_message' => $responseJson['message'] ?? ($responseJson['data']['responseMessage'] ?? null),
                ]);

                if ($responseJson['status'] == true && $responseJson['statusCode'] == '10000') {

                    // ✅ Duplicate-credit guard: only process money if NOT already credited
                    if (!$txnRecord->response_credited) {

                        // Mark as credited FIRST to prevent race conditions / double calls
                        $txnRecord->update(['response_credited' => true]);

                        $mid           = $txnRecord->mid;
                        $admin_id      = $txnRecord->admin_id;
                        $amount        = $txnRecord->amount;
                        $transaction_id = $txnRecord->merchant_txn_id;

                        $user    = User::where('mid', $mid)->first();
                        $account = Account::where('user_id', $user->id)->where('primary_status', true)->first();

                        // Determine category based on AEPS type
                        $categoryCode = 'AEPS';
                        $type         = 'UPICW';

                        // Step 1: Prepare transaction data
                        $transactionData1 = [
                            'account_id'     => $account->id,
                            'type'           => 'CR',
                            'amount'         => $amount,
                            'description'    => $type . ' - Transaction ' . $transaction_id,
                            'transaction_id' => $transaction_id,
                            'created_by'     => $user->id,
                            'admin_id'       => $admin_id,
                            'user_id'        => $user->id,
                            'category_code'  => $categoryCode
                        ];

                        // Step 2: Create the transaction
                        $transaction = createTransaction($transactionData1);

                        $commissionTransactionData = [
                            'user_id'       => $user->id,
                            'amount'        => $amount,
                            'sub_module_id' => 97,
                            'category_code' => 'AEPS',
                            'description'   => $type . ' - Commission ' . $transaction_id,
                            'admin_id'      => $admin_id
                        ];

                        processCommissionCharge($commissionTransactionData);
                    }
                }
            }

            return response()->json($responseJson);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 0,
                'message' => 'Status check error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get UPI Cash Withdrawal History
     */
    public function history(Request $request)
    {
        try {
            $user = $request->get('user') ?? auth()->user();
            $mid = $request->mid ?? ($user ? $user->mid : null);

            $query = AepsTransaction::where('aeps_type', 'UPICW');

            if ($mid) {
                $query->where('mid', $mid);
            }

            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
            }

            $transactions = $query->orderBy('id', 'desc')->paginate($request->per_page ?? 15);

            return response()->json([
                'status' => true,
                'data'   => $transactions
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch history: ' . $e->getMessage()
            ], 500);
        }
    }
}
