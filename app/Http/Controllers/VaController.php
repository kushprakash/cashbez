<?php

namespace App\Http\Controllers;

use App\Models\Va;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use DB;

class VaController extends Controller
{
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

        $settings = DB::table('settings')->where('user_id', $request->get('admin')->id)->first();
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

            $key = 'A96334D5FD';
            $salt = '962A257E0C';

            $payload = [];
            $payload['key'] = $key;
            $payload['label'] = $request->name;
            $payload['description'] = $request->description ?? ($request->name . '-' . $request->account_number);

            $payload['authorized_remitters'] = [
                [
                    'account_ifsc'   => $request->account_ifsc,
                    'account_number' => $request->account_number,
                ]
            ];

            $string = $key . '|' . $request->name . '|' . $salt;
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

            $rawResponse = curl_exec($curl);
            $curlError = null;

            if (curl_errno($curl)) {
                $curlError = curl_error($curl);
            }

            curl_close($curl);

            DB::table('logs')->insert([
                'mid' => $user->mid ?? NULL,
                'type' => 'VPA Generation API',
                'platform' => 'API Request',
                'headers' => json_encode([
                    'Authorization: ' . $signature,
                    'Content-Type: application/json'
                ]),
                'request_data' => json_encode($payload),
                'url' => 'https://wire.easebuzz.in/api/v1/insta-collect/virtual_accounts/',
                'response_data' => $rawResponse ?? null,
                'txnid' => $txnid,
                'status' => 0,
                'timestamp' => now(),
                'created_at' => now()->format('Y-m-d H:i:s'),
            ]);

            if ($curlError) {
                // Refund charge
                createTransaction([
                    'account_id' => $account->id,
                    'type' => 'CR',
                    'amount' => 5,
                    'description' => 'VPA Generation Failed (cURL Error) & Refund',
                    'transaction_id' => rand(11111111, 99999999),
                    'created_by' => $account->admin_id,
                    'admin_id' => $account->admin_id,
                    'user_id' => $account->user_id,
                    'category_code' => 'CHARGE'
                ]);

                return response()->json([
                    'status' => 0,
                    'message' => 'cURL Error: ' . $curlError,
                    'data' => NULL
                ], 500);
            }

            $responseArray = json_decode($rawResponse, true);

