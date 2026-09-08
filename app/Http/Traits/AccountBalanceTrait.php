<?php

namespace App\Http\Traits;

use App\Models\Account;
use Illuminate\Http\Request;

trait AccountBalanceTrait
{
    /**
     * Get account balance with hold amount consideration
     * 
     * @param Request $request
     * @param int|null $accountId - Optional account ID, if not provided will get from request
     * @return array
     */
    public function getAccountBalance(Request $request, $accountId = null)
    {
        try {
            // Get account ID from parameter or request
            $accountId = $accountId ?? $request->input('account_id');
            
            if (!$accountId) {
                return [
                    'status' => 0,
                    'message' => 'Account ID is required',
                    'balance' => 0,
                    'available_balance' => 0,
                    'hold_amount' => 0
                ];
            }

            // Get user from request (set by ApiTokenAuth middleware)
            $user = $request->input('user');
            
            if (!$user) {
                return [
                    'status' => 0,
                    'message' => 'User not authenticated',
                    'balance' => 0,
                    'available_balance' => 0,
                    'hold_amount' => 0
                ];
            }

            // Find account belonging to the authenticated user
            $account = Account::where('id', $accountId)
                            ->where('user_id', $user->id)
                            ->where('status', 1)
                            ->first();

            if (!$account) {
                return [
                    'status' => 0,
                    'message' => 'Account not found or inactive',
                    'balance' => 0,
                    'available_balance' => 0,
                    'hold_amount' => 0
                ];
            }

            // Get current balance from account
            $currentBalance = $account->balance;
            $holdAmount = $account->hold_amount ?? 0;
            
            // Calculate available balance (current balance - hold amount)
            $availableBalance = $currentBalance - $holdAmount;
            
            // Ensure available balance is not negative
            $availableBalance = max(0, $availableBalance);

            return [
                'status' => 1,
                'message' => 'Balance fetched successfully',
                'balance' => $currentBalance,
                'available_balance' => $availableBalance,
                'hold_amount' => $holdAmount,
                'account_id' => $account->id,
                'account_name' => $account->name,
                'account_number' => $account->number
            ];

        } catch (\Exception $e) {
            return [
                'status' => 0,
                'message' => 'Error fetching balance: ' . $e->getMessage(),
                'balance' => 0,
                'available_balance' => 0,
                'hold_amount' => 0
            ];
        }
    }

    /**
     * Get all account balances for authenticated user
     * 
     * @param Request $request
     * @return array
     */
    public function getAllAccountBalances(Request $request)
    {
        try {
            // Get user from request (set by ApiTokenAuth middleware)
            $user = $request->input('user');
            
            if (!$user) {
                return [
                    'status' => 0,
                    'message' => 'User not authenticated',
                    'accounts' => []
                ];
            }

            // Get all active accounts for the user
            $accounts = Account::where('user_id', $user->id)
                             ->where('status', 1)
                             ->get();

            if ($accounts->isEmpty()) {
                return [
                    'status' => 0,
                    'message' => 'No active accounts found',
                    'accounts' => []
                ];
            }

            $accountBalances = [];
            foreach ($accounts as $account) {
                $currentBalance = $account->balance;
                $holdAmount = $account->hold_amount ?? 0;
                $availableBalance = max(0, $currentBalance - $holdAmount);

                $accountBalances[] = [
                    'account_id' => $account->id,
                    'account_name' => $account->name,
                    'account_number' => $account->number,
                    'balance' => $currentBalance,
                    'available_balance' => $availableBalance,
                    'hold_amount' => $holdAmount,
                    'status' => $account->status
                ];
            }

            return [
                'status' => 1,
                'message' => 'Account balances fetched successfully',
                'accounts' => $accountBalances,
                'total_accounts' => count($accountBalances)
            ];

        } catch (\Exception $e) {
            return [
                'status' => 0,
                'message' => 'Error fetching account balances: ' . $e->getMessage(),
                'accounts' => []
            ];
        }
    }

    /**
     * Check if account has sufficient balance for transaction
     * 
     * @param Request $request
     * @param int $accountId
     * @param float $amount
     * @return array
     */
    public function checkSufficientBalance(Request $request, $accountId, $amount)
    {
        $balanceResult = $this->getAccountBalance($request, $accountId);
        
        if ($balanceResult['status'] == 0) {
            return $balanceResult;
        }

        $availableBalance = $balanceResult['available_balance'];
        
        if ($availableBalance >= $amount) {
            return [
                'status' => 1,
                'message' => 'Sufficient balance available',
                'available_balance' => $availableBalance,
                'required_amount' => $amount,
                'remaining_balance' => $availableBalance - $amount
            ];
        } else {
            return [
                'status' => 0,
                'message' => 'Insufficient balance',
                'available_balance' => $availableBalance,
                'required_amount' => $amount,
                'shortage' => $amount - $availableBalance
            ];
        }
    }

