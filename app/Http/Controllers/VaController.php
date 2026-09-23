<?php

namespace App\Http\Controllers;

use App\Models\Va;
use App\Models\User;
use App\Models\Setting;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use DB;

class VaController extends Controller
{
    private const BASE_URL = 'https://icchhamatidataservice.com/api/';
    private const MID = "AGENT1475";
    private const MKEY = "8ECgqn6xep6FPdVvzOs4ketqWQxG9qGY";
    /**
     * Display a listing of the Virtual Account records.
     */
    public function index(Request $request)
    {
        try {

            $user = $request->get('user');
            if($user->id != 1){
                $vaList = Va::where('mid', $user->mid)->select('virtual_upi_handle','qrcode_image','qrcode_pdf')->first();
                return response()->json([
                    'status' => 1,
                    'message' => 'VA records retrieved successfully',
                    'data' => $vaList
                ], 200);

            }

            $query = Va::query();

            // Search by mid, mobile, username, virtual account number or upi handle
            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('mid', 'like', "%{$search}%")
                      ->orWhere('mobile', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%")
                      ->orWhere('virtual_account_number', 'like', "%{$search}%")
                      ->orWhere('virtual_upi_handle', 'like', "%{$search}%")
                      ->orWhere('account_number', 'like', "%{$search}%");
                });
            }

            if ($request->filled('mid')) {
                $query->where('mid', $request->input('mid'));
            }

            if ($request->filled('mobile')) {
                $query->where('mobile', 'like', "%{$request->input('mobile')}%");
            }

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            $perPage = $request->input('per_page', 25);
            $vaList = $query->orderBy('id', 'desc')->paginate($perPage);


