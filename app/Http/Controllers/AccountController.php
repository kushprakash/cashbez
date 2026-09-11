<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Passbook;
use App\Models\Setting;
use App\Models\User;
use App\Http\Traits\AccountBalanceTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Writer\SvgWriter;
use DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Models\Payout;
use App\Models\Recharge;
use App\Models\AepsTransaction;
use App\Models\AepsDraft;
use App\Models\Beneficiary;

class AccountController extends Controller
{

    //api details
    private const BASE_URL = 'https://icchhamatidataservice.com/api/';
    private const MID = "AGENT1475";
    private const MKEY = "8ECgqn6xep6FPdVvzOs4ketqWQxG9qGY";


    use AccountBalanceTrait;
    /**
     * Get all accounts for authenticated user with balance details
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $admin = $request->get('admin');

            // Helper for mapping account data
            $mapAccount = function ($account) use ($admin) {
                $balance = $account->balance;
                $accountholder = DB::table('users')->where('id', $account->user_id)->first();
                $admindata = DB::table('users')->where('mid', $accountholder->admin_mid)->first();
                $isPrimary = (bool)$account->primary_status;
               
                    return [
                        'id' => $account->id,
                        'user_id' => $account->user_id,
                        'user_name' => $accountholder->name ?? '',
                        'mid' => $accountholder->mid ?? '',
                        'mobile' => $accountholder->mobile ?? '',
                        'company_name' => $admindata ? ($admindata->name ?? '') : '',
                        'name' => $account->name,
                        'wallet_type' => $isPrimary ? 'Trade Wallet' : 'Utility Wallet',
                        'number' => $account->formatted_number,
                        'balance' => '₹' . number_format($balance, 0),
                        'available_balance' => '₹' . number_format($balance - $account->hold_amount, 0),
                        'hold_amount' => '₹' . number_format($account->hold_amount, 2),
                        'status' => $account->status,
                        'primary_status' => $isPrimary,
                        'is_primary' => $isPrimary,
                        'upi' => $account->upi,
                        'full_number' => $account->number,
                        'raw_balance' => $balance,
                        'raw_available_balance' => $balance - $account->hold_amount,
                        'raw_hold_amount' => $account->hold_amount
                    ];
              
            };

            // Build query based on user role
            if ($user->role == 1) {
                $accounts = Account::with('latestTransaction')->get()->map($mapAccount);
            } elseif ($admin && $user->role == $admin->role) {
                $accounts = Account::with('latestTransaction')
                    ->where('admin_id', $admin->id)
                    ->get()->map($mapAccount);
            } else {
                $accounts = Account::with('latestTransaction')
                    ->where('user_id', $user->id)
                    ->get()->map($mapAccount);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Accounts retrieved successfully',
                'data' => [
                    'accounts' => $accounts
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve accounts',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function rootWiseAccounts(Request $request){
        try {
            $user = Auth::user();
            
             $selectColumns = [
                'accounts.id as account_id',
                'accounts.user_id',
                'accounts.name', 'accounts.number', 'accounts.hold_amount',
                'accounts.admin_id', 'accounts.status', 'accounts.primary_status', 'accounts.upi',
                'users.root as root_chain','users.name as user_name',
                'users.mid as user_mid', 'users.mobile as user_mobile',
                'admin_users.name as company_name'
            ];

            $query = Account::join('users', 'users.id', '=', 'accounts.user_id')
            ->leftJoin('users as admin_users', 'users.admin_mid', '=', 'admin_users.mid')
            ->orderBy('accounts.id', 'DESC');

            // Role-wise filter
            if ($user->role == 1) {
                // Super Admin → no filter (get all)
                $query->select($selectColumns);
            } elseif ($user->role == 2) {
                // Admin → filter by admin_id
                $query->where('accounts.admin_id', $user->id)
                      ->select($selectColumns);
            } else {
                // Dealer/Retailer → filter by root chain or direct ownership
                $query->where(function ($q) use ($user) {
                    $q->whereRaw("FIND_IN_SET(?, users.root)", [$user->id])
                    ->orWhere('users.id', $user->id);
                })
                ->select($selectColumns);
            }

            // Add subquery for latest balance
            $query->addSelect(['latest_balance' => \App\Models\Passbook::select('balance')
                ->whereColumn('account_id', 'accounts.id')
                ->orderBy('id', 'desc')
                ->limit(1)
            ]);

            $accounts = $query->get();

            // Calculate final balance
            $accounts->transform(function ($account) {
                $balance = $account->latest_balance ?? 0;
                $hold_amount = $account->hold_amount ?? 0;
                $final_balance = $balance - $hold_amount;
                $isPrimary = (bool)$account->primary_status;
                
                return [
                    "id" => $account->account_id,
                    "user_id" => $account->user_id,
                    "user_name" => $account->user_name,
                    "mid" => $account->user_mid ?? '',
                    "mobile" => $account->user_mobile ?? '',
                    "company_name" => $account->company_name ?? '',
                    "name" => $account->name,
                    "wallet_type" => $isPrimary ? 'Trade Wallet' : 'Utility Wallet',
                    "number" => '****' . substr($account->number, -4),
                    "balance" => '₹' . number_format($balance, 0),
                    "available_balance" => '₹' . number_format($final_balance, 0),
                    "hold_amount" => '₹' . number_format($hold_amount, 2),
                    "status" => $account->status,
                    "primary_status" => $isPrimary,
                    "is_primary" => $isPrimary,
                    "upi" => $account->upi,
                    "full_number" => $account->number,
                    "raw_balance" => $balance,
                    "raw_available_balance" => $final_balance,
                    "raw_hold_amount" => $hold_amount
                ];
            });

            return response()->json([
                'status' => 1,
                'message' => 'Accounts retrieved successfully',
                'data' => [
                    'accounts' => $accounts
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve accounts',
                'error' => $e->getMessage()
            ], 500);
        }

    }

    public function transaction(Request $request)
    {
        try {
            $request->validate([
                'account_id' => 'required|exists:accounts,id',
                'type'       => 'required|in:CR,DR',
                'amount'     => 'required|numeric|min:0',
                'details'    => 'required|string',
            ]);

            $user = Auth::user();
            $primaryAccount = Account::where('user_id', $user->id)
                ->where('primary_status', 1)
                ->first();

            if (!$primaryAccount) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Primary account not found'
                ], 404);
            }

            $receiverAccount = Account::findOrFail($request->account_id);
            $reverseType = $request->type === 'CR' ? 'DR' : 'CR';

            // Helper function to build transaction dataset
            $buildTxn = function ($account, $type) use ($request, $user) {
                return [
                    'account_id'     => $account->id,
                    'type'           => $type,
                    'amount'         => $request->amount,
                    'description'    => $request->details,
                    'transaction_id' => random_int(100000, 999999),
                    'created_by'     => $user->id,
                    'admin_id'       => $account->admin_id,
                    'user_id'        => $account->user_id,
                    'category_code'  => 'P2P'
                ];
            };

            // First transaction (deduction or credit based on request)
            $firstTransaction = createTransaction(
                $request->type === 'CR'
                    ? $buildTxn($primaryAccount, $reverseType)
                    : $buildTxn($receiverAccount, $request->type)
            );

            // Do NOT allow return response() inside `createTransaction()` — it must return array only.
            if (!isset($firstTransaction['status']) || $firstTransaction['status'] != 1) {
                return response()->json([
                    'status'  => 0,
                    'message' => $firstTransaction['message'] ?? 'Transaction failed'
                ], 200);
            }

            // Second transaction (opposite entry)
            createTransaction(
                $request->type === 'CR'
                    ? $buildTxn($receiverAccount, $request->type)
                    : $buildTxn($primaryAccount, $reverseType)
            );

            return response()->json([
                'status'  => 1,
                'message' => 'Transaction successful'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 0,
                'message' => 'Transaction failed',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transfer funds from primary account (primary_status = true/1)
     * to a non-primary account (primary_status = false/0) via MPIN verification
     */
    public function selfTransfer(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'status' => 0,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // If user ID is 1, MPIN is not strictly required
            $mpinRule = ($user->id == 1) ? 'nullable|string' : 'required|string|size:4|regex:/^[0-9]{4}$/';

            // Support 'account_id', 'target_account_id', or 'to_account_id' for target account
            $validator = Validator::make([
                'target_account_id' => $request->input('target_account_id'),
                'amount' => $request->input('amount'),
                'mpin' => $request->input('mpin'),
                'details' => $request->input('details')
            ], [
                'target_account_id' => 'required|exists:accounts,id',
                'amount' => 'required|numeric|min:0.01',
                'mpin' => $mpinRule,
                'details' => 'nullable|string|max:255'
            ]);

            $targetAccountId=$request->input('target_account_id');

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'error' => $validator->errors()
                ], 422);
            }

            // Get user's primary account (source of funds)
            $primaryAccount = Account::where('user_id', $user->id)
                ->where('primary_status', 1)
                ->first();

            if (!$primaryAccount) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Primary account not found'
                ], 404);
            }

            // Get target (destination) account
            $targetAccount = Account::where('id', $targetAccountId)
                ->where('user_id', $user->id)
                ->first();

            if (!$targetAccount) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Target account not found or does not belong to you'
                ], 404);
            }

            if ($targetAccount->id === $primaryAccount->id) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Cannot transfer funds to the same primary account'
                ], 400);
            }

            if ($targetAccount->isPrimary()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Target account must be a non-primary account'
                ], 400);
            }

            if ($targetAccount->status != 1) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Target account is inactive'
                ], 400);
            }

            // Verify MPIN (check primary account or target account MPIN). If user ID == 1, bypass MPIN check.
            $mpinValid = false;
            if ($user->id == 1) {
                $mpinValid = true;
            } elseif ($primaryAccount->hasMpin() && $primaryAccount->verifyMpin($request->mpin)) {
                $mpinValid = true;
            } elseif ($targetAccount->hasMpin() && $targetAccount->verifyMpin($request->mpin)) {
                $mpinValid = true;
            }

            if (!$mpinValid) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid MPIN entered'
                ], 400);
            }

            $amount = floatval($request->amount);
            $availableBalance = $primaryAccount->available_balance;

            if ($availableBalance < $amount) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Insufficient balance in primary account',
                    'data' => [
                        'available_balance' => $availableBalance,
                        'requested_amount' => $amount
                    ]
                ], 400);
            }

            $details = $request->details ?? ('Self Transfer to ' . $targetAccount->name);
            $txnId = random_int(100000, 999999);

            DB::beginTransaction();

            // 1. Debit Primary Account (primary_status = true)
            $debitData = [
                'account_id'     => $primaryAccount->id,
                'type'           => 'DR',
                'amount'         => $amount,
                'description'    => $details,
                'transaction_id' => $txnId,
                'created_by'     => $user->id,
                'admin_id'       => $primaryAccount->admin_id,
                'user_id'        => $primaryAccount->user_id,
                'category_code'  => 'P2P'
            ];

            $debitResult = createTransaction($debitData);

            if (!isset($debitResult['status']) || $debitResult['status'] != 1) {
                DB::rollBack();
                return response()->json([
                    'status'  => 0,
                    'message' => $debitResult['message'] ?? 'Debit transaction failed from primary account'
                ], 400);
            }

            // 2. Credit Target Account (primary_status = false)
            $creditData = [
                'account_id'     => $targetAccount->id,
                'type'           => 'CR',
                'amount'         => $amount,
                'description'    => 'Self Transfer from Primary Account (' . $primaryAccount->name . ')',
                'transaction_id' => $txnId,
                'created_by'     => $user->id,
                'admin_id'       => $targetAccount->admin_id,
                'user_id'        => $targetAccount->user_id,
                'category_code'  => 'P2P'
            ];

            $creditResult = createTransaction($creditData);

            if (!isset($creditResult['status']) || $creditResult['status'] != 1) {
                DB::rollBack();
                return response()->json([
                    'status'  => 0,
                    'message' => $creditResult['message'] ?? 'Credit transaction failed to target account'
                ], 400);
            }

            DB::commit();

            return response()->json([
                'status'  => 1,
                'message' => 'Self transfer completed successfully',
                'data'    => [
                    'transaction_id' => $txnId,
                    'amount'         => $amount,
                    'from_account'   => [
                        'id' => $primaryAccount->id,
                        'name' => $primaryAccount->name,
                        'new_balance' => $primaryAccount->balance - $amount,
                    ],
                    'to_account'     => [
                        'id' => $targetAccount->id,
                        'name' => $targetAccount->name,
                        'new_balance' => $targetAccount->balance + $amount,
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 0,
                'message' => 'Self transfer failed due to system error',
                'error'   => $e->getMessage()
            ], 500);
        }
    }



    /**
     * Create a new account
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'number' => 'required|string|unique:accounts,number|max:20',
                'initial_balance' => 'nullable|numeric|min:0',
                'mpin' => 'required|string|size:4|regex:/^[0-9]{4}$/',
                'user_id' => 'required|exists:users,id',
                'primary_status' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'error' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $initialBalance = $request->input('initial_balance', 0);
            $setPrimary = $request->input('primary_status', false);

            // Check if user has any existing accounts
            $existingAccountsCount = Account::where('user_id', $request->user_id)->count();

            // If this is the first account or explicitly requested, set as primary
            $shouldBePrimary = $existingAccountsCount === 0 || $setPrimary;

            DB::beginTransaction();

            // If setting as primary, remove primary status from other accounts
            // using users mobile for UPI 22-11-2025
            $upi = $user->mobile . '@cashbez';
            if ($shouldBePrimary && $existingAccountsCount > 0) {
                Account::where('user_id', $request->user_id)
                    ->update(['primary_status' => false]);
            }

            if ($existingAccountsCount > 0) {
                $upi = $user->mobile . '-' . $existingAccountsCount . '@cashbez';
            }

            // Create account
            $account = Account::create([
                'user_id' => $request->user_id,
                'name' => $request->name,
                'number' => $request->number,
                'upi' => $upi,
                'mpin' => $request->mpin,
                'hold_amount' => 0,
                'created_by' => $user->id,
                'admin_id' => $user->id,
                'status' => 1,
                'primary_status' => $shouldBePrimary
            ]);

            // Create initial passbook entry if initial balance > 0
            if ($initialBalance > 0) {
                Passbook::create([
                    'user_id' => $request->user_id,
                    'account_id' => $account->id,
                    'details' => 'Account opening balance',
                    'type' => Passbook::TYPE_CREDIT,
                    'pre_balance' => 0,
                    'amount' => $initialBalance,
                    'balance' => $initialBalance,
                    'created_by' => $user->id,
                    'admin_id' => $user->id
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Account created successfully',
                'data' => [
                    'account' => [
                        'id' => $account->id,
                        'name' => $account->name,
                        'number' => $account->formatted_number,
                        'balance' => $account->formatted_balance,
                        'status' => $account->status,
                        'primary_status' => $account->primary_status,
                        'is_primary' => $account->isPrimary()
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create account',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get account details with transactions
     */
    public function show(Request $request, $id)
    {
        try {

            $start_date = $request->start_date;
            $end_date = $request->end_date;

            $user = Auth::user();

            if($user->id==1){
           $account = Account::with([
                'passbooks' => function ($query) use ($start_date, $end_date) {
                    // If both dates are empty, get all
                    if (empty($start_date) && empty($end_date)) {
                        $query->orderBy('id', 'desc');
                    } elseif (!empty($start_date) && empty($end_date)) {
                        // If only start_date is set, get from that date onwards
                        $query->whereDate('created_at', '>=', $start_date)
                            ->orderBy('id', 'desc');
                    } elseif (!empty($start_date) && !empty($end_date)) {
                        // If both are set, get between
                        $query->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->orderBy('id', 'desc');
                    } else {
                        // If only end_date is set, get up to that date
                        $query->whereDate('created_at', '<=', $end_date)
                            ->orderBy('id', 'desc');
                    }
                },
                'latestTransaction'
            ])
                ->where('id', $id)
                ->first();

            } else {

           $account = Account::with([
                'passbooks' => function ($query) use ($start_date, $end_date) {
                    // If both dates are empty, get all
                    if (empty($start_date) && empty($end_date)) {
                        $query->orderBy('id', 'desc');
                    } elseif (!empty($start_date) && empty($end_date)) {
                        // If only start_date is set, get from that date onwards
                        $query->whereDate('created_at', '>=', $start_date)
                            ->orderBy('id', 'desc');
                    } elseif (!empty($start_date) && !empty($end_date)) {
                        // If both are set, get between
                        $query->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->orderBy('id', 'desc');
                    } else {
                        // If only end_date is set, get up to that date
                        $query->whereDate('created_at', '<=', $end_date)
                            ->orderBy('id', 'desc');
                    }
                },
                'latestTransaction'
            ])
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            }
 

            if (!$account) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Account not found',
                    'debug' => [
                        'id' => $id,
                        'user_id' => $user->id
                    ]
                ], 200);
            }

            $latestTransaction = $account->latestTransaction ?? null;
            $balance = $latestTransaction ? $latestTransaction->balance : $account->balance;

            // Defensive: handle missing relationships
            $passbooks = $account->passbooks ?? collect();

            return response()->json([
                'status' => 1,
                'message' => 'Account details retrieved successfully',
                'data' => [
                    'account' => [
                        'id' => $account->id,
                        'name' => $account->name,
                        'number' => $account->formatted_number,
                        'balance' => '₹' . number_format($balance, 2),
                        'available_balance' => '₹' . number_format($balance - $account->hold_amount, 2),
                        'hold_amount' => '₹' . number_format($account->hold_amount, 2),
                        'status' => $account->status,
                        'primary_status' => $account->primary_status,
                        'is_primary' => $account->isPrimary(),
                        'created_at' => $account->created_at ? $account->created_at->format('Y-m-d H:i:s') : null,
                        'raw_balance' => $account->balance,
                        'raw_hold_amount' => $account->hold_amount,
                        'raw_latest_transaction' => $latestTransaction,
                    ],
                    'recent_transactions' => $passbooks->map(function ($transaction) {
                        return [
                            'id' => $transaction->id,
                            'details' => $transaction->description,
                            'type' => $transaction->type,
                            'pre_balance' => $transaction->pre_balance,
                            'amount' => $transaction->formatted_amount,
                            'balance' => $transaction->formatted_balance,
                            'date' => $transaction->created_at ? $transaction->created_at->format('Y-m-d H:i:s') : null
                        ];
                    }),
                    'debug' => [
                        'passbooks_count' => $passbooks->count(),
                        'latest_transaction' => $latestTransaction,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve account details',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Update account status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:0,1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'error' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();

            $account = Account::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$account) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Account not found'
                ], 200);
            }

            $account->update(['status' => $request->status]);

            return response()->json([
                'status' => 1,
                'message' => 'Account status updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update account status',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function sendOtp(Request $request)
    {
        $user = Auth::user();

        $otp = rand(100000, 999999);
        $number = $user->mobile;

        $admin = DB::table('users')->where('mid', $user->admin_mid)->first();
        $adminId = $admin->id;
        $messageRow = getMessageRow("VerificationOTP", $adminId);
        if (!$messageRow) {
            return [
                'status' => 0,
                'message' => 'Message not sent due to Technical issue. Please contact the administrator.'
            ];
        }


        if(isset($request->type)){

            $url = self::BASE_URL."banking-send-otp";


            $data = [];

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


            $json_response = json_decode($response, true);

            if(isset($json_response['status']) && $json_response['status']==1){

                return response()->json([
                    'status' => 1,
                    'message' => 'OTP sent successfully',
                    'is_registered' => true
                ]);

            }


        }

        
        $messageTemplate = $messageRow->message;
        eval ("\$message = \"$messageTemplate\";");

        sendSms($message, $adminId, $number, $messageRow->template_id);



        DB::table('otps')->where('mobile', $user->mobile)->delete();


        DB::table('otps')->insert([
            'mobile' => $user->mobile,
            'otp' => $otp,
        ]);

        return response()->json([
            'status' => 1,
            'message' => 'OTP sent successfully',
            'is_registered' => false
        ]);


    }


    // Verify OTP (helper method)
    public function verifyOtp(Request $request)
    {
        $otp = $request->otp;

        $user = Auth::user();
        $mobile = $user->mobile;

        $user2 = DB::table('otps')->where('mobile', $mobile)->first();
        if (!$user2) {
            return ['status' => 0, 'message' => 'OTP expired or not found'];
        } else {

            if ($user2->otp != $otp) {
                return ['status' => 0, 'message' => 'Invalid OTP'];
            }

            DB::table('otps')->where('mobile', $mobile)->delete();
            return ['status' => 1, 'message' => 'OTP valid'];


        }

    }


    public function updateMpin(Request $request)
    {
        $user = Auth::user();

        // Validate the request

        $validator = Validator::make($request->all(), [
            'account_id' => 'required|exists:accounts,id',
            'newMpin' => 'required|string|size:4|regex:/^[0-9]{4}$/',
            'confirmMpin' => 'required|string|size:4|regex:/^[0-9]{4}$/|same:newMpin', //match newMpin and confirmMpin
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'error' => $validator->errors()
            ], 422);
        }

        $account = Account::where('id', $request->account_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$account) {
            return response()->json([
                'status' => 0,
                'message' => 'Account not found'
            ], 200);
        }

        $account->update([
            'mpin' => $request->newMpin,
        ]);

        return response()->json([
            'status' => 1,
            'message' => 'MPIN updated successfully'
        ]);
    }

    /**
     * Example method showing how to use AccountBalanceTrait in any controller
     */
    public function getAccountBalanceExample(Request $request)
    {
        $balanceData = $this->getAccountBalance($request);
        return response()->json($balanceData);
    }

    /**
     * Example of checking balance before a transaction
     */
    public function exampleTransactionWithBalanceCheck(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer',
            'amount' => 'required|numeric|min:0.01'
        ]);

        $accountId = $request->input('account_id');
        $amount = $request->input('amount');

        // Check if sufficient balance is available
        $balanceCheck = $this->checkSufficientBalance($request, $accountId, $amount);

        if ($balanceCheck['status'] == 0) {
            return response()->json([
                'status' => 0,
                'message' => $balanceCheck['message'],
                'data' => $balanceCheck
            ], 400);
        }

        // Proceed with transaction logic here
        // ... your transaction code ...

        return response()->json([
            'status' => 1,
            'message' => 'Transaction completed successfully',
            'data' => $balanceCheck
        ]);
    }

    /**
     * Example of MPIN validation for transaction
     */
    public function exampleMpinValidation(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer',
            'mpin' => 'required|string|size:4'
        ]);

        // Method 1: Just validate MPIN
        $mpinValidation = $this->validateAccountMpin($request);

        if ($mpinValidation['status'] == 0) {
            return response()->json([
                'status' => 0,
                'message' => $mpinValidation['message'],
                'data' => $mpinValidation
            ], 400);
        }

        return response()->json([
            'status' => 1,
            'message' => 'MPIN validation successful',
            'data' => $mpinValidation
        ]);
    }

    /**
     * Example of complete transaction validation using global function
     */
    public function exampleGlobalTransactionValidation(Request $request)
    {
        // Direct call to global validateTransaction function
        // No need to import anything or use traits
        $validation = validateTransaction($request);

        if ($validation['status'] == 0) {
            return response()->json([
                'status' => 0,
                'message' => $validation['message'],
                'error_code' => $validation['error_code'],
                'data' => $validation
            ], 400);
        }

        // All validations passed - proceed with transaction
        // ... your transaction logic here ...

        return response()->json([
            'status' => 1,
            'message' => 'Transaction validation successful using global function',
            'data' => $validation
        ]);
    }

    /**
     * Example mobile recharge using global validateTransaction
     */
    public function exampleMobileRechargeWithGlobalValidation(Request $request)
    {
        // Step 1: Validate transaction using global function
        $validation = validateTransaction($request);

        if ($validation['status'] == 0) {
            return response()->json([
                'status' => 0,
                'message' => $validation['message'],
                'error_code' => $validation['error_code'],
                'data' => $validation
            ], 400);
        }

        // Step 2: Process mobile recharge
        $mobileNumber = $request->input('mobile_number');
        $amount = $validation['transaction_amount'];

        try {
            // Simulate mobile recharge API call
            $rechargeResult = [
                'transaction_id' => 'MR' . time(),
                'status' => 'SUCCESS',
                'operator' => 'Airtel'
            ];

            return response()->json([
                'status' => 1,
                'message' => 'Mobile recharge completed successfully',
                'data' => [
                    'recharge' => $rechargeResult,
                    'account_info' => [
                        'account_id' => $validation['account_id'],
                        'account_name' => $validation['account_name'],
                        'remaining_balance' => $validation['remaining_balance']
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Recharge failed: ' . $e->getMessage(),
                'error_code' => 'RECHARGE_FAILED'
            ], 500);
        }
    }

    /**
     * Set an account as primary
     * Automatically sets all other accounts for the user as non-primary
     */
    public function setPrimary(Request $request, $id)
    {
        try {
            $user = Auth::user();

            $account = Account::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$account) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Account not found'
                ], 200);
            }

            // Use the model method to set as primary
            $account->setPrimary();

            return response()->json([
                'status' => 1,
                'message' => 'Account set as primary successfully',
                'data' => [
                    'account_id' => $account->id,
                    'account_name' => $account->name,
                    'is_primary' => true
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to set account as primary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove primary status from an account
     */
    public function removePrimary(Request $request, $id)
    {
        try {
            $user = Auth::user();

            $account = Account::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$account) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Account not found'
                ], 200);
            }

            // Use the model method to remove primary status
            $account->removePrimary();

            return response()->json([
                'status' => 1,
                'message' => 'Primary status removed successfully',
                'data' => [
                    'account_id' => $account->id,
                    'account_name' => $account->name,
                    'is_primary' => false
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to remove primary status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle primary status for an account
     */
    public function togglePrimary(Request $request, $id)
    {
        try {
            $user = Auth::user();

            $account = Account::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$account) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Account not found'
                ], 200);
            }

            if ($account->isPrimary()) {
                // Remove primary status
                $account->removePrimary();
                $message = 'Primary status removed successfully';
                $isPrimary = false;
            } else {
                // Set as primary
                $account->setPrimary();
                $message = 'Account set as primary successfully';
                $isPrimary = true;
            }

            return response()->json([
                'status' => 1,
                'message' => $message,
                'data' => [
                    'account_id' => $account->id,
                    'account_name' => $account->name,
                    'is_primary' => $isPrimary
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to toggle primary status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the primary account for the authenticated user
     */
    public function getPrimary(Request $request)
    {
        try {
            $user = $request->get('user');

            $primaryAccount = Account::where('user_id', $user->id)->where('primary_status', 1)->first();

            if (!$primaryAccount) {
                // Return debug info if no primary account found, as planned
                return response()->json([
                    'status' => 0,
                    'message' => 'No primary account found',
                    'debug_info' => [
                        'user_id' => $user->id,
                        'total_accounts' => Account::where('user_id', $user->id)->count(),
                        'accounts' => Account::where('user_id', $user->id)->get(['id', 'primary_status', 'status'])
                    ]
                ], 200);
            }

            $balance = $primaryAccount->balance;

            return response()->json([
                'status' => 1,
                'message' => 'Primary account retrieved successfully',
                'data' => [
                    'account' => [
                        'id' => $primaryAccount->id,
                        'name' => $primaryAccount->name,
                        'number' => $primaryAccount->formatted_number,
                        'balance' => '₹' . number_format($balance, 2),
                        'available_balance' => '₹' . number_format($balance - $primaryAccount->hold_amount, 2),
                        'hold_amount' => '₹' . number_format($primaryAccount->hold_amount, 2),
                        'status' => $primaryAccount->status,
                        'primary_status' => true,
                        'is_primary' => true,
                        'full_number' => $primaryAccount->number,
                        'raw_balance' => $balance,
                        'raw_available_balance' => $balance - $primaryAccount->hold_amount,
                        'raw_hold_amount' => $primaryAccount->hold_amount
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve primary account',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function upiRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'data' => NULL,
                'errors' => $validator->errors()
            ], 422);
        }

        // if ($request->amount < 200) {
        //     return response()->json([
        //         'status' => 0,
        //         'message' => 'Minimum amount is 200.00',
        //         'data' => NULL
        //     ], 200);
        // }


        $users = $request->get('user');

        // Verify account belongs to the user
        if (isset($request->account_id)) {
            $account = Account::where('id', $request->account_id)->where('user_id', $users->id)->first();
        } else {
            $account = Account::where('primary_status', 1)->where('user_id', $users->id)->first();
        }

        if (!$account) {
            return response()->json([
                'status' => 0,
                'message' => 'Account not found or unauthorized',
                'data' => NULL
            ], 200);
        }

        $mob = $users->mobile ?? '9999999999';
        $email = $users->email ?? 'user@example.com';
        $firstname = $users->name ?? 'User';
        $amt = number_format((float)$request->amount, 2, '.', '');
        $txnid = 'EB' . time() . rand(1111, 9999);

        // Easebuzz Credentials
        $key = env('EASEBUZZ_KEY', 'OXWCT9JKVV');
        $salt = env('EASEBUZZ_SALT', 'KOXBM3GS4V');
        $envMode = env('EASEBUZZ_ENV', 'prod'); // 'prod' or 'test'

        $productinfo = 'Add Fund Request';
        $surl = url("/api/add-money/verify");
        $furl = url("/api/add-money/verify");

        // Easebuzz Hash Sequence Formula:
        // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
        $hashSequence = "{$key}|{$txnid}|{$amt}|{$productinfo}|{$firstname}|{$email}|||||||||||{$salt}";
        $hash = strtolower(hash('sha512', $hashSequence));


        $postFields = http_build_query([
            'key' => $key,
            'txnid' => $txnid,
            'amount' => $amt,
            'productinfo' => $productinfo,
            'firstname' => $firstname,
            'phone' => $mob,
            'email' => $email,
            'surl' => $surl,
            'furl' => $furl,
            'hash' => $hash,
            'udf1' => '',
            'udf2' => '',
            'udf3' => '',
            'udf4' => '',
            'udf5' => ''
        ]);

        $apiUrl = ($envMode === 'test')
            ? 'https://testpay.easebuzz.in/payment/initiateLink'
            : 'https://pay.easebuzz.in/payment/initiateLink';

        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => $apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => $postFields,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/x-www-form-urlencoded',
                'Accept: application/json'
            ),
        ));

        $response = curl_exec($curl);
        $curlError = curl_errno($curl) ? curl_error($curl) : null;
        curl_close($curl);

        $response_data = json_decode($response, true);

        // Log transaction initiation in add_funds table
        DB::table('add_funds')->insert([
            "user_id" => $users->id,
            "account_id" => $account->id,
            "mobile_number" => $mob,
            "email" => $email,
            "name" => $firstname,
            "success_url" => $surl ?? null,
            "failure_url" => $furl ?? null,
            "amount" => $amt,
            "txnid" => $txnid,
            "status" => 'pending',
            'order_id' => $txnid,
            "message" => 'Easebuzz Payment initiated',
            'device_id' => rand(11111111, 99999999),
            'sim_verified' => 1,
            "paytm_response" => $response
        ]);

        // Handle Easebuzz API response (status 1 = success, data contains access_key string)
        if ($response_data && isset($response_data['status']) && $response_data['status'] == 1) {
            $accessKey = $response_data['data'];


            DB::table('add_funds')->where('txnid', $txnid)->update([
                'access_key' => $accessKey
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Payment initiated successfully.',
                'data' => [
                    'access_key' => $accessKey,
                    'key' => $key,
                    'txnid' => $txnid,
                    'env' => $envMode
                ]
            ]);
        }

        $errorMsg = $response_data['error_desc'] ?? $response_data['message'] ?? $curlError ?? 'Failed to initiate payment with gateway';

        return response()->json([
            'status' => 0,
            'message' => 'Payment initiation failed: ' . $errorMsg,
            'data' => NULL
        ], 200);
    }


    public function upiRequests(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1',
            'mobile_number' => 'required|numeric|min:10',
            'email' => 'required|email',
            'name' => 'required|string',
            'success_url' => 'required|url',
            'failure_url' => 'required|url',
            'reference_id' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'data' => NULL,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->amount < 200) {
            return response()->json([
                'status' => 0,
                'message' => 'Minimum amount is 200.00',
                'data' => NULL
            ], 200);
        }


        

        $users = $request->get('user');

   
        $account = Account::where('primary_status', 0)->where('user_id', $users->id)->first();
    

        if (!$account) {
            return response()->json([
                'status' => 0,
                'message' => 'Account not found or unauthorized',
                'data' => NULL
            ], 200);
        }





        $mob = $request->mobile_number ?? $request->customer_mobile ?? $request->mobile ?? $users->mobile ?? '9999999999';
        $email = $request->email ?? $request->customer_email ?? $users->email ?? 'customer@example.com';
        $firstname = $request->name ?? $request->customer_name ?? $users->name ?? 'Customer';
        $amt = number_format((float)$request->amount, 2, '.', '');
        $txnid = $request->reference_id ?? $request->txnid ?? 'TXN' . time() . rand(1000, 9999);


        $check_txn=DB::table('add_funds')->where('txnid', $txnid)->first();
    
        if ($check_txn) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid reference_id. Transaction already exist',
                'data' => NULL
            ], 200);
        }


        // Easebuzz Credentials
        $key = env('EASEBUZZ_KEY', 'OXWCT9JKVV');
        $salt = env('EASEBUZZ_SALT', 'KOXBM3GS4V');
        $envMode = env('EASEBUZZ_ENV', 'prod'); // 'prod' or 'test'

        $productinfo = 'Add Fund Request';
        $surl = url("/api/add-money/verify");
        $furl = url("/api/add-money/verify");

        // Easebuzz Hash Sequence Formula:
        // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
        $hashSequence = "{$key}|{$txnid}|{$amt}|{$productinfo}|{$firstname}|{$email}|||||||||||{$salt}";
        $hash = strtolower(hash('sha512', $hashSequence));


        $postFields = http_build_query([
            'key' => $key,
            'txnid' => $txnid,
            'amount' => $amt,
            'productinfo' => $productinfo,
            'firstname' => $firstname,
            'phone' => $mob,
            'email' => $email,
            'surl' => $surl,
            'furl' => $furl,
            'hash' => $hash,
            'udf1' => '',
            'udf2' => '',
            'udf3' => '',
            'udf4' => '',
            'udf5' => ''
        ]);

        $apiUrl = ($envMode === 'test')
            ? 'https://testpay.easebuzz.in/payment/initiateLink'
            : 'https://pay.easebuzz.in/payment/initiateLink';

        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => $apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => $postFields,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/x-www-form-urlencoded',
                'Accept: application/json'
            ),
        ));

        $response = curl_exec($curl);
        $curlError = curl_errno($curl) ? curl_error($curl) : null;
        curl_close($curl);

        $response_data = json_decode($response, true);

        // Log transaction initiation in add_funds table
        DB::table('add_funds')->insert([
            "user_id" => $users->id,
            "account_id" => $account->id,
            "mobile_number" => $mob,
            "email" => $email,
            "name" => $firstname,
            "success_url" => $request->success_url ?? null,
            "failure_url" => $request->failure_url ?? null,
            "amount" => $amt,
            "txnid" => $txnid,
            "status" => 'pending',
            'order_id' => $txnid,
            "message" => 'Easebuzz Payment initiated',
            'device_id' => rand(11111111, 99999999),
            'sim_verified' => 1,
            "paytm_response" => json_encode([
                'raw' => $response_data,
                'access_key' => $response_data['data'] ?? null,
                'key' => $key,
                'env' => $envMode
            ])
        ]);

        // Handle Easebuzz API response (status 1 = success, data contains access_key string)
        if ($response_data && isset($response_data['status']) && $response_data['status'] == 1) {
            $accessKey = $response_data['data'];
            $paymentUrl = url('/pg/checkout/' . $accessKey);

            return response()->json([
                'status' => 1,
                'message' => 'Payment initiated successfully.',
                'payment_url' => $paymentUrl
            ]);
        }

        $errorMsg = $response_data['error_desc'] ?? $response_data['message'] ?? $curlError ?? 'Failed to initiate payment with gateway';

        return response()->json([
            'status' => 0,
            'message' => 'Payment initiation failed: ' . $errorMsg,
            'data' => NULL
        ], 200);
    }

    public function getPGTransaction(Request $request)
    {
        $accessKey = $request->input('access_key') ?? $request->input('accessKey') ?? '';
        $txnId = $request->input('txnid') ?? $request->input('reference_id') ?? $request->input('order_id');

        $addMoney = DB::table('add_funds')->where('txnid', $txnId)->first();

        if (!$addMoney) {
            return response()->json([
                'status' => 0,
                'message' => 'Transaction not found',
                'data' => null
            ], 404);
        }

        // Check payment status from Easebuzz if status is pending
        if (strtolower((string)$addMoney->status) === 'pending') {
            $key = env('EASEBUZZ_KEY', 'OXWCT9JKVV');
            $salt = env('EASEBUZZ_SALT', 'KOXBM3GS4V');
            $envMode = env('EASEBUZZ_ENV', 'prod');

            $amtFormatted = number_format((float)$addMoney->amount, 2, '.', '');
            $email = $addMoney->email ?? 'customer@example.com';
            $phone = $addMoney->mobile_number ?? '9999999999';

            // Easebuzz Hash Sequence Formula for Retrieve API: key|txnid|amount|email|phone|salt
            $hashSeq = "{$key}|{$addMoney->txnid}|{$amtFormatted}|{$email}|{$phone}|{$salt}";
            $hash = strtolower(hash('sha512', $hashSeq));

            $apiUrl = ($envMode === 'test')
                ? 'https://testpay.easebuzz.in/transaction/v1/retrieve'
                : 'https://pay.easebuzz.in/transaction/v1/retrieve';

            $postFields = http_build_query([
                'key' => $key,
                'txnid' => $addMoney->txnid,
                'amount' => $amtFormatted,
                'email' => $email,
                'phone' => $phone,
                'hash' => $hash
            ]);

            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => $apiUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 5,
                CURLOPT_TIMEOUT => 4,
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => $postFields,
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/x-www-form-urlencoded',
                    'Accept: application/json'
                ),
            ));

            $ebResponse = curl_exec($curl);
            curl_close($curl);

            $ebData = json_decode($ebResponse, true);

            if ($ebData && isset($ebData['status']) && ($ebData['status'] == 1 || $ebData['status'] === true)) {

                $msgStatus = strtolower($ebData['msg']['status'] ?? $ebData['msg'][0]['status'] ?? '');
                $easepayid = $ebData['msg']['easepayid'] ?? $ebData['msg'][0]['easepayid'] ?? $addMoney->txnid;

                if (in_array($msgStatus, ['success', 'completed'])) {
                    DB::table('add_funds')->where('id', $addMoney->id)->update([
                        'status' => 'success',
                        'message' => 'Easebuzz Payment Successful',
                        'utr' => $easepayid,
                        'paytm_response' => json_encode($ebData)
                    ]);

                    // Credit user's account & add transaction
                    $user = DB::table('users')->where('id', $addMoney->user_id)->first();
                    if ($user) {
                        $admin = DB::table('users')->where('mid', $user->admin_mid ?? '')->first();
                        $adminId = $admin->id ?? $user->id;

                        createTransaction([
                            'account_id' => $addMoney->account_id,
                            'type' => 'CR',
                            'amount' => $addMoney->amount,
                            'description' => 'Easebuzz Payment TxnID: ' . $addMoney->txnid,
                            'transaction_id' => $addMoney->txnid,
                            'created_by' => $user->id,
                            'admin_id' => $adminId,
                            'user_id' => $user->id,
                            'category_code' => 'ADD_FUND'
                        ]);
                    }

                    // Refresh $addMoney record
                    $addMoney = DB::table('add_funds')->where('id', $addMoney->id)->first();

                } elseif (in_array($msgStatus, ['usercancelled', 'failure', 'failed', 'user dropped', 'bounced', 'flagged', 'cancelled'])) {
                    DB::table('add_funds')->where('id', $addMoney->id)->update([
                        'status' => 'failed',
                        'message' => 'Easebuzz Payment Failed / Cancelled',
                        'paytm_response' => json_encode($ebData)
                    ]);

                    // Refresh $addMoney record
                    $addMoney = DB::table('add_funds')->where('id', $addMoney->id)->first();

                } elseif (in_array($msgStatus, ['pending', 'initiated', 'processing', 'unmapped', 'pending_vbv'])) {
                    DB::table('add_funds')->where('id', $addMoney->id)->update([
                        'status' => 'pending',
                        'message' => 'Easebuzz Payment Pending',
                        'paytm_response' => json_encode($ebData)
                    ]);

                    // Refresh $addMoney record
                    $addMoney = DB::table('add_funds')->where('id', $addMoney->id)->first();
                }
            }
        }

        $paytmData = json_decode($addMoney->paytm_response ?? '{}', true);

        // Format success_url and failure_url with ?txnid=...&status=...
        $currentStatusUpper = strtoupper($addMoney->status ?? 'PENDING');

        $successUrl = $addMoney->success_url;
        if (!empty($successUrl)) {
            $sep = (strpos($successUrl, '?') !== false) ? '&' : '?';
            $successUrl .= $sep . 'txnid=' . $addMoney->txnid . '&status=' . $currentStatusUpper;
        }

        $failureUrl = $addMoney->failure_url;
        if (!empty($failureUrl)) {
            $sep = (strpos($failureUrl, '?') !== false) ? '&' : '?';
            $failureUrl .= $sep . 'txnid=' . $addMoney->txnid . '&status=' . $currentStatusUpper;
        }

        return response()->json([
            'status' => 1,
            'message' => 'Transaction retrieved successfully',
            'data' => [
                'txnid' => $addMoney->txnid,
                'order_id' => $addMoney->order_id,
                'amount' => $addMoney->amount,
                'name' => $addMoney->name,
                'email' => $addMoney->email,
                'mobile_number' => $addMoney->mobile_number,
                'status' => $addMoney->status,
                'success_url' => $successUrl,
                'failure_url' => $failureUrl,
                'access_key' => $paytmData['access_key'] ?? $accessKey,
                'key' => $paytmData['key'] ?? env('EASEBUZZ_KEY', 'OXWCT9JKVV'),
                'env' => $paytmData['env'] ?? env('EASEBUZZ_ENV', 'prod'),
                'created_at' => $addMoney->created_at
            ]
        ], 200);
    }


    public function pgCronCheckStatus(Request $request)
    {

        $addMoney = DB::table('add_funds')
                ->where('status', 'pending')
                ->whereNotNull('access_key')
                ->where('access_key', '!=', '')
                ->get();

                foreach($addMoney as $am){
                    $this->CheckStatus($am->txnid);
                }
                
    }



    public function CheckStatus($txnid=null)
    {

     
            $addMoney = DB::table('add_funds')
                ->where('status', 'pending')
                ->whereNotNull('access_key')
                ->where('access_key', '!=', '')
                ->where('txnid', $txnid)
                ->first();
     
                if($addMoney){

                    $account = Account::where('primary_status', 0)->where('user_id', $addMoney->user_id)->first();
    

                    if (!$account) {
                        return response()->json([
                            'status' => 0,
                            'message' => 'Account not found or unauthorized',
                            'data' => NULL
                        ], 200);
                    }

        
    
                    $key = env('EASEBUZZ_KEY', 'OXWCT9JKVV');
                    $salt = env('EASEBUZZ_SALT', 'KOXBM3GS4V');
                    $envMode = env('EASEBUZZ_ENV', 'prod');

                    // 1. Easebuzz V2 Retrieve API Formula: key|txnid|salt
                    $v2HashSeq = "{$key}|{$addMoney->txnid}|{$salt}";
                    $v2Hash = strtolower(hash('sha512', $v2HashSeq));

                    $v2Url = ($envMode === 'test')
                        ? 'https://testdashboard.easebuzz.in/transaction/v2/retrieve'
                        : 'https://dashboard.easebuzz.in/transaction/v2/retrieve';

                    $curl = curl_init();
                    curl_setopt_array($curl, array(
                        CURLOPT_URL => $v2Url,
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_ENCODING => '',
                        CURLOPT_MAXREDIRS => 5,
                        CURLOPT_TIMEOUT => 6,
                        CURLOPT_CONNECTTIMEOUT => 4,
                        CURLOPT_SSL_VERIFYPEER => false,
                        CURLOPT_SSL_VERIFYHOST => false,
                        CURLOPT_CUSTOMREQUEST => 'POST',
                        CURLOPT_POSTFIELDS => http_build_query([
                            'key' => $key,
                            'txnid' => $addMoney->txnid,
                            'hash' => $v2Hash
                        ]),
                        CURLOPT_HTTPHEADER => array(
                            'Content-Type: application/x-www-form-urlencoded',
                            'Accept: application/json'
                        ),
                    ));

                    $ebResponse = curl_exec($curl);
                    curl_close($curl);
                    $res = json_decode($ebResponse, true);

                    // Fallback to V1 Retrieve API if V2 fails
                    if (!$res || !isset($res['status']) || ($res['status'] === false && str_contains(json_encode($res), 'wrong'))) {
                        $amtFormatted = number_format((float)$addMoney->amount, 2, '.', '');
                        $userObj = DB::table('users')->where('id', $addMoney->user_id)->first();
                        $email = !empty($addMoney->email) ? $addMoney->email : ($userObj->email ?? 'user@example.com');
                        $phone = !empty($addMoney->mobile_number) ? $addMoney->mobile_number : ($userObj->mobile ?? '9999999999');

                        $v1HashSeq = "{$key}|{$addMoney->txnid}|{$amtFormatted}|{$email}|{$phone}|{$salt}";
                        $v1Hash = strtolower(hash('sha512', $v1HashSeq));

                        $v1Url = ($envMode === 'test')
                            ? 'https://testpay.easebuzz.in/transaction/v1/retrieve'
                            : 'https://pay.easebuzz.in/transaction/v1/retrieve';

                        $curl1 = curl_init();
                        curl_setopt_array($curl1, array(
                            CURLOPT_URL => $v1Url,
                            CURLOPT_RETURNTRANSFER => true,
                            CURLOPT_ENCODING => '',
                            CURLOPT_MAXREDIRS => 5,
                            CURLOPT_TIMEOUT => 6,
                            CURLOPT_CONNECTTIMEOUT => 4,
                            CURLOPT_SSL_VERIFYPEER => false,
                            CURLOPT_SSL_VERIFYHOST => false,
                            CURLOPT_CUSTOMREQUEST => 'POST',
                            CURLOPT_POSTFIELDS => http_build_query([
                                'key' => $key,
                                'txnid' => $addMoney->txnid,
                                'amount' => $amtFormatted,
                                'email' => $email,
                                'phone' => $phone,
                                'hash' => $v1Hash
                            ]),
                            CURLOPT_HTTPHEADER => array(
                                'Content-Type: application/x-www-form-urlencoded',
                                'Accept: application/json'
                            ),
                        ));

                        $ebResponseV1 = curl_exec($curl1);
                        curl_close($curl1);

                        $resV1 = json_decode($ebResponseV1, true);
                        if ($resV1 && isset($resV1['status'])) {
                            $res = $resV1;
                            $ebResponse = $ebResponseV1;
                        }
                    }

                    $status=0;
                    $message='Invalid Transaction';
                    if($res && isset($res['status']) && $res['status'] == true){

                        if(isset($res['msg'])){

                            if($res['msg']['status']=='success'){

                                $status=1;
                                $message='Transaction successfully';

                                // Credit user's account & add transaction
                                $user = DB::table('users')->where('id', $addMoney->user_id)->first();
                                if ($user) {
                                    $admin = DB::table('users')->where('mid', $user->admin_mid ?? '')->first();
                                    $adminId = $admin->id ?? $user->id;

                                    createTransaction([
                                        'account_id' => $account->id,
                                        'type' => 'CR',
                                        'amount' => $addMoney->amount,
                                        'description' => 'Easebuzz Payment TxnID: ' . $addMoney->txnid,
                                        'transaction_id' => $addMoney->txnid,
                                        'created_by' => $user->id,
                                        'admin_id' => $adminId,
                                        'user_id' => $user->id,
                                        'category_code' => 'ADD_FUND'
                                    ]);
                                }

                                DB::table('add_funds')->where('id', $addMoney->id)->update([
                                    'status' => 'success',
                                    'utr' => $res['msg']['easepayid']??$res['msg']['bank_ref_num']??'',
                                    'message' => 'Easebuzz Payment Success',
                                    'paytm_response' => json_encode($ebResponse)
                                ]);
                                
                            } else if($res['msg']['status']=='failed'){

                                $message='Transaction failed';
                                $status=0;
                                DB::table('add_funds')->where('id', $addMoney->id)->update([
                                    'status' => 'failed',
                                    'message' => 'Easebuzz Payment Failed',
                                    'paytm_response' => json_encode($ebResponse)
                                ]);
                                
                            } else {
                                $message='Transaction Pending';
                                $status=2;
                                DB::table('add_funds')->where('id', $addMoney->id)->update([
                                    'status' => 'pending',
                                    'message' => 'Easebuzz Payment Pending',
                                    'paytm_response' => json_encode($ebResponse)
                                ]);
                            }


                        }
                    }



                    return response()->json([
                        'status' => $status,
                        'message' => $message,
                    ], 200);


            } else {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid Transaction',
                ], 200);
            }

    }

    public function pgVerify(Request $request)
    {
        $txnId = $request->txnid ?? $request->order_id;

        $addMoney = DB::table('add_funds')
            ->where('txnid', $txnId)
            ->first();

        if (!$addMoney) {
            return response()->json(['status' => 0, 'message' => 'Invalid Transaction', 'data' => NULL], 400);
        }


       
        return response()->json([
            'status' => 1,
            'message' => 'Payment Status fetched',
            'data' => [
                'txnid' => $txnId,
                'status' => $addMoney->status,
                'created_at' => $addMoney->created_at,
            ]
        ]);
    }




    public function addFundReceipt(Request $request)
    {
        $txnId = $request->txnid ?? $request->order_id;

        $addMoney = DB::table('add_funds')
            ->where('txnid', $txnId)
            ->first();

        if (!$addMoney) {
            return response()->json(['status' => 0, 'message' => 'Invalid Transaction', 'data' => NULL], 400);
        }

        if ($addMoney->status === 'success') {
            return response()->json([
                'status' => 1,
                'message' => 'Payment already verified and credited',
                'data' => ['txnid' => $txnId]
            ]);
        }

        $status = $request->status ?? $request->easebuzz_status;
        $responseRaw = json_encode($request->all());

        DB::table('add_funds')->where('txnid', $txnId)->update(['paytm_response' => $responseRaw]);

        if (in_array(strtolower((string)$status), ['success', '1', 'completed', 'true'])) {

            DB::table('add_funds')->where('txnid', $txnId)->update([
                'status' => 'success',
                'message' => 'Easebuzz Payment Successful',
                'utr' => $request->easepayid ?? $request->bank_ref_num ?? $txnId
            ]);

            // Credit to user's account logic
            $user = DB::table('users')->where('id', $addMoney->user_id)->first();
            $admin = DB::table('users')->where('mid', $user->admin_mid ?? '')->first();
            $adminId = $admin->id ?? $user->id;

            createTransaction([
                'account_id' => $addMoney->account_id,
                'type' => 'CR',
                'amount' => $addMoney->amount,
                'description' => 'Easebuzz Payment TxnID: ' . $txnId,
                'transaction_id' => $txnId,
                'created_by' => $user->id,
                'admin_id' => $adminId,
                'user_id' => $user->id,
                'category_code' => 'ADD_FUND'
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Payment Successful',
                'data' => [
                    'txnid' => $txnId,
                    'utr' => $request->easepayid ?? $txnId
                ]
            ]);
        }

        // Failed or pending
        DB::table('add_funds')->where('txnid', $txnId)->update([
            'status' => 'failed',
            'message' => $request->error_Message ?? $request->message ?? "Payment Failed"
        ]);

        return response()->json(['status' => 0, 'message' => 'Payment Failed', 'data' => NULL]);
    }



    public function addFundHistory(Request $request)
    {

        $user = User::find($request->id);

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'User not found'
            ], 404);
        }

        // Get filter parameters
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $status = $request->input('status', '');
        $startDate = $request->input('start_date', '');
        $endDate = $request->input('end_date', '');
        $accountId = $request->input('account_id', '');

        // Build query
        $query = DB::table('add_funds as am')
            ->leftJoin('accounts as a', 'am.account_id', '=', 'a.id')
            ->select(
                'am.id',
                'am.user_id',
                'am.account_id',
                'am.amount',
                'am.txnid',
                'am.utr',
                'am.status',
                'am.message',
                'am.created_at',
                'am.updated_at',
                'a.name as account_name',
                'a.number as account_number'
            )
            ->where('am.user_id', $user->id);

        // Apply status filter
        if (!empty($status)) {
            $query->where('am.status', $status);
        }

        // Apply account filter
        if (!empty($accountId)) {
            $query->where('am.account_id', $accountId);
        }

        // Apply date range filter
        if (!empty($startDate) && !empty($endDate)) {
            $query->whereBetween('am.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        } elseif (!empty($startDate)) {
            $query->whereDate('am.created_at', '>=', $startDate);
        } elseif (!empty($endDate)) {
            $query->whereDate('am.created_at', '<=', $endDate);
        }

        // Order by latest first
        $query->orderBy('am.id', 'desc');

        // Get total count before pagination
        $total = $query->count();

        // Apply pagination
        $history = $query->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        // Format the response data
        $formattedHistory = $history->map(function ($item) {
            return [
                'id' => $item->id,
                'user_id' => $item->user_id,
                'account_id' => $item->account_id,
                'account_name' => $item->account_name,
                'account_number' => $item->account_number,
                'formatted_account_number' => $item->account_number ? '****' . substr($item->account_number, -4) : 'N/A',
                'amount' => '₹' . number_format($item->amount, 2),
                'raw_amount' => $item->amount,
                'txnid' => $item->txnid,
                'utr' => $item->utr ?? 'N/A',
                'status' => $item->status,
                'status_badge' => $item->status === 'success' ? 'success' : ($item->status === 'pending' ? 'warning' : 'danger'),
                'message' => $item->message,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
                'formatted_date' => date('d M Y, h:i A', strtotime($item->created_at))
            ];
        });

        return response()->json([
            'status' => 1,
            'message' => 'Add Fund History retrieved successfully.',
            'data' => $formattedHistory,
            'pagination' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($total / $perPage),
                'from' => (($page - 1) * $perPage) + 1,
                'to' => min($page * $perPage, $total)
            ]
        ], 200);

    }


    /**
     * Verify UPI ID - checks if it's internal or external valid UPI
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upiVerify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'upi' => 'required|string',
            'name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'data' => null,
                'errors' => $validator->errors()
            ], 422);
        }

        $upiId = $request->upi;

        // Check if UPI is internal (exists in our system)
        $internalAccount = Account::where('upi', $upiId)
            ->leftJoin('user_kyc', 'user_kyc.user_id', '=', 'accounts.user_id')
            ->select('user_kyc.photo', 'user_kyc.name as kyc_name')
            ->first();

        if ($internalAccount) {
            return $this->buildInternalUpiResponse($internalAccount, $upiId);
        }

        // Validate external UPI
        $name = $request->name;
        return $this->buildExternalUpiResponse($upiId, $name);
    }

    private function buildInternalUpiResponse($account, $upiId)
    {
        $resultData = [
            'ResultPic' => $account->photo ?? '',
            'ResultName' => $account->kyc_name ?? 'Unknown',
            'ResultUPI' => $upiId,
            'is_internal' => true
        ];

        return response()->json([
            'status' => 1,
            'message' => 'UPI is valid and unique.',
            'data' => $resultData
        ], 200);
    }


    private function buildExternalUpiResponse($upiId, $name)
    {
        $externalValidation = $this->validateExternalUpi($upiId);

        if (!$externalValidation['is_valid']) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid UPI ID format: ' . implode(', ', $externalValidation['errors']),
                'data' => null
            ], 200);
        }

        $resultData = [
            'ResultPic' => url('uploads/upi-icons/user.jpg'),
            'ResultName' => $name,
            'ResultUPI' => $upiId,
            'is_internal' => false,
            'can_pay' => true,
            'provider' => $externalValidation['provider'],
            'provider_icon' => $this->getProviderIcon($externalValidation['provider'])
        ];

        return response()->json([
            'status' => 1,
            'message' => 'UPI is valid.',
            'data' => $resultData
        ], 200);
    }


    private function identifyUpiProvider($domain)
    {
        $providers = $this->getUpiProviderMappings();

        // Check exact match first
        if (isset($providers[$domain])) {
            return $providers[$domain];
        }

        // Check partial matches for complex domains
        foreach ($providers as $key => $value) {
            if (strpos($domain, $key) !== false) {
                return $value;
            }
        }

        // Check if it looks like a bank domain
        if (preg_match('/bank|financial|payment|wallet|pay/', $domain)) {
            return 'Bank/Financial Institution';
        }

        return 'Unknown Provider';
    }


    private function getUpiProviderMappings()
    {
        return [
            // PhonePe
            'ybl' => 'PhonePe',
            'ibl' => 'PhonePe',
            'axl' => 'PhonePe',

            // Paytm
            'paytm' => 'Paytm',

            // Google Pay
            'okaxis' => 'Google Pay',
            'okhdfcbank' => 'Google Pay',
            'okicici' => 'Google Pay',
            'oksbi' => 'Google Pay',

            // Amazon Pay
            'apl' => 'Amazon Pay',

            // BHIM
            'upi' => 'BHIM',

            // Major Banks
            'icici' => 'ICICI Bank',
            'hdfcbank' => 'HDFC Bank',
            'sbi' => 'State Bank of India',
            'axisbank' => 'Axis Bank',
            'pnb' => 'Punjab National Bank',
            'boi' => 'Bank of India',
            'cnrb' => 'Canara Bank',
            'iob' => 'Indian Overseas Bank',
            'unionbank' => 'Union Bank',
            'indianbank' => 'Indian Bank',
            'bankofbaroda' => 'Bank of Baroda',
            'centralbank' => 'Central Bank of India',
            'idbi' => 'IDBI Bank',
            'idfc' => 'IDFC Bank',
            'kotak' => 'Kotak Mahindra Bank',
            'indusind' => 'IndusInd Bank',
            'yesbank' => 'Yes Bank',
            'federalbank' => 'Federal Bank',
            'rbl' => 'RBL Bank',
            'bandhan' => 'Bandhan Bank',

            // Wallet providers
            'freecharge' => 'Freecharge',
            'mobikwik' => 'MobiKwik',
            'airtel' => 'Airtel Money',
            'jio' => 'JioMoney',
        ];
    }


    private function getProviderIcon($provider)
    {
        $iconMap = [
            'PhonePe' => 'uploads/upi-icons/phonepe.png',
            'Paytm' => 'uploads/upi-icons/paytm.png',
            'Google Pay' => 'uploads/upi-icons/googlepay.png',
            'Amazon Pay' => 'uploads/upi-icons/amazonpay.png',
            'BHIM' => 'uploads/upi-icons/bhim.png',
            'ICICI Bank' => 'uploads/upi-icons/icici.png',
            'HDFC Bank' => 'uploads/upi-icons/hdfc.png',
            'State Bank of India' => 'uploads/upi-icons/sbi.png',
            'Axis Bank' => 'uploads/upi-icons/axis.png',
            'Internal System' => 'uploads/dist/img/upi-internal.png',
        ];

        $iconPath = $iconMap[$provider] ?? 'uploads/dist/img/upi-generic.png';
        return url($iconPath);
    }



    private function validateExternalUpi($upiId)
    {
        try {
            $errors = [];
            $provider = 'unknown';

            // Basic validation
            if (empty($upiId)) {
                $errors[] = 'UPI ID cannot be empty';
                return $this->buildValidationResult(false, $provider, $errors);
            }

            // Check @ symbol
            if (strpos($upiId, '@') === false) {
                $errors[] = 'UPI ID must contain @ symbol';
                return $this->buildValidationResult(false, $provider, $errors);
            }

            // Split and validate parts
            $parts = explode('@', $upiId);
            if (count($parts) !== 2) {
                $errors[] = 'Invalid UPI ID format';
                return $this->buildValidationResult(false, $provider, $errors);
            }

            $username = trim($parts[0]);
            $domain = strtolower(trim($parts[1]));

            // Validate username
            $errors = array_merge($errors, $this->validateUpiUsername($username));

            // Validate domain
            if (empty($domain)) {
                $errors[] = 'UPI domain part cannot be empty';
            } else {
                $provider = $this->identifyUpiProvider($domain);
            }

            return $this->buildValidationResult(empty($errors), $provider, $errors, $username, $domain);

        } catch (\Exception $e) {
            return $this->buildValidationResult(false, 'unknown', ['Error validating UPI: ' . $e->getMessage()]);
        }
    }


    private function validateUpiUsername($username)
    {
        $errors = [];

        if (empty($username)) {
            $errors[] = 'UPI username part cannot be empty';
        } elseif (strlen($username) < 3) {
            $errors[] = 'UPI username must be at least 3 characters';
        } elseif (strlen($username) > 50) {
            $errors[] = 'UPI username cannot exceed 50 characters';
        } elseif (!preg_match('/^[a-zA-Z0-9._-]+$/', $username)) {
            $errors[] = 'UPI username can only contain letters, numbers, dots, hyphens, and underscores';
        }

        return $errors;
    }

    private function buildValidationResult($isValid, $provider, $errors, $username = '', $domain = '')
    {
        return [
            'is_valid' => $isValid,
            'provider' => $provider,
            'errors' => $errors,
            'username' => $username,
            'domain' => $domain
        ];
    }

    /**
     * Get UPI list for authenticated user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upiList(Request $request)
    {
        $user = $request->get('user');

        $accounts = Account::where('user_id', $user->id)
            ->select('name', 'upi', 'primary_status')
            ->get();

        if ($accounts->isEmpty()) {
            return response()->json([
                'status' => 0,
                'message' => 'No UPI accounts found.',
                'data' => []
            ], 200);
        }

        $formattedList = $accounts->map(function ($item) {
            return [
                'upi_id' => $item->upi,
                'wallet_name' => $item->name,
                'qr_url' => url("api/qr-generate/" . $item->upi),
                'is_primary' => $item->primary_status ? true : false
            ];
        });

        return response()->json([
            'status' => 1,
            'message' => 'UPI Providers retrieved successfully.',
            'data' => $formattedList
        ], 200);
    }

    /**
     * Generate QR Code for UPI ID with centered logo
     *
     * @param string $upiId
     * @return \Illuminate\Http\Response
     */
    public function qrGenerate($upiId)
    {
        try {
            // Decode UPI ID if it's URL encoded
            $upiId = urldecode($upiId);

            // Validate UPI format
            if (empty($upiId) || strpos($upiId, '@') === false) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid UPI ID',
                    'data' => null
                ], 400);
            }

            // Build UPI payment string
            $upiPaymentString = "upi://pay?pa={$upiId}&pn=Payment&cu=INR";

            // Generate SVG QR code with logo
            $svgContent = $this->generateQrSvgContent($upiPaymentString);

            // Return as SVG response (can be used directly in <img> tag)
            return response($svgContent, 200)
                ->header('Content-Type', 'image/svg+xml');

        } catch (\Exception $e) {
            // Return a default SVG on error
            $errorMsg = htmlspecialchars($e->getMessage());
            $defaultSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">' .
                '<rect width="100%" height="100%" fill="white"/>' .
                '<text x="50%" y="50%" text-anchor="middle" fill="red" font-size="14">Error: ' . $errorMsg . '</text>' .
                '</svg>';

            return response($defaultSvg, 200)
                ->header('Content-Type', 'image/svg+xml');
        }
    }

    /**
     * Generate QR code as PNG with logo overlay and border
     *
     * @param string $data
     * @param string $savePath Path to save the QR code file
     * @return \Illuminate\Http\Response
     */
    private function generateQrWithLogo($data, $savePath = null)
    {
        // Generate base QR code
        $builder = new Builder(
            writer: new PngWriter(),
            data: $data,
            encoding: new Encoding('UTF-8'),
            size: 600,
            margin: 10
        );

        $result = $builder->build();
        $qrImageString = $result->getString();

        // Create QR image resource
        $qr = imagecreatefromstring($qrImageString);
        if (!$qr) {
            throw new \Exception('Failed to create QR code image');
        }

        imagesavealpha($qr, true);
        $qrW = imagesx($qr);
        $qrH = imagesy($qr);

        // Create a new image with extra space for border
        $borderGap = 15;
        $borderWidth = 4;
        $newW = $qrW + ($borderGap * 2);
        $newH = $qrH + ($borderGap * 2);

        $finalImage = imagecreatetruecolor($newW, $newH);
        imagesavealpha($finalImage, true);

        // Fill with white background
        $white = imagecolorallocate($finalImage, 255, 255, 255);
        imagefill($finalImage, 0, 0, $white);

        // Copy QR code to center of new image
        imagecopy($finalImage, $qr, $borderGap, $borderGap, 0, 0, $qrW, $qrH);
        imagedestroy($qr);

        // Draw green border with rounded corners effect
        $borderColor = imagecolorallocate($finalImage, 0x70, 0xAF, 0x52); // #70AF52

        // Draw border rectangle
        for ($i = 0; $i < $borderWidth; $i++) {
            imagerectangle(
                $finalImage,
                $i,
                $i,
                $newW - $i - 1,
                $newH - $i - 1,
                $borderColor
            );
        }

        // Add logo if exists
        $adminData = $this->getAdminWithurl();
        $logoPath = public_path($adminData['favicon']);


        if (file_exists($logoPath)) {
            $logoContent = file_get_contents($logoPath);
            $logo = imagecreatefromstring($logoContent);

            if ($logo) {
                // Calculate logo size (20% of QR code)
                $logoW = imagesx($logo);
                $logoH = imagesy($logo);
                $logoTargetW = 600 * 0.20; // 20% of original QR size
                $scale = $logoW / $logoTargetW;
                $logoTargetH = $logoH / $scale;

                // Calculate center position (accounting for border gap)
                $dstX = ($newW - $logoTargetW) / 2;
                $dstY = ($newH - $logoTargetH) / 2;

                // Create white background circle behind logo
                $circleW = $logoTargetW + 20;
                $circleH = $logoTargetH + 20;
                imagefilledellipse($finalImage, $newW / 2, $newH / 2, $circleW, $circleH, $white);

                // Place logo in center
                imagecopyresampled(
                    $finalImage,
                    $logo,
                    $dstX,
                    $dstY,
                    0,
                    0,
                    $logoTargetW,
                    $logoTargetH,
                    $logoW,
                    $logoH
                );

                imagedestroy($logo);
            }
        }

        // Save to file if path is provided
        if ($savePath) {
            imagepng($finalImage, $savePath);
        }

        // Output final image
        ob_start();
        imagepng($finalImage);
        $imageData = ob_get_clean();
        imagedestroy($finalImage);

        return response($imageData, 200)
            ->header('Content-Type', 'image/png')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Generate QR code as SVG (fallback without logo)
     *
     * @param string $data
     * @param string $savePath Path to save the QR code file
     * @return \Illuminate\Http\Response
     */
    private function generateQrSvg($data, $savePath = null)
    {
        $builder = new Builder(
            writer: new SvgWriter(),
            data: $data,
            encoding: new Encoding('UTF-8'),
            size: 600,
            margin: 10
        );

        $result = $builder->build();
        $svgContent = $result->getString();

        // Add logo to SVG if available
        $adminData = $this->getAdminWithurl();
        $logoPath = public_path($adminData['favicon']);

        if (file_exists($logoPath)) {
            $svgContent = $this->addLogoToSvg($svgContent, $logoPath);
        }

        // Save to file if path is provided
        if ($savePath) {
            // Change extension to .svg for SVG files
            $svgPath = str_replace('.png', '.svg', $savePath);
            file_put_contents($svgPath, $svgContent);
        }

        return response($svgContent, 200)
            ->header('Content-Type', 'image/svg+xml');
    }

    /**
     * Generate QR code SVG content only (without HTTP response)
     *
     * @param string $data
     * @return string
     */
    private function generateQrSvgContent($data)
    {
        $builder = new Builder(
            writer: new SvgWriter(),
            data: $data,
            encoding: new Encoding('UTF-8'),
            size: 620,
            margin: 0
        );

        $result = $builder->build();
        $svgContent1 = $result->getString();

        // Add logo to SVG if available
        $adminData = $this->getAdminWithurl();
        $faviconPath = $adminData['favicon'];
        $logoPath = $faviconPath;

        $svgContent = $this->addLogoToSvg($svgContent1, $logoPath);

        return $svgContent;
    }


    /**
     * Perfectly centers the QR code, adds borders, inner rect, and logo (no XML header issue)
     */
    private function addLogoToSvg($svgContent)
    {
        try {
            $adminData = $this->getAdminWithurl();
            $logoPath = $adminData['favicon'];
            
            // Validate logo file exists
            if (!file_exists($logoPath) || !is_readable($logoPath)) {
                error_log("Logo file not found or not readable: " . $logoPath);
                return $svgContent; // Return original SVG without logo
            }
            
            // Read and encode logo
            $logoFileContent = file_get_contents($logoPath);
            if ($logoFileContent === false) {
                error_log("Failed to read logo file: " . $logoPath);
                return $svgContent; // Return original SVG without logo
            }
            
            $logoData = base64_encode($logoFileContent);

            // Detect MIME type from file extension or content
            $logoMime = $this->detectImageMimeType($logoPath);

            $qrSize = 620; // QR code base size from endroid
            $canvasSize = 680; // add breathing room around it
            $borderColor = $adminData['color1'];
            $borderColor2 = $adminData['color2'];
            $borderWidth = 4;

            // --- Extract just the QR paths from SVG ---
            // Match everything between the opening and closing svg tags
            if (preg_match('/<svg[^>]*>(.*)<\/svg>/is', $svgContent, $matches)) {
                $qrInnerContent = $matches[1];
            } else {
                $qrInnerContent = $svgContent;
            }

            // Remove XML declaration if present
            $qrInnerContent = preg_replace('/<\?xml[^>]*\?>\s*/i', '', $qrInnerContent);

            // Remove rect background if present (we'll add our own)
            $qrInnerContent = preg_replace('/<rect[^>]*fill="#ffffff"[^>]*\/>/i', '', $qrInnerContent);

            // --- Center QR group ---
            $centerOffset = ($canvasSize - $qrSize) / 2;
            $centerGroup = sprintf(
                '<g transform="translate(%d,%d)">%s</g>',
                $centerOffset,
                $centerOffset,
                trim($qrInnerContent)
            );

            // --- Build white background ---
            $background = sprintf(
                '<rect width="%d" height="%d" fill="white"/>',
                $canvasSize,
                $canvasSize
            );

            // --- Borders ---
            $innerPadding = 15;
            $outerPadding = 25;

            $innerRect = sprintf(
                '<rect x="%d" y="%d" width="%d" height="%d" rx="20" ry="20" fill="none" stroke="%s" stroke-width="%d" stroke-dasharray="16,8" stroke-linecap="round"/>',
                $centerOffset - $innerPadding,
                $centerOffset - $innerPadding,
                $qrSize + ($innerPadding * 2),
                $qrSize + ($innerPadding * 2),
                $borderColor2,
                $borderWidth
            );

            $outerRect = sprintf(
                '<rect x="%d" y="%d" width="%d" height="%d" rx="28" ry="28" fill="none" stroke="%s" stroke-width="%d"/>',
                $centerOffset - $outerPadding,
                $centerOffset - $outerPadding,
                $qrSize + ($outerPadding * 2),
                $qrSize + ($outerPadding * 2),
                $borderColor,
                $borderWidth
            );

            // --- Logo (centered perfectly) ---
            $logoSize = $qrSize * 0.18; // 18% of QR size
            $circleSize = $logoSize + 20;
            $center = $canvasSize / 2;

            // White circle background
            $logoCircle = sprintf(
                '<circle cx="%d" cy="%d" r="%d" fill="white"/>',
                $center,
                $center,
                $circleSize / 2
            );

            // Logo image embedded as base64
            $logoImage = sprintf(
                '<image href="data:%s;base64,%s" x="%d" y="%d" width="%d" height="%d" preserveAspectRatio="xMidYMid meet"/>',
                $logoMime,
                $logoData,
                $center - ($logoSize / 2),
                $center - ($logoSize / 2),
                $logoSize,
                $logoSize
            );

            // --- Combine all parts with proper XML namespace ---
            $finalSvg = sprintf(
                '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="%dpx" height="%dpx" viewBox="0 0 %d %d">%s%s%s%s%s%s</svg>',
                $canvasSize,
                $canvasSize,
                $canvasSize,
                $canvasSize,
                $background,
                $outerRect,
                $innerRect,
                $centerGroup,
                $logoCircle,
                $logoImage
            );

            return $finalSvg;

        } catch (\Exception $e) {
            // Log error for debugging
            error_log("Error in addLogoToSvg: " . $e->getMessage());
            return $svgContent;
        }
    }

    /**
     * Detect image MIME type from file path
     */
    private function detectImageMimeType($filePath)
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'bmp' => 'image/bmp',
            'ico' => 'image/x-icon',
        ];

        return $mimeTypes[$extension] ?? 'image/png';
    }


    public function qrGenerate12(Request $request)
    {
        try {
            // Decode QR value if it's URL encoded
            $qrvalue = urldecode($request->input('text'));

            // Generate PNG QR code directly with logo using GD library
            $pngData = $this->generateQrPngWithLogo($qrvalue);

            // Return as PNG response with proper headers to prevent caching
            return response($pngData, 200)
                ->header('Content-Type', 'image/png')
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0')
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma, Expires');

        } catch (\Exception $e) {
            // Return a default error PNG on error
            $errorMsg = htmlspecialchars($e->getMessage());
            
            // Try to generate error image using GD
            try {
                $errorPng = $this->generateErrorPngGd($errorMsg);
                return response($errorPng, 200)
                    ->header('Content-Type', 'image/png')
                    ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
            } catch (\Exception $innerException) {
                // If GD fails, fallback to SVG
                $defaultSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">' .
                    '<rect width="100%" height="100%" fill="white"/>' .
                    '<text x="50%" y="50%" text-anchor="middle" fill="red" font-size="14">Error: ' . $errorMsg . '</text>' .
                    '</svg>';

                return response($defaultSvg, 200)
                    ->header('Content-Type', 'image/svg+xml')
                    ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
            }
        }
    }

    /**
     * Public API endpoint: Convert SVG to PNG
     * 
     * Accepts SVG content via POST and returns PNG image
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function convertSvgToPngApi(Request $request)
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'svg_content' => 'required|string',
                'width' => 'nullable|integer|min:50|max:5000',
                'height' => 'nullable|integer|min:50|max:5000',
                'density' => 'nullable|integer|min:72|max:600'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get parameters
            $svgContent = $request->input('svg_content');
            $width = $request->input('width', null);
            $height = $request->input('height', null);
            $density = $request->input('density', 300);

            // Convert SVG to PNG
            $pngData = $this->convertSvgToPng($svgContent, $width, $height, $density);

            // Return PNG image
            return response($pngData, 200)
                ->header('Content-Type', 'image/png')
                ->header('Cache-Control', 'public, max-age=3600')
                ->header('Content-Disposition', 'inline; filename="converted.png"');

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Conversion failed: ' . $e->getMessage(),
                'imagick_available' => extension_loaded('imagick')
            ], 500);
        }
    }

    /**
     * Convert SVG content to PNG using Imagick
     *
     * @param string $svgContent SVG content as string
     * @param int $width Optional width for PNG (default: auto from SVG)
     * @param int $height Optional height for PNG (default: auto from SVG)
     * @param int $density DPI resolution for clarity (default: 300)
     * @return string PNG binary data
     * @throws \Exception if Imagick is not available or conversion fails
     */
    private function convertSvgToPng($svgContent, $width = null, $height = null, $density = 300)
    {
        // Check if Imagick is available
        if (!extension_loaded('imagick')) {
            throw new \Exception('Imagick extension is not loaded. Please install and enable php-imagick.');
        }

        try {
            // Create new Imagick instance
            $imagick = new \Imagick();
            
            // Set resolution/density BEFORE reading the image for better quality
            $imagick->setResolution($density, $density);
            
            // Read SVG content from blob
            $imagick->readImageBlob($svgContent);
            
            // Set image format to PNG
            $imagick->setImageFormat('png');
            
            // Enable alpha channel for transparency
            $imagick->setImageAlphaChannel(\Imagick::ALPHACHANNEL_ACTIVATE);
            
            // Set background to transparent
            $imagick->setImageBackgroundColor(new \ImagickPixel('transparent'));
            
            // Apply custom dimensions if specified
            if ($width !== null && $height !== null) {
                $imagick->resizeImage($width, $height, \Imagick::FILTER_LANCZOS, 1);
            }
            
            // Improve PNG quality
            $imagick->setImageCompressionQuality(95);
            
            // Get PNG binary data
            $pngData = $imagick->getImageBlob();
            
            // Clean up
            $imagick->clear();
            $imagick->destroy();
            
            return $pngData;

        } catch (\ImagickException $e) {
            throw new \Exception('Imagick conversion failed: ' . $e->getMessage());
        }
    }

    /**
     * Generate an error PNG image using Imagick
     *
     * @param string $errorMessage Error message to display
     * @return string PNG binary data
     * @throws \Exception if generation fails
     */
    private function generateErrorPng($errorMessage)
    {
        if (!extension_loaded('imagick')) {
            throw new \Exception('Imagick not available');
        }

        try {
            $imagick = new \Imagick();
            $imagick->newImage(600, 200, new \ImagickPixel('white'));
            $imagick->setImageFormat('png');
            
            // Create text drawing
            $draw = new \ImagickDraw();
            $draw->setFillColor(new \ImagickPixel('red'));
            $draw->setFont('Arial');
            $draw->setFontSize(16);
            $draw->setTextAlignment(\Imagick::ALIGN_CENTER);
            
            // Add error text
            $imagick->annotateImage($draw, 300, 90, 0, 'QR Code Generation Error');
            
            $draw->setFontSize(12);
            $draw->setFillColor(new \ImagickPixel('black'));
            $imagick->annotateImage($draw, 300, 120, 0, substr($errorMessage, 0, 50));
            
            $pngData = $imagick->getImageBlob();
            
            $imagick->clear();
            $imagick->destroy();
            
            return $pngData;

        } catch (\Exception $e) {
            throw new \Exception('Error PNG generation failed: ' . $e->getMessage());
        }
    }

    /**
     * Generate QR code as PNG with logo overlay and borders using GD library
     *
     * @param string $data QR code data
     * @return string PNG binary data
     * @throws \Exception if generation fails
     */
    private function generateQrPngWithLogo($data)
    {
        // Generate base QR code as PNG
        $builder = new Builder(
            writer: new PngWriter(),
            data: $data,
            encoding: new Encoding('UTF-8'),
            size: 620,
            margin: 0
        );

        $result = $builder->build();
        $qrImageString = $result->getString();

        // Create QR image resource from string
        $qrImage = imagecreatefromstring($qrImageString);
        if (!$qrImage) {
            throw new \Exception('Failed to create QR code image');
        }

        // Get admin data for colors and logo
        $adminData = $this->getAdminWithurl();
        
        // Canvas settings
        $qrSize = 620;
        $canvasSize = 680;
        $centerOffset = ($canvasSize - $qrSize) / 2;

        // Create canvas
        $canvas = imagecreatetruecolor($canvasSize, $canvasSize);
        imagesavealpha($canvas, true);
        
        // Fill with white background
        $white = imagecolorallocate($canvas, 255, 255, 255);
        imagefill($canvas, 0, 0, $white);

        // Parse border colors
        $color1Rgb = $this->hexToRgb($adminData['color1']);
        $color2Rgb = $this->hexToRgb($adminData['color2']);
        
        $borderColor1 = imagecolorallocate($canvas, $color1Rgb[0], $color1Rgb[1], $color1Rgb[2]);
        $borderColor2 = imagecolorallocate($canvas, $color2Rgb[0], $color2Rgb[1], $color2Rgb[2]);

        // Draw outer border (solid)
        $outerPadding = 25;
        $borderWidth = 4;
        for ($i = 0; $i < $borderWidth; $i++) {
            imagerectangle(
                $canvas,
                $centerOffset - $outerPadding + $i,
                $centerOffset - $outerPadding + $i,
                $canvasSize - ($centerOffset - $outerPadding) - $i - 1,
                $canvasSize - ($centerOffset - $outerPadding) - $i - 1,
                $borderColor1
            );
        }

        // Draw inner border (dashed effect)
        $innerPadding = 15;
        $this->drawDashedRect(
            $canvas,
            $centerOffset - $innerPadding,
            $centerOffset - $innerPadding,
            $qrSize + ($innerPadding * 2),
            $qrSize + ($innerPadding * 2),
            $borderColor2,
            $borderWidth,
            16,
            8
        );

        // Copy QR code to canvas
        imagecopy($canvas, $qrImage, $centerOffset, $centerOffset, 0, 0, $qrSize, $qrSize);
        imagedestroy($qrImage);

        // Add logo overlay
        $logoPath = $adminData['favicon'];
        if (file_exists($logoPath) && is_readable($logoPath)) {
            $this->addLogoToCanvas($canvas, $logoPath, $canvasSize);
        }

        // Output PNG
        ob_start();
        imagepng($canvas, null, 9); // Maximum compression
        $pngData = ob_get_clean();
        imagedestroy($canvas);

        return $pngData;
    }

    /**
     * Add logo overlay to canvas
     *
     * @param resource $canvas GD image resource
     * @param string $logoPath Path to logo file
     * @param int $canvasSize Canvas size
     */
    private function addLogoToCanvas($canvas, $logoPath, $canvasSize)
    {
        try {
            // Load logo based on file type
            $imageInfo = getimagesize($logoPath);
            if (!$imageInfo) {
                return;
            }

            $mimeType = $imageInfo['mime'];
            $logo = null;

            switch ($mimeType) {
                case 'image/jpeg':
                    $logo = imagecreatefromjpeg($logoPath);
                    break;
                case 'image/png':
                    $logo = imagecreatefrompng($logoPath);
                    break;
                case 'image/gif':
                    $logo = imagecreatefromgif($logoPath);
                    break;
                case 'image/webp':
                    $logo = imagecreatefromwebp($logoPath);
                    break;
                default:
                    return;
            }

            if (!$logo) {
                return;
            }

            // Enable alpha blending for logo
            imagealphablending($logo, true);
            imagesavealpha($logo, true);

            // Calculate logo size (18% of QR size)
            $logoSize = 620 * 0.18;
            $logoW = imagesx($logo);
            $logoH = imagesy($logo);
            
            // Maintain aspect ratio
            $scale = $logoSize / max($logoW, $logoH);
            $newLogoW = $logoW * $scale;
            $newLogoH = $logoH * $scale;

            // Calculate center position
            $center = $canvasSize / 2;
            $logoX = $center - ($newLogoW / 2);
            $logoY = $center - ($newLogoH / 2);

            // Draw white circle background
            $circleRadius = ($logoSize + 20) / 2;
            $white = imagecolorallocate($canvas, 255, 255, 255);
            imagefilledellipse($canvas, $center, $center, $circleRadius * 2, $circleRadius * 2, $white);

            // Resize and place logo
            imagecopyresampled(
                $canvas,
                $logo,
                $logoX,
                $logoY,
                0,
                0,
                $newLogoW,
                $newLogoH,
                $logoW,
                $logoH
            );

            imagedestroy($logo);

        } catch (\Exception $e) {
            error_log("Failed to add logo to canvas: " . $e->getMessage());
        }
    }

    /**
     * Draw dashed rectangle
     *
     * @param resource $image GD image resource
     * @param int $x X position
     * @param int $y Y position
     * @param int $width Width
     * @param int $height Height
     * @param int $color Color
     * @param int $thickness Line thickness
     * @param int $dashLength Dash length
     * @param int $gapLength Gap length
     */
    private function drawDashedRect($image, $x, $y, $width, $height, $color, $thickness, $dashLength, $gapLength)
    {
        imagesetthickness($image, $thickness);
        
        // Top line
        $this->drawDashedLine($image, $x, $y, $x + $width, $y, $color, $dashLength, $gapLength);
        
        // Right line
        $this->drawDashedLine($image, $x + $width, $y, $x + $width, $y + $height, $color, $dashLength, $gapLength);
        
        // Bottom line
        $this->drawDashedLine($image, $x + $width, $y + $height, $x, $y + $height, $color, $dashLength, $gapLength);
        
        // Left line
        $this->drawDashedLine($image, $x, $y + $height, $x, $y, $color, $dashLength, $gapLength);
        
        imagesetthickness($image, 1);
    }

    /**
     * Draw dashed line
     *
     * @param resource $image GD image resource
     * @param int $x1 Start X
     * @param int $y1 Start Y
     * @param int $x2 End X
     * @param int $y2 End Y
     * @param int $color Color
     * @param int $dashLength Dash length
     * @param int $gapLength Gap length
     */
    private function drawDashedLine($image, $x1, $y1, $x2, $y2, $color, $dashLength, $gapLength)
    {
        $length = sqrt(pow($x2 - $x1, 2) + pow($y2 - $y1, 2));
        $dx = ($x2 - $x1) / $length;
        $dy = ($y2 - $y1) / $length;
        
        $position = 0;
        while ($position < $length) {
            $startX = $x1 + $dx * $position;
            $startY = $y1 + $dy * $position;
            $endPos = min($position + $dashLength, $length);
            $endX = $x1 + $dx * $endPos;
            $endY = $y1 + $dy * $endPos;
            
            imageline($image, $startX, $startY, $endX, $endY, $color);
            $position += $dashLength + $gapLength;
        }
    }

    /**
     * Convert hex color to RGB array
     *
     * @param string $hex Hex color (e.g., "#FF0000" or "FF0000")
     * @return array [R, G, B]
     */
    private function hexToRgb($hex)
    {
        $hex = ltrim($hex, '#');
        
        if (strlen($hex) == 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        
        return [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2))
        ];
    }

    /**
     * Generate error PNG using GD library
     *
     * @param string $errorMessage Error message
     * @return string PNG binary data
     */
    private function generateErrorPngGd($errorMessage)
    {
        $width = 600;
        $height = 200;
        
        $image = imagecreatetruecolor($width, $height);
        $white = imagecolorallocate($image, 255, 255, 255);
        $red = imagecolorallocate($image, 255, 0, 0);
        $black = imagecolorallocate($image, 0, 0, 0);
        
        imagefill($image, 0, 0, $white);
        
        // Add error text
        imagestring($image, 5, 200, 80, 'QR Code Error', $red);
        imagestring($image, 3, 150, 110, substr($errorMessage, 0, 50), $black);
        
        ob_start();
        imagepng($image);
        $pngData = ob_get_clean();
        imagedestroy($image);
        
        return $pngData;
    }



    public function getAdminWithurl()
    {
        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
        $baseUrl .= "://" . $_SERVER['HTTP_HOST'];
        $site = $_SERVER['HTTP_X_FORWARDED_SITE']
            ?? $_SERVER['HTTP_ORIGIN']
            ?? $_SERVER['HTTP_REFERER']
            ?? null;

        if ($site) {
            // Parse domain
            $host = parse_url($site, PHP_URL_HOST); // gives "banking.cashbez.com"

            // Extract only main domain (last 2 parts)
            $parts = explode('.', $host);
            $count = count($parts);

            if ($count >= 2) {
                $mainDomain = $parts[$count - 2] . '.' . $parts[$count - 1];
                // "cashbez.com"
            } else {
                $mainDomain = $host;
            }
        } else {
            $mainDomain = null;
        }
        $baseUrl = $mainDomain ?? $baseUrl;

        $logoPath = public_path('favicon-1735711203.webp');
        $logo = 'https://cashbez.com/public//footer_logo-1733140069.webp';
        $footer_logo = url('uploads/enexa-logo-mix-white.png');
        $name = 'Enexa IT Solutions';
        $about = 'Unified Open Banking & API Platform';
        $color1 = '#21736a';
        $color2 = '#acdd49';

        $setting = Setting::where('website', $baseUrl)->first();

        if ($setting) {
            // Handle favicon path - can be URL or relative path
            if (!empty($setting->favicon)) {
                // Check if it's a full URL
                if (filter_var($setting->favicon, FILTER_VALIDATE_URL)) {
                    // Extract path from URL
                    $faviconUrlPath = parse_url($setting->favicon, PHP_URL_PATH);
                    if ($faviconUrlPath) {
                        // Remove leading slash and 'public/' if present
                        $cleanPath = ltrim($faviconUrlPath, '/');
                        $cleanPath = preg_replace('#^public/#', '', $cleanPath);
                        $logoPath = public_path($cleanPath);
                    }
                } else {
                    // It's already a relative path or filename
                    $cleanPath = ltrim($setting->favicon, '/');
                    $cleanPath = preg_replace('#^public/#', '', $cleanPath);
                    $logoPath = public_path($cleanPath);
                }
            }
            
            $logo = $setting->logo;
            $footer_logo = $setting->footer_logo;
            $name = $setting->company_name;
            $about = $setting->about;
            $color1 = $setting->theme_color_primary;
            $color2 = $setting->theme_color_secondary;
        }

        $var = [
            'logo' => $logo,
            'footer_logo' => $footer_logo,
            'favicon' => $logoPath,  // This is now a full system path
            'name' => $name,
            'about' => $about,
            'color1' => $color1,
            'color2' => $color2,
            'imagick' => extension_loaded('imagick') ? true : false,
        ];
        return $var;
    }

    public function getUserData($mid)
    {
        $user = User::where('mid', $mid)->first();

        if ($user) {
            $user1 = User::where('mid', operator: $user->admin_mid)->first();
            $draft = AepsDraft::where('mid', $user->mid)->first();
            $sett = DB::table('settings')->where('user_id', $user1->id)->select('logo','favicon','sign','company_name','theme_color_primary','theme_color_secondary','address','email','mobile_no')->first();

            $user->logo = $sett->logo ?? 'https://enexa.in/images/enexa-logo-mix-white.png?id=83e17363ed5f59867f1cb9c59b3c5f56';
            $user->favicon = $sett->favicon ?? 'https://enexa.in/images/favicon.png?id=4d32d1fd37b525ccef36fe75ff7f6172new';
            $user->sign = $sett->sign ?? 'https://enexa.in/images/favicon.png?id=4d32d1fd37b525ccef36fe75ff7f6172new';
            $user->cname = $sett->company_name ?? 'Enexa IT Solutions Private Limited';
            $user->color1 = $sett->theme_color_primary;
            $user->color2 = $sett->theme_color_secondary;
            $user->shop_name = $draft?$draft->shop_name:'';
            $user->company = $sett;
            $userKyc = DB::table('user_kyc')->where('user_id', $user->id)->first();
            $user->photo = $userKyc->photo ?? url('').'/assets/images/users/avatar-1.jpg';
            $user->join = $userKyc->verified_at ? date("d-m-Y", strtotime($userKyc->verified_at)) : date('d-m-Y');
            $user->address = $userKyc->vtc . ', ' . $userKyc->dist . ', ' . $userKyc->subdist . ', ' . $userKyc->state . ' - ' . $userKyc->pincode;

            
            $role = DB::table('roles')->where('id', $user->role)->first();
            $user->role_name = $role->name ?? 'Unknown';

            return response()->json([
                'status' => 1,
                'message' => 'User profile fetched successfully',
                'user' => $user
            ]);
        }
        return response()->json([
            'status' => 1,
            'message' => 'User profile not fetched successfully',
            'user' => []
        ]);
    }
    public function getUserBeneficiaryAccounts($mid)
    {
        $user = User::where('mid', $mid)->first();

        if ($user) {
            $beneficiaries = DB::table('beneficiaries')
                ->where('user_id', $user->id)
                ->where('type', 3)
                ->select('id', 'name', 'account', 'ifsc', 'bank', 'branch')
                ->get();

            return response()->json([
                'status' => 1,
                'message' => 'Beneficiary accounts fetched successfully',
                'data' => $beneficiaries
            ]);
        }
        
        return response()->json([
            'status' => 0,
            'message' => 'User not found',
            'data' => []
        ]);
    }

    public function reports(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
            }

            if ($user->role != 1) {
                return response()->json(['status' => 0, 'message' => 'Unauthorized Access'], 403);
            }

            $targetAdmin = User::where('mid', $user->admin_mid)->first();
            if (!$targetAdmin) {
                $targetAdmin = $user;
            }

            $startDate = $request->input('start_date', date('Y-m-d'));
            $endDate = $request->input('end_date', date('Y-m-d'));
            $perPage = $request->input('per_page', 200);

            // Fetch Summaries for Dashboard
            $summaries = [
                'payout' => [
                    'success' => DB::table('payouts')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('status', 'SUCCESS')->count(),
                    'failed' => DB::table('payouts')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('status', 'FAILED')->count(),
                    'pending' => DB::table('payouts')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('status', 'PENDING')->count(),
                    'success_amount' => DB::table('payouts')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('status', 'SUCCESS')->sum('amount'),
                    'failed_amount' => DB::table('payouts')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('status', 'FAILED')->sum('amount'),
                    'pending_amount' => DB::table('payouts')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('status', 'PENDING')->sum('amount'),
                ],
                'recharge' => [
                    'success' => DB::table('recharges')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('status', 'SUCCESS')->count(),
                    'failed' => DB::table('recharges')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('status', 'FAILED')->count(),
                    'pending' => DB::table('recharges')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('status', 'PENDING')->count(),
                    'success_amount' => DB::table('recharges')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('status', 'SUCCESS')->sum('amount'),
                    'failed_amount' => DB::table('recharges')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('status', 'FAILED')->sum('amount'),
                    'pending_amount' => DB::table('recharges')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('status', 'PENDING')->sum('amount'),
                ],
                'aeps' => [
                    'success' => DB::table('aeps_transactions')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('response_status', 1)->count(),
                    'failed' => DB::table('aeps_transactions')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('response_status', 0)->count(),
                    'pending' => DB::table('aeps_transactions')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('response_status', 2)->count(),
                    'success_amount' => DB::table('aeps_transactions')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('response_status', 1)->sum('amount'),
                    'failed_amount' => DB::table('aeps_transactions')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('response_status', 0)->sum('amount'),
                    'pending_amount' => DB::table('aeps_transactions')->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])->where('response_status', 2)->sum('amount'),
                ]
            ];

            $payout = DB::table('payouts')
                ->join('users', 'payouts.user_id', '=', 'users.id')
                ->join('beneficiaries', 'payouts.beneficiary_id', '=', 'beneficiaries.id')
                ->leftJoin('aeps_drafts', 'users.mid', '=', 'aeps_drafts.mid')
                ->leftJoin('settings', 'payouts.admin_id', '=', 'settings.user_id')
                ->whereBetween('payouts.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->select(
                    'users.id as user_id', 'users.mid as user_mid', 'users.mobile as user_phone', 'users.name as user_name',
                    'payouts.id as payout_id', 'payouts.type as payout_type', 'payouts.amount', 'payouts.created_at', 'payouts.admin_id', 'payouts.status',
                    'beneficiaries.type as bene_type', 'aeps_drafts.shop_name', 'settings.company_name', 'beneficiaries.account', 'beneficiaries.ifsc', 'beneficiaries.bank', 'beneficiaries.branch'
                )
                ->orderBy('payouts.id', 'desc')
                ->paginate($perPage, ['*'], 'payout_page');

            $recharge = DB::table('recharges')
                ->join('users', 'recharges.user_id', '=', 'users.id')
                ->leftJoin('aeps_drafts', 'users.mid', '=', 'aeps_drafts.mid')
                ->leftJoin('settings', 'recharges.admin_id', '=', 'settings.user_id')
                ->leftJoin('api_settings', 'recharges.api_id', '=', 'api_settings.id')
                ->leftJoin('utility_operators', 'recharges.oprator', '=', 'utility_operators.code')
                ->whereBetween('recharges.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->select(
                    'recharges.id as id', 'recharges.oprator', 'recharges.amount', 'recharges.status', 'recharges.created_at', 'recharges.admin_id',
                    'recharges.number', 'recharges.response_data',
                    'users.mid as user_mid', 'users.mobile as user_phone', 'users.name as user_name',
                    'aeps_drafts.shop_name', 'settings.company_name',
                    'api_settings.api_name',
                    'utility_operators.category as operator_category', 'utility_operators.name as operator_name'
                )
                ->orderBy('recharges.id', 'desc')
                ->paginate($perPage, ['*'], 'recharge_page');

            $aepsTransaction = DB::table('aeps_transactions')
                ->join('users', 'aeps_transactions.mid', '=', 'users.mid')
                ->leftJoin('aeps_drafts', 'users.mid', '=', 'aeps_drafts.mid')
                ->leftJoin('settings', 'aeps_transactions.admin_id', '=', 'settings.user_id')
                ->whereBetween('aeps_transactions.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->where('aeps_transactions.response_status', 1)
                ->select(
                    'aeps_transactions.aeps_type as type', 'aeps_transactions.amount', 'aeps_transactions.created_at',
                    'aeps_transactions.admin_id', 'aeps_transactions.response_status','users.mid as user_mid', 'users.mobile as user_phone',
                    'users.name as user_name', 'aeps_drafts.shop_name', 'settings.company_name',
                    DB::raw("CASE WHEN response_status = 1 THEN 'SUCCESS' WHEN response_status = 2 THEN 'PENDING' ELSE 'FAILED' END as status")
                )
                ->orderBy('aeps_transactions.id', 'desc')
                ->paginate($perPage, ['*'], 'aeps_page');

            // Calculate AEPS Slab Stats (CW only, Success) of group by mid so can get merchant count and sum of their txns slab wise
            $slabStats = DB::query()->fromSub(function ($query) use ($startDate, $endDate) {
                $query->from('aeps_merchant_total_volume_base')
                    ->select('mid', DB::raw('SUM(total_amount) as total_amount'))
                    ->whereBetween('txn_date', [$startDate, $endDate])
                    ->groupBy('mid');
            }, 'merchant_volumes')
            ->selectRaw("
                COUNT(CASE WHEN total_amount BETWEEN 0 AND 20000 THEN 1 END) as count_0_20k,
                SUM(CASE WHEN total_amount BETWEEN 0 AND 20000 THEN total_amount ELSE 0 END) as amount_0_20k,
                COUNT(CASE WHEN total_amount BETWEEN 20001 AND 50000 THEN 1 END) as count_20k_50k,
                SUM(CASE WHEN total_amount BETWEEN 20001 AND 50000 THEN total_amount ELSE 0 END) as amount_20k_50k,
                COUNT(CASE WHEN total_amount BETWEEN 50001 AND 100000 THEN 1 END) as count_50k_1L,
                SUM(CASE WHEN total_amount BETWEEN 50001 AND 100000 THEN total_amount ELSE 0 END) as amount_50k_1L,
                COUNT(CASE WHEN total_amount BETWEEN 100001 AND 200000 THEN 1 END) as count_1L_2L,
                SUM(CASE WHEN total_amount BETWEEN 100001 AND 200000 THEN total_amount ELSE 0 END) as amount_1L_2L,
                COUNT(CASE WHEN total_amount BETWEEN 200001 AND 500000 THEN 1 END) as count_2L_5L,
                SUM(CASE WHEN total_amount BETWEEN 200001 AND 500000 THEN total_amount ELSE 0 END) as amount_2L_5L,
                COUNT(CASE WHEN total_amount BETWEEN 500001 AND 2500000 THEN 1 END) as count_5L_25L,
                SUM(CASE WHEN total_amount BETWEEN 500001 AND 2500000 THEN total_amount ELSE 0 END) as amount_5L_25L,
                COUNT(CASE WHEN total_amount BETWEEN 2500001 AND 7500000 THEN 1 END) as count_25L_75L,
                SUM(CASE WHEN total_amount BETWEEN 2500001 AND 7500000 THEN total_amount ELSE 0 END) as amount_25L_75L,
                COUNT(CASE WHEN total_amount BETWEEN 7500001 AND 20000000 THEN 1 END) as count_75L_2Cr,
                SUM(CASE WHEN total_amount BETWEEN 7500001 AND 20000000 THEN total_amount ELSE 0 END) as amount_75L_2Cr,
                COUNT(CASE WHEN total_amount BETWEEN 20000001 AND 99999999 THEN 1 END) as count_2Cr_10Cr,
                SUM(CASE WHEN total_amount BETWEEN 20000001 AND 99999999 THEN total_amount ELSE 0 END) as amount_2Cr_10Cr,
                COUNT(CASE WHEN total_amount BETWEEN 100000000 AND 5000000000 THEN 1 END) as count_10Cr_500Cr,
                SUM(CASE WHEN total_amount BETWEEN 100000000 AND 5000000000 THEN total_amount ELSE 0 END) as amount_10Cr_500Cr
            ")
            ->first();

            $amountSlabs = DB::table('aeps_cw_amount_slab_base')
                ->select(
                    'amt_slab',
                    DB::raw('COUNT(*) as txn_count'),
                    DB::raw('SUM(amount) as total_amount')
                )
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->groupBy('amt_slab')
                ->orderByRaw('MIN(min_amount)')
                ->get();

            return response()->json([
                'status' => 1,
                'message' => 'Reports fetched successfully',
                'data' => [
                    'summaries' => $summaries,
                    'slab_stats' => $slabStats,
                    'payout' => $payout,
                    'recharge' => $recharge,
                    'aepsTransaction' => $aepsTransaction,
                    'amount_slabs' => $amountSlabs
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve reports',
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function payoutRequest()
    {
        try {
            // Count only TODAY's pending payouts (to match dashboard summary)
            $today = date('Y-m-d');
            $count = DB::table('payouts')
                ->whereRaw('UPPER(status) = ?', ['PENDING'])
                ->count();

            return response()->json([
                'status' => 1,
                'message' => 'Pending payouts count fetched successfully',
                'count' => $count
            ])->header('Cache-Control', 'no-cache, no-store, must-revalidate')
              ->header('Pragma', 'no-cache')
              ->header('Expires', '0');

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve payout count',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updatePayoutStatus(Request $request, $id)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
            }

            $validator = \Validator::make($request->all(), [
                'status' => 'required|in:SUCCESS,FAILED,PENDING,success,failed,pending',
                'utr' => 'required|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'error' => $validator->errors()->first()
                ], 200);
            }

            $status = strtolower($request->status);
            $utr = $request->utr;

            ////////////////////////////////////////////////////////////////////////////////////////
            //////////////////////////////// $status == "failed" //////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////
            if ($status == "failed") {

                $payout = Payout::where('id', $id)->first();

                // Get the beneficiary
                $beneficiary = Beneficiary::where('id', $payout->beneficiary_id)->select("type")->first();
                $category_code='DMT';
                if($beneficiary){
                    if($beneficiary->type==3){
                        $category_code='MOVE_TO';
                    }
                }
                
                $transaction_id = $payout->transaction_id;

                $transactionData1 = [
                    'account_id' => $payout->account_id,
                    'type' => 'CR',
                    'amount' => $payout->amount,
                    'description' => "Refund of Payment to ".$payout->name." - ".$payout->account,
                    'transaction_id' => $transaction_id,
                    'created_by' => $payout->user_id,
                    'admin_id' => $payout->admin_id,
                    'user_id' => $payout->user_id,
                    'category_code' => $category_code
                ];

                /* CREDIT BACK PAYOUT AMOUNT */
                $transactionData = createTransaction($transactionData1);

                if($transactionData['status'] !== 1) {
                    return response()->json(['status' => 0, 'message' => $transactionData['message'], 'data' => NULL], 200);
                }

                /* IF RETURNED ALSO RETURN CHARGE TO USER AND API USER CALLBACK */
                if($transactionData['status'] === 1) {


                    ////////////////////////////////////////////////////////////////////////////////////////
                    //////////////////////////////// API PARTNER CALLBACK //////////////////////////////////
                    ////////////////////////////////////////////////////////////////////////////////////////
                    $api_partner_user_id='';
                    $is_api_partner = false;
                    $adminData = User::where('id',$payout->admin_id)->first();

                    if($adminData && $adminData->is_api_partner==true) {
                        $api_partner_user_id = $adminData->id;
                        $is_api_partner = true;
                    }

                    if($is_api_partner == true) {

                        $setting = Setting::where('user_id', $api_partner_user_id)->first();
                        if($setting && isset($setting->call_back_url) && !empty($setting->call_back_url)) {
                            // Send callback to partner URL
                            try {
                                
                                $postData = [
                                    "type" => "payout",  // must be JSON string
                                    "status" => "failed",
                                    "message" => "Refund of Payment to ".$payout->name." - ".$payout->account,
                                    "txnId" => $payout->transaction_id,
                                    "name" => $payout->name,
                                    "bankacc" => $payout->account,
                                    "ifsccode" => $payout->ifsc,
                                    "utr" => $utr,
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

                    ////////////////////////////////////////////////////////////////////////////////////////
                    ////////////////////////////////////////////////////////////////////////////////////////

                    if($category_code=='MOVE_TO') {
                        $tcharge = 0;
                        if($payout->type == 'IMPS') {
                            if($payout->amount < 25000) {
                                $tcharge = 5;
                            } else {
                                $tcharge = 10;
                            }
                        }
                        

                        /* move to charge refund if IMPS */
                        if($tcharge>0) {

                            $transactionData1 = [
                                'account_id' => $payout->account_id,
                                'type' => 'CR',
                                'amount' => $tcharge,
                                'description' => 'Refund of Move to Charge '.$payout->account,
                                'transaction_id' => $transaction_id,
                                'created_by' => $payout->user_id,
                                'admin_id' => $payout->admin_id,
                                'user_id' => $payout->user_id,
                                'category_code' => $category_code
                            ];
                            
                            createTransaction($transactionData1);
                        }
                    }

                    /* refund DMT charge */
                    if($category_code=='DMT') {

                        $commissionTransactionData = [
                            'user_id' => $payout->user_id,
                            'amount' => $payout->amount,
                            'sub_module_id' => 49, // Money Transfer Sub Module Id
                            'description' => 'Refund of Fund Transfer Charge '.$payout->account,
                            'admin_id' => $payout->admin_id,
                            'category_code' => $category_code,
                            'txn_type' => 'refund',
                            'account_id' => $payout->account_id
                        ];

                        processCommissionCharge($commissionTransactionData);
                    }

                }
            }
            ////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////



            $updated = DB::table('payouts')
                ->where('id', $id)
                ->update([
                    'status' => $status,
                    'utr' => $utr,
                    'updated_at' => now()
                ]);

            if ($updated) {
                return response()->json([
                    'status' => 1,
                    'message' => 'Payout status updated successfully'
                ]);
            }

            return response()->json([
                'status' => 0,
                'message' => 'Payout not found or no changes made'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update payout status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download AEPS CW Transactions as CSV (with optional date filter)
     */
    public function downloadAepsCwTxns(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
            }

            // Check if date filter is applied
            $startDate = $request->input('start_date', date('Y-m-d'));
            $endDate = $request->input('end_date', date('Y-m-d'));
            
            // Query: SELECT created_at, amount FROM aeps_transactions 
            // WHERE aeps_type LIKE 'CW' AND response_status = 1 AND created_at BETWEEN dates
            $transactions = DB::table('aeps_transactions')
                ->where('aeps_type', 'CW')
                ->where('response_status', 1)
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->select('created_at', 'amount')
                ->orderBy('id', 'desc')
                ->get();

            // Calculate total sum
            $totalAmount = $transactions->sum('amount');

            // Generate CSV content with date range in filename
            $filename = 'aeps_cw_txns_' . $startDate . '_to_' . $endDate . '.csv';
            
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0'
            ];

            $callback = function() use ($transactions, $totalAmount) {
                $file = fopen('php://output', 'w');
                
                // Add CSV header row
                fputcsv($file, ['Created At', 'Amount']);
                
                // Add data rows
                foreach ($transactions as $txn) {
                    fputcsv($file, [$txn->created_at, $txn->amount]);
                }
                
                // Add empty row and total sum row
                fputcsv($file, ['', '']);
                fputcsv($file, ['TOTAL', $totalAmount]);
                
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to download transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    // Summary of Commission Distribution Based on `retailer`, `distributor`, `super` Profit Loss based on aeps transactions left commission
    public function summary(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
            }

            $type = $request->input('type', 'CW'); // CW, CD or MATM
            $startDate = $request->input('start_date', date('Y-m-d'));
            $endDate = $request->input('end_date', date('Y-m-d'));
            $perPage = $request->input('per_page', 50);

            $lowcaseType = strtolower($type);

            // 1. Get aeps_comm_slab records based on type CW, CD or MATM
            // Get slabs in date range + the most recent slab before startDate (as fallback for early transactions)
            $commSlabsInRange = DB::table('aeps_comm_slab')
                ->where('type', $type)
                ->whereBetween('date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->orderBy('date', 'desc')
                ->get();
            
            // Get one most recent slab per amt_slab before startDate (fallback rates)
            $commSlabsFallback = DB::table('aeps_comm_slab')
                ->where('type', $type)
                ->where('date', '<', $startDate . ' 00:00:00')
                ->orderBy('date', 'desc')
                ->get()
                ->unique('amt_slab'); // Keep only the most recent per slab range
            
            $commSlabs = $commSlabsInRange->merge($commSlabsFallback)->sortByDesc('date')->values();

            // 2. Get aeps_fingpay_charge records for date-based lookup
            // Get charges in date range + the most recent charge before startDate (as fallback)
            $fingpayChargesInRange = DB::table('aeps_fingpay_charge')
                ->whereBetween('date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->orderBy('date', 'desc')
                ->get();
            
            // Get the most recent charge before startDate (fallback rate)
            $fingpayChargeFallback = DB::table('aeps_fingpay_charge')
                ->where('date', '<', $startDate . ' 00:00:00')
                ->orderBy('date', 'desc')
                ->first();
            
            $fingpayCharges = $fingpayChargesInRange;
            if ($fingpayChargeFallback) {
                $fingpayCharges = $fingpayCharges->push($fingpayChargeFallback);
            }

            $txn_type = $type=="MATM" ? "MATMCW" : $type;

            // 3. Get paginated transactions with only success ones
            $transactions = DB::table('aeps_transactions')
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->select('id', 'created_at', 'amount', 'aeps_type', 'admin_id')
                ->where('aeps_type', $txn_type) // CW, CD or MATM
                ->where('response_status', 1) // only success transactions
                ->orderBy('id', 'desc')
                ->paginate($perPage);

            // Get all api users ids
            $apiUserIds = DB::table('users')->where('is_api_partner', 1)->pluck('id')->toArray();
            
            // Add api_user flag to each transaction (use transform to preserve paginator)
            $transactions->getCollection()->transform(function ($transaction) use ($apiUserIds) {
                $transaction->api_user = in_array($transaction->admin_id, $apiUserIds);
                return $transaction;
            });
            

            // 4. Get overall totals for ALL transactions (not just current page)
            $allTransactions = DB::table('aeps_transactions')
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->where('aeps_type', $txn_type)
                ->where('response_status', 1)
                ->get(['amount']);

            $overallTotalAmount = $allTransactions->sum('amount');

            // 5. Get BE and MS transaction counts
            $beCount = DB::table('aeps_transactions')
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->where('aeps_type', 'BE')
                ->where('response_status', 1)
                ->count();

            $msCount = DB::table('aeps_transactions')
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->where('aeps_type', 'MS')
                ->where('response_status', 1)
                ->count();

            $matmBeCount = DB::table('aeps_transactions')
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->where('aeps_type', 'MATMBE')
                ->where('response_status', 1)
                ->count();

            return response()->json([
                'status' => 1,
                'message' => 'Profit loss summary fetched successfully',
                'data' => [
                    'transactions' => [
                        'current_page' => $transactions->currentPage(),
                        'data' => $transactions->items(),
                        'from' => $transactions->firstItem(),
                        'to' => $transactions->lastItem(),
                        'total' => $transactions->total(),
                        'last_page' => $transactions->lastPage(),
                        'per_page' => $transactions->perPage(),
                    ],
                    'comm_slabs' => $commSlabs,
                    'fingpay_charges' => $fingpayCharges, // Array of all charge records for date-based lookup
                    'overall_total_amount' => $overallTotalAmount,
                    'be_count' => $beCount,
                    'ms_count' => $msCount,
                    'matm_be_count' => $matmBeCount
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve profit loss summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export Summary Data to Excel
     */
    public function exportSummary(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
            }

            $type = $request->input('type', 'CW');
            $startDate = $request->input('start_date', date('Y-m-d'));
            $endDate = $request->input('end_date', date('Y-m-d'));
            $lowcaseType = strtolower($type);

            $txn_type = $type=="MATM" ? "MATMCW" : $type;

            // Get ALL transactions for export (no pagination)
            $transactions = DB::table('aeps_transactions')
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->where('aeps_type', $txn_type)
                ->where('response_status', 1)
                ->orderBy('id', 'desc')
                ->get(['id', 'created_at', 'amount', 'aeps_type', 'admin_id']);

            $apiUserIds = DB::table('users')->where('is_api_partner', 1)->pluck('id')->toArray();

            // Add api_user flag to each transaction 
            $transactions->transform(function ($transaction) use ($apiUserIds) {
                $transaction->api_user = in_array($transaction->admin_id, $apiUserIds);
                return $transaction;
            });
         
            // Get commission slabs (all records, sorted by date desc for date-based lookup)
            $commSlabs = DB::table('aeps_comm_slab')
                ->where('type', $type)
                ->orderBy('date', 'desc')
                ->get();

            // Get all fingpay charges (sorted by date desc for date-based lookup)
            $fingpayCharges = DB::table('aeps_fingpay_charge')
                ->orderBy('date', 'desc')
                ->get();

            // Helper function to find applicable fingpay charge based on transaction date
            // Finds the charge record where charge.date <= transaction.created_at (most recent applicable rate)
            $getFingpayChargePercent = function($transactionDate) use ($fingpayCharges, $lowcaseType) {
                $txnDate = strtotime($transactionDate);
                foreach ($fingpayCharges as $charge) {
                    $chargeDate = strtotime($charge->date);
                    if ($chargeDate <= $txnDate) {
                        return floatval($charge->{$lowcaseType} ?? 0);
                    }
                }
                return 0;
            };

            // Helper function to find commission slab based on amount AND transaction date
            // Finds the slab where slab.date <= transaction.created_at AND amount matches the slab range
            $getCommissionSlab = function($amount, $transactionDate) use ($commSlabs) {
                $txnDate = strtotime($transactionDate);
                
                // Find slabs that match the amount range
                $matchingSlabs = [];
                foreach ($commSlabs as $s) {
                    $parts = explode('-', $s->amt_slab);
                    $min = floatval($parts[0]);
                    $max = floatval($parts[1]);
                    if ($amount >= $min && $amount <= $max) {
                        $matchingSlabs[] = $s;
                    }
                }
                
                // From matching slabs, find the one with date <= transaction date (already sorted by date desc)
                foreach ($matchingSlabs as $slab) {
                    $slabDate = strtotime($slab->date);
                    if ($slabDate <= $txnDate) {
                        return $slab;
                    }
                }
                
                return (object)['retailer' => 0, 'distributor' => 0, 'super' => 0];
            };

            // Calculate commissions function with date-based lookup
            $calculateCommissions = function($transaction) use ($type, $getFingpayChargePercent, $getCommissionSlab) {
                $amount = floatval($transaction->amount);
                $transactionDate = $transaction->created_at;
                
                // Get applicable fingpay charge for this transaction's date
                $fingpayChargePercent = $getFingpayChargePercent($transactionDate);
                $fingpayNetComm = 0;

                if ($type === 'M') {
                    $fingpayNetComm = 0;
                    $actualFingPayComm = 0;
                    $finPeChargeAmt = 0;
                } else if ($type === 'CW' || $type === 'CD' || $type === 'MATM') {
                    if ($amount < 3000) {
                        $actualFingPayComm = ($amount * 0.5) / 100;
                        $finPeChargeAmt = $actualFingPayComm * $fingpayChargePercent / 100;
                        if ($finPeChargeAmt < 0.50) {
                            $fingpayNetComm = $actualFingPayComm - 0.50;
                        } else {
                            $fingpayNetComm = $actualFingPayComm - $finPeChargeAmt;
                        }
                    } else {
                        $actualFingPayComm = 15;
                        $finPeChargeAmt = $actualFingPayComm * $fingpayChargePercent / 100;
                        $fingpayNetComm = $actualFingPayComm - $finPeChargeAmt;
                    }
                } else {
                    $actualFingPayComm = ($amount * 0.5) / 100;
                    $finPeChargeAmt = $actualFingPayComm * $fingpayChargePercent / 100;
                    $fingpayNetComm = $actualFingPayComm - $finPeChargeAmt;
                }

                if ($transaction->api_user) {
                    $apiUserComm = $fingpayNetComm * 0.1 / 100;
                    $fingpayNetComm -= $apiUserComm;
                }

                // Get applicable commission slab for this amount AND transaction date
                $slab = $getCommissionSlab($amount, $transactionDate);
                $retailerComm = floatval($slab->retailer ?? 0);
                $distributorComm = floatval($slab->distributor ?? 0);
                $superComm = floatval($slab->super ?? 0);
                
                $apiUserComm = 0;
                $cashbezProfit = 0;
                
                if ($type === 'M') {
                    $retailerComm = 0;
                    $distributorComm = 0;
                    $superComm = 0;
                    $apiUserComm = 0;
                    $cashbezProfit = 0;
                } else {
                    // Check if this transaction is from an API user
                    if ($transaction->api_user) {
                        // Reset other commissions to 0 for API users
                        $retailerComm = 0;
                        $distributorComm = 0;
                        $superComm = 0;
                        
                        // Apply tiered API user commission
                        if ($amount >= 1 && $amount <= 799) {
                            $apiUserComm = $fingpayNetComm / 2;
                        } else if ($amount >= 800 && $amount <= 3000) {
                            $apiUserComm = ($amount * 0.4) / 100;
                        } else {
                            $apiUserComm = 12;
                        }
                        
                        $cashbezProfit = $fingpayNetComm - $apiUserComm;
                    } else {
                        $cashbezProfit = $fingpayNetComm - ($retailerComm + $distributorComm + $superComm);
                    }
                }

                return [
                    'fingpayNetComm' => number_format($fingpayNetComm, 2, '.', ''),
                    'retailerComm' => number_format($retailerComm, 2, '.', ''),
                    'distributorComm' => number_format($distributorComm, 2, '.', ''),
                    'superComm' => number_format($superComm, 2, '.', ''),
                    'apiUserComm' => number_format($apiUserComm, 2, '.', ''),
                    'cashbezProfit' => number_format($cashbezProfit, 2, '.', ''),
                ];
            };

            // Generate Excel CSV
            $filename = 'summary_' . $type . '_' . $startDate . '_to_' . $endDate . '.csv';
            
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0'
            ];

            $callback = function() use ($transactions, $calculateCommissions) {
                $file = fopen('php://output', 'w');
                
                // Add CSV header row
                fputcsv($file, ['S. No', 'Txn Date & Time', 'Amount', 'FingPay Comm.', 'Retailer', 'Distributor', 'Super', 'API User Comm.', 'Cashbez Profit']);
                
                // Initialize totals
                $totalAmount = 0;
                $totalFingpay = 0;
                $totalRetailer = 0;
                $totalDistributor = 0;
                $totalSuper = 0;
                $totalApiUser = 0;
                $totalCashbez = 0;
                
                // Add data rows
                $serialNumber = 1;
                foreach ($transactions as $txn) {
                    $commissions = $calculateCommissions($txn);
                    
                    fputcsv($file, [
                        $serialNumber++,
                        $txn->created_at,
                        number_format($txn->amount, 2, '.', ''),
                        $commissions['fingpayNetComm'],
                        $commissions['retailerComm'],
                        $commissions['distributorComm'],
                        $commissions['superComm'],
                        $commissions['apiUserComm'],
                        $commissions['cashbezProfit']
                    ]);
                    
                    $totalAmount += $txn->amount;
                    $totalFingpay += floatval($commissions['fingpayNetComm']);
                    $totalRetailer += floatval($commissions['retailerComm']);
                    $totalDistributor += floatval($commissions['distributorComm']);
                    $totalSuper += floatval($commissions['superComm']);
                    $totalApiUser += floatval($commissions['apiUserComm']);
                    $totalCashbez += floatval($commissions['cashbezProfit']);
                }
                
                // Add empty row and total row
                fputcsv($file, ['', '', '', '', '', '', '', '', '']);
                fputcsv($file, [
                    'TOTAL',
                    '',
                    number_format($totalAmount, 2, '.', ''),
                    number_format($totalFingpay, 2, '.', ''),
                    number_format($totalRetailer, 2, '.', ''),
                    number_format($totalDistributor, 2, '.', ''),
                    number_format($totalSuper, 2, '.', ''),
                    number_format($totalApiUser, 2, '.', ''),
                    number_format($totalCashbez, 2, '.', '')
                ]);
                
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to export summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user passbook with pagination (for Reports page)
     */
    public function userPassbook(Request $request, $userId)
    {
        try {
            $user = Auth::user();
            if (!$user || ($user->role != 1 && $user->id != 21)) {
                 return response()->json(['status' => 0, 'message' => 'Unauthorized Access'], 403);
            }

            $perPage = $request->get('per_page', 100);
            
            $query = Passbook::where('user_id', $userId);
            
            $entries = $query->orderBy('id', 'desc')->paginate($perPage);
            
            return response()->json([
                'status' => 1,
                'message' => 'Passbook retrieved successfully',
                'data' => $entries->items(),
                'pagination' => [
                    'total' => $entries->total(),
                    'current_page' => $entries->currentPage(),
                    'last_page' => $entries->lastPage(),
                    'per_page' => $entries->perPage(),
                    'from' => $entries->firstItem(),
                    'to' => $entries->lastItem(),
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve passbook: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user beneficiaries with pagination (for Reports page)
     */
    public function userBeneficiaries(Request $request, $userId)
    {
        try {
            $user = Auth::user();
            if (!$user || ($user->role != 1 && $user->id != 21)) {
                 return response()->json(['status' => 0, 'message' => 'Unauthorized Access'], 403);
            }

            $perPage = $request->get('per_page', 50);
            $type = $request->get('type'); // 1=DMT, 3=Move To Bank
            
            $query = \App\Models\Beneficiary::where('user_id', $userId)
                ->select([
                    'id', 'user_id', 'name', 'mobile', 'account', 'ifsc', 
                    'bank', 'branch', 'type', 'status', 'account_verified', 
                    'ifsc_verified', 'created_at'
                ])
                ->orderBy('created_at', 'desc');
            
            // Filter by type if provided
            if ($type !== null) {
                $query->where('type', $type);
            }
            
            $beneficiaries = $query->paginate($perPage);
            
            // Calculate summary
            $summary = \App\Models\Beneficiary::where('user_id', $userId)
                ->selectRaw('
                    COUNT(*) as total_count,
                    SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) as dmt_count,
                    SUM(CASE WHEN type = 3 THEN 1 ELSE 0 END) as move_to_bank_count,
                    SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_count,
                    SUM(CASE WHEN account_verified = 1 THEN 1 ELSE 0 END) as verified_count
                ')
                ->first();
            
            return response()->json([
                'status' => 1,
                'message' => 'Beneficiaries retrieved successfully',
                'data' => $beneficiaries->items(),
                'summary' => $summary,
                'pagination' => [
                    'total' => $beneficiaries->total(),
                    'current_page' => $beneficiaries->currentPage(),
                    'last_page' => $beneficiaries->lastPage(),
                    'per_page' => $beneficiaries->perPage(),
                    'from' => $beneficiaries->firstItem(),
                    'to' => $beneficiaries->lastItem(),
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve beneficiaries: ' . $e->getMessage()
            ], 500);
        }
    }


    public function dumypassbook()
    {
        $userId = 110;
        $accountId = 174;
        $createdBy = 1;

        $startDate = strtotime("2025-12-26 10:00:00");
        $endDate   = strtotime("2026-01-22 20:00:00");

        $startTimestamp = strtotime("2025-12-26 10:00:00");
        $endTimestamp   = strtotime("2026-01-22 20:00:00");



        $totalTransactions = 20000; 
        $targetFinalBalance = 14726.86;
        $batchSize = 100;

        $array = [
            'AEPS'=> ['details'=>'CW - Commission ','amount'=>[0.20,0.40,0.80,1,0.5,0.25]],
            'MATM'=> ['details'=>'MATM - Commission ','amount'=>[0.20,0.40,0.80,1,0.5,0.25]],
            'RECHARGE'=> ['details'=>'Recharge - Commission ','amount'=>[0.05,0.15,0.18,0.20,0.5,1]],
            'BILL_PAY'=> ['details'=>'BBPS - Commission ','amount'=>[1]],
            'CREDIT_CARD'=> ['details'=>'CC - Commission ','amount'=>[200]],
            'ITR'=> ['details'=>'ITR - Commission ','amount'=>[20]],
            'GST'=> ['details'=>'GST - Commission ','amount'=>[20]],
            'MANTRA_DEVICE'=> ['details'=>'MANTRA DEVICE BONUS ','amount'=>[25]],
            'MATM_DEVICE'=> ['details'=>'MATM DEVICE BONUS ','amount'=>[25]],
            'SAVING'=> ['details'=>'SAVING BONUS ','amount'=>[25]],
        ];

        $limits = [
            'CREDIT_CARD' => 15,
            'MANTRA_DEVICE' => 25,
            'MATM_DEVICE' => 14,
            'GST' => 30,
            'ITR' => 25,
            'SAVING' => 70,
            'RECHARGE' => 500,
            'BILL_PAY' => 500,
        ];

        // Build forced keys
        $forcedKeys = [];
        foreach ($limits as $key => $count) {
            for ($i=0; $i<$count; $i++) $forcedKeys[] = $key;
        }

        $remaining = $totalTransactions - count($forcedKeys);
        for ($i=0; $i<$remaining; $i++) {
            $forcedKeys[] = rand(0,1) ? 'AEPS' : 'MATM';
        }

        shuffle($forcedKeys);

        $categoryMap = \App\Models\TxnCategory::pluck('id','code')->toArray();

        $balance = 0;
        $rows = [];

        $totalKeys = count($forcedKeys);
        $timeStep = ($endTimestamp - $startTimestamp) / $totalKeys;

        $currentTimestamp = $startTimestamp;

        foreach ($forcedKeys as $index => $key) {

            $txn = $array[$key];
            $randAmount = $txn['amount'][array_rand($txn['amount'])];

            $createdAt = date('Y-m-d H:i:s', $currentTimestamp);
            $currentTimestamp += $timeStep;

            $txnid = mt_rand(11111111,99999999);
            $description = $txn['details'].$txnid;

            // ===== LAST TRANSACTION: FORCE FINAL BALANCE =====
            if (($index+1) == $totalTransactions) {
                $randAmount = round($targetFinalBalance - $balance, 2);
                if ($randAmount < 0) $randAmount = 0; 
            }

            // ===== NORMAL CREDIT ENTRY =====
            $preBalance = $balance;
            $balance += $randAmount;

            $rows[] = [
                'user_id' => $userId,
                'account_id'=> $accountId,
                'transaction_id'=> $txnid,
                'description'=> $description,
                'type'=> 'CR',
                'pre_balance'=> round($preBalance,2),
                'amount'=> round($randAmount,2),
                'balance'=> round($balance,2),
                'category_id'=> $categoryMap[$key] ?? null,
                'created_by'=> $createdBy,
                'admin_id'=> $createdBy,
                'created_at'=> $createdAt,
                'updated_at'=> $createdAt,
            ];

            // ===== AEPS / MATM TDS ENTRY =====
            if ($key == 'AEPS' || $key == 'MATM') {

                $tds = round($randAmount * 0.02, 2);

                $preBalanceTds = $balance; // FIXED pre-balance
                $balance -= $tds;

                $rows[] = [
                    'user_id'=> $userId,
                    'account_id'=> $accountId,
                    'transaction_id'=> $txnid,
                    'description'=> "TDS Deduction - ".$txnid,
                    'type'=> 'DR',
                    'pre_balance'=> round($preBalanceTds,2),
                    'amount'=> round($tds,2),
                    'balance'=> round($balance,2),
                    'category_id'=> $categoryMap[$key] ?? null,
                    'created_by'=> $createdBy,
                    'admin_id'=> $createdBy,
                    'created_at'=> $createdAt,
                    'updated_at'=> $createdAt,
                ];
            }

            // ===== Batch Insert =====
            if (count($rows) >= $batchSize) {
                DB::table('passbooks')->insert($rows);
                $rows = [];
            }
        }

        if (!empty($rows)) {
            DB::table('passbooks')->insert($rows);
        }

        return "Dummy passbook inserted successfully with exact final balance!";
    }

    /**
     * Export Payouts Data to CSV
     */
    public function exportPayouts(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user || ($user->id != 21 && $user->role != 1)) {
                return response()->json(['status' => 0, 'message' => 'Unauthorized Access'], 403);
            }

            $startDate = $request->input('start_date', date('Y-m-d'));
            $endDate = $request->input('end_date', date('Y-m-d'));

            $payouts = DB::table('payouts')
                ->join('users', 'payouts.user_id', '=', 'users.id')
                ->leftJoin('settings', 'payouts.admin_id', '=', 'settings.user_id')
                ->whereBetween('payouts.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->where('payouts.status', "success") // 1 means SUCCESS
                ->select(
                    'users.mid as mid',
                    'users.name as user_shop_name',
                    'settings.company_name',
                    'payouts.name as beneficiary_name', // name is stored in payouts table directly
                    'payouts.account as account',
                    'payouts.amount as amount',
                    'payouts.type as type',
                    'payouts.transaction_id as utr',
                    'payouts.created_at as time'
                )
                ->orderBy('payouts.id', 'desc')
                ->get();

            $filename = 'payouts_' . $startDate . '_to_' . $endDate . '.csv';

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0'
            ];

            $callback = function() use ($payouts) {
                $file = fopen('php://output', 'w');
                
                fputcsv($file, ['S. No', 'MID', 'Name', 'Beneficiary Name', 'Account', 'Amount', 'Type', 'UTR', 'Time']);

                $totalAmount = 0;
                $serialNumber = 1;

                foreach ($payouts as $payout) {
                    $shopName = $payout->company_name ?: $payout->user_shop_name ?: 'N/A';
                    fputcsv($file, [
                        $serialNumber++,
                        $payout->mid,
                        $shopName,
                        $payout->beneficiary_name,
                        $payout->account,
                        number_format($payout->amount, 2, '.', ''),
                        $payout->type,
                        $payout->utr,
                        $payout->time
                    ]);
                    
                    $totalAmount += floatval($payout->amount);
                }
                
                fputcsv($file, ['', '', '', '', '', 'TOTAL', number_format($totalAmount, 2, '.', ''), '', '']);
                
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to export payouts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
    public function reffralLink(Request $request)
    {
        $user = User::where('remember_token', $request->header('Token'))->first();
        $admin = User::where('mid', $user->admin_mid)->first();

        if ($admin) {
            $setting = Setting::where('user_id', $admin->id)->first();

            if ($setting && $setting->playstore_url) {
                return response()->json([
                    'status' => 1,
                    'message' => 'URL retrieved successfully',
                    'url' => $setting->playstore_url
                ], 200);
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => 'Playstore URL not set for admin',
                    'url' => null
                ], 200);
            }
        } else {
            return response()->json([
                'status' => 0,
                'message' => 'Admin not found in request',
                'url' => $request->header('Token')// fixed here
            ], 200);
        }
    }

    /**
     * Check all users and create missing Trade Wallet & Utility Wallet for users who don't have both.
     */
    public function createMissingWallets(Request $request)
    {
        try {
            $users = User::all();
            $processedUsersCount = 0;
            $createdWalletsCount = 0;
            $details = [];

            foreach ($users as $user) {
                $processedUsersCount++;

                // Check existing accounts for this user
                $tradeWallet = Account::where('user_id', $user->id)
                    ->where('name', 'Trade Wallet')
                    ->first();

                $utilityWallet = Account::where('user_id', $user->id)
                    ->where('name', 'Utility Wallet')
                    ->first();

                // Mobile number fallback
                $mobileNum = !empty($user->mobile) ? $user->mobile : ($user->id . rand(100000, 999999));

                // Hashed MPIN for 123456
                $defaultMpin = Hash::make('123456');

                // 1. Create Trade Wallet if missing (primary_status = true, created_by = 4, admin_id = 4)
                if (!$tradeWallet) {
                    $tradeNumber = $mobileNum . date('ym') . '01';
                    while (Account::where('number', $tradeNumber)->exists()) {
                        $tradeNumber = $mobileNum . date('ymd') . rand(10, 99);
                    }
                    $tradeUpi = $mobileNum . '@cashbez';

                    Account::create([
                        'user_id'        => $user->id,
                        'name'           => 'Trade Wallet',
                        'number'         => $tradeNumber,
                        'upi'            => $tradeUpi,
                        'mpin'           => $defaultMpin,
                        'hold_amount'    => 0.00,
                        'created_by'     => 4,
                        'admin_id'       => 4,
                        'status'         => 1,
                        'primary_status' => true
                    ]);

                    $createdWalletsCount++;
                    $details[] = "Created Trade Wallet for User ID {$user->id} ({$user->name})";
                }

                // 2. Create Utility Wallet if missing (primary_status = false, created_by = 4, admin_id = 4)
                if (!$utilityWallet) {
                    $utilityNumber = $mobileNum . date('ymd') . '02';
                    while (Account::where('number', $utilityNumber)->exists()) {
                        $utilityNumber = $mobileNum . date('ymd') . rand(10, 99);
                    }
                    $utilityUpi = $mobileNum . '1@bp';

                    Account::create([
                        'user_id'        => $user->id,
                        'name'           => 'Utility Wallet',
                        'number'         => $utilityNumber,
                        'upi'            => $utilityUpi,
                        'mpin'           => $defaultMpin,
                        'hold_amount'    => 0.00,
                        'created_by'     => 4,
                        'admin_id'       => 4,
                        'status'         => 1,
                        'primary_status' => false
                    ]);

                    $createdWalletsCount++;
                    $details[] = "Created Utility Wallet for User ID {$user->id} ({$user->name})";
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Missing wallets check and creation completed successfully.',
                'total_users_processed' => $processedUsersCount,
                'wallets_created_count' => $createdWalletsCount,
                'details' => $details
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create missing wallets',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import users from aeps_drafts where admin_id = 4 into users table if not already present.
     */
    public function syncAepsDraftsToUsers(Request $request)
    {
        try {
            $adminIdFilter = $request->input('admin_id', 4);
            $drafts = AepsDraft::where('admin_id', $adminIdFilter)
                ->orWhere('created_by', $adminIdFilter)
                ->get();

            $processedCount = 0;
            $insertedCount = 0;
            $details = [];

            foreach ($drafts as $draft) {
                $processedCount++;

                // Check if user already exists by mid or mobile
                $existingUser = null;
                if (!empty($draft->mid)) {
                    $existingUser = User::where('mid', $draft->mid)->first();
                }
                if (!$existingUser && !empty($draft->phone)) {
                    $existingUser = User::where('mobile', $draft->phone)->first();
                }

                if (!$existingUser) {
                    $midVal = !empty($draft->mid) ? $draft->mid : ("AGENT" . $draft->id);
                    while (User::where('mid', $midVal)->exists()) {
                        $midVal = "AGENT" . rand(100000, 999999);
                    }

                    $mobileVal = !empty($draft->phone) ? $draft->phone : ("99" . rand(10000000, 99999999));
                    while (User::where('mobile', $mobileVal)->exists()) {
                        $mobileVal = "99" . rand(10000000, 99999999);
                    }

                    $emailVal = !empty($draft->email) ? $draft->email : ("user_" . $draft->id . "@domain.com");
                    while (User::where('email', $emailVal)->exists()) {
                        $emailVal = "draft_" . $draft->id . "_" . rand(100, 999) . "@domain.com";
                    }

                    $nameVal = !empty($draft->full_name) ? $draft->full_name : "User " . $draft->id;

                    $userData = [
                        'mid'                => $midVal,
                        'mkey'               => Str::random(32),
                        'admin_mid'          => $midVal,
                        'mobile'             => $mobileVal,
                        'name'               => $nameVal,
                        'email'              => $emailVal,
                        'email_verified_at'  => 1,
                        'aadhar_verified_at' => 1,
                        'password'           => $draft->password ?? Hash::make($mobileVal),
                        'mpin'               => $draft->password ?? Hash::make('123456'),
                        'aadhar_number'      => $draft->aadhaar_number,
                        'role'               => '0',
                        'root'               => '',
                        'refer_by'           => $midVal,
                        'status'             => 1,
                        'is_api_partner'     => 0,
                        'created_at'         => $draft->created_at ?? now(),
                        'updated_at'         => $draft->updated_at ?? now(),
                    ];

                    $newUserId = DB::table('users')->insertGetId($userData);
             
                    $insertedCount++;

                    // Create Trade Wallet & Utility Wallet for newly created user
                    $defaultMpin = Hash::make('123456');

                    // Guaranteed unique Trade Wallet number
                    $tradeNumber = $mobileVal . date('ym') . '01';
                    while (Account::where('number', $tradeNumber)->exists()) {
                        $tradeNumber = $mobileVal . date('ymd') . rand(10, 99);
                    }

                    Account::create([
                        'user_id'        => $newUserId,
                        'name'           => 'Trade Wallet',
                        'number'         => $tradeNumber,
                        'upi'            => $mobileVal . '@cashbez',
                        'mpin'           => $defaultMpin,
                        'hold_amount'    => 0.00,
                        'created_by'     => 4,
                        'admin_id'       => 4,
                        'status'         => 1,
                        'primary_status' => true
                    ]);

                    // Guaranteed unique Utility Wallet number
                    $utilityNumber = $mobileVal . date('ymd') . '02';
                    while (Account::where('number', $utilityNumber)->exists()) {
                        $utilityNumber = $mobileVal . date('ymd') . rand(10, 99);
                    }

                    Account::create([
                        'user_id'        => $newUserId,
                        'name'           => 'Utility Wallet',
                        'number'         => $utilityNumber,
                        'upi'            => $mobileVal . '1@bp',
                        'mpin'           => $defaultMpin,
                        'hold_amount'    => 0.00,
                        'created_by'     => 4,
                        'admin_id'       => 4,
                        'status'         => 1,
                        'primary_status' => false
                    ]);

                    $details[] = "Inserted User ID {$newUserId} ({$nameVal}, MID: {$midVal}) from AEPS Draft ID {$draft->id}";
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'AEPS Drafts to Users sync completed successfully.',
                'total_drafts_processed' => $processedCount,
                'users_inserted_count' => $insertedCount,
                'details' => $details
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to sync AEPS drafts to users',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 200);
        }
    }

}
