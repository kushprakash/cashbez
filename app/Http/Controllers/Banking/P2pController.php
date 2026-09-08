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
use App\Models\UserKyc;
use App\Models\Account;
use DB; 
use Illuminate\Support\Facades\Cache;
use Exception;

class P2pController extends Controller
{

    public function findContact(Request $request)
    {
        try {
            
            $userId = $request->get('user')->id;
            $adminMID = $request->get('admin')->mid;
            $searchNumber = $request->mobile_no;

            //left join with UserKyc to get photo using UserKyc.user_id = User.id
            $contact = User::where('users.mobile', $searchNumber)
                ->leftJoin('user_kyc', 'user_kyc.user_id', '=', 'users.id')
                ->select('users.id', 'users.name', 'users.mobile as mobile_no', 'user_kyc.photo' , 'user_kyc.name as kyc_name')
                ->where('users.id', '!=', $userId)
                ->where('users.status', 1)
                ->where('users.admin_mid', $adminMID)
                ->first();

            if ($contact) {
                $image = $contact->photo;
                $imageUrl = $image ? $image : '';

                $dataContact = [
                    'user_id' => $contact->id,
                    'mobile_number' => $contact->mobile_no,
                    'bank_name' => $contact->kyc_name,
                    'name' => $contact->name,
                    'image' => $imageUrl,
                ];

                return response()->json(['status' => 1, 'message' => 'get contact success', 'contact' => $dataContact], 200);
            } else {
                return response()->json(['status' => 0, 'message' => 'Contact not found'], 200);
            }
        } catch (Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'An error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function saveContact(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'contacts' => 'required|json',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 200);
        }

        $token = $request->header('Token');
        if (!$token) {
            return response()->json([
                'status' => 0,
                'message' => 'Unauthorized',
            ], 200);
        }

        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 200);
        }

        DB::table('contacts')->where('user_id', $user->id)->delete();

        DB::table('contacts')->insert([
            'user_id' => $user->id,
            'contacts' => $request->contacts,
        ]);
        
      
        $storedContacts = json_decode($request->contacts, true);
        $contactMatches = $this->getContactMatches($user->id, $storedContacts);

        if (count($contactMatches) > 0) {
            return response()->json(['status' => 1, 'message' => 'get contact success', 'contact' => $contactMatches], 200);
        } else {
            return response()->json(['status' => 0, 'message' => 'Contact not found', 'contact' => $contactMatches], 200);
        }

    }

    public function mobileTransfer(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'account_id'   => 'required|integer',
                'mpin'         => 'required|string|digits:4',
                'to_user_id'      => 'required|integer',
                'from_mobile'  => 'required|digits:10',
                'to_mobile'    => 'required|digits:10|different:from_mobile',
                'amount'       => 'required|numeric|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Validation failed',
                    'errors'  => $validator->errors(),
                ], 400);
            }

            $transaction_id = rand(100000, 999999).time();
            $request->merge(['transaction_id' => $transaction_id]);
            $admin = $request->get('admin');
            $from_account = Account::where('accounts.id', $request->account_id)
            ->leftJoin('users', 'users.id', '=', 'accounts.user_id')
            ->leftJoin('user_kyc', 'user_kyc.user_id', '=', 'users.id')
            ->select('users.name', 'users.mobile', 'users.id as userId', 'user_kyc.name as kyc_name')
            ->where('accounts.id', $request->account_id)
            ->first();

            if (!$from_account) {
                return response()->json([
                    'status' => 0,
                    'message' => 'From account not found'
                ], 404);
            }

            $to_account = DB::table('accounts')
            ->leftJoin('users', 'users.id', '=', 'accounts.user_id')
            ->leftJoin('user_kyc', 'user_kyc.user_id', '=', 'users.id')
            ->select('accounts.id', 'users.name', 'users.mobile', 'users.id as userId', 'user_kyc.name as kyc_name')
            ->where('accounts.user_id', $request->to_user_id)->where('primary_status', true)->first();

            if(!$to_account) {
                return response()->json(['status' => 0, 'message' => $request->to_mobile . ' have no primary account', 'data' => NULL], 200);
            }


            $transactionData = [
                'account_id' => $request->account_id,
                'mpin' => $request->mpin,
                'type' => 'DR',
                'amount' => $request->amount,
                'transaction_amount' => $request->amount,
                'description' => 'Mobile Transfer to ' . $to_account->kyc_name,
                'transaction_id' => $request->transaction_id,
                'category_code' => 'P2P'
            ];

            $transactionData = processTransaction($request, $transactionData);

            $mobilepayData = [
                'from_account_id' => $request->account_id,
                'from_user_id' => $from_account->userId,
                'from_mobile' => $from_account->mobile,
                'from_name' => $from_account->kyc_name,
                'to_account_id' => $to_account->id,
                'to_user_id' => $to_account->userId,
                'to_mobile' => $to_account->mobile,
                'to_name' => $to_account->kyc_name,
                'amount' => $request->amount,
                'txn_id' => $request->transaction_id,
                'status' => 'PENDING',
                'admin_id' => $admin->id,
                'created_by' => $from_account->userId,
                'platform' => 'android',
                'remarks' => 'Mobile Transfer to ' . $to_account->kyc_name,
                'created_at' => now(),
            ];

            // Insert and get the ID for later updates
            $mobiletransferInserted = DB::table('mobile_pay_transfers')->insert($mobilepayData);


            if($transactionData['status'] !== 1) {

                DB::table('mobile_pay_transfers')->where('txn_id', $request->transaction_id)->update([
                    'status' => 'FAILED',
                    'remarks' => $transactionData['message'] . ' - Failed Mobile Transfer to ' . $to_account->kyc_name
                ]);  

                return response()->json(['status' => 0, 'message' => $transactionData['message'], 'data' => NULL], 200);
            }

            if(!empty($transactionData['status']) && $transactionData['status'] == 1) {

                DB::table('mobile_pay_transfers')->where('txn_id', $request->transaction_id)->update([
                    'status' => 'SUCCESS',
                ]); 

                // Step 1: Prepare transaction data
                $transactionData1 = [
                    'account_id' => $to_account->id,
                    'type' => 'CR',
                    'amount' => $request->amount,
                    'description' => 'Mobile Transfer Received from ' . $from_account->kyc_name,
                    'transaction_id' => $request->transaction_id,
                    'created_by' => $to_account->userId,
                    'admin_id' => $admin->id,
                    'user_id' => $to_account->userId,
                    'category_code' => 'P2P'
                ];

                // Step 2: Create the transaction
                createTransaction($transactionData1);

                return response()->json(['status' => 1, 'message' => 'Transaction successful', 'data' => $transactionData], 200);


            } else {

                $json = json_encode($transactionData);
                $json = str_replace('"status":1', '"status":0', $json);
                $responses = json_decode($json, true);

                return response()->json(['status' => 0, 'message' => 'Transaction failed', 'data' => $responses], 200);
            }


        } catch (\Exception $e) {
           
            return response()->json([
                'status' => 0,
                'message' => 'Payment failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   

    private function getContactMatches($userId, $storedContacts)
    {
        $matchedContacts = [];
        $index = 0;

        foreach ($storedContacts as $contacts) {
            $formattedNumber = $this->formatPhoneNumber($contacts['number']);
            if (strlen($formattedNumber) >= 10) {

                $user = User::where('id', $userId)->first();
                $userId = $user->id;
                $adminMID = $user->admin_mid;

                //left join with UserKyc to get photo using UserKyc.user_id = User.id
                $contact = User::where('users.mobile', $formattedNumber)
                ->leftJoin('user_kyc', 'user_kyc.user_id', '=', 'users.id')
                ->select('users.id as userId', 'users.name', 'users.mobile as mobile_no', 'user_kyc.photo' , 'user_kyc.name as kyc_name')
                ->where('users.id', '!=', $userId)
                ->where('users.status', 1)
                ->where('users.admin_mid', $adminMID)
                ->first();

                if ($contact) {

                    $image = $contact->photo;
                    $imageUrl = $image ? $image : '';
                    $matchedContacts[] = [
                        'user_id' => $contact->userId,
                        'mobile_number' => $contact->mobile_no,
                        'bank_name' => $contact->kyc_name,
                        'name' => $contact->name,
                        'image' => $imageUrl
                    ];
                }
            }
        }

        return $matchedContacts;
    }

    private function formatPhoneNumber($number)
    {
        $number = str_replace([" ", "+91", "(", ")"], "", $number);
        return strlen($number) > 10 ? substr($number, 2) : $number;
    }

    public function recentTxnContact(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'page'     => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Validation failed',
                    'errors'  => $validator->errors(),
                ], 400);
            }

            $user = $request->get('user'); // assuming user is attached via middleware
            $userId = $user->id;
            $perPage = $request->input('per_page', 100); // default 100 per page
            $page = $request->input('page', 1); // default page 1

            // Get unique contacts with their latest transaction details
            $recentContactsQuery = DB::table('mobile_pay_transfers as mpt1')
                ->leftJoin('user_kyc as uk', function($join) use ($userId) {
                    $join->on('uk.user_id', '=', DB::raw('CASE 
                        WHEN mpt1.from_user_id = ' . $userId . ' THEN mpt1.to_user_id 
                        ELSE mpt1.from_user_id 
                    END'));
                })
                ->select([
                    DB::raw('CASE 
                        WHEN mpt1.from_user_id = ' . $userId . ' THEN mpt1.to_user_id 
                        ELSE mpt1.from_user_id 
                    END as contact_user_id'),
                    DB::raw('CASE 
                        WHEN mpt1.from_user_id = ' . $userId . ' THEN mpt1.to_mobile 
                        ELSE mpt1.from_mobile 
                    END as contact_mobile'),
                    DB::raw('CASE 
                        WHEN mpt1.from_user_id = ' . $userId . ' THEN mpt1.to_name 
                        ELSE mpt1.from_name 
                    END as contact_name'),
                    'uk.photo as contact_photo',
                    'mpt1.amount',
                    'mpt1.status',
                    'mpt1.created_at',
                    DB::raw('CASE 
                        WHEN mpt1.from_user_id = ' . $userId . ' THEN "SENT" 
                        ELSE "RECEIVED" 
                    END as transaction_type')
                ])
                ->where(function($query) use ($userId) {
                    $query->where('mpt1.from_user_id', $userId)
                        ->orWhere('mpt1.to_user_id', $userId);
                })
                ->whereIn('mpt1.id', function($subQuery) use ($userId) {
                    $subQuery->select(DB::raw('MAX(mpt2.id)'))
                        ->from('mobile_pay_transfers as mpt2')
                        ->where(function($query) use ($userId) {
                            $query->where('mpt2.from_user_id', $userId)
                                ->orWhere('mpt2.to_user_id', $userId);
                        })
                        ->groupBy(DB::raw('CASE 
                            WHEN mpt2.from_user_id = ' . $userId . ' THEN mpt2.to_user_id 
                            ELSE mpt2.from_user_id 
                        END'));
                })
                ->orderBy('mpt1.id', 'desc');

            // Apply pagination
            $offset = ($page - 1) * $perPage;
            $recentContacts = $recentContactsQuery->offset($offset)->limit($perPage)->get();

            // Get total count for pagination
            $totalQuery = DB::table('mobile_pay_transfers')
                ->select(DB::raw('COUNT(DISTINCT CASE 
                    WHEN from_user_id = ' . $userId . ' THEN to_user_id 
                    ELSE from_user_id 
                END) as total'))
                ->where(function($query) use ($userId) {
                    $query->where('from_user_id', $userId)
                        ->orWhere('to_user_id', $userId);
                });
            
            $total = $totalQuery->first()->total;
            $lastPage = ceil($total / $perPage);

            return response()->json([
                'status'  => 1,
                'message' => 'Recent contacts retrieved successfully',
                'data'    => $recentContacts,
                'pagination' => [
                    'current_page' => $page,
                    'last_page'    => $lastPage,
                    'per_page'     => $perPage,
                    'total'        => $total,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 0,
                'message' => 'An error occurred',
                'error'   => $e->getMessage(), // optional: useful for debugging
            ], 500);
        }
    }

    public function mobileTransferHistory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'to_user_id' => 'required|integer',
            'page'       => 'nullable|integer|min:1',
            'per_page'   => 'nullable|integer|min:1|max:100', // optional for pagination
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 0,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 400);
        }

        $user = $request->get('user'); // assuming user is injected from middleware
        $userId = $user->id;
        $perPage = $request->input('per_page', 10); // default 10 per page
        $page = $request->input('page', 1); // default page 1

        $transactions = DB::table('mobile_pay_transfers')
            ->where(function($query) use ($userId, $request) {
                $query->where('from_user_id', $userId)
                    ->where('to_user_id', $request->to_user_id);
            })
            ->orWhere(function($query) use ($userId, $request) {
                $query->where('from_user_id', $request->to_user_id)
                    ->where('to_user_id', $userId);
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'status'  => 1,
            'message' => 'Transaction history retrieved successfully',
            'data'    => $transactions->items(),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
                'per_page'     => $transactions->perPage(),
                'total'        => $transactions->total(),
            ]
        ], 200);
    }


    public function upiTransfer(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'account_id'   => 'required|integer',
                'mpin'         => 'required|string|digits:4',
                'upi'      => 'required|string',
                'amount'       => 'required|numeric|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Validation failed',
                    'errors'  => $validator->errors(),
                ], 400);
            }

            $transaction_id = rand(100000, 999999).time();
            $request->merge(['transaction_id' => $transaction_id]);
            $admin = $request->get('admin');
            $from_account = Account::where('accounts.id', $request->account_id)
            ->leftJoin('users', 'users.id', '=', 'accounts.user_id')
            ->leftJoin('user_kyc', 'user_kyc.user_id', '=', 'users.id')
            ->select('users.name', 'users.mobile', 'users.id as userId', 'user_kyc.name as kyc_name')
            ->first();

            if (!$from_account) {
                return response()->json([
                    'status' => 0,
                    'message' => 'From account not found'
                ], 404);
            }

            $to_account = DB::table('accounts')
            ->leftJoin('users', 'users.id', '=', 'accounts.user_id')
            ->leftJoin('user_kyc', 'user_kyc.user_id', '=', 'users.id')
            ->select('accounts.id', 'users.name', 'users.mobile', 'users.id as userId', 'user_kyc.name as kyc_name')
            ->where('accounts.upi', $request->upi)->first();

            if(!$to_account) {
                return response()->json(['status' => 0, 'message' => 'Invalid UPI : '.$request->upi, 'data' => NULL], 200);
            }


            $transactionData = [
                'account_id' => $request->account_id,
                'mpin' => $request->mpin,
                'type' => 'DR',
                'amount' => $request->amount,
                'transaction_amount' => $request->amount,
                'description' => 'UPI Transfer to ' . $request->upi,
                'transaction_id' => $request->transaction_id,
                'category_code' => 'P2P'
            ];

            $transactionData = processTransaction($request, $transactionData);

            $mobilepayData = [
                'from_account_id' => $request->account_id,
                'from_user_id' => $from_account->userId,
                'from_mobile' => $from_account->mobile,
                'from_name' => $from_account->kyc_name,
                'to_account_id' => $to_account->id,
                'to_user_id' => $to_account->userId,
                'to_mobile' => $to_account->mobile,
                'to_name' => $to_account->kyc_name,
                'amount' => $request->amount,
                'txn_id' => $request->transaction_id,
                'status' => 'PENDING',
                'admin_id' => $admin->id,
                'created_by' => $from_account->userId,
                'platform' => 'android',
                'remarks' => 'UPI Transfer to ' . $request->upi,
                'created_at' => now(),
            ];

            // Insert and get the ID for later updates
            $mobiletransferInserted = DB::table('mobile_pay_transfers')->insert($mobilepayData);


            if($transactionData['status'] !== 1) {

                DB::table('mobile_pay_transfers')->where('txn_id', $request->transaction_id)->update([
                    'status' => 'FAILED',
                    'remarks' => $transactionData['message'] . ' - Failed UPI Transfer to ' . $request->upi
                ]);

                return response()->json(['status' => 0, 'message' => $transactionData['message'], 'data' => NULL], 200);
            }

            if(!empty($transactionData['status']) && $transactionData['status'] == 1) {

                DB::table('mobile_pay_transfers')->where('txn_id', $request->transaction_id)->update([
                    'status' => 'SUCCESS',
                ]); 

                // Step 1: Prepare transaction data
                $transactionData1 = [
                    'account_id' => $to_account->id,
                    'type' => 'CR',
                    'amount' => $request->amount,
                    'description' => 'UPI Transfer Received from ' . $request->upi,
                    'transaction_id' => $request->transaction_id,
                    'created_by' => $to_account->userId,
                    'admin_id' => $admin->id,
                    'user_id' => $to_account->userId,
                    'category_code' => 'P2P'
                ];

                // Step 2: Create the transaction
                createTransaction($transactionData1);

                return response()->json(['status' => 1, 'message' => 'Transaction successful', 'data' => $transactionData], 200);


            } else {

                $json = json_encode($transactionData);
                $json = str_replace('"status":1', '"status":0', $json);
                $responses = json_decode($json, true);
                return response()->json(['status' => 0, 'message' => 'Transaction failed', 'data' => $responses], 200);
            }


        } catch (\Exception $e) {
           
            return response()->json([
                'status' => 0,
                'message' => 'Payment failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }


}