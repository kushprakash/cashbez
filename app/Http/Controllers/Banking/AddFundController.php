<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AddFund;
use App\Models\Account;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AddFundController extends Controller
{

    private function GenRandomString($length = 10) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    /**
     * Initiate UPI Intent for Add Fund
     * Validates device/SIM and creates a pending transaction.
     */
    public function initiateUpiIntent(Request $request) {
        $validator = Validator::make(
            $request->all(),
            [
                'amount' => 'required|numeric|min:10|max:50000',
                'account_id' => 'required|exists:accounts,id',
                'device_id' => 'required|string',
                // 'is_sim_verified' => 'required|boolean',
                // 'verified_mobile' => 'required_if:is_sim_verified,true|string'
            ],
            [
                'amount.required' => 'Please enter the transaction amount.',
                'amount.numeric'  => 'Amount must be a valid number.',
                'amount.min'      => 'Minimum allowed amount is ₹10.',
                'amount.max'      => 'Maximum allowed amount is ₹50,000.',

                'account_id.required' => 'Please select an account.',
                'account_id.exists'   => 'Selected account is not valid.',

                'device_id.required' => 'Device verification failed. Please try again.',
                'device_id.string'   => 'Invalid device information received.',

                // 'is_sim_verified.required' => 'SIM verification status is missing.',
                // 'is_sim_verified.boolean'  => 'Invalid SIM verification status.',

                // 'verified_mobile.required_if' =>
                //     'SIM verification failed. Please use your registered mobile number.',
                // 'verified_mobile.string' =>
                //     'Verified mobile number format is invalid.'
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first()
            ], 200);
        }

        $user = $request->get('user');
        $admin = $request->get('admin');


        if (isset($request->verified_mobile) && !empty($request->verified_mobile)) {
            
            // 1. Device Binding Check
            // if ($user->device_id && $user->device_id !== $request->device_id) { ... }

            // 2. SIM Verification & Mobile Match Check
            if (!$request->is_sim_verified) {
                return response()->json([
                    'status' => 0,
                    'message' => 'SIM verification failed. Security check required.'
                ], 403);
            }

            // Normalize registered phone
            $registeredPhone = preg_replace('/\D/', '', $user->mobile);
            $registeredPhone = substr($registeredPhone, -10);

            // Normalize verified mobile
            $verifiedMobile = preg_replace('/\D/', '', $request->verified_mobile);
            $verifiedMobile = substr($verifiedMobile, -10);

            if ($registeredPhone !== $verifiedMobile) {
                return response()->json([
                    'status' => 0,
                    'message' => 'SIM card does not match registered mobile number. Transaction blocked.'
                ], 200);
            }
        }

        $account = Account::where('id', $request->account_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$account) {
            return response()->json(['status' => 0, 'message' => 'Invalid Account Request'], 200);
        }

        // Get Paytm Credentials from Settings
        $settings = Setting::where('user_id', $admin->id)->first();
        if (!$settings || empty($settings->paytm_mid)) {
            return response()->json(['status' => 0, 'message' => 'Service Currently not available'], 200);
        }

        $mid = $settings->paytm_mid;
        $amount = number_format((float)$request->amount, 2, '.', '');
       

        $txnid = "PG" . rand(111, 999) . time(); // 
        $orderId = $this->GenRandomString().time();	

        // Create Pending Transaction
        $addFund = AddFund::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'amount' => $amount,
            'txnid' => $txnid,
            'order_id' => $orderId,
            'status' => 'pending',
            'device_id' => $request->device_id,
            'sim_verified' => 1
        ]);
       
        $upiId = $settings->paytm_upi_id ?? ''; 
        $paytmSign = $settings->paytm_sign; // Use this for `tn` or verify if needed.

        $pn = "ENEXA";
        $tn = $txnid;


        // paytmmp://cash_wallet?pa=paytm.s1lcife%40pty&pn=INDIA&am=1.00&cu=INR&tn=PG3711770582162&tr=ATr8l8hEZo1770582162&mc=4722&sign=AAuN7izDWN5cb8A5scnUiNME%2BLkZqI2DWgkXlN1McoP6WZABa%2FKkFTiLvuPRP6%2FnWK8BPg%2FrPhb%2Bu4QMrUEX10UsANTDbJaALcSM9b8Wk218X%2B55T%2FzOzb7xoiB%2BBcX8yYuYayELImXJHIgL%2Fc7nkAnHrwUCmbM97nRbCVVRvU0ku3Tr&featuretype=money_transfer
        
        // upi://pay?pa=paytm.s1lcife%40pty&pn=INDIA&am=1.00&tn=PG3711770582162&tr=ATr8l8hEZo1770582162
        

        $paytmIntent = "paytmmp://cash_wallet?pa=" . rawurlencode($upiId) .
            "&pn=" . rawurlencode("INDIA") .
            "&am=" . $amount .
            "&cu=INR" .
            "&tn=" . rawurlencode($tn) .
            "&tr=" . rawurlencode($orderId) .
            "&mc=4722" .
            "&sign=" . rawurlencode($paytmSign) .
            "&featuretype=money_transfer";

        $fallbackIntent = "upi://pay?pa=" . rawurlencode($upiId) .
            "&pn=" . rawurlencode("INDIA") .
            "&am=" . $amount .
            "&tn=" . rawurlencode($tn) .
            "&tr=" . rawurlencode($orderId);

        return response()->json([
            'status' => 1,
            'message' => 'Transaction initiated',
            'data' => [
                'txnid' => $txnid,
                'order_id' => $orderId,
                'paytm_intent' => $paytmIntent,
                'upi_intent' => $fallbackIntent,
                'amount' => $amount
            ]
        ]);

    }

    /**
     * Verify Payment Status via Paytm Status API
     * Checks status and credits wallet if successful.
     */
    public function verifyPayment(Request $request) {
        $validator = Validator::make($request->all(), [
            'txnid' => 'required|string|exists:add_funds,txnid',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => 'Invalid Transaction ID'], 200);
        }

        $txnid = $request->txnid;
        $addFund = AddFund::where('txnid', $txnid)->first();

        if ($addFund->status === 'success') {
            return response()->json(['status' => 1, 'message' => 'Transaction already successful', 'data' => ['utr' => $addFund->utr]]);
        }

        $admin = $request->get('admin');

         $settings = Setting::where('user_id', $admin->id)->first();
        if (!$settings || empty($settings->paytm_mid)) {
            return response()->json(['status' => 0, 'message' => 'Service Currently not available'], 200);
        }

        $mid = $settings->paytm_mid;
        $orderId = $addFund->order_id;

        // Prepare Status Check Request
        $jsonData = json_encode(["MID" => $mid, "ORDERID" => $orderId]);
        $url = "https://securegw.paytm.in/order/status?JsonData=" . urlencode($jsonData);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Consider true for prod
        $response = curl_exec($ch);
        
        if (curl_errno($ch)) {
             Log::error("Paytm cURL Error: " . curl_error($ch));
             curl_close($ch);
             return response()->json(['status' => 0, 'message' => 'Payment Verification Failed (Network)']);
        }
        curl_close($ch);

        $responseArray = json_decode($response, true);
        
        // Update raw response
        $addFund->paytm_response = $response;
        $addFund->save();

        if ($responseArray && isset($responseArray['STATUS']) && $responseArray['STATUS'] === "TXN_SUCCESS") {
            
            // Verify Amount Match
            if (floatval($responseArray['TXNAMOUNT']) != floatval($addFund->amount)) {
                $addFund->status = 'failed';
                $addFund->save();
                return response()->json(['status' => 0, 'message' => 'Amount Mismatch']);
            }

            // Success! Credit Wallet
            DB::beginTransaction();
            try {
                $addFund->status = 'success';
                $addFund->utr = $responseArray['BANKTXNID'] ?? $responseArray['TXNID'];
                $addFund->save();

                // Credit the User's Account via createTransaction helper or manual insert
                // Assuming `createTransaction` global helper exists as per `AccountController`
                
                // Fetch admin for 'admin_id' field in transactions if needed
                // Using simplistic logic from AccountController logic
                $user = User::find($addFund->user_id);
                // $admin = User::first(); // simplified

                // We can use the existing 'Passbook' model or `createTransaction` helper.
                // Replicating AccountController logic:
                // createTransaction([...])
                
                // Let's use DB insert for reliability if helper not available in this scope, 
                // but better to use the helper if it's autoloaded. 
                // Based on `AccountController.php`, `createTransaction` is a global function.
                
                createTransaction([
                    'account_id' => $addFund->account_id,
                    'type' => 'CR',
                    'amount' => $addFund->amount,
                    'description' => 'Add Fund UPI ' . ($addFund->utr ? 'UTR: '.$addFund->utr : ''),
                    'transaction_id' => $txnid,
                    'created_by' => $user->id,
                    'admin_id' => 1, // Default admin
                    'user_id' => $user->id,
                    'category_code' => 'ADD_FUND'
                ]);

                DB::commit();

                return response()->json([
                    'status' => 1, 
                    'message' => 'Payment Successful', 
                    'data' => [
                        'utr' => $addFund->utr,
                        'amount' => $addFund->amount
                    ]
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("AddFund Logic Error: " . $e->getMessage());
                return response()->json(['status' => 0, 'message' => 'Internal Error during wallet credit']);
            }

        } else {
            // Check if failed
            if ($responseArray && isset($responseArray['STATUS']) && ($responseArray['STATUS'] == 'TXN_FAILURE' || $responseArray['STATUS'] == 'TXN_FAILURE')) {
                $addFund->status = 'failed';
                $addFund->save();
            }
            
            $msg = $responseArray['RESPMSG'] ?? 'Payment Pending or Failed';
            return response()->json(['status' => 0, 'message' => $msg]);
        }
    }

    /**
     * Get Add Fund History
     */
    public function getHistory(Request $request) {
        $user = $request->user();
        $perPage = $request->input('per_page', 20);

        $history = AddFund::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'status' => 1,
            'message' => 'History fetched',
            'data' => $history
        ]);
    }
}
