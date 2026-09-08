<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CardDownload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class CardDownloadController extends Controller
{
    private $mid = "G195064846";
    private $mkey = "PRA3948146";
    private $wallet = "G53BD90U9F612K83574F1";
    private $chargeAmount = 25;                       
    private $commissionAmount = 20;

    // API endpoint mapping per card type
    private $apiEndpoints = [
        'pan'   => 'panvalidate',
        'dl'    => 'dlvalidate',
        'voter' => 'votervalidate',
        'rc'    => 'rcvalidate',
    ];

    // Validation rules per card type
    private $validationRules = [
        'aadhaar' => ['doc_number' => 'required|string|size:12|regex:/^[0-9]{12}$/'],
        'pan'     => ['doc_number' => 'required|string|size:10|regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i'],
        'dl'      => ['doc_number' => 'required|string|max:20', 'dob' => 'required|date'],
        'voter'   => ['doc_number' => 'required|string|max:20'],
        'rc'      => ['doc_number' => 'required|string|max:15'],
    ];

    // Field name mapping for API param names
    private $apiParamNames = [
        'pan'   => 'pancard',
        'dl'    => 'dlnumber',
        'voter' => 'epicnumber',
        'rc'    => 'rcnumber',
    ];

    // Name field in API response per card type
    private $nameFields = [
        'aadhaar' => 'name',
        'pan'     => 'RegisteredName',
        'dl'      => 'name',
        'voter'   => 'name',
        'rc'      => 'owner',
    ];

    /**
     * Download card (PAN, DL, Voter, RC) — single-step flow
     */
    public function downloadCard(Request $request)
    {
        $user = $request->get('user');
        $admin = $request->get('admin');

        $validator = Validator::make($request->all(), [
            'card_type'  => 'required|string|in:pan,dl,voter,rc',
            'doc_number' => 'required|string',
            'account_id' => 'required|integer',
            'mpin'       => 'required|digits:4',
            'dob'        => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => 'Validation error', 'error' => $validator->errors()], 200);
        }

        $cardType = $request->card_type;
        $docNumber = strtoupper(trim($request->doc_number));

        // Card-type specific validation
        if (isset($this->validationRules[$cardType])) {
            $typeValidator = Validator::make(
                array_merge($request->all(), ['doc_number' => $docNumber]),
                $this->validationRules[$cardType]
            );
            if ($typeValidator->fails()) {
                return response()->json(['status' => 0, 'message' => 'Validation error', 'error' => $typeValidator->errors()], 200);
            }
        }

        try {
            // Step 1: Check if this USER already downloaded this doc → return cached (free)
            $existing = CardDownload::where('user_id', $user->id)
                ->where('card_type', $cardType)
                ->where('doc_number', $docNumber)
                ->where('status', 1)
                ->first();

            if ($existing && !empty($existing->api_response)) {
                $keysToRemove = ['Fees', 'Bal', 'bal'];
                $decryptedResponse = $this->getDecryptedApiResponse($existing);
                $response = array_diff_key(json_decode($decryptedResponse, true) ?? [], array_flip($keysToRemove));
                return response()->json([
                    'status'  => 1,
                    'message' => 'Card data retrieved from history (no charge)',
                    'data'    => $response,
                    'download_id' => $existing->id,
                    'cached'  => true,
                ], 200);
            }

            // Step 2: Charge ₹25 via processTransaction
            $txnid = rand(11111111, 99999999);
            $transactionResult = processTransaction($request, [
                'account_id'    => $request->account_id,
                'mpin'          => $request->mpin,
                'type'          => 'DR',
                'amount'        => $this->chargeAmount,
                'description'   => ucfirst($cardType) . ' Card Download - ' . $docNumber,
                'transaction_id'=> 'VCD' . $txnid,
                'category_code' => 'COMMISSION',
            ]);

            if ($transactionResult['status'] !== 1) {
                return response()->json(['status' => 0, 'message' => $transactionResult['message'] ?? 'Transaction failed'], 200);
            }

            // Step 3: Try to find cached response (from verifications or other user's downloads)
            $apiResponse = $this->findCachedResponse($cardType, $docNumber);
            $customerName = null;

            if ($apiResponse) {
                // Use cached response
                $customerName = $this->extractCustomerName($cardType, $apiResponse);
            } else {
                // Step 4: Call GoterPay API
                $apiResult = $this->callGoterPayApi($cardType, $docNumber, $request->dob, $txnid);

                if (!$apiResult || !isset($apiResult['status']) || $apiResult['status'] !== 'SUCCESS') {
                    // Refund ₹25 on API failure
                    $this->refundCharge($request, $txnid, $cardType, $docNumber);

                    return response()->json([
                        'status'  => 0,
                        'message' => $apiResult['resText'] ?? 'Verification failed. Amount refunded.',
                        'data'    => $apiResult,
                    ], 200);
                }

                $apiResponse = $apiResult;
                $customerName = $this->extractCustomerName($cardType, $apiResponse);
            }

            // Step 5: Credit ₹20 commission back
            $this->creditCommission($request, $txnid, $cardType, $docNumber);

            // Step 6: Save to card_downloads
            $keysToRemove = ['Fees', 'Bal', 'bal'];
            $cleanResponse = array_diff_key($apiResponse, array_flip($keysToRemove));

            $download = CardDownload::create([
                'user_id'        => $user->id,
                'card_type'      => $cardType,
                'doc_number'     => $docNumber,
                'dob'            => $request->dob,
                'status'         => 1,
                'api_response'   => Crypt::encryptString(json_encode($cleanResponse)),
                'transaction_id' => 'VCD' . $txnid,
                'customer_name'  => $customerName,
                'amount'         => $this->chargeAmount,
                'commission'     => $this->commissionAmount,
            ]);

            $this->addCacheVerification($cardType, $docNumber, $cleanResponse);

            return response()->json([
                'status'      => 1,
                'message'     => ucfirst($cardType) . ' card downloaded successfully! ₹20 commission credited.',
                'data'        => $cleanResponse,
                'download_id' => $download->id,
                'cached'      => false,
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'Card download failed: ' . $e->getMessage()], 200);
        }
    }

    /**
     * Aadhaar — Step 1: Send OTP
     */
    public function aadhaarSendOtp(Request $request)
    {
        $user = $request->get('user');

        $validator = Validator::make($request->all(), [
            'doc_number' => 'required|string|size:12|regex:/^[0-9]{12}$/',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => 'Validation error', 'error' => $validator->errors()], 200);
        }

        try {
            $txnid = rand(11111111, 99999999);
            $aadhaarno = $request->doc_number;

            $url = "https://dashboard.goterpay.com/api/v3/verification/aadhaarotp?mid={$this->mid}&mkey={$this->mkey}&subwallet={$this->wallet}&txnid=$txnid&aadhaarno=$aadhaarno";
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            $response = curl_exec($ch);
            curl_close($ch);

            if (empty($response)) {
                return response()->json(['status' => 0, 'message' => 'Aadhaar server down'], 200);
            }

            $rj = json_decode($response, true);

            if (isset($rj['status']) && $rj['status'] == 'SUCCESS') {
                // Save pending row
                CardDownload::create([
                    'user_id'   => $user->id,
                    'card_type' => 'aadhaar',
                    'doc_number'=> $aadhaarno,
                    'refid'     => $rj['refid'],
                    'status'    => 0,
                ]);

                $keysToRemove = ['Fees', 'Bal', 'bal'];
                $rj = array_diff_key($rj, array_flip($keysToRemove));

                return response()->json(['status' => 1, 'message' => 'OTP sent successfully', 'data' => $rj], 200);
            }

            return response()->json(['status' => 0, 'message' => 'Failed to send OTP', 'data' => $rj], 200);

        } catch (\Exception $e) {
            Log::error('Aadhaar OTP Error: ' . $e->getMessage());
            return response()->json(['status' => 0, 'message' => 'Failed to send OTP'], 200);
        }
    }

    /**
     * Aadhaar — Step 2: Verify OTP + charge ₹25 + commission ₹20
     */
    public function aadhaarVerifyAndDownload(Request $request)
    {
        $user = $request->get('user');
        $admin = $request->get('admin');

        $validator = Validator::make($request->all(), [
            'refid'      => 'required|string',
            'otp'        => 'required|digits:6',
            'account_id' => 'required|integer',
            'mpin'       => 'required|digits:4',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => 'Validation error', 'error' => $validator->errors()], 200);
        }

        try {
            $pending = CardDownload::where('refid', $request->refid)->where('card_type', 'aadhaar')->first();

            if (!$pending) {
                return response()->json(['status' => 0, 'message' => 'Invalid Reference ID'], 200);
            }

            // Check if this user already has this aadhaar downloaded
            $existing = CardDownload::where('user_id', $user->id)
                ->where('card_type', 'aadhaar')
                ->where('doc_number', $pending->doc_number)
                ->where('status', 1)
                ->first();

            if ($existing && !empty($existing->api_response)) {
                $keysToRemove = ['Fees', 'Bal', 'bal'];
                $decryptedResponse = $this->getDecryptedApiResponse($existing);
                $response = array_diff_key(json_decode($decryptedResponse, true) ?? [], array_flip($keysToRemove));
                return response()->json([
                    'status'  => 1,
                    'message' => 'Aadhaar data retrieved from history (no charge)',
                    'data'    => $response,
                    'download_id' => $existing->id,
                    'cached'  => true,
                ], 200);
            }

            // Charge ₹25
            $txnid = rand(11111111, 99999999);
            $transactionResult = processTransaction($request, [
                'account_id'    => $request->account_id,
                'mpin'          => $request->mpin,
                'type'          => 'DR',
                'amount'        => $this->chargeAmount,
                'description'   => 'Aadhaar Card Download - ' . $pending->doc_number,
                'transaction_id'=> 'VCD' . $txnid,
                'category_code' => 'COMMISSION',
            ]);

            if ($transactionResult['status'] !== 1) {
                return response()->json(['status' => 0, 'message' => $transactionResult['message'] ?? 'Transaction failed'], 200);
            }

            // Check for cached response first
            $cachedResponse = $this->findCachedResponse('aadhaar', $pending->doc_number);

            if ($cachedResponse) {
                // Credit commission
                $this->creditCommission($request, $txnid, 'aadhaar', $pending->doc_number);

                $keysToRemove = ['Fees', 'Bal', 'bal'];
                $cleanResponse = array_diff_key($cachedResponse, array_flip($keysToRemove));
                $customerName = $cleanResponse['name'] ?? null;

                $pending->update([
                    'status'         => 1,
                    'api_response'   => Crypt::encryptString(json_encode($cleanResponse)),
                    'transaction_id' => 'VCD' . $txnid,
                    'customer_name'  => $customerName,
                    'amount'         => $this->chargeAmount,
                    'commission'     => $this->commissionAmount,
                ]);

                return response()->json([
                    'status'      => 1,
                    'message'     => 'Aadhaar verified successfully! ₹20 commission credited.',
                    'data'        => $cleanResponse,
                    'download_id' => $pending->id,
                    'cached'      => true,
                ], 200);
            }

            // Call GoterPay API to verify OTP
            $refid = $request->refid;
            $otp = $request->otp;
            $url = "https://dashboard.goterpay.com/api/v3/verification/aadhaarverify?mid={$this->mid}&mkey={$this->mkey}&subwallet={$this->wallet}&txnid=$txnid&refid=$refid&otp=$otp";

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            $response = curl_exec($ch);
            curl_close($ch);

            $rj = json_decode($response, true);

            if (isset($rj['status']) && $rj['status'] == 'SUCCESS') {
                // Credit commission
                $this->creditCommission($request, $txnid, 'aadhaar', $pending->doc_number);

                $keysToRemove = ['Fees', 'Bal', 'bal'];
                $cleanResponse = array_diff_key($rj, array_flip($keysToRemove));
                $customerName = $cleanResponse['name'] ?? null;

                $pending->update([
                    'status'         => 1,
                    'api_response'   => Crypt::encryptString(json_encode($cleanResponse)),
                    'transaction_id' => 'VCD' . $txnid,
                    'customer_name'  => $customerName,
                    'amount'         => $this->chargeAmount,
                    'commission'     => $this->commissionAmount,
                ]);

                $this->addCacheVerification('aadhaar', $pending->doc_number, $cleanResponse);

                return response()->json([
                    'status'      => 1,
                    'message'     => 'Aadhaar verified successfully! ₹20 commission credited.',
                    'data'        => $cleanResponse,
                    'download_id' => $pending->id,
                    'cached'      => false,
                ], 200);
            }

            // Failed — refund
            $this->refundCharge($request, $txnid, 'aadhaar', $pending->doc_number);

            $pending->update(['status' => 2]);

            return response()->json([
                'status'  => 0,
                'message' => $rj['resText'] ?? 'Aadhaar verification failed. Amount refunded.',
                'data'    => $rj,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Aadhaar Verify Error: ' . $e->getMessage());
            return response()->json(['status' => 0, 'message' => 'Verification failed'], 200);
        }
    }

    /**
     * List user's past downloads
     */
    public function myDownloads(Request $request)
    {
        $user = $request->get('user');
        $cardType = $request->query('card_type');

        $query = CardDownload::where('user_id', $user->id)->where('status', 1);

        if ($cardType) {
            $query->where('card_type', $cardType);
        }

        $downloads = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status'  => 1,
            'message' => 'Downloads fetched',
            'data'    => $downloads->map(function ($d) {
                // Decrypt data on retrieve
                $parsedData = null;
                if (!empty($d->api_response)) {
                    try {
                        $parsedData = json_decode($this->getDecryptedApiResponse($d), true);
                    } catch (\Exception $e) {
                         Log::error("Failed to decrypt download data ID: {$d->id}");
                    }
                }

                return [
                    'id'            => $d->id,
                    'card_type'     => $d->card_type,
                    'doc_number'    => $d->doc_number,
                    'customer_name' => $d->customer_name,
                    'amount'        => $d->amount,
                    'commission'    => $d->commission,
                    'created_at'    => $d->created_at->format('d M Y, h:i A'),
                    'data'          => $parsedData,
                ];
            }),
        ], 200);
    }

    /**
     * Get receipt data for a download
     */
    public function receipt(Request $request, $id)
    {
        $user = $request->get('user');
        $download = CardDownload::where('id', $id)->where('user_id', $user->id)->where('status', 1)->first();

        if (!$download) {
            return response()->json(['status' => 0, 'message' => 'Download not found'], 200);
        }

        // Get merchant shop name from settings
        $setting = DB::table('settings')->where('user_id', $user->id)->first();

        return response()->json([
            'status'  => 1,
            'message' => 'Receipt data',
            'data'    => [
                'id'             => $download->id,
                'card_type'      => $download->card_type,
                'doc_number'     => $this->maskDocNumber($download->doc_number),
                'customer_name'  => $download->customer_name,
                'amount'         => $download->amount,
                'date'           => $download->created_at->format('d M Y, h:i A'),
                'transaction_id' => $download->transaction_id,
                'shop_name'      => $setting->company_name ?? 'CashBez Partner',
                'shop_address'   => $setting->address ?? '',
                'merchant_name'  => $user->name,
                'merchant_mobile'=> $user->mobile ?? '',
            ],
        ], 200);
    }

    // ============================================
    // PRIVATE HELPERS
    // ============================================

    /**
     * Find cached response from verifications table or other downloads
     */
    private function findCachedResponse($cardType, $docNumber)
    {
        // Check verifications table first
        $verification = DB::table('verifications')
            ->where('number', $docNumber)
            ->where('status', 1)
            ->whereNotNull('second_res')
            ->first();

        if ($verification && !empty($verification->second_res)) {
            return json_decode($verification->second_res, true);
        }

        // Check other users' card_downloads
        $otherDownload = CardDownload::where('doc_number', $docNumber)
            ->where('card_type', $cardType)
            ->where('status', 1)
            ->whereNotNull('api_response')
            ->first();

        if ($otherDownload && !empty($otherDownload->api_response)) {
            try {
                return json_decode($this->getDecryptedApiResponse($otherDownload), true);
            } catch (\Exception $e) {
                Log::error("Failed to decrypt cached response ID: {$otherDownload->id}");
            }
        }

        return null;
    }

    // SELECT `id`, `user_id`, `type`, `number`, `refid`, `status`, `first_res`, `second_res`, `created_at`, `updated_at` FROM `verifications` WHERE 1
    private function addCacheVerification($cardType, $docNumber, $response)
    {
        DB::table('verifications')->insert([
            'user_id' => $user->id,
            'type' => $cardType,
            'number' => $docNumber,
            'refid' => $txnid,
            'status' => 1,
            'first_res' => json_encode($response),
            'second_res' => json_encode($response),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Call GoterPay API for non-Aadhaar card types
     */
    private function callGoterPayApi($cardType, $docNumber, $dob, $txnid)
    {
        $txnid = "VCD" . $txnid;
        $endpoint = $this->apiEndpoints[$cardType] ?? null;
        if (!$endpoint) return null;

        $paramName = $this->apiParamNames[$cardType];
        $url = "https://dashboard.goterpay.com/api/v3/verification/{$endpoint}?mid={$this->mid}&mkey={$this->mkey}&subwallet={$this->wallet}&txnid=$txnid&{$paramName}=" . urlencode($docNumber);

        // DL requires DOB
        if ($cardType === 'dl' && $dob) {
            $url .= "&dob=" . urlencode($dob);
        }

        $user = request()->get('user');

        // ✅ Log request BEFORE API call
        DB::table('logs')->insert([
            'mid'          => $user ? $user->mid : null,
            'type'         => 'CardDownload',
            'platform'     => 'WEB',
            'headers'      => json_encode([]),
            'request_data' => json_encode(['cardType' => $cardType, 'docNumber' => $docNumber, 'dob' => $dob]),
            'url'          => $url,
            'txnid'        => $txnid,
            'status'       => 0,
            'timestamp'    => now(),
            'created_at'   => now()->format('Y-m-d H:i:s'),
        ]);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        $responseJson = json_decode($response, true);

        // ✅ Update log with response AFTER API call
        DB::table('logs')
            ->where('txnid', $txnid)
            ->update([
                'response_data' => $response ?: json_encode(['error' => $curlError]),
                'status'        => (isset($responseJson['status']) && $responseJson['status'] === 'SUCCESS') ? 1 : 0,
                'updated_at'    => now(),
            ]);

        if ($curlError || empty($response)) {
            return null;
        }

        return $responseJson;
    }

    /**
     * Extract customer name from API response based on card type
     */
    private function extractCustomerName($cardType, $apiResponse)
    {
        $field = $this->nameFields[$cardType] ?? 'name';
        return $apiResponse[$field] ?? null;
    }

    /**
     * Credit ₹20 commission back to merchant wallet
     */
    private function creditCommission($request, $txnid, $cardType, $docNumber)
    {
        try {
            $user = $request->get('user');
            $admin = $request->get('admin');

            $account = DB::table('accounts')
                ->where('user_id', $user->id)
                ->where('primary_status', true)
                ->first();

            if (!$account) return;

            createTransaction([
                'account_id'     => $account->id,
                'type'           => 'CR',
                'amount'         => $this->commissionAmount,
                'description'    => ucfirst($cardType) . ' Card Download Commission - ' . $docNumber,
                'transaction_id' => 'VCDCM' . $txnid,
                'created_by'     => $user->id,
                'admin_id'       => $admin->id ?? null,
                'user_id'        => $user->id,
                'category_code'  => 'COMMISSION',
            ]);
        } catch (\Exception $e) {
            Log::error('Commission credit failed: ' . $e->getMessage());
        }
    }

    /**
     * Refund ₹25 on API failure
     */
    private function refundCharge($request, $txnid, $cardType, $docNumber)
    {
        try {
            $user = $request->get('user');
            $admin = $request->get('admin');

            $account = DB::table('accounts')
                ->where('user_id', $user->id)
                ->where('primary_status', true)
                ->first();

            if (!$account) return;

            createTransaction([
                'account_id'     => $account->id,
                'type'           => 'CR',
                'amount'         => $this->chargeAmount,
                'description'    => ucfirst($cardType) . ' Card Download Refund - ' . $docNumber,
                'transaction_id' => 'VCDRF' . $txnid,
                'created_by'     => $user->id,
                'admin_id'       => $admin->id ?? null,
                'user_id'        => $user->id,
                'category_code'  => 'COMMISSION',
            ]);
        } catch (\Exception $e) {
            Log::error('Refund failed: ' . $e->getMessage());
        }
    }

    /**
     * Helper to safely decode API responses and migrate unencrypted data
     */
    private function getDecryptedApiResponse($model)
    {
        $payload = $model->api_response;
        if (empty($payload)) return null;

        try {
            return Crypt::decryptString($payload);
        } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
            // Attempt to treat it as legacy unencrypted JSON
            // Auto encrypt legacy payload so next time it is retrieved securely.
            $model->update(['api_response' => Crypt::encryptString($payload)]);
            return $payload;
        }
    }

    /**
     * Mask document number for receipt (show last 4 digits)
     */
    private function maskDocNumber($number)
    {
        $len = strlen($number);
        if ($len <= 4) return $number;
        return str_repeat('X', $len - 4) . substr($number, -4);
    }
}
