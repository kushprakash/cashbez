<?php

if (!function_exists('validateTransaction')) {
    /**
     * Global function to validate transaction with comprehensive security checks
     * 
     * @param \Illuminate\Http\Request $request
     * @param int|null $accountId
     * @param string|null $mpin
     * @param float|null $amount
     * @return array
     */
    function validateTransaction($request, $accountId = null, $mpin = null, $amount = null, $type='DR')
    {
        try {
         

            // Get parameters from request if not provided
            $accountId = $accountId ?? $request->input('account_id');
            $mpin = $mpin ?? $request->input('mpin');
            $amount = $amount ?? $request->input('amount');
            $type = $type ?? $request->input('type');

            // Step 1: Basic Input Validation
            if (!$accountId) {
                return [
                    'status' => 0,
                    'message' => 'Account ID is required',
                    'error_code' => 'ACCOUNT_ID_REQUIRED',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            if (!$mpin) {
                return [
                    'status' => 0,
                    'message' => 'MPIN is required',
                    'error_code' => 'MPIN_REQUIRED',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            if (!$amount) {
                return [
                    'status' => 0,
                    'message' => 'Transaction amount is required',
                    'error_code' => 'AMOUNT_REQUIRED',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            // Step 2: Security Validations
            
            // Validate account ID is numeric and positive
            if (!is_numeric($accountId) || $accountId <= 0) {
                return [
                    'status' => 0,
                    'message' => 'Invalid account ID',
                    'error_code' => 'INVALID_ACCOUNT_ID',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            // Validate MPIN format (4 digits only)
            if (!preg_match('/^[0-9]{4}$/', $mpin)) {
                return [
                    'status' => 0,
                    'message' => 'MPIN must be exactly 4 digits',
                    'error_code' => 'INVALID_MPIN_FORMAT',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            // Validate amount is positive and not zero
            if (!is_numeric($amount) || $amount <= 0) {
                return [
                    'status' => 0,
                    'message' => 'Transaction amount must be greater than zero',
                    'error_code' => 'INVALID_AMOUNT',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            // Convert amount to float and validate it's not negative
            $amount = floatval($amount);
            if ($amount < 0.01) {
                return [
                    'status' => 0,
                    'message' => 'Minimum transaction amount is 0.01',
                    'error_code' => 'AMOUNT_TOO_LOW',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            // Validate maximum transaction amount (security limit)
            if ($amount > 100000) {
                return [
                    'status' => 0,
                    'message' => 'Maximum transaction amount is 100,000',
                    'error_code' => 'AMOUNT_TOO_HIGH',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            // Step 3: User Authentication
            $user = $request->user() ?? $request->input('user');
            
            if (!$user) {
                
                
                return [
                    'status' => 0,
                    'message' => 'User not authenticated',
                    'error_code' => 'USER_NOT_AUTHENTICATED',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            // Step 4: Account Validation
            $account = \App\Models\Account::where('id', $accountId)
                                        ->where('user_id', $user->id)
                                        ->first();

          
            if (!$account) {
                return [
                    'status' => 0,
                    'message' => 'Account not found or unauthorized access',
                    'error_code' => 'ACCOUNT_NOT_FOUND',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            // Step 5: Account Status Check
            if ($account->status != 1) {
                return [
                    'status' => 0,
                    'message' => 'Account is inactive or suspended',
                    'error_code' => 'ACCOUNT_INACTIVE',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            // Step 6: MPIN Validation
            if (!$account->hasMpin()) {
               
                return [
                    'status' => 0,
                    'message' => 'MPIN not set for this account',
                    'error_code' => 'MPIN_NOT_SET',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            if (!$account->verifyMpin($mpin)) {
               
                return [
                    'status' => 0,
                    'message' => 'Wrong MPIN entered. Use the correct MPIN to proceed or reset your MPIN if forgotten.',
                    'error_code' => 'INVALID_MPIN',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            // Step 7: Balance Calculation
            $currentBalance = $account->balance;
            $holdAmount = $account->hold_amount ?? 0;
            
           
            
            // If account is inactive, return zero balance
            if ($account->status == 0) {
                return [
                    'status' => 0,
                    'message' => 'Account is inactive',
                    'error_code' => 'ACCOUNT_INACTIVE',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            // Calculate available balance (current balance - hold amount)
            $availableBalance = $currentBalance - $holdAmount;
            
            // Ensure available balance is not negative
            $availableBalance = max(0, $availableBalance);

            

            // Step 8: Sufficient Balance Check
            if ($availableBalance < $amount && strtoupper($type) == 'DR') {
                return [
                    'status' => 0,
                    'message' => 'Insufficient balance for transaction',
                    'error_code' => 'INSUFFICIENT_BALANCE',
                    'balance' => $currentBalance,
                    'available_balance' => $availableBalance,
                    'required_amount' => $amount,
                    'shortage' => $amount - $availableBalance
                ];
            }

            // Step 9: Additional Security Checks
            
            // Check for suspicious activity (multiple rapid transactions)
            $recentTransactions = \App\Models\Passbook::where('account_id', $accountId)
                                                   ->where('created_at', '>=', now()->subMinutes(5))
                                                   ->count();
            
            if ($recentTransactions >= 10 && strtoupper($type) == 'DR') {
                return [
                    'status' => 0,
                    'message' => 'Too many transactions in short time. Please wait.',
                    'error_code' => 'RATE_LIMIT_EXCEEDED',
                    'balance' => 0,
                    'available_balance' => 0
                ];
            }

            // Step 10: Success Response
            return [
                'status' => 1,
                'message' => 'Transaction validation successful',
                'error_code' => null,
                'account_id' => $account->id,
                'account_name' => $account->name,
                'account_number' => $account->number,
                'balance' => $currentBalance,
                'available_balance' => $availableBalance,
                'hold_amount' => $holdAmount,
                'transaction_amount' => $amount,
                'remaining_balance' => $availableBalance - $amount,
                'validated_at' => now()->toISOString(),
                'user_id' => $user->id
            ];

        } catch (\Exception $e) {
            
            return [
                'status' => 0,
                'message' => 'Transaction validation failed due to system error',
                'error_code' => 'SYSTEM_ERROR',
                'balance' => 0,
                'available_balance' => 0
            ];
        }
    }

    //also make transaction in passbook
}

if (!function_exists('getCategoryIdByCode')) {
    /**
     * Get transaction category ID by code
     * 
     * @param string $code Category code (e.g., 'P2P', 'DMT', 'AEPS')
     * @return int|null Category ID or null if not found
     */
    function getCategoryIdByCode($code)
    {
        try {
            $category = \App\Models\TxnCategory::where('code', strtoupper($code))->first();
            return $category ? $category->id : null;
        } catch (\Exception $e) {
            return null;
        }
    }
}

if (!function_exists('createTransaction')) {
    /**
     * Global function to create a transaction in the passbook
     * 
     * @param array $transactionDataxyz
     * @return array
     */
    function createTransaction($transactionDataxyz)
    {
        try {
           

            // Required fields validation
            $requiredFields = ['account_id', 'type', 'amount', 'description'];
            foreach ($requiredFields as $field) {
                if (!isset($transactionDataxyz[$field]) || empty($transactionDataxyz[$field])) {
                    
                    return [
                        'status' => 0,
                        'message' => "Field {$field} is required",
                        'error_code' => 'MISSING_REQUIRED_FIELD',
                        'transaction_id' => null
                    ];
                }
            }

            // Validate transaction type
            $validTypes = ['DR', 'CR'];
            if (!in_array(strtoupper($transactionDataxyz['type']), $validTypes)) {
                return [
                    'status' => 0,
                    'message' => 'Invalid transaction type. Must be debit or credit',
                    'error_code' => 'INVALID_TRANSACTION_TYPE',
                    'transaction_id' => null
                ];
            }

            // Validate amount
            $amount = floatval($transactionDataxyz['amount']);
            if ($amount <= 0) {
                return [
                    'status' => 0,
                    'message' => 'Transaction amount must be greater than zero',
                    'error_code' => 'INVALID_AMOUNT',
                    'transaction_id' => null
                ];
            }

            // Get account details
            $account = \App\Models\Account::find($transactionDataxyz['account_id']);
            if (!$account) {
               return [
                    'status' => 0,
                    'message' => 'Account not found',
                    'error_code' => 'ACCOUNT_NOT_FOUND',
                    'transaction_id' => null
                ];
            }

        

            // Start database transaction
            \DB::beginTransaction();
          

            try {
                // Calculate new balance
                $currentBalance = $account->balance;
                $transactionType = strtoupper($transactionDataxyz['type']);


                $minBalance = $amount;
                if ($transactionType == 'DR') {
                    $newBalance = $currentBalance - $amount;
                    // Check for negative balance
                    $newMinBalance = $currentBalance - $minBalance;

                    if ($newMinBalance < 0) {
                        \DB::rollBack();
                        return [
                            'status' => 0,
                            'message' => 'Insufficient balance for debit transaction',
                            'error_code' => 'INSUFFICIENT_BALANCE',
                            'transaction_id' => null
                        ];
                    }
                } else {
                    $newBalance = $currentBalance + $amount;
                }

                // Resolve category_id from category_code if provided
                $categoryId = null;
                if (isset($transactionDataxyz['category_code'])) {
                    $categoryId = getCategoryIdByCode($transactionDataxyz['category_code']);
                } elseif (isset($transactionDataxyz['category_id'])) {
                    $categoryId = $transactionDataxyz['category_id'];
                }

                $passbookDesc = $transactionDataxyz['description'] ?? 'Transaction';
                if (is_array($passbookDesc) || is_object($passbookDesc)) {
                    $passbookDesc = json_encode($passbookDesc);
                } elseif (!is_string($passbookDesc) && !is_numeric($passbookDesc)) {
                    $passbookDesc = (string)$passbookDesc;
                }

                // Create passbook entry
                $passbookData = [
                    'account_id' => $transactionDataxyz['account_id'],
                    'transaction_id' => $transactionDataxyz['transaction_id'] ?? \Str::uuid(),
                    'type' => $transactionType,
                    'pre_balance' => $currentBalance,
                    'amount' => $amount,
                    'balance' => $newBalance,
                    'description' => $passbookDesc,
                    'category_id' => $categoryId,
                    'created_by' => $transactionDataxyz['created_by'] ?? null,
                    'admin_id' => $transactionDataxyz['admin_id'] ?? null,
                    'user_id' => $transactionDataxyz['user_id'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now()
                ];

              

                // Create the passbook entry
                $passbook = \App\Models\Passbook::create($passbookData);

                // Commit the transaction
                \DB::commit();

                return [
                    'status' => 1,
                    'message' => 'Transaction created successfully',
                    'error_code' => null,
                    'transaction_id' => $transactionDataxyz['transaction_id'] ?? $passbook->transaction_id,
                    'passbook_id' => $passbook->id,
                    'previous_balance' => $currentBalance,
                    'new_balance' => $newBalance
                ];

            } catch (\Exception $e) {
                \DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
        
            return [
                'status' => 0,
                'message' => 'Transaction creation failed due to system error: ' . $e->getMessage(),
                'error_code' => 'SYSTEM_ERROR',
                'transaction_id' => null,
                'debug_info' => [
                    'error_message' => $e->getMessage(),
                    'error_file' => $e->getFile(),
                    'error_line' => $e->getLine()
                ]
            ];
        }
    }
}

if (!function_exists('processTransaction')) {
    /**
     * Global function to validate and create a transaction in one go
     * 
     * @param \Illuminate\Http\Request $request
     * @param array $transactionDataxyz
     * @return array
     */
    function processTransaction($request, $transactionDataxyz , $checkType = true)
    {
        try {
           

            if($checkType){
                // Step 1: Validate the transaction
                $validation = validateTransaction(
                    $request,
                    $transactionDataxyz['account_id'] ?? null,
                    $transactionDataxyz['mpin'] ?? null,
                    $transactionDataxyz['amount'] ?? null,
                    $transactionDataxyz['type'] ?? 'DR'
                );

            
                // If validation fails, return the validation error
                if ($validation['status'] == 0) {
                    return $validation;
                }
            } else {

                $account = \App\Models\Account::where('user_id', $request->get('user')->id)->where('primary_status', true)->first();
                $validation['account_id'] = $transactionDataxyz['account_id'] ?? $account->id;
                $validation['transaction_amount'] = $transactionDataxyz['amount'] ?? 0;
            }

            // Prepare transaction data
            $transactionDataxyz1 = [
                'account_id' => $validation['account_id'],
                'type' => $transactionDataxyz['type'] ?? 'DR',
                'amount' => $validation['transaction_amount'],
                'description' => $transactionDataxyz['description'] ?? 'Transaction',
                'transaction_id' => $transactionDataxyz['transaction_id'] ?? \Str::uuid(),
                'created_by' => $request->user() ? $request->user()->id : null,
                'admin_id' => $request->get('admin') ? $request->get('admin')->id : null,
                'user_id' => $request->get('user') ? $request->get('user')->id : null
            ];

            // Pass through category information if provided
            if (isset($transactionDataxyz['category_code'])) {
                $transactionDataxyz1['category_code'] = $transactionDataxyz['category_code'];
            }
            if (isset($transactionDataxyz['category_id'])) {
                $transactionDataxyz1['category_id'] = $transactionDataxyz['category_id'];
            }

          

            // Step 2: Create the transaction
            $transaction = createTransaction($transactionDataxyz1);

            // If transaction creation fails, return the error
            if ($transaction['status'] == 0) {
                return $transaction;
            }

            // Step 3: Return combined success response
            return [
                'status' => 1,
                'message' => 'Transaction processed successfully',
                'error_code' => null,
                'validation' => $validation,
                'transaction' => $transaction
            ];

        } catch (\Exception $e) {
         

            return [
                'status' => 0,
                'message' => 'Transaction processing failed due to system error: ' . $e->getMessage(),
                'error_code' => 'SYSTEM_ERROR',
                'transaction_id' => null,
                'debug_info' => [
                    'error_message' => $e->getMessage(),
                    'error_file' => $e->getFile(),
                    'error_line' => $e->getLine()
                ]
            ];
        }
    }
}

if (!function_exists('getTransactionHistory')) {
    /**
     * Global function to get transaction history for an account
     * 
     * @param int $accountId
     * @param array $filters
     * @return array
     */
    function getTransactionHistory($accountId, $filters = [])
    {
        try {
            // Validate account
            $account = \App\Models\Account::find($accountId);
            if (!$account) {
                return [
                    'status' => 0,
                    'message' => 'Account not found',
                    'error_code' => 'ACCOUNT_NOT_FOUND',
                    'transactions' => []
                ];
            }

            // Build query
            $query = \App\Models\Passbook::where('account_id', $accountId);

            // Apply filters
            if (!empty($filters['type'])) {
                $query->where('type', $filters['type']);
            }

            if (!empty($filters['category'])) {
                $query->where('category', $filters['category']);
            }

            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            if (!empty($filters['date_from'])) {
                $query->whereDate('created_at', '>=', $filters['date_from']);
            }

            if (!empty($filters['date_to'])) {
                $query->whereDate('created_at', '<=', $filters['date_to']);
            }

            // Apply pagination
            $perPage = $filters['per_page'] ?? 10;
            $page = $filters['page'] ?? 1;

            // Get transactions
            $transactions = $query->orderBy('created_at', 'desc')
                                 ->paginate($perPage, ['*'], 'page', $page);

            return [
                'status' => 1,
                'message' => 'Transaction history retrieved successfully',
                'error_code' => null,
                'account_id' => $accountId,
                'account_name' => $account->name,
                'current_balance' => $account->balance,
                'transactions' => $transactions->items(),
                'pagination' => [
                    'current_page' => $transactions->currentPage(),
                    'per_page' => $transactions->perPage(),
                    'total' => $transactions->total(),
                    'last_page' => $transactions->lastPage(),
                    'from' => $transactions->firstItem(),
                    'to' => $transactions->lastItem()
                ]
            ];

        } catch (\Exception $e) {
        
            return [
                'status' => 0,
                'message' => 'Failed to retrieve transaction history',
                'error_code' => 'SYSTEM_ERROR',
                'transactions' => []
            ];
        }
    }
}

if (!function_exists('processCommissionCharge')) {
    /**
     * Global function to process commission charges for a transaction
     * 
     * @param array $commissionTransactionData
     * @return array
     */
    function processCommissionCharge($commissionTransactionData)
    {
        try {
            $accountId = $commissionTransactionData['account_id'] ?? '';
            $txnType = $commissionTransactionData['txn_type'] ?? '';
            $userId = $commissionTransactionData['user_id'] ?? '';
            $category_code = $commissionTransactionData['category_code'] ?? 'COMMISSION';
            $amount = $commissionTransactionData['amount'] ?? 0;
            $sub_module_id = $commissionTransactionData['sub_module_id'] ?? 0;
            $description = $commissionTransactionData['description'] ?? 'Commission & Charge';
            $adminId = $commissionTransactionData['admin_id'] ?? null;
            
            $users = \App\Models\User::where('id', $userId)->first();

            if ($users) {
                $rootUsers1 = $userId.','.$users->root;
                $rootUsers = explode(',', $rootUsers1);

             

                $txnStatus = 0;

                // Start database transaction
                \DB::beginTransaction();

                

                try {
                    foreach ($rootUsers as $rootUserId) {


                        
                        $amount = floatval($amount);

                        $UserRoleCommissionsIds = \App\Models\UserRoleCommission::where('user_id', $rootUserId)
                            ->where('sub_module_id', $sub_module_id)
                            ->pluck('commission_id');
                        

                        $ModuleCommissions = \App\Models\ModuleCommission::whereIn('id', $UserRoleCommissionsIds)
                            ->get();

                        

                        $calculatedCommission = 0;
                        $commissionTxnType = '';

                        // Process commission charges
                        foreach ($ModuleCommissions as $commission) {
                            $commissionTxnType = $commission->txn_type;
                            $tempCommission = 0;

                            if($commission->mode == 0){
                                if($commission->commission_type == 1) {
                                    // Calculate percentage-based commission
                                    $tempCommission = ($amount * $commission->commission) / 100;
                                } else {
                                    // Fixed amount commission
                                    $tempCommission = $commission->commission;
                                }
                            } else {
                                // For mode 1, calculate based on from_amt and to_amt
                                if ($amount >= $commission->from_amt && $amount <= $commission->to_amt) {
                                    if($commission->commission_type == 1) {
                                        // Calculate percentage-based commission
                                        $tempCommission = ($amount * $commission->commission) / 100;
                                    } else {
                                        // Fixed amount commission
                                        $tempCommission = $commission->commission;
                                    }
                                } 
                            }

                            // Accumulate commission instead of overwriting
                            $calculatedCommission += $tempCommission;
                        }

                        if($calculatedCommission > 0) {
                            $txnStatus = 1;

                            if($accountId!=''){
                                $account = \App\Models\Account::where('id', $accountId)->first();
                            } else {
                                $account = \App\Models\Account::where('user_id', $rootUserId)->where('primary_status', 1)->first();
                            }
                            
                            if($account){
                                $currentBalance = $account->balance;
                                
                                if($txnType == 'refund'){
                                    if($commissionTxnType == 'Commission') {
                                        $newBalance = $currentBalance - $calculatedCommission;
                                        $ttype = 'DR';
                                    } else {
                                        $newBalance = $currentBalance + $calculatedCommission;
                                        $ttype = 'CR';
                                    }
                                } else {
                                    if($commissionTxnType == 'Commission') {
                                        $newBalance = $currentBalance + $calculatedCommission;
                                        $ttype = 'CR';
                                    } else {
                                        $newBalance = $currentBalance - $calculatedCommission;
                                        $ttype = 'DR';
                                    }
                                }

                                // Check for negative balance in case of debit
                                if($ttype == 'DR' && $newBalance < 0) {
                                    \DB::rollBack();
                                    return [
                                        'status' => 0,
                                        'message' => 'Insufficient balance for charge deduction'
                                    ];
                                }

                                // Get COMMISSION category ID
                                $commissionCategoryId = getCategoryIdByCode($category_code);

                                $passbookData = [
                                    'account_id' => $account->id,
                                    'transaction_id' => mt_rand(11111111,99999999),
                                    'type' => $ttype,
                                    'pre_balance' => $currentBalance,
                                    'amount' => $calculatedCommission,
                                    'balance' => $newBalance,
                                    'description' => $description,
                                    'category_id' => $commissionCategoryId,
                                    'created_by' => $adminId,
                                    'admin_id' => $adminId,
                                    'user_id' => $rootUserId ?? null,
                                    'created_at' => now(),
                                    'updated_at' => now()
                                ];
                               
                                $passbook = \App\Models\Passbook::create($passbookData);

                                if($category_code == 'AEPS' || $category_code == 'CASH_DEPOSIT' || $category_code == 'MATM'){
                                    $tds = $calculatedCommission/100*2;
                                    $passbookData = [
                                        'account_id' => $account->id,
                                        'transaction_id' => mt_rand(11111111,99999999),
                                        'type' => 'DR',
                                        'pre_balance' => $newBalance,
                                        'amount' => $tds,
                                        'balance' => $newBalance - $tds,
                                        'description' => 'TDS',
                                        'category_id' => $commissionCategoryId,
                                        'created_by' => $adminId,
                                        'admin_id' => $adminId,
                                        'user_id' => $rootUserId ?? null,
                                        'created_at' => now(),
                                        'updated_at' => now()
                                    ];
                                
                                    $passbook = \App\Models\Passbook::create($passbookData);
                                }

                                // // recharge tds added on 12-01-2026 20:58 // disabled 13-01-2026 20:58
                                // if($category_code == 'RECHARGE'){

                                //     $tds = $calculatedCommission/100*2;
                                //     $passbookData = [
                                //         'account_id' => $account->id,
                                //         'transaction_id' => mt_rand(11111111,99999999),
                                //         'type' => 'DR',
                                //         'pre_balance' => $newBalance,
                                //         'amount' => $tds,
                                //         'balance' => $newBalance - $tds,
                                //         'description' => 'TDS',
                                //         'category_id' => $commissionCategoryId,
                                //         'created_by' => $adminId,
                                //         'admin_id' => $adminId,
                                //         'user_id' => $rootUserId ?? null,
                                //         'created_at' => now(),
                                //         'updated_at' => now()
                                //     ];
                                
                                //     $passbook = \App\Models\Passbook::create($passbookData);
                                // }

                                

                            }
                        }

                        if($commissionTxnType == 'Charge' && $rootUserId == $userId){
                            \DB::commit();
                            return [
                                'status' => 1,
                                'message' => 'Charge applied successfully'
                            ];        
                        }
                    }

                    \DB::commit();
                    return [
                        'status' => 1,
                        'message' => 'Commission generated successfully'
                    ];

                } catch (\Exception $e) {
                    \DB::rollBack();
                    throw $e;
                }
               
            } else {
                return [
                    'status' => 0,
                    'message' => 'User Not Found : Failed to generate commission/charge'
                ];
            }

        } catch (\Exception $e) {
            return [
                'status' => 0,
                'message' => 'Server error: Failed to generate commission/charge - ' . $e->getMessage()
            ];
        }
    }
}

if (!function_exists('sendSms')) {

    function sendSms($message,$adminId,$number,$template_id = '213181'){
        
        try {

            $setting = DB::table('settings')->where('user_id', $adminId)->first();

            if (!$setting || empty($setting->apikey)) {
                return [
                    'status' => 0,
                    'message' => 'Message settings not found'
                ];
            }

            $encoded_message = urlencode($message);
            $encoded_key = urlencode($setting->apikey);
            $encoded_sender = urlencode($setting->sender_id);
            $encoded_number = urlencode($number);

            $url = "https://www.fast2sms.com/dev/bulkV2?authorization=" . $encoded_key . "&route=dlt&sender_id=" . $encoded_sender . "&message=" . $template_id . "&variables_values=" . $encoded_message . "&numbers=" . $encoded_number . "&schedule_time=";
            //$url = "http://buzzify.in/V2/http-api.php?apikey=" . $encoded_key . "&senderid=" . $encoded_sender . "&number=" . $encoded_number . "&message=" . $encoded_message . "&format=json";

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 90); // 90 seconds timeout

            $response = curl_exec($ch);

        } catch (\Exception $e) {
        
            return [
                'status' => 0,
                'message' => 'Message not sent due to Technical issue. Please contact the administrator..'
            ];
        }
    }

}

if (!function_exists('sentMail')) {

    function sentMail($toEmail, $subject, $adminId, $message)
    {
        try {
            $setting = DB::table('settings')->where('user_id', $adminId)->first();

            if (!$setting) {
                return [
                    'status' => 0,
                    'message' => 'No email settings found for admin: ' . $adminId
                ];
            }

            // Debug each setting value
            if (!$setting->smtp_host || !$setting->smtp_user || !$setting->smtp_password) {
                return [
                    'status' => 0,
                    'message' => 'Some SMTP credentials missing',
                    'data' => $setting
                ];
            }

            $company_name = $setting->company_name ?? 'Unknown';
            $subject = $subject . ' ' . $company_name;

            $mailData = [
                'api_key' => 'mailcodeapi0001',
                'smtp_host' => $setting->smtp_host,
                'smtp_port' => $setting->smtp_port,
                'smtp_username' => $setting->smtp_user,
                'smtp_password' => $setting->smtp_password,
                'from_email' => $setting->smtp_user,
                'from_name' => $company_name,
                'to_email' => $toEmail,
                'subject' => $subject,
                'body' => urldecode($message),
                'sandbox' => 'false'
            ];


            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => 'https://enexa.in/mail/mailer/send_mail.php',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $mailData,
                CURLOPT_HTTPHEADER => [
                    'mid: ENX0000001',
                    'mkey: cNGHE78SD3Qo1qBO91w28vtddB1JAuXo'
                ],
            ]);

            return $response = curl_exec($curl);

            if (curl_errno($curl)) {
                $error_msg = 'CURL Error: ' . curl_error($curl);
                curl_close($curl);
                return [
                    'status' => 0,
                    'message' => $error_msg
                ];
            }

            curl_close($curl);

        } catch (\Throwable $e) {
            return [
                'status' => 0,
                'message' => 'Mail not sent: ' . $e->getMessage()
            ];
        }
    }

}

if (!function_exists('getMessageRow')) {
    function getMessageRow($message_name, $userId)
    {
        if (!\Schema::hasTable('messages')) {
            return (object)[
                'message' => 'Your OTP for verification is $otp.',
                'template_id' => null,
            ];
        }

        $row = \DB::table('messages')->where('name', $message_name)->where('user_id', $userId)->first();
        if (!$row) {
            $row = \DB::table('messages')->where('name', $message_name)->first();
        }
        if (!$row) {
            $row = (object)[
                'message' => 'Your OTP for verification is $otp.',
                'template_id' => null,
            ];
        }
        return $row;
    }
}