            if (is_array($responseArray) && isset($responseArray['success']) && $responseArray['success'] == true) {
                // Easebuzz structure: $responseArray['data']['virtual_account'] or $responseArray['virtual_account'] or $responseArray['data']
                $vaData = $responseArray['data']['virtual_account'] ?? $responseArray['virtual_account'] ?? $responseArray['data'] ?? $responseArray;

                $vData = [
                    'mid' => $user->mid ?? ($va ? $va->mid : null),
                    'mobile' => $user->mobile ?? ($va ? $va->mobile : null),
                    'username' => $request->name,
                    'account_number' => $request->account_number,
                    'account_ifsc' => strtoupper($request->account_ifsc),
                    'virtual_account_id' => $vaData['id'] ?? null,
                    'virtual_account_number' => $vaData['virtual_account_number'] ?? null,
                    'virtual_ifsc' => $vaData['virtual_ifsc_number'] ?? $vaData['virtual_ifsc'] ?? null,
                    'virtual_upi_handle' => $vaData['virtual_upi_handle'] ?? null,
                    'qrcode_image' => $vaData['upi_qrcode_remote_file_location'] ?? null,
                    'qrcode_pdf' => $vaData['upi_qrcode_scanner_remote_file_location'] ?? null,
                    'status' => 1,
                ];

                if ($va && $user->role > 2) {
                    $va->update($vData);
                } else {
                    $va = Va::create($vData);
                }


                $va = Va::where('mobile', $user->mobile)->select('virtual_account_id','virtual_upi_handle','qrcode_image','qrcode_pdf')->first();



                return response()->json([
                    'status' => 1,
                    'message' => 'Virtual Account QR generated successfully!',
                    'data' => $va
                ], 200);

            } else {
                $errorMsg = $responseArray['message'] ?? (is_string($responseArray['data'] ?? null) ? $responseArray['data'] : 'Failed to create VPA account');

                createTransaction([
                    'account_id' => $account->id,
                    'type' => 'CR',
                    'amount' => 5,
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

            if (empty($response) || !isset($response['event'])) {
                return response()->json([
                    'status' => 1,
                    'message' => 'VPA Callback endpoint reached successfully'
                ], 200);
            }

            $validEvents = ['TRANSACTION_CREDIT', 'REFUND_INITIATED', 'REFUND_STATUS_UPDATE', 'SETTLEMENT_INITIATED', 'SETTLEMENT_STATUS_UPDATE'];

            if (in_array($response['event'], $validEvents)) {
                $event = $response['event'];
                $eventData = $response['data'] ?? [];

                $virtualAccountId = $eventData['virtual_account']['id'] ?? null;
                if (!$virtualAccountId) {
                    return response()->json(['status' => 0, 'message' => 'Virtual Account ID missing in callback data'], 200);
                }

                $vpa_data = Va::where('virtual_account_id', $virtualAccountId)->first();

                DB::table('logs')->insert([
                    'mid' => $vpa_data->mid ?? $virtualAccountId,
                    'type' => 'VPA Callback',
                    'platform' => 'Webhook',
                    'headers' => NULL,
                    'request_data' => json_encode($eventData),
                    'url' => 'VPA Callback',
                    'txnid' => $eventData['id'] ?? rand(999999999, 111111111),
                    'status' => 0,
                    'timestamp' => now(),
                    'created_at' => now()->format('Y-m-d H:i:s'),
                ]);

                if ($vpa_data) {
                    $data = [];
                    $data['narration'] = $eventData['narration'] ?? null;

                    if ($event == 'TRANSACTION_CREDIT' && in_array($eventData['status'] ?? '', ['received', 'unsettled'])) {
                        $data['status'] = 'SUCCESS';
                    } else if ($event == 'REFUND_INITIATED' && ($eventData['status'] ?? '') == 'in_process') {
                        $data['status'] = 'REFUND_INITIATED';
                    } else if ($event == 'REFUND_STATUS_UPDATE' && ($eventData['status'] ?? '') == 'success') {
                        $data['status'] = 'REFUNDED';
                    } else if ($event == 'SETTLEMENT_INITIATED' && ($eventData['status'] ?? '') == 'in_process') {
                        $data['status'] = 'PENDING';
                    } else if ($event == 'SETTLEMENT_STATUS_UPDATE' && ($eventData['status'] ?? '') == 'success') {
                        $data['status'] = 'SUCCESS';
                    } else {
                        $data['status'] = 'PENDING';
                    }

                    $txnId = $eventData['id'] ?? null;
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
                            $data['amount'] = $eventData['amount'] ?? 0;
                            $data['service_charge'] = $eventData['service_charge'] ?? 0;
                            $data['gst_amount'] = $eventData['gst_amount'] ?? 0;
                            $data['service_charge_with_gst'] = $eventData['service_charge_with_gst'] ?? 0;
                            $data['vpa_id'] = $vpa_data->id;
                            $data['mid'] = $vpa_data->mid;
                            $data['txn_id'] = $txnId;
                            $data['utr'] = $eventData['unique_transaction_reference'] ?? null;
                            $data['created_at'] = date('Y-m-d H:i:s');

                            $id = DB::table('vpa_transaction')->insertGetId($data);

                            $user = DB::table('users')->where('mid', $vpa_data->mid)->first();

                            if ($user) {
                                $account = DB::table('accounts')->where('user_id', $user->id)->where('primary_status', false)->first();

                                if ($account) {


                                    $amt = (float) ($eventData['amount'] ?? 0);
                                    

                                    $transactionData1 = [
                                        'account_id' => $account->id,
                                        'type' => 'CR',
                                        'amount' => $amt,
                                        'description' => 'VPA Credit',
                                        'transaction_id' => $txnId.'_CR',
                                        'created_by' => $account->user_id,
                                        'admin_id' => $account->admin_id,
                                        'user_id' => $account->user_id,
                                        'category_code' => 'DEPOSIT'
                                    ];

                                    if ($data['status'] == 'SUCCESS') {

                                        $transactionData = createTransaction($transactionData1);

                                        $settings = DB::table('settings')->where('user_id', $account->admin_id)->first();
                                        $charge = $settings->va_receive_charge ?? 0;
                                        
                                        $credit_user_id = $account->user_id;
                                        $is_api_partner = false;

                                        $adminData = User::where('id', $account->admin_id)->first();
                                        if ($adminData && $adminData->is_api_partner == true) {
                                            $credit_user_id = $adminData->id;
                                            $is_api_partner = true;
                                            $charge = $settings->api_vpa_receive_charge ?? 0;
                                        } 

                                        $transactionData13 = [
                                            'account_id' => $account->id,
                                            'type' => 'DR',
                                            'amount' => $charge,
                                            'description' => 'VPA Credit Charge',
                                            'transaction_id' => $txnId.'_DR',
                                            'created_by' => $account->user_id,
                                            'admin_id' => $account->admin_id,
                                            'user_id' => $account->user_id,
                                            'category_code' => 'CHARGE'
                                        ];

                                        if($charge>0){
                                            $transactionData2 = createTransaction($transactionData13);
                                        }

                                        

                                        if ($is_api_partner == true) {
                                            $setting = Setting::where('user_id', $credit_user_id)->first();
                                            if ($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)) {
                                                try {
                                                    $postData = [
                                                        "type" => "vpa_transaction",
                                                        "data" => $data
                                                    ];

                                                    $ch = curl_init($setting->call_back_url);
                                                    $payload = json_encode($postData);

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

        } catch (Exception $e) {
            \Log::error('vaCallback Exception: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Callback error: ' . $e->getMessage()
            ], 500);
        }
    }
}
