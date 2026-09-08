# Global validateTransaction Function Documentation

## Overview

The `validateTransaction()` function is a comprehensive, globally accessible function that validates all aspects of a financial transaction including:
- User authentication
- Account validation
- Account status checking
- MPIN verification
- Balance validation
- Security checks
- Anti-fraud measures

## Features

✅ **No Imports Required** - Global function accessible anywhere  
✅ **Comprehensive Security** - Multiple validation layers  
✅ **Balance Calculation** - Handles hold amounts automatically  
✅ **Account Status Check** - Returns zero balance for inactive accounts  
✅ **MPIN Verification** - Secure 4-digit PIN validation  
✅ **Anti-Fraud Protection** - Rate limiting and security checks  
✅ **Error Codes** - Specific error codes for different scenarios  

## Function Signature

```php
validateTransaction($request, $accountId = null, $mpin = null, $amount = null)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `$request` | Request | Yes | Laravel Request object (with user data from middleware) |
| `$accountId` | int | Optional | Account ID (can be passed or taken from request) |
| `$mpin` | string | Optional | 4-digit MPIN (can be passed or taken from request) |
| `$amount` | float | Optional | Transaction amount (can be passed or taken from request) |

## Usage Examples

### Method 1: Direct Function Call (Recommended)

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function processPayment(Request $request)
    {
        // Direct call - no imports, no traits needed
        $validation = validateTransaction($request);
        
        if ($validation['status'] == 0) {
            return response()->json([
                'status' => 0,
                'message' => $validation['message'],
                'error_code' => $validation['error_code']
            ], 400);
        }

        // Proceed with payment processing
        // All validations passed
        return response()->json([
            'status' => 1,
            'message' => 'Payment successful'
        ]);
    }
}
```

### Method 2: With Parameters

```php
public function mobileRecharge(Request $request)
{
    $accountId = $request->input('account_id');
    $mpin = $request->input('mpin');
    $amount = $request->input('amount');
    
    // Pass parameters directly
    $validation = validateTransaction($request, $accountId, $mpin, $amount);
    
    if ($validation['status'] == 1) {
        // Process recharge
        $remainingBalance = $validation['remaining_balance'];
        // ... recharge logic
    }
}
```

## Response Format

### Success Response
```json
{
    "status": 1,
    "message": "Transaction validation successful",
    "error_code": null,
    "account_id": 123,
    "account_name": "Main Account",
    "account_number": "1234567890",
    "balance": 1000.00,
    "available_balance": 850.00,
    "hold_amount": 150.00,
    "transaction_amount": 100.00,
    "remaining_balance": 750.00,
    "validated_at": "2025-08-16T10:30:00.000Z",
    "user_id": 456
}
```

### Error Response
```json
{
    "status": 0,
    "message": "Insufficient balance for transaction",
    "error_code": "INSUFFICIENT_BALANCE",
    "balance": 500.00,
    "available_balance": 350.00,
    "required_amount": 1000.00,
    "shortage": 650.00
}
```

## Error Codes

| Error Code | Description | Message |
|------------|-------------|---------|
| `ACCOUNT_ID_REQUIRED` | Account ID missing | Account ID is required |
| `MPIN_REQUIRED` | MPIN missing | MPIN is required |
| `AMOUNT_REQUIRED` | Amount missing | Transaction amount is required |
| `INVALID_ACCOUNT_ID` | Invalid account ID format | Invalid account ID |
| `INVALID_MPIN_FORMAT` | MPIN format invalid | MPIN must be exactly 4 digits |
| `INVALID_AMOUNT` | Amount invalid | Transaction amount must be greater than zero |
| `AMOUNT_TOO_LOW` | Amount below minimum | Minimum transaction amount is 0.01 |
| `AMOUNT_TOO_HIGH` | Amount above maximum | Maximum transaction amount is 100,000 |
| `USER_NOT_AUTHENTICATED` | User not authenticated | User not authenticated |
| `ACCOUNT_NOT_FOUND` | Account doesn't exist | Account not found or unauthorized access |
| `ACCOUNT_INACTIVE` | Account is inactive | Account is inactive or suspended |
| `MPIN_NOT_SET` | MPIN not configured | MPIN not set for this account |
| `INVALID_MPIN` | Wrong MPIN | Invalid MPIN |
| `INSUFFICIENT_BALANCE` | Not enough balance | Insufficient balance for transaction |
| `RATE_LIMIT_EXCEEDED` | Too many transactions | Too many transactions in short time |
| `SYSTEM_ERROR` | Technical error | Transaction validation failed due to system error |

