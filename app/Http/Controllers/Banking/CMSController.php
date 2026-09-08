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
use App\Models\Passbook;
use App\Models\TxnCategory;
use App\Services\CatchLogService;


class CMSController extends Controller
{
   
    // Constants
    private const AEPS_API_TIMEOUT = 120;

    private const SUPER_MERCHANT_ID       = '1405';
    private const SUPER_MERCHANT_USERNAME = 'enexad';
    private const SUPER_MERCHANT_PASSWORD = '1234d';
    private const SUPER_MERCHANT_GST_IN   = '10AAICE1567H1ZX';
    private const IP_ADDRESS              = '184.168.120.147';
    private const API_TIMEOUT             = 30;
    
    // FingPay CMS Secret Key (64-char hex = 32 bytes for AES-256)
    private const SECRET_KEY = "f4af10e06bc000e837df2600e60a9a334b9b29c3b5814d9cd35fe5dc1aa3bf87";

    private const PUBLIC_RSA_KEY =  '-----BEGIN CERTIFICATE-----
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
-----END CERTIFICATE-----';

    /**
     * Generate SHA-256 hash for webhook verification
     * Format: Base64(SHA256(jsonPayload + secretKey))
     */
    private function generateWebhookHash($jsonPayload)
    {
        $hashString = $jsonPayload . self::SECRET_KEY;
        return base64_encode(hash('sha256', $hashString, true));
    }

    /**
     * Verify incoming webhook hash from FingPay
     */
    private function verifyWebhookHash($jsonPayload, $receivedHash)
    {
        $expectedHash = $this->generateWebhookHash($jsonPayload);
        return hash_equals($expectedHash, $receivedHash);
    }

    /**
     * Encrypt data using AES-ECB to match FingPay's CryptoJS implementation
     * 
     * From FingPay documentation:
     * - this.skey (URL parameter) = the 64-char hex key (identifier)
     * - this.loginrequestdata.superMerchantSkey = base64 encoded AES key
     * 
     * CryptoJS code:
     *   let parsedBase64Key = CryptoJS.enc.Base64.parse(this.loginrequestdata.superMerchantSkey);
     *   // This PARSES a base64 string to get the raw AES key bytes
     *   
     *   this.encryptInfo = window.btoa(CryptoJS.AES.encrypt(...parsedBase64Key, {mode: ECB, padding: PKCS7}));
     * 
     * So superMerchantSkey in payload must be a BASE64-ENCODED encryption key!
     */
    private function encryptAES($data, &$superMerchantSkeyBase64)
    {
        // Convert the 64-char hex key to binary (32 bytes)
        $fullKeyBinary = hex2bin(self::SECRET_KEY);
        
        // For AES-128, use first 16 bytes. For AES-256, use all 32 bytes.
        // FingPay sample shows 16-char key, suggesting AES-128
        // But let's try AES-256 with 32 bytes first (more common for hex keys)
        
        // Use first 16 bytes (128-bit) for AES-128 to match sample '1234567891011121' length pattern
        $aesKeyBinary = substr($fullKeyBinary, 0, 16);
        $cipher = 'AES-128-ECB';
        
        // superMerchantSkey in the payload must be BASE64 encoded (for CryptoJS.enc.Base64.parse)
        $superMerchantSkeyBase64 = base64_encode($aesKeyBinary);
        
        // Update the data with the correct superMerchantSkey format
        $data['superMerchantSkey'] = $superMerchantSkeyBase64;
        
        $jsonPayload = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        
        $encryptedRaw = openssl_encrypt(
            $jsonPayload,
            $cipher,
            $aesKeyBinary,
            OPENSSL_RAW_DATA // Raw output, PKCS7 padding is automatic
        );
        
        if ($encryptedRaw === false) {
            throw new \Exception('AES encryption failed: ' . openssl_error_string());
        }
        
        // CryptoJS.AES.encrypt().toString() returns Base64
        // Then window.btoa() encodes it again (double base64)
        $base64Once = base64_encode($encryptedRaw);
        return base64_encode($base64Once); // Double base64 as per: window.btoa(CryptoJS.AES.encrypt(...))
    }

    private function encryptMD5($password)
    {
        return md5($password);
    }

    private function generateSha256Hash($data)
    {
        return base64_encode(hash('sha256', $data, true));
    }

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