    /**
     * Validate MPIN for account transaction
     * 
     * @param Request $request
     * @param int|null $accountId - Optional account ID, if not provided will get from request
     * @param string|null $mpin - Optional MPIN, if not provided will get from request
     * @return array
     */
    public function validateAccountMpin(Request $request, $accountId = null, $mpin = null)
    {
        try {
            // Get account ID from parameter or request
            $accountId = $accountId ?? $request->input('account_id');
            
            // Get MPIN from parameter or request
            $mpin = $mpin ?? $request->input('mpin');
            
            if (!$accountId) {
                return [
                    'status' => 0,
                    'message' => 'Account ID is required',
                    'account_id' => null
                ];
            }

            if (!$mpin) {
                return [
                    'status' => 0,
                    'message' => 'MPIN is required',
                    'account_id' => $accountId
                ];
            }

            // Validate MPIN format (4 digits)
            if (!preg_match('/^[0-9]{4}$/', $mpin)) {
                return [
                    'status' => 0,
                    'message' => 'MPIN must be 4 digits',
                    'account_id' => $accountId
                ];
            }

            // Get user from request (set by ApiTokenAuth middleware)
            $user = $request->input('user');
            
            if (!$user) {
                return [
                    'status' => 0,
                    'message' => 'User not authenticated',
                    'account_id' => $accountId
                ];
            }

            // Find account belonging to the authenticated user
            $account = Account::where('id', $accountId)
                            ->where('user_id', $user->id)
                            ->where('status', 1)
                            ->first();

            if (!$account) {
                return [
                    'status' => 0,
                    'message' => 'Account not found or inactive',
                    'account_id' => $accountId
                ];
            }

            // Check if account has MPIN set
            if (!$account->hasMpin()) {
                return [
                    'status' => 0,
                    'message' => 'MPIN not set for this account',
                    'account_id' => $accountId
                ];
            }

            // Verify MPIN
            if (!$account->verifyMpin($mpin)) {
                return [
                    'status' => 0,
                    'message' => 'Invalid MPIN',
                    'account_id' => $accountId
                ];
            }

            return [
                'status' => 1,
                'message' => 'MPIN validated successfully',
                'account_id' => $account->id,
                'account_name' => $account->name,
                'account_number' => $account->number
            ];

        } catch (\Exception $e) {
            return [
                'status' => 0,
                'message' => 'Error validating MPIN: ' . $e->getMessage(),
                'account_id' => $accountId
            ];
        }
    }

    /**
     * Validate account and MPIN for transaction (Combined validation)
     * 
     * @param Request $request
     * @param int|null $accountId
     * @param string|null $mpin
     * @param float|null $amount - Optional amount to check balance
     * @return array
     */
    public function validateAccountForTransaction(Request $request, $accountId = null, $mpin = null, $amount = null)
    {
        try {
            // Get parameters from request if not provided
            $accountId = $accountId ?? $request->input('account_id');
            $mpin = $mpin ?? $request->input('mpin');
            $amount = $amount ?? $request->input('amount');

            // Step 1: Validate MPIN
            $mpinValidation = $this->validateAccountMpin($request, $accountId, $mpin);
            
            if ($mpinValidation['status'] == 0) {
                return $mpinValidation;
            }

            // Step 2: Get account balance
            $balanceResult = $this->getAccountBalance($request, $accountId);
            
            if ($balanceResult['status'] == 0) {
                return $balanceResult;
            }

            // Step 3: Check sufficient balance if amount is provided
            if ($amount !== null && $amount > 0) {
                $balanceCheck = $this->checkSufficientBalance($request, $accountId, $amount);
                
                if ($balanceCheck['status'] == 0) {
                    return [
                        'status' => 0,
                        'message' => $balanceCheck['message'],
                        'account_id' => $accountId,
                        'available_balance' => $balanceCheck['available_balance'],
                        'required_amount' => $amount,
                        'shortage' => $balanceCheck['shortage'] ?? 0
                    ];
                }

                return [
                    'status' => 1,
                    'message' => 'Account validated successfully for transaction',
                    'account_id' => $balanceResult['account_id'],
                    'account_name' => $balanceResult['account_name'],
                    'account_number' => $balanceResult['account_number'],
                    'balance' => $balanceResult['balance'],
                    'available_balance' => $balanceResult['available_balance'],
                    'hold_amount' => $balanceResult['hold_amount'],
                    'transaction_amount' => $amount,
                    'remaining_balance' => $balanceCheck['remaining_balance']
                ];
            }

            // If no amount check required, just return MPIN validation and balance info
            return [
                'status' => 1,
                'message' => 'Account and MPIN validated successfully',
                'account_id' => $balanceResult['account_id'],
                'account_name' => $balanceResult['account_name'],
                'account_number' => $balanceResult['account_number'],
                'balance' => $balanceResult['balance'],
                'available_balance' => $balanceResult['available_balance'],
                'hold_amount' => $balanceResult['hold_amount']
            ];

        } catch (\Exception $e) {
            return [
                'status' => 0,
                'message' => 'Error validating account for transaction: ' . $e->getMessage(),
                'account_id' => $accountId
            ];
        }
    }
}