## Security Features

### 1. Input Validation
- Account ID must be positive integer
- MPIN must be exactly 4 digits
- Amount must be positive and within limits
- No SQL injection or XSS vulnerabilities

### 2. Account Security
- User ownership verification
- Account status checking
- Inactive accounts return zero balance

### 3. Balance Protection
- Hold amount consideration
- Minimum/Maximum transaction limits
- Negative balance prevention

### 4. Anti-Fraud Measures
- Rate limiting (max 10 transactions per 5 minutes)
- Transaction amount limits
- User authentication requirements

### 5. MPIN Security
- Encrypted storage
- Secure verification
- Format validation

## Real-World Examples

### Mobile Recharge
```php
public function mobileRecharge(Request $request)
{
    // Validate transaction
    $validation = validateTransaction($request);
    
    if ($validation['status'] == 0) {
        return response()->json($validation, 400);
    }

    // Process recharge
    $mobile = $request->input('mobile_number');
    $amount = $validation['transaction_amount'];
    
    // Call recharge API
    $result = $this->callRechargeAPI($mobile, $amount);
    
    return response()->json([
        'status' => 1,
        'message' => 'Recharge successful',
        'remaining_balance' => $validation['remaining_balance']
    ]);
}
```

### Fund Transfer
```php
public function fundTransfer(Request $request)
{
    // Validate sender account
    $validation = validateTransaction($request);
    
    if ($validation['status'] == 0) {
        return response()->json([
            'status' => 0,
            'message' => 'Sender validation failed: ' . $validation['message'],
            'error_code' => $validation['error_code']
        ], 400);
    }

    // Process transfer
    $toAccount = $request->input('to_account_id');
    $amount = $validation['transaction_amount'];
    
    // Transfer logic here
    
    return response()->json([
        'status' => 1,
        'message' => 'Transfer successful'
    ]);
}
```

### Bill Payment
```php
public function billPayment(Request $request)
{
    $validation = validateTransaction($request);
    
    if ($validation['status'] == 0) {
        return response()->json($validation, 400);
    }

    // Process bill payment
    $billNumber = $request->input('bill_number');
    $amount = $validation['transaction_amount'];
    
    // Payment processing logic
    
    return response()->json([
        'status' => 1,
        'message' => 'Bill payment successful'
    ]);
}
```

## API Endpoints

### Global Validation Endpoint
```
POST /api/accounts/global/validate
```

**Request:**
```json
{
    "account_id": 123,
    "mpin": "1234",
    "amount": 100.50
}
```

**Success Response:**
```json
{
    "status": 1,
    "message": "Transaction validation successful",
    "account_id": 123,
    "balance": 1000.00,
    "available_balance": 850.00,
    "remaining_balance": 749.50
}
```

## Installation Notes

The function is automatically loaded via Composer autoload. No manual imports required.

**File Location:** `app/Helpers/TransactionHelper.php`  
**Autoload:** Added to `composer.json` files array  
**Global Access:** Available in all controllers without imports  

## Best Practices

1. **Always check return status:**
   ```php
   $validation = validateTransaction($request);
   if ($validation['status'] == 0) {
       // Handle error
       return response()->json($validation, 400);
   }
   ```

2. **Use error codes for specific handling:**
   ```php
   if ($validation['error_code'] == 'INSUFFICIENT_BALANCE') {
       // Redirect to add money page
   }
   ```

3. **Log failed validations:**
   ```php
   if ($validation['status'] == 0) {
       Log::warning('Transaction validation failed', $validation);
   }
   ```

4. **Always use remaining_balance from response:**
   ```php
   $newBalance = $validation['remaining_balance'];
   // Don't calculate manually
   ```

## Testing

```php
// Test with valid data
$request = Request::create('/', 'POST', [
    'account_id' => 1,
    'mpin' => '1234',
    'amount' => 100
]);

$result = validateTransaction($request);
// Result should have status = 1 for valid data
```

This global function provides enterprise-level security and validation for all financial transactions in your application.