    /**
     * Debug endpoint to test encryption (REMOVE IN PRODUCTION)
     */
    public function cmsDebug(Request $request)
    {
        try {
            // The 64-char hex key
            $fullHexKey = self::SECRET_KEY;
            
            // Convert to binary (32 bytes)
            $fullKeyBinary = hex2bin($fullHexKey);
            
            // Use first 16 bytes for AES-128 (as per FingPay sample showing 16-char key)
            $aesKeyBinary = substr($fullKeyBinary, 0, 16);
            
            // superMerchantSkey in payload must be BASE64 of the AES key
            // (for CryptoJS.enc.Base64.parse to decode)
            $superMerchantSkeyBase64 = base64_encode($aesKeyBinary);
            
            $testData = [
                "additionalParams"     => null,
                "latitude"             => "17.385044",
                "loginType"            => "2",
                "longitude"            => "78.486671",
                "supermerchantId"      => self::SUPER_MERCHANT_ID,
                "merchantId"           => "TEST123",
                "merchantPin"          => "9999999999",
                "mobileNumber"         => "9999999999",
                "amount"               => "1000",
                "superMerchantSkey"    => $superMerchantSkeyBase64  // Base64 encoded AES key!
            ];

            $jsonPayload = json_encode($testData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            
            // CORRECT METHOD: AES-128-ECB with first 16 bytes of hex key
            $encryptedRaw = openssl_encrypt($jsonPayload, 'AES-128-ECB', $aesKeyBinary, OPENSSL_RAW_DATA);
            $singleBase64 = base64_encode($encryptedRaw);
            $doubleBase64 = base64_encode($singleBase64);
            
            // Also test AES-256 with full 32 bytes for comparison
            $encrypted256 = openssl_encrypt($jsonPayload, 'AES-256-ECB', $fullKeyBinary, OPENSSL_RAW_DATA);
            $single256 = base64_encode($encrypted256);
            $double256 = base64_encode($single256);

            return response()->json([
                'status' => 1,
                'message' => 'Debug Data - Test these URLs manually to find which works!',
                'instructions' => 'Copy each URL and open in browser. Look for the one that DOES NOT show "additionalParams" error.',
                'data' => [
                    'keys' => [
                        'full_hex_key' => $fullHexKey,
                        'aes_key_binary_length' => strlen($aesKeyBinary) . ' bytes',
                        'superMerchantSkey_as_base64' => $superMerchantSkeyBase64,
                        'superMerchantSkey_as_hex_direct' => $fullHexKey
                    ],
                    'test_urls' => $this->generateAllTestUrls($fullHexKey, $fullKeyBinary, $aesKeyBinary)
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate all possible encryption test URLs
     */
    private function generateAllTestUrls($fullHexKey, $fullKeyBinary, $aesKeyBinary16)
    {
        $skey = $fullHexKey; // URL skey is always the full hex key
        
        $urls = [];
        
        // =====================================================
        // SCENARIO 1: superMerchantSkey = base64(first 16 bytes of hex-decoded key)
        // =====================================================
        $testData1 = $this->getTestPayload(base64_encode($aesKeyBinary16));
        $json1 = json_encode($testData1, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        
        // AES-128 with 16 bytes, single base64
        $enc1a = base64_encode(openssl_encrypt($json1, 'AES-128-ECB', $aesKeyBinary16, OPENSSL_RAW_DATA));
        $urls['1a_aes128_base64key_single'] = "https://fpcorp.tapits.in/UberCMSBC/#/login?data=" . urlencode($enc1a) . "&skey=" . urlencode($skey);
        
        // AES-128 with 16 bytes, double base64
        $enc1b = base64_encode($enc1a);
        $urls['1b_aes128_base64key_double'] = "https://fpcorp.tapits.in/UberCMSBC/#/login?data=" . urlencode($enc1b) . "&skey=" . urlencode($skey);
        
        // =====================================================
        // SCENARIO 2: superMerchantSkey = the 64-char hex key directly (no conversion)
        // =====================================================
        $testData2 = $this->getTestPayload($fullHexKey);
        $json2 = json_encode($testData2, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        
        // AES-128 with 16 bytes
        $enc2a = base64_encode(openssl_encrypt($json2, 'AES-128-ECB', $aesKeyBinary16, OPENSSL_RAW_DATA));
        $urls['2a_aes128_hexkey_single'] = "https://fpcorp.tapits.in/UberCMSBC/#/login?data=" . urlencode($enc2a) . "&skey=" . urlencode($skey);
        $urls['2b_aes128_hexkey_double'] = "https://fpcorp.tapits.in/UberCMSBC/#/login?data=" . urlencode(base64_encode($enc2a)) . "&skey=" . urlencode($skey);
        
        // AES-256 with 32 bytes
        $enc2c = base64_encode(openssl_encrypt($json2, 'AES-256-ECB', $fullKeyBinary, OPENSSL_RAW_DATA));
        $urls['2c_aes256_hexkey_single'] = "https://fpcorp.tapits.in/UberCMSBC/#/login?data=" . urlencode($enc2c) . "&skey=" . urlencode($skey);
        $urls['2d_aes256_hexkey_double'] = "https://fpcorp.tapits.in/UberCMSBC/#/login?data=" . urlencode(base64_encode($enc2c)) . "&skey=" . urlencode($skey);
        
        // =====================================================
        // SCENARIO 3: superMerchantSkey = first 16 chars of hex key (like the sample '1234567891011121')
        // =====================================================
        $keyAsString16 = substr($fullHexKey, 0, 16); // First 16 chars of hex string as key
        $testData3 = $this->getTestPayload($keyAsString16);
        $json3 = json_encode($testData3, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        
        $enc3a = base64_encode(openssl_encrypt($json3, 'AES-128-ECB', $keyAsString16, OPENSSL_RAW_DATA));
        $urls['3a_aes128_first16chars_single'] = "https://fpcorp.tapits.in/UberCMSBC/#/login?data=" . urlencode($enc3a) . "&skey=" . urlencode($skey);
        $urls['3b_aes128_first16chars_double'] = "https://fpcorp.tapits.in/UberCMSBC/#/login?data=" . urlencode(base64_encode($enc3a)) . "&skey=" . urlencode($skey);
        
        return $urls;
    }

    private function getTestPayload($superMerchantSkey)
    {
            return [
                "additionalParams"     => null,
                "latitude"             => "17.385044",
                "loginType"            => "2",
                "longitude"            => "78.486671",
                "supermerchantId"      => self::SUPER_MERCHANT_ID,
                "merchantId"           => "TEST123",
                "merchantPin"          => "9999999999",
                "mobileNumber"         => "9999999999",
                "amount"               => "1000",
                "superMerchantSkey"    => $superMerchantSkey
            ];
    }

    /**
     * Generate CMS Login URL for redirecting user to FingPay portal
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function cmsLogin(Request $request)
    {
        try {
            $mid = $request->outletId;

            $existingUser = AepsDraft::where('mid', $mid)->first();
            if ($existingUser == null) {
                return response()->json(['status' => 0, 'message' => 'Invalid Outlet ID', 'data' => null], 200);
            }

            $is_api_partner = false;
            $adminData = User::where('id', $existingUser->admin_id)->first();
            if ($adminData && $adminData->is_api_partner == true) {
                $balanceAccount = Account::where('user_id', $adminData->id)->where('primary_status', true)->first();
                $credit_user_id = $adminData->id;
                $is_api_partner = true;
            } else {
                $userData = User::where('mid', $existingUser->mid)->first();
                $balanceAccount = Account::where('user_id', $userData->id)->where('primary_status', true)->first();
                $credit_user_id = $userData->id;
            }

            if (!$balanceAccount) {
                return response()->json(['status' => 0, 'message' => 'No primary account found', 'data' => null], 200);
            }

            // Login Payload as per FingPay documentation
            // Note: superMerchantSkey will be set by encryptAES as base64-encoded key
            $loginRequestData = [
                "additionalParams"     => null,
                "latitude"             => $existingUser->latitude ?? "0.0",
                "loginType"            => "2",
                "longitude"            => $existingUser->longitude ?? "0.0",
                "supermerchantId"      => self::SUPER_MERCHANT_ID,
                "merchantId"           => $existingUser->mid,
                "merchantPin"          => $existingUser->phone,
                "mobileNumber"         => $existingUser->phone,
                "amount"               => (string) $balanceAccount->balance,
                "superMerchantSkey"    => "" // Will be set by encryptAES
            ];

            // Encrypt using AES-ECB matching CryptoJS
            // The function will set $superMerchantSkeyBase64 which is the base64-encoded AES key
            $superMerchantSkeyBase64 = "";
            $encryptedData = $this->encryptAES($loginRequestData, $superMerchantSkeyBase64);

            // skey = the FULL 64-char hex key (used by FingPay to identify/lookup the encryption key)
            $skey = self::SECRET_KEY;

            // Redirect URL
            $redirectUrl = "https://fpcorp.tapits.in/UberCMSBC/#/login"
                . "?data=" . urlencode($encryptedData)
                . "&skey=" . urlencode($skey);

            Log::channel('cms')->info('CMS Login URL Generated', [
                'mid' => $mid,
                'user_id' => $credit_user_id,
                'balance' => $balanceAccount->balance,
                'url' => $redirectUrl
            ]);

            return response()->json([
                'status'  => 1,
                'message' => 'Login URL Successfully generated',
                'url'     => $redirectUrl
            ], 200);

        } catch (\Exception $e) {
            Log::channel('cms')->error('CMS Login Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status'  => 0,
                'message' => 'Encryption failed',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * BC Wallet Debit API - Webhook endpoint for FingPay to debit BC wallet
     * 
     * FingPay calls this endpoint when:
     * 1. Transaction is initiated (transactionStatus = "I")
     * 2. Transaction is success/failure (transactionStatus = "S" or "F")
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bcWalletDebit(Request $request)
    {
        try {
            $jsonPayload = $request->getContent();
            $receivedHash = $request->header('hash');
            
            Log::channel('cms')->info('BC Wallet Debit Request', [
                'payload' => $jsonPayload,
                'hash' => $receivedHash
            ]);

            // Verify hash for security
            if (!$this->verifyWebhookHash($jsonPayload, $receivedHash)) {
                Log::channel('cms')->warning('BC Wallet Debit Hash Mismatch', [
                    'received' => $receivedHash,
                    'expected' => $this->generateWebhookHash($jsonPayload)
                ]);
                return response()->json([
                    'merchantTransactionId' => null,
                    'status' => false,
                    'errorMessage' => 'Hash verification failed'
                ], 401);
            }

            $data = json_decode($jsonPayload, true);
            
            $amount = $data['amount'] ?? 0;
            $transactionStatus = $data['transactionStatus'] ?? ''; // I = Initiated, S = Success, F = Failure
            $fpTransactionId = $data['fpTransactionId'] ?? '';
            $typeOfTransaction = $data['typeOfTransaction'] ?? ''; // CDC = Cash Deposit Collection
            $bcLoginId = $data['bcLoginId'] ?? ''; // This is the merchant ID
            $transactionTimestamp = $data['transactionTimestamp'] ?? now()->format('Y-m-d H:i:s');
            $errorMessage = $data['errorMessage'] ?? '';
            $remarks = $data['remarks'] ?? '';
            $merchantTransactionId = $data['merchantTransactionId'] ?? null;

            // Find the BC (Business Correspondent) by merchantId/bcLoginId
            $aepsDraft = AepsDraft::where('mid', $bcLoginId)->first();
            if (!$aepsDraft) {
                return response()->json([
                    'merchantTransactionId' => null,
                    'status' => false,
                    'errorMessage' => 'BC not found'
                ], 404);
            }

            // Get the user and account
            $user = User::where('mid', $bcLoginId)->first();
            if (!$user) {
                return response()->json([
                    'merchantTransactionId' => null,
                    'status' => false,
                    'errorMessage' => 'User not found'
                ], 404);
            }

            $account = Account::where('user_id', $user->id)->where('primary_status', true)->first();
            if (!$account) {
                return response()->json([
                    'merchantTransactionId' => null,
                    'status' => false,
                    'errorMessage' => 'Primary account not found'
                ], 404);
            }

            // Handle based on transaction status
            if ($transactionStatus === 'I') {
                // Transaction Initiated - Check balance and hold/debit amount
                if ($account->balance < $amount) {
                    return response()->json([
                        'merchantTransactionId' => null,
                        'status' => false,
                        'errorMessage' => 'Insufficient balance'
                    ], 200);
                }

                // Generate merchant transaction ID
                $merchantTxnId = 'CMS' . time() . rand(1000, 9999);

                // Debit the amount (hold)
                DB::beginTransaction();
                try {
                    $account->balance -= $amount;
                    $account->save();

                    // Log the transaction
                    Passbook::create([
                        'account_id'    => $account->id,
                        'user_id'       => $user->id,
                        'type'          => 'DR',
                        'amount'        => $amount,
                        'balance'       => $account->balance,
                        'narration'     => "CMS CDC Transaction - {$fpTransactionId}",
                        'reference_id'  => $fpTransactionId,
                        'txn_id'        => $merchantTxnId,
                        'status'        => 'pending',
                        'created_at'    => now()
                    ]);

                    // Store CMS transaction for tracking
                    DB::table('cms_transactions')->insert([
                        'fp_transaction_id'       => $fpTransactionId,
                        'merchant_transaction_id' => $merchantTxnId,
                        'bc_login_id'             => $bcLoginId,
                        'user_id'                 => $user->id,
                        'account_id'              => $account->id,
                        'amount'                  => $amount,
                        'type'                    => $typeOfTransaction,
                        'status'                  => 'initiated',
                        'fp_status'               => $transactionStatus,
                        'remarks'                 => $remarks,
                        'error_message'           => $errorMessage,
                        'created_at'              => now(),
                        'updated_at'              => now()
                    ]);

                    DB::commit();

                    Log::channel('cms')->info('BC Wallet Debit Initiated', [
                        'merchantTxnId' => $merchantTxnId,
                        'fpTxnId' => $fpTransactionId,
                        'amount' => $amount,
                        'bcLoginId' => $bcLoginId
                    ]);

                    return response()->json([
                        'merchantTransactionId' => $merchantTxnId,
                        'status' => true,
                        'errorMessage' => ''
                    ], 200);

                } catch (\Exception $e) {
                    DB::rollBack();
                    throw $e;
                }

            } elseif ($transactionStatus === 'S' || $transactionStatus === 'F') {
                // Transaction Success or Failure - Update the transaction status
                $cmsTxn = DB::table('cms_transactions')
                    ->where('fp_transaction_id', $fpTransactionId)
                    ->first();

                if (!$cmsTxn) {
                    return response()->json([
                        'merchantTransactionId' => $merchantTransactionId,
                        'status' => false,
                        'errorMessage' => 'Transaction not found'
                    ], 404);
                }

                DB::beginTransaction();
                try {
                    if ($transactionStatus === 'F') {
                        // Transaction Failed - Refund the amount
                        $account->balance += $amount;
                        $account->save();

                        // Log refund
                        Passbook::create([
                            'account_id'    => $account->id,
                            'user_id'       => $user->id,
                            'type'          => 'CR',
                            'amount'        => $amount,
                            'balance'       => $account->balance,
                            'narration'     => "CMS CDC Refund - {$fpTransactionId}",
                            'reference_id'  => $fpTransactionId,
                            'txn_id'        => $cmsTxn->merchant_transaction_id,
                            'status'        => 'success',
                            'created_at'    => now()
                        ]);
                    }

                    // Update CMS transaction status
                    DB::table('cms_transactions')
                        ->where('fp_transaction_id', $fpTransactionId)
                        ->update([
                            'status'        => $transactionStatus === 'S' ? 'success' : 'failed',
                            'fp_status'     => $transactionStatus,
                            'error_message' => $errorMessage,
                            'remarks'       => $remarks,
                            'updated_at'    => now()
                        ]);

                    // Update passbook status
                    Passbook::where('reference_id', $fpTransactionId)
                        ->where('type', 'DR')
                        ->update(['status' => $transactionStatus === 'S' ? 'success' : 'failed']);

                    DB::commit();

                    Log::channel('cms')->info('BC Wallet Debit Status Update', [
                        'status' => $transactionStatus,
                        'fpTxnId' => $fpTransactionId,
                        'merchantTxnId' => $cmsTxn->merchant_transaction_id
                    ]);

                    return response()->json([
                        'merchantTransactionId' => $cmsTxn->merchant_transaction_id,
                        'status' => true,
                        'errorMessage' => 'received'
                    ], 200);

                } catch (\Exception $e) {
                    DB::rollBack();
                    throw $e;
                }
            }

            return response()->json([
                'merchantTransactionId' => null,
                'status' => false,
                'errorMessage' => 'Invalid transaction status'
            ], 400);

        } catch (\Exception $e) {
            Log::channel('cms')->error('BC Wallet Debit Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'merchantTransactionId' => null,
                'status' => false,
                'errorMessage' => 'Internal server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * BC Wallet Check API - Webhook endpoint for FingPay to check BC balances
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bcWalletCheck(Request $request)
    {
        try {
            $jsonPayload = $request->getContent();
            $receivedHash = $request->header('hash');

            Log::channel('cms')->info('BC Wallet Check Request', [
                'payload' => $jsonPayload,
                'hash' => $receivedHash
            ]);

            // Verify hash for security
            if (!$this->verifyWebhookHash($jsonPayload, $receivedHash)) {
                Log::channel('cms')->warning('BC Wallet Check Hash Mismatch', [
                    'received' => $receivedHash,
                    'expected' => $this->generateWebhookHash($jsonPayload)
                ]);
                return response()->json([
                    'status' => false,
                    'errorMessage' => 'Hash verification failed',
                    'bcBalances' => []
                ], 401);
            }

            $data = json_decode($jsonPayload, true);
            $bcLoginIds = $data['bcLoginIds'] ?? [];

            if (empty($bcLoginIds)) {
                return response()->json([
                    'status' => false,
                    'errorMessage' => 'No BC IDs provided',
                    'bcBalances' => []
                ], 400);
            }

            $bcBalances = [];

            foreach ($bcLoginIds as $bcLoginId) {
                // Find user by merchantId (bcLoginId)
                $user = User::where('mid', $bcLoginId)->first();
                
                if ($user) {
                    $account = Account::where('user_id', $user->id)
                        ->where('primary_status', true)
                        ->first();
                    
                    $bcBalances[] = [
                        'bcLoginId' => $bcLoginId,
                        'balance'   => $account ? (float) $account->balance : 0.00
                    ];
                } else {
                    $bcBalances[] = [
                        'bcLoginId' => $bcLoginId,
                        'balance'   => 0.00
                    ];
                }
            }

            Log::channel('cms')->info('BC Wallet Check Response', [
                'bcBalances' => $bcBalances
            ]);

            return response()->json([
                'status'       => true,
                'errorMessage' => 'Success',
                'bcBalances'   => $bcBalances
            ], 200);

        } catch (\Exception $e) {
            Log::channel('cms')->error('BC Wallet Check Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status'       => false,
                'errorMessage' => 'Internal server error: ' . $e->getMessage(),
                'bcBalances'   => []
            ], 500);
        }
    }

    /**
     * CMS Transaction Response Callback - Receive transaction completion status from FingPay
     * This is the URL you provide to FingPay for posting transaction details
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function cmsCallback(Request $request)
    {
        try {
            $data = $request->all();

            Log::channel('cms')->info('CMS Callback Received', [
                'data' => $data
            ]);

            // Extract response data
            $status = $data['status'] ?? false;
            $message = $data['message'] ?? '';
            $responseData = $data['data'] ?? [];

            if ($status && !empty($responseData)) {
                $fpTransactionId = $responseData['fingpayTransactionId'] ?? '';
                $bcLoginId = $responseData['bcLoginId'] ?? '';
                $dropAmount = $responseData['dropAmount'] ?? 0;
                $statusCode = $responseData['statusCode'] ?? '';
                $errorMessage = $responseData['errorMessage'] ?? '';
                $transactionTimestamp = $responseData['transactionTimestamp'] ?? '';
                $merchantTxnId = $responseData['merchantTxnId'] ?? '';

                // Update CMS transaction if exists
                if ($fpTransactionId) {
                    DB::table('cms_transactions')
                        ->where('fp_transaction_id', $fpTransactionId)
                        ->update([
                            'callback_received'  => true,
                            'callback_status'    => $statusCode,
                            'callback_message'   => $errorMessage,
                            'callback_data'      => json_encode($responseData),
                            'callback_timestamp' => now(),
                            'updated_at'         => now()
                        ]);
                }

                Log::channel('cms')->info('CMS Transaction Completed', [
                    'fpTxnId' => $fpTransactionId,
                    'bcLoginId' => $bcLoginId,
                    'amount' => $dropAmount,
                    'status' => $statusCode
                ]);
            }

            return response()->json([
                'status' => true,
                'message' => 'Callback received successfully'
            ], 200);

        } catch (\Exception $e) {
            Log::channel('cms')->error('CMS Callback Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Error processing callback'
            ], 500);
        }
    }

    /**
     * Get CMS Transaction History
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function cmsHistory(Request $request)
    {
        try {
            $user = auth()->user();
            $perPage = $request->get('per_page', 20);

            $transactions = DB::table('cms_transactions')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'Success',
                'data' => $transactions
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching history',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}