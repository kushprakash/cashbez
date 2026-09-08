<?php

namespace App\Http\Controllers\Examples;

use App\Http\Controllers\Controller;
use App\Http\Traits\AccountBalanceTrait;
use Illuminate\Http\Request;

class TransactionExampleController extends Controller
{
    use AccountBalanceTrait;

    /**
     * Example: Mobile Recharge with MPIN validation
     */
    public function mobileRecharge(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer',
            'mpin' => 'required|string|size:4',
            'mobile_number' => 'required|string|size:10',
            'amount' => 'required|numeric|min:1'
        ]);

        // Step 1: Complete validation (MPIN + Balance + Amount)
        $validation = $this->validateAccountForTransaction($request);
        
        if ($validation['status'] == 0) {
            return response()->json([
                'status' => 0,
                'message' => $validation['message'],
                'error_type' => $this->getErrorType($validation['message']),
                'data' => $validation
            ], 400);
        }

        // Step 2: Proceed with mobile recharge
        $mobileNumber = $request->input('mobile_number');
        $amount = $request->input('amount');
        
        try {
            // Here you would call your mobile recharge API
            // $rechargeResult = $this->callMobileRechargeAPI($mobileNumber, $amount);
            
            // For demo purposes, we'll simulate success
            $rechargeResult = [
                'transaction_id' => 'TXN' . time(),
                'status' => 'SUCCESS',
                'operator' => 'Airtel',
                'circle' => 'Delhi'
            ];

            return response()->json([
                'status' => 1,
                'message' => 'Mobile recharge successful',
                'data' => [
                    'transaction_id' => $rechargeResult['transaction_id'],
                    'mobile_number' => $mobileNumber,
                    'amount' => $amount,
                    'operator' => $rechargeResult['operator'],
                    'circle' => $rechargeResult['circle'],
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
                'data' => []
            ], 500);
        }
    }

    /**
     * Example: Fund Transfer with MPIN validation
     */
    public function fundTransfer(Request $request)
    {
        $request->validate([
            'from_account_id' => 'required|integer',
            'to_account_id' => 'required|integer',
            'mpin' => 'required|string|size:4',
            'amount' => 'required|numeric|min:1'
        ]);

        // Step 1: Validate sender account
        $senderValidation = $this->validateAccountForTransaction(
            $request, 
            $request->input('from_account_id'),
            $request->input('mpin'),
            $request->input('amount')
        );
        
        if ($senderValidation['status'] == 0) {
            return response()->json([
                'status' => 0,
                'message' => 'Sender account validation failed: ' . $senderValidation['message'],
                'data' => $senderValidation
            ], 400);
        }

        // Step 2: Validate receiver account exists
        $receiverValidation = $this->getAccountBalance($request, $request->input('to_account_id'));
        
        if ($receiverValidation['status'] == 0) {
            return response()->json([
                'status' => 0,
                'message' => 'Receiver account not found',
                'data' => []
            ], 400);
        }

        // Step 3: Process transfer (simulate)
        $amount = $request->input('amount');
        
        try {
            // Here you would create debit and credit transactions
            $transferResult = [
                'transaction_id' => 'TXN' . time(),
                'status' => 'SUCCESS'
            ];

            return response()->json([
                'status' => 1,
                'message' => 'Fund transfer successful',
                'data' => [
                    'transaction_id' => $transferResult['transaction_id'],
                    'amount' => $amount,
                    'sender' => [
                        'account_id' => $senderValidation['account_id'],
                        'account_name' => $senderValidation['account_name'],
                        'remaining_balance' => $senderValidation['remaining_balance']
                    ],
                    'receiver' => [
                        'account_id' => $receiverValidation['account_id'],
                        'account_name' => $receiverValidation['account_name']
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Transfer failed: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Example: Simple MPIN validation only
     */
    public function validateMpinOnly(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer',
            'mpin' => 'required|string|size:4'
        ]);

        $mpinValidation = $this->validateAccountMpin($request);
        
        return response()->json([
            'status' => $mpinValidation['status'],
            'message' => $mpinValidation['message'],
            'data' => $mpinValidation
        ]);
    }

    /**
     * Get error type for frontend handling
     */
    private function getErrorType($message)
    {
        if (str_contains($message, 'MPIN')) {
            return 'MPIN_ERROR';
        } elseif (str_contains($message, 'balance') || str_contains($message, 'Insufficient')) {
            return 'BALANCE_ERROR';
        } elseif (str_contains($message, 'Account not found')) {
            return 'ACCOUNT_ERROR';
        } elseif (str_contains($message, 'authenticated')) {
            return 'AUTH_ERROR';
        }
        
        return 'GENERAL_ERROR';
    }
}
