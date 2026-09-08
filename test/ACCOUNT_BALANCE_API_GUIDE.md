# Account Balance API Documentation

This documentation explains how to use the global account balance functionality in your Laravel application.

## Overview

The account balance functionality provides a unified way to:
- Get account balance with hold amount consideration
- Check if an account has sufficient balance for transactions
- Get all account balances for a user
- Automatically handle authentication and permissions

## Components

### 1. ApiTokenAuth Middleware
- Automatically authenticates users via Token or MID/MKEY
- Adds account balance helper method to request object
- Location: `app/Http/Middleware/ApiTokenAuth.php`

### 2. AccountBalanceTrait
- Provides reusable methods for balance operations
- Can be used in any controller
- Location: `app/Http/Traits/AccountBalanceTrait.php`

### 3. BalanceController
- Dedicated controller for balance operations
- Location: `app/Http/Controllers/Api/BalanceController.php`

## API Endpoints

### Get Account Balance
```
GET /api/accounts/balance?account_id=123
```

**Parameters:**
- `account_id` (required): The ID of the account

**Response:**
```json
{
    "status": 1,
    "message": "Balance fetched successfully",
    "data": {
        "status": 1,
        "message": "Balance fetched successfully",
        "balance": 1000.00,
        "available_balance": 850.00,
        "hold_amount": 150.00,
        "account_id": 123,
        "account_name": "Main Account",
        "account_number": "1234567890"
    }
}
```

### Get All Account Balances
```
GET /api/accounts/balance/all
```

**Response:**
```json
{
    "status": 1,
    "message": "Account balances fetched successfully",
    "data": {
        "status": 1,
        "message": "Account balances fetched successfully",
        "accounts": [
            {
                "account_id": 123,
                "account_name": "Main Account",
                "account_number": "1234567890",
                "balance": 1000.00,
                "available_balance": 850.00,
                "hold_amount": 150.00,
                "status": 1
            }
        ],
        "total_accounts": 1
    }
}
```

### Check Sufficient Balance
```
POST /api/accounts/balance/check
```

**Parameters:**
- `account_id` (required): The ID of the account
- `amount` (required): The amount to check

**Response (Sufficient):**
```json
{
    "status": 1,
    "message": "Sufficient balance available",
    "data": {
        "status": 1,
        "message": "Sufficient balance available",
        "available_balance": 850.00,
        "required_amount": 100.00,
        "remaining_balance": 750.00
    }
}
```

**Response (Insufficient):**
```json
{
    "status": 0,
    "message": "Insufficient balance",
    "data": {
        "status": 0,
        "message": "Insufficient balance",
        "available_balance": 850.00,
        "required_amount": 1000.00,
        "shortage": 150.00
    }
}
```

### Validate MPIN
```
POST /api/accounts/mpin/validate
```

**Parameters:**
- `account_id` (required): The ID of the account
- `mpin` (required): 4-digit MPIN

**Response (Valid):**
```json
{
    "status": 1,
    "message": "MPIN validated successfully",
    "data": {
        "status": 1,
        "message": "MPIN validated successfully",
        "account_id": 123,
        "account_name": "Main Account",
        "account_number": "1234567890"
    }
}
```

**Response (Invalid):**
```json
{
    "status": 0,
    "message": "Invalid MPIN",
    "data": {
        "status": 0,
        "message": "Invalid MPIN",
        "account_id": 123
    }
}
```

### Validate Complete Transaction
```
POST /api/accounts/transaction/validate
```

**Parameters:**
- `account_id` (required): The ID of the account
- `mpin` (required): 4-digit MPIN
- `amount` (optional): Transaction amount for balance check

**Response (Valid):**
```json
{
    "status": 1,
    "message": "Account validated successfully for transaction",
    "data": {
        "status": 1,
        "message": "Account validated successfully for transaction",
        "account_id": 123,
        "account_name": "Main Account",
        "account_number": "1234567890",
        "balance": 1000.00,
        "available_balance": 850.00,
        "hold_amount": 150.00,
        "transaction_amount": 100.00,
        "remaining_balance": 750.00
    }
}
```

## Usage in Controllers

### Method 1: Using the Trait