            return response()->json([
                'status' => 1,
                'message' => 'VA records retrieved successfully',
                'data' => $vaList
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve VA records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created VA record.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'mid'                    => 'nullable|string|max:255',
                'mobile'                 => 'nullable|string|max:20',
                'username'               => 'nullable|string|max:255',
                'account_number'         => 'nullable|string|max:255',
                'account_ifsc'           => 'nullable|string|max:255',
                'virtual_account_id'     => 'nullable|string|max:255',
                'virtual_account_number' => 'nullable|string|max:255',
                'virtual_ifsc'           => 'nullable|string|max:255',
                'virtual_upi_handle'     => 'nullable|string|max:255',
                'status'                 => 'nullable|integer'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $va = Va::create($request->only([
                'mid', 'mobile', 'username', 'account_number', 'account_ifsc',
                'virtual_account_id', 'virtual_account_number', 'virtual_ifsc',
                'virtual_upi_handle', 'status'
            ]));

            return response()->json([
                'status' => 1,
                'message' => 'VA record created successfully',
                'data' => $va
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create VA record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified VA record.
     */
    public function show($id)
    {
        try {
            $va = Va::find($id);

            if (!$va) {
                return response()->json([
                    'status' => 0,
                    'message' => 'VA record not found'
                ], 404);
            }

            return response()->json([
                'status' => 1,
                'message' => 'VA record details',
                'data' => $va
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch VA record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified VA record.
     */
    public function update(Request $request, $id)
    {
        try {
            $va = Va::find($id);

            if (!$va) {
                return response()->json([
                    'status' => 0,
                    'message' => 'VA record not found'
                ], 404);
            }

            $va->update($request->only([
                'mid', 'mobile', 'username', 'account_number', 'account_ifsc',
                'virtual_account_id', 'virtual_account_number', 'virtual_ifsc',
                'virtual_upi_handle', 'status'
            ]));

            return response()->json([
                'status' => 1,
                'message' => 'VA record updated successfully',
                'data' => $va
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update VA record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified VA record from storage.
     */
    public function destroy($id)
    {
        try {
            $va = Va::find($id);

            if (!$va) {
                return response()->json([
                    'status' => 0,
                    'message' => 'VA record not found'
                ], 404);
            }

            $va->delete();

            return response()->json([
                'status' => 1,
                'message' => 'VA record deleted successfully'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete VA record',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function vaCheck(Request $request){
        try {
            $key = $request->input('key', 'A96334D5FD');
            $salt = $request->input('salt', '962A257E0C');

            $name = $request->input('name', 'Lov Prakash');
            $account_number = $request->input('account_number', '003205014793');
            $account_ifsc = $request->input('account_ifsc', 'UBIN0500322');

            $payload = [];
            $payload['key'] = $key;
            $payload['label'] = $name;
            $payload['description'] = $request->input('description', $name . '-' . $account_number);

            $payload['authorized_remitters'] = [
                [
                    'account_ifsc'   => $account_ifsc,
                    'account_number' => $account_number,
                ]
            ];

            $string = $key . '|' . $name . '|' . $salt;
            $signature = hash('sha512', $string);

            $curl = curl_init();

            curl_setopt_array($curl, [
                CURLOPT_URL => 'https://wire.easebuzz.in/api/v1/insta-collect/virtual_accounts/',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => [
                    'Authorization: ' . $signature,
                    'Content-Type: application/json',
                ],
            ]);

            $response = curl_exec($curl);
            $curlError = null;

            if (curl_errno($curl)) {
                $curlError = curl_error($curl);
            }

            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            curl_close($curl);

            if ($curlError) {
                return response()->json([
                    'status' => 0,
                    'message' => 'cURL Connection Error: ' . $curlError,
                ], 500);
            }

            $decodedResponse = json_decode($response, true);

            return response()->json([
                'status' => 1,
                'http_code' => $httpCode,
                'data' => $decodedResponse ?? $response
            ], $httpCode >= 200 && $httpCode < 300 ? 200 : $httpCode);

        } catch (Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Exception: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate / Request Virtual Account QR for logged in user.
     */
    public function generateQr(Request $request)
    {
        $user = $request->get('user');
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'User not authenticated'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'account_ifsc' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $settings = DB::table('settings')->where('user_id', 1)->first();
        $va_charge = $settings->va_create_charge ?? 0;


        $account = DB::table('accounts')->where('user_id', $user->id)->where('primary_status', false)->first();

        if (!$account) {
            return response()->json(['status' => 0, 'message' => 'Primary account not found', 'data' => NULL], 200);
        }

        $txnid = rand(11111111, 99999999);
        $debited = false;

        try {
            // Step 1: Debit charge transaction
            $transactionData1 = [
                'account_id' => $account->id,
                'type' => 'DR',
                'amount' => $va_charge,
                'description' => 'VPA Generation Charge',
                'transaction_id' => $txnid,
                'created_by' => $account->user_id,
                'admin_id' => $account->admin_id,
                'user_id' => $account->user_id,
                'category_code' => 'CHARGE'
            ];

            if($va_charge>0){

                $transactionData = createTransaction($transactionData1);

                if (($transactionData['status'] ?? 0) !== 1) {
                    return response()->json(['status' => 0, 'message' => $transactionData['message'] ?? 'Transaction failed', 'data' => NULL], 200);
                }
            }

            $debited = true;

            // Look up existing va record by mid or mobile
            $va = null;
            if (!empty($user->mid)) {
                $va = Va::where('mid', $user->mid)->first();
            } elseif (!empty($user->mobile)) {
                $va = Va::where('mobile', $user->mobile)->first();
            }


            $url = self::BASE_URL."v2/generate-qr";


            $data = [
                "name"    => $request->name,
                "account_number"    => $request->account_number,
                "account_ifsc" => $request->account_ifsc
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
            
            // ✅ Step 7: Log API Request BEFORE Call
            DB::table('logs')->insert([
                'mid'          => $request->get('user')->mid ?? null,
                'type'         => 'QR Generate',
                'platform'     => 'API',
                'headers'      => json_encode(["Content-Type" => "application/x-www-form-urlencoded"]),
                'request_data' => json_encode($data),
                'response_data' => $response,
                'url'          => $url,
                'txnid'        => '',
                'status'       => 0,
                'timestamp'    => now(),
                'created_at'   => now()->format('Y-m-d H:i:s'),
            ]);

            $json_response = json_decode($response, true);
  

            if(isset($json_response['status']) && $json_response['status']==1){

                $vData = [
                    'mid' => $user->mid ?? null,
                    'mobile' => $user->mobile ?? null,
                    'username' => $request->name,
                    'account_number' => $request->account_number,
                    'account_ifsc' => strtoupper($request->account_ifsc),
                    'virtual_account_id' => $json_response['data']['virtual_account_id'] ?? null,
                    'virtual_account_number' => $json_response['data']['virtual_account_number'] ?? null,
                    'virtual_ifsc' => $json_response['data']['virtual_ifsc'] ?? null,
                    'virtual_upi_handle' => $json_response['data']['virtual_upi_handle'] ?? null,
                    'qrcode_image' => $json_response['data']['qrcode_image'] ?? null,
                    'qrcode_pdf' => $json_response['data']['qrcode_pdf'] ?? null,
                    'status' => 1,
                ];

                if ($va && $user->role > 2) {
                    $va->update($vData);
                } else {
                    $va = Va::create($vData);
                }


                $va = Va::where('virtual_account_id', $vaData['id'])->select('virtual_account_id','virtual_upi_handle','virtual_account_number','virtual_ifsc','qrcode_image','qrcode_pdf')->first();



                return response()->json([
                    'status' => 1,
                    'message' => 'QR generated successfully!',
                    'data' => $va
                ], 200);

            } else {
                $errorMsg = $responseArray['message'] ?? (is_string($responseArray['data'] ?? null) ? $responseArray['data'] : 'Failed to create VPA account');

                createTransaction([
                    'account_id' => $account->id,
                    'type' => 'CR',
                    'amount' => $va_charge,
                    'description' => $errorMsg . ' & Refund',
                    'transaction_id' => rand(11111111, 99999999),
                    'created_by' => $account->admin_id,
                    'admin_id' => $account->admin_id,
                    'user_id' => $account->user_id,
                    'category_code' => 'CHARGE'
                ]);

                return response()->json([
                    'status' => 0,
                    'message' => $errorMsg,
                    'data' => NULL
                ], 200);
            }

        } catch (Exception $e) {
            if ($debited) {
                createTransaction([
                    'account_id' => $account->id,
                    'type' => 'CR',
                    'amount' => 5,
                    'description' => 'VPA Generation Exception & Refund',
                    'transaction_id' => rand(11111111, 99999999),
                    'created_by' => $account->admin_id,
                    'admin_id' => $account->admin_id,
                    'user_id' => $account->user_id,
                    'category_code' => 'CHARGE'
                ]);
            }

            return response()->json([
                'status' => 0,
                'message' => 'Failed to generate Virtual Account QR',
                'error' => $e->getMessage() . ' on line ' . $e->getLine() . ' in ' . basename($e->getFile()),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }


    public function vaCallback(Request $request){
        try {
            // easy buzz virtual account transaction
        
                $response = $request->all();

                $eventData=$response['data'] ?? [];

                DB::table('logs')->insert([
                    'mid' => null,
                    'type' => 'Bharatpay Callback',
                    'platform' => 'Webhook',
                    'headers' => NULL,
                    'request_data' => json_encode($response),
                    'url' => 'VPA Callback',
                    'txnid' => rand(999999999, 111111111),
                    'status' => 0,
                    'timestamp' => now(),
                    'created_at' => now()->format('Y-m-d H:i:s'),
                ]);

                
                if($response['type'] =='vpa_transaction'){
                   
                    // $eventData keys => `id`, `mid`, `vpa_account_id`,
                    //  `txn_id`, `remitter_full_name`, `remitter_account_number`, 
                    // `remitter_account_ifsc`, `remitter_phone_number`, `utr`,
                    //  `payment_mode`, `amount`, `service_charge`, `gst_amount`,
                    //  `service_charge_with_gst`, `narration`, `status`, `vpa_id`,
                    //  `created_at`, `updated_at`

                    $virtualAccountId = $eventData['vpa_account_id'] ?? null;
                    if (!$virtualAccountId) {
                        return response()->json(['status' => 0, 'message' => 'Virtual Account ID missing in callback data'], 200);
                    }

                    $vpa_data = Va::where('virtual_account_id', $virtualAccountId)->first();

                  

                    if ($vpa_data) {
                        $data = [];
                    
                        $txnId = $eventData['txn_id'] ?? null;
                        if ($txnId) {
                            $record = DB::table('vpa_transaction')->where('txn_id', $txnId)->first();
                            if ($record) {
                                $data['updated_at'] = date('Y-m-d H:i:s');
                                DB::table('vpa_transaction')->where('id', $record->id)->update($data);
                            } else {
                                $data['remitter_full_name'] = $eventData['remitter_full_name'] ?? null;
                                $data['remitter_account_number'] = $eventData['remitter_account_number'] ?? null;
                                $data['remitter_account_ifsc'] = $eventData['remitter_account_ifsc'] ?? null;
                                $data['remitter_phone_number'] = $eventData['remitter_phone_number'] ?? null;
                                $data['payment_mode'] = $eventData['payment_mode'] ?? null;
                                $data['narration'] = $eventData['narration'] ?? null;
                                $data['amount'] = $eventData['amount'] ?? 0;
                                $data['service_charge'] = $eventData['service_charge'] ?? 0;
                                $data['gst_amount'] = $eventData['gst_amount'] ?? 0;
                                $data['service_charge_with_gst'] = $eventData['service_charge_with_gst'] ?? 0;
                                $data['vpa_id'] = $vpa_data->id;
                                $data['mid'] = $vpa_data->mid;
                                $data['txn_id'] = $txnId;
                                $data['status'] = $eventData['status'] ?? 'Pending';
                                $data['utr'] = $eventData['utr'] ?? null;
                                $data['created_at'] = date('Y-m-d H:i:s');
                                $data['vpa_account_id'] = $virtualAccountId;

                                $id = DB::table('vpa_transaction')->insertGetId($data);

                                $isMember = (($vpa_data->user_type ?? 'AGENT') === 'MEMBER' || !empty($vpa_data->financial_account_id) || !empty($vpa_data->member_id));

                                if ($isMember) {
                                    // ── MEMBER SAVING ACCOUNT CREDIT ────────────────────
                                    $finAccount = null;
                                    if (!empty($vpa_data->financial_account_id)) {
                                        $finAccount = \App\Models\Financial\FinancialAccount::find($vpa_data->financial_account_id);
                                    }
                                    if (!$finAccount && !empty($vpa_data->member_id)) {
                                        $finAccount = \App\Models\Financial\FinancialAccount::where('member_id', $vpa_data->member_id)
                                            ->where('service_type', 'SAVING')
                                            ->first();
                                    }
                                    if (!$finAccount && !empty($vpa_data->virtual_account_id)) {
                                        $finAccount = \App\Models\Financial\FinancialAccount::where('virtual_account_id', $vpa_data->virtual_account_id)->first();
                                    }

                                    if ($finAccount && ($eventData['status'] ?? '') == 'SUCCESS') {
                                        $amt = (float) ($eventData['amount'] ?? 0);
                                        $utr = $eventData['utr'] ?? $txnId;
                                        $remitter = $eventData['remitter_full_name'] ?? 'UPI Transfer';

                                        DB::transaction(function() use ($finAccount, $amt, $txnId, $utr, $remitter) {
                                            $balanceBefore = (float) $finAccount->current_balance;
                                            $balanceAfter = $balanceBefore + $amt;

                                            $finAccount->update([
                                                'current_balance'   => $balanceAfter,
                                                'available_balance' => $balanceAfter,
                                            ]);

                                            \App\Models\Financial\FinancialTransaction::create([
                                                'transaction_id' => $txnId . '_QR',
                                                'account_id'     => $finAccount->id,
                                                'member_id'      => $finAccount->member_id,
                                                'user_id'        => $finAccount->user_id,
                                                'admin_id'       => $finAccount->admin_id,
                                                'service_type'   => 'SAVING',
                                                'txn_type'       => 'DEPOSIT',
                                                'amount'         => $amt,
                                                'charges'        => 0,
                                                'net_amount'     => $amt,
                                                'balance_before' => $balanceBefore,
                                                'balance_after'  => $balanceAfter,
                                                'payment_mode'   => 'UPI_QR',
                                                'narration'      => "UPI QR Deposit from {$remitter} (UTR: {$utr})",
                                                'status'         => 'SUCCESS',
                                            ]);





                                            $adminAccount = Account::where('user_id', $finAccount->admin_id)
                                                ->where(function ($q) {
                                                    $q->where('primary_status', false)->orWhere('primary_status', 0);
                                                })->first();

                                            if (!$adminAccount && $finAccount->admin_id) {
                                                $adminAccount = Account::where('user_id', $finAccount->admin_id)->first();
                                            }

                                            if ($adminAccount && $finAccount->admin_id) {

                                                $settings = DB::table('settings')->where('user_id', 1)->first();
                                                $charge = (float) ($settings->va_receive_charge ?? 4);

                                                // Create passbook entry
                                                $passbookData = [
                                                    'account_id' => $adminAccount->id,
                                                    'type' => 'CR',
                                                    'amount' => $amt,
                                                    'description' => 'UPI QR Deposit from '.$remitter,
                                                    'transaction_id' => $txnId.'-1',
                                                    'created_by' => 1,
                                                    'admin_id' => $adminAccount->admin_id ?? $finAccount->admin_id,
                                                    'user_id' => $adminAccount->user_id,
                                                    'category_code' => 'UPI_QR'
                                                ];

                                                $transactionData12 = createTransaction($passbookData);

                                                if ($charge > 0) {
                                                    $passbookData2 = [
                                                        'account_id' => $adminAccount->id,
                                                        'type' => 'DR',
                                                        'amount' => $charge,
                                                        'description' => 'VPA Credit Charge',
                                                        'transaction_id' => $txnId.'-2',
                                                        'created_by' => 1,
                                                        'admin_id' => $adminAccount->admin_id ?? $finAccount->admin_id,
                                                        'user_id' => $adminAccount->user_id,
                                                        'category_code' => 'CHARGE'
                                                    ];

                                                    $transactionData2 = createTransaction($passbookData2);
                                                }
                                            }
                                        });
                                    }
                                } else {
                                    // ── AGENT ACCOUNT CREDIT (Existing flow) ────────────
                                    $user = User::where('mid', $vpa_data->mid)->first();

                                    if ($user) {
                                        $account = Account::where('user_id', $user->id)
                                            ->where(function ($q) {
                                                $q->where('primary_status', false)->orWhere('primary_status', 0);
                                            })->first();

                                        if (!$account) {
                                            $account = Account::where('user_id', $user->id)->first();
                                        }

                                        if ($account) {

                                            // Determine Admin User (check admin_mid, or different account->admin_id, or default to 1)
                                            $adminUser = null;
                                            if (!empty($user->admin_mid)) {
                                                $adminUser = User::where('mid', $user->admin_mid)->first();
                                            }
                                            if (!$adminUser || $adminUser->id == $user->id) {
                                                if (!empty($account->admin_id) && $account->admin_id != $user->id) {
                                                    $adminUser = User::find($account->admin_id);
                                                }
                                            }
                                            if (!$adminUser && $user->id != 1) {
                                                $adminUser = User::find(1);
                                            }

                                            $adminId = $adminUser ? $adminUser->id : 1;

                                            $settings = DB::table('settings')->where('user_id', 1)->first();
                                            $charge = (float) ($settings->va_receive_charge ?? 4);

                                            $amt = (float) ($eventData['amount'] ?? 0);

                                            $credit_user_id = $account->user_id;
                                            $is_api_partner = false;

                                            if (!empty($user->is_api_partner)) {
                                                $credit_user_id = $user->id;
                                                $is_api_partner = true;
                                                $charge = (float) ($settings->api_vpa_receive_charge ?? 0);
                                            } elseif ($adminUser && !empty($adminUser->is_api_partner)) {
                                                $credit_user_id = $adminUser->id;
                                                $is_api_partner = true;
                                                $charge = (float) ($settings->api_vpa_receive_charge ?? 0);
                                            }

                                            $transactionData1 = [
                                                'account_id' => $account->id,
                                                'type' => 'CR',
                                                'amount' => $amt,
                                                'description' => 'VPA Credit',
                                                'transaction_id' => $txnId.'_CR',
                                                'created_by' => $account->user_id,
                                                'admin_id' => $adminId,
                                                'user_id' => $account->user_id,
                                                'category_code' => 'DEPOSIT'
                                            ];

                                            $transactionData13 = [
                                                'account_id' => $account->id,
                                                'type' => 'DR',
                                                'amount' => $charge,
                                                'description' => 'VPA Credit Charge',
                                                'transaction_id' => $txnId.'_DR',
                                                'created_by' => $account->user_id,
                                                'admin_id' => $adminId,
                                                'user_id' => $account->user_id,
                                                'category_code' => 'CHARGE'
                                            ];

                                            if ($eventData['status'] == 'SUCCESS') {

                                                $transactionData = createTransaction($transactionData1);

                                                if ($charge > 0) {
                                                    $transactionData2 = createTransaction($transactionData13);
                                                }

                                                // Admin credit (only if admin is a different user)
                                                if ($adminId && $adminId != $account->user_id) {
                                                    $adminAccount = Account::where('user_id', $adminId)
                                                        ->where(function ($q) {
                                                            $q->where('primary_status', false)->orWhere('primary_status', 0);
                                                        })->first();

                                                    if (!$adminAccount) {
                                                        $adminAccount = Account::where('user_id', $adminId)->first();
                                                    }

                                                    if ($adminAccount) {
                                                        // Create passbook entry for Admin Deposit
                                                        $passbookData = [
                                                            'account_id' => $adminAccount->id,
                                                            'type' => 'CR',
                                                            'amount' => $amt,
                                                            'description' => 'VPA Deposit',
                                                            'transaction_id' => $txnId.'-1',
                                                            'created_by' => $credit_user_id,
                                                            'admin_id' => $adminAccount->admin_id ?? $adminId,
                                                            'user_id' => $adminAccount->user_id,
                                                            'category_code' => 'DEPOSIT'
                                                        ];

                                                        $transactionData12 = createTransaction($passbookData);

                                                        if ($charge > 0) {
                                                            $passbookData2 = [
                                                                'account_id' => $adminAccount->id,
                                                                'type' => 'DR',
                                                                'amount' => $charge,
                                                                'description' => 'VPA Credit Charge',
                                                                'transaction_id' => $txnId.'-2',
                                                                'created_by' => $credit_user_id,
                                                                'admin_id' => $adminAccount->admin_id ?? $adminId,
                                                                'user_id' => $adminAccount->user_id,
                                                                'category_code' => 'CHARGE'
                                                            ];

                                                            $transactionData2 = createTransaction($passbookData2);
                                                        }
                                                    }
                                                }

                                                if ($is_api_partner == true) {

                                                    $setting = Setting::where('user_id', $credit_user_id)->first();
                                                    if ($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)) {
                                                        try {

                                                            $postData = [
                                                                "type" => "vpa_transaction",
                                                                "data" => DB::table('vpa_transaction')->where('id', $id)->first()
                                                            ];
                                                            
                                                            $ch = curl_init($setting->call_back_url);
                                                            curl_setopt_array($ch, [
                                                                CURLOPT_RETURNTRANSFER => true,
                                                                CURLOPT_POST           => true,
                                                                CURLOPT_POSTFIELDS     => json_encode($postData),
                                                                CURLOPT_HTTPHEADER     => [
                                                                    "Content-Type: application/json",
                                                                    "Accept: application/json"
                                                                ],
                                                                CURLOPT_TIMEOUT        => 60,
                                                                CURLOPT_CONNECTTIMEOUT => 20
                                                            ]);
                                                            $res = curl_exec($ch);
                                                            curl_close($ch);


                                                            DB::table('logs')->insert([
                                                                'mid' => $adminUser ? $adminUser->mid : $user->mid,
                                                                'type' => 'VPA Webhook Sent',
                                                                'platform' => 'API',
                                                                'headers' => NULL,
                                                                'request_data' => json_encode(DB::table('vpa_transaction')->where('id', $id)->first()),
                                                                'response_data' => $res,
                                                                'url' => $setting->call_back_url,
                                                                'txnid' => rand(999999999, 111111111),
                                                                'status' => 0,
                                                                'timestamp' => now(),
                                                                'created_at' => now()->format('Y-m-d H:i:s'),
                                                            ]);


                                                        } catch (\Exception $e) {
                                                            \Log::error('Callback to API partner failed: ' . $e->getMessage());
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    return response()->json([
                        'status' => 1,
                        'message' => 'VPA Callback processed successfully'
                    ], 200);

                }

                
        } catch (Exception $e) {
            \Log::error('vaCallback Exception: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Callback error: ' . $e->getMessage()
            ], 500);
        }
    }
}
