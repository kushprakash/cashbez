<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Passbook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PassbookController extends Controller
{
    /**
     * Create a new transaction
     */
    public function createTransaction(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'account_id' => 'required|exists:accounts,id',
                'details' => 'required|string|max:500',
                'type' => 'required|in:CR,DR',
                'amount' => 'required|numeric|min:0.01',
                'mpin' => 'required_if:type,DR|string|size:4|regex:/^[0-9]{4}$/'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'error' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            
            // Get account with latest transaction for balance
            $account = Account::with('latestTransaction')
                ->where('id', $request->account_id)
                ->where('user_id', $user->id)
                ->active()
                ->first();

            if (!$account) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Account not found or inactive'
                ], 404);
            }

            // Verify MPIN for debit transactions
            if ($request->type === Passbook::TYPE_DEBIT && $request->mpin) {
                if (!$account->hasMpin()) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'MPIN not set for this account'
                    ], 400);
                }

                if (!$account->verifyMpin($request->mpin)) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Invalid MPIN'
                    ], 400);
                }
            }

            // Get current balance from latest transaction
            $latestTransaction = $account->latestTransaction;
            $currentBalance = $latestTransaction ? $latestTransaction->balance : 0.00;

            $amount = $request->amount;
            $type = $request->type;

            // Calculate new balance
            if ($type === Passbook::TYPE_CREDIT) {
                $newBalance = $currentBalance + $amount;
            } else {
                // Check if sufficient balance for debit
                $availableBalance = $currentBalance - $account->hold_amount;
                if ($amount > $availableBalance) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Insufficient balance. Available: ₹' . number_format($availableBalance, 2)
                    ], 400);
                }
                $newBalance = $currentBalance - $amount;
            }

            DB::beginTransaction();

            // Create passbook entry
            $passbook = Passbook::create([
                'user_id' => $user->id,
                'account_id' => $account->id,
                'details' => $request->details,
                'transaction_id' => \Str::uuid(),
                'type' => $type,
                'pre_balance' => $currentBalance,
                'amount' => $amount,
                'balance' => $newBalance,
                'created_by' => $user->id,
                'admin_id' => $user->id
            ]);

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Transaction created successfully',
                'data' => [
                    'transaction' => [
                        'id' => $passbook->id,
                        'description' => $passbook->description,
                        'type' => $passbook->type,
                        'amount' => $passbook->formatted_amount,
                        'pre_balance' => $passbook->formatted_pre_balance,
                        'balance' => $passbook->formatted_balance,
                        'date' => $passbook->created_at->format('Y-m-d H:i:s')
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get transactions for an account
     */
    public function getTransactions(Request $request, $accountId)
    {
        try {
            $user = Auth::user();
            
            // Verify account belongs to user
            $account = Account::where('id', $accountId)
                ->where('user_id', $user->id)
                ->first();

            if (!$account) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Account not found'
                ], 404);
            }

            $perPage = $request->input('per_page', 20);
            $page = $request->input('page', 1);

            $transactions = Passbook::with(['category'])
                ->where('account_id', $accountId)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'status' => 1,
                'message' => 'Transactions retrieved successfully',
                'data' => [
                    'transactions' => $transactions->items(),
                    'pagination' => [
                        'current_page' => $transactions->currentPage(),
                        'last_page' => $transactions->lastPage(),
                        'per_page' => $transactions->perPage(),
                        'total' => $transactions->total()
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function transactions(Request $request)
    {
        try {
            $user = Auth::user();
            
            $perPage = $request->input('per_page', 20);
            $page = $request->input('page', 1);

            $query = Passbook::where('user_id', $user->id);

            if ($request->has('date_from') && !empty($request->date_from)) {    
                $query->where('created_at', '>=', $request->date_from.' 00:00:00');
            }

            if ($request->has('date_to') && !empty($request->date_to)) {
                $query->where('created_at', '<=', $request->date_to.' 23:59:59');
            }

            if ($request->has('description') && !empty($request->description)) {
                $query->where('description', 'like', '%' . $request->description . '%');
            }

            if ($request->has('category_id') && !empty($request->category_id)) {
                $query->where('category_id', $request->category_id);
            }

            $transactions = $query->with(['category'])
                ->orderBy('id', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            // Transform transactions to include IST formatted timestamps
            $formattedTransactions = collect($transactions->items())->map(function ($txn) {
                $txnArray = $txn->toArray();
                
                // Safely format timestamps with null checks
                if ($txn->created_at) {
                    $txnArray['created_at'] = $txn->created_at
                        ->setTimezone('Asia/Kolkata')
                        ->format('Y-m-d H:i:s');
                }
                if ($txn->updated_at) {
                    $txnArray['updated_at'] = $txn->updated_at
                        ->setTimezone('Asia/Kolkata')
                        ->format('Y-m-d H:i:s');
                }
                
                return $txnArray;
            });

            return response()->json([
                'status' => 1,
                'message' => 'Transactions retrieved successfully',
                'data' => [
                    'transactions' => $formattedTransactions,
                    'pagination' => [
                        'current_page' => $transactions->currentPage(),
                        'last_page' => $transactions->lastPage(),
                        'per_page' => $transactions->perPage(),
                        'total' => $transactions->total()
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }


  
    /**
     * Get last transaction for balance
     */
    public function getLastTransaction($accountId)
    {
        try {
            $user = Auth::user();
            
            // Verify account belongs to user
            $account = Account::where('id', $accountId)
                ->where('user_id', $user->id)
                ->first();

            if (!$account) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Account not found'
                ], 404);
            }

            $lastTransaction = Passbook::where('account_id', $accountId)
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$lastTransaction) {
                return response()->json([
                    'status' => 1,
                    'message' => 'No transactions found',
                    'data' => [
                        'balance' => $account->formatted_balance,
                        'raw_balance' => $account->balance
                    ]
                ]);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Last transaction retrieved successfully',
                'data' => [
                    'transaction' => [
                        'id' => $lastTransaction->id,
                        'details' => $lastTransaction->details,
                        'type' => $lastTransaction->type,
                        'amount' => $lastTransaction->formatted_amount,
                        'balance' => $lastTransaction->formatted_balance,
                        'date' => $lastTransaction->created_at->format('Y-m-d H:i:s')
                    ],
                    'balance' => $lastTransaction->formatted_balance,
                    'raw_balance' => $lastTransaction->balance
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve last transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get account statement
     */
    public function getStatement(Request $request, $accountId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'from_date' => 'nullable|date',
                'to_date' => 'nullable|date|after_or_equal:from_date',
                'type' => 'nullable|in:CR,DR'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'error' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            
            // Verify account belongs to user
            $account = Account::where('id', $accountId)
                ->where('user_id', $user->id)
                ->first();

            if (!$account) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Account not found'
                ], 404);
            }

            $query = Passbook::where('account_id', $accountId);

            // Apply filters
            if ($request->from_date) {
                $query->whereDate('created_at', '>=', $request->from_date);
            }

            if ($request->to_date) {
                $query->whereDate('created_at', '<=', $request->to_date);
            }

            if ($request->type) {
                $query->where('type', $request->type);
            }

            $transactions = $query->with(['category'])->orderBy('created_at', 'desc')->get();

            // Calculate totals
            $totalCredit = $transactions->where('type', 'CR')->sum('amount');
            $totalDebit = $transactions->where('type', 'DR')->sum('amount');

            return response()->json([
                'status' => 1,
                'message' => 'Account statement retrieved successfully',
                'data' => [
                    'account' => [
                        'id' => $account->id,
                        'name' => $account->name,
                        'number' => $account->formatted_number
                    ],
                    'statement' => [
                        'transactions' => $transactions->map(function($transaction) {
                            return [
                                'id' => $transaction->id,
                                'details' => $transaction->details,
                                'type' => $transaction->type,
                                'amount' => $transaction->formatted_amount,
                                'pre_balance' => $transaction->formatted_pre_balance,
                                'balance' => $transaction->formatted_balance,
                                'category' => $transaction->category ? [
                                    'id' => $transaction->category->id,
                                    'code' => $transaction->category->code,
                                    'label' => $transaction->category->label
                                ] : null,
                                'date' => $transaction->created_at->format('Y-m-d H:i:s')
                            ];
                        }),
                        'summary' => [
                            'total_credit' => '₹' . number_format($totalCredit, 2),
                            'total_debit' => '₹' . number_format($totalDebit, 2),
                            'net_balance' => '₹' . number_format($totalCredit - $totalDebit, 2),
                            'transaction_count' => $transactions->count()
                        ]
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve account statement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