```php
<?php

namespace App\Http\Controllers;

use App\Http\Traits\AccountBalanceTrait;
use Illuminate\Http\Request;

class YourController extends Controller
{
    use AccountBalanceTrait;

    public function someMethod(Request $request)
    {
        // Get balance for specific account
        $balanceData = $this->getAccountBalance($request, 123);
        
        // Get all account balances
        $allBalances = $this->getAllAccountBalances($request);
        
        // Check sufficient balance
        $balanceCheck = $this->checkSufficientBalance($request, 123, 100.00);
        
        // Validate MPIN only
        $mpinValidation = $this->validateAccountMpin($request, 123, '1234');
        
        // Complete transaction validation (MPIN + Balance)
        $transactionValidation = $this->validateAccountForTransaction($request, 123, '1234', 100.00);
        
        return response()->json($balanceData);
    }
}
```

### Method 2: Using the Middleware Macro

```php
public function someMethod(Request $request)
{
    // The middleware automatically adds this method to the request
    $balanceData = $request->getAccountBalance(123);
    
    return response()->json($balanceData);
}
```

### Method 3: Complete Transaction Example

```php
public function processTransaction(Request $request)
{
    $request->validate([
        'account_id' => 'required|integer',
        'mpin' => 'required|string|size:4',
        'amount' => 'required|numeric|min:0.01'
    ]);

    // Complete validation: MPIN + Balance + Amount
    $validation = $this->validateAccountForTransaction($request);
    
    if ($validation['status'] == 0) {
        return response()->json([
            'status' => 0,
            'message' => $validation['message'],
            'data' => $validation
        ], 400);
    }

    // All validations passed - proceed with transaction
    // ... your transaction logic here ...

    return response()->json([
        'status' => 1,
        'message' => 'Transaction completed successfully',
        'data' => $validation
    ]);
}
```

## Authentication

All balance endpoints require authentication via the `api.token.auth` middleware. Provide authentication in one of these ways:

### Method 1: Token Header
```
Headers:
Token: your_user_token_here
```

### Method 2: MID/MKEY Headers
```
Headers:
mid: your_mid_here
mkey: your_mkey_here
```

### Method 3: MID/MKEY in Request Body
```json
{
    "mid": "your_mid_here",
    "mkey": "your_mkey_here",
    "account_id": 123
}
```

## Balance Calculation Logic

1. **Current Balance**: Retrieved from the latest passbook transaction
2. **Hold Amount**: Amount that is held/frozen in the account
3. **Available Balance**: Current Balance - Hold Amount (minimum 0)

## Error Responses

### Authentication Error
```json
{
    "status": 0,
    "message": "Invalid token"
}
```

### Account Not Found
```json
{
    "status": 0,
    "message": "Account not found or inactive",
    "balance": 0,
    "available_balance": 0,
    "hold_amount": 0
}
```

### Missing Account ID
```json
{
    "status": 0,
    "message": "Account ID is required",
    "balance": 0,
    "available_balance": 0,
    "hold_amount": 0
}
```

### MPIN Errors
```json
{
    "status": 0,
    "message": "MPIN is required",
    "account_id": 123
}
```

```json
{
    "status": 0,
    "message": "MPIN must be 4 digits",
    "account_id": 123
}
```

```json
{
    "status": 0,
    "message": "Invalid MPIN",
    "account_id": 123
}
```

```json
{
    "status": 0,
    "message": "MPIN not set for this account",
    "account_id": 123
}
```

## Example Integration

Here's how to integrate balance checking into a mobile recharge transaction:

```php
public function processRecharge(Request $request)
{
    $accountId = $request->input('account_id');
    $amount = $request->input('amount');
    
    // Check if sufficient balance is available
    $balanceCheck = $this->checkSufficientBalance($request, $accountId, $amount);
    
    if ($balanceCheck['status'] == 0) {
        return response()->json([
            'status' => 0,
            'message' => 'Insufficient balance for recharge',
            'data' => $balanceCheck
        ], 400);
    }
    
    // Proceed with recharge transaction
    // ... your recharge logic here ...
    
    return response()->json([
        'status' => 1,
        'message' => 'Recharge completed successfully'
    ]);
}
```

## Security Features

- Accounts are filtered by authenticated user ID
- Only active accounts (status = 1) are considered
- MPIN verification is handled separately in transaction controllers
- Hold amounts are properly deducted from available balance
- All balance amounts are cast to proper decimal format

## Notes

- Balance calculation considers hold amounts automatically
- Available balance will never be negative (minimum 0)
- All monetary values are returned as decimal numbers
- Account access is restricted to the authenticated user only
- The middleware automatically handles user authentication and adds helper methods
