<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MobileRechargeController extends Controller
{
    /**
     * Process mobile recharge using global validateTransaction function
     */
    public function processRecharge(Request $request)
    {
        $request->validate([
            'mobile_number' => 'required|string|size:10',
            'operator' => 'required|string',
            'circle' => 'required|string'
        ]);

        // Step 1: Use global validateTransaction function
        // No imports needed, no traits needed, direct call
        $validation = validateTransaction($request);
        
        if ($validation['status'] == 0) {
            return response()->json([
                'status' => 0,
                'message' => $validation['message'],
                'error_code' => $validation['error_code'],
                'balance' => $validation['balance'],
                'available_balance' => $validation['available_balance']
            ], 400);
        }

        // Step 2: All validations passed, process recharge
        $mobileNumber = $request->input('mobile_number');
        $operator = $request->input('operator');
        $circle = $request->input('circle');
        $amount = $validation['transaction_amount'];

        try {
            // Simulate recharge API call
            $rechargeData = [
                'transaction_id' => 'MR' . time() . rand(1000, 9999),
                'mobile_number' => $mobileNumber,
                'operator' => $operator,
                'circle' => $circle,
                'amount' => $amount,
                'status' => 'SUCCESS',
                'timestamp' => now()->toISOString()
            ];

            return response()->json([
                'status' => 1,
                'message' => 'Mobile recharge successful',
                'data' => [
                    'recharge' => $rechargeData,
                    'account' => [
                        'account_id' => $validation['account_id'],
                        'account_name' => $validation['account_name'],
                        'previous_balance' => $validation['balance'],
                        'remaining_balance' => $validation['remaining_balance']
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Recharge failed',
                'error_code' => 'RECHARGE_API_ERROR'
            ], 500);
        }
    }

    /**
     * Fund transfer using global validateTransaction function
     */
    public function fundTransfer(Request $request)
    {
        $request->validate([
            'to_account_id' => 'required|integer',
            'transfer_type' => 'required|in:internal,external'
        ]);

        // Step 1: Validate sender account using global function
        $senderValidation = validateTransaction($request);
        
        if ($senderValidation['status'] == 0) {
            return response()->json([
                'status' => 0,
                'message' => 'Sender validation failed: ' . $senderValidation['message'],
                'error_code' => $senderValidation['error_code']
            ], 400);
        }

        // Step 2: Process fund transfer
        $toAccountId = $request->input('to_account_id');
        $amount = $senderValidation['transaction_amount'];

        try {
            // Simulate transfer
            $transferData = [
                'transaction_id' => 'FT' . time() . rand(1000, 9999),
                'from_account' => $senderValidation['account_id'],
                'to_account' => $toAccountId,
                'amount' => $amount,
                'status' => 'SUCCESS',
                'timestamp' => now()->toISOString()
            ];

            return response()->json([
                'status' => 1,
                'message' => 'Fund transfer successful',
                'data' => [
                    'transfer' => $transferData,
                    'sender_account' => [
                        'account_id' => $senderValidation['account_id'],
                        'account_name' => $senderValidation['account_name'],
                        'remaining_balance' => $senderValidation['remaining_balance']
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Transfer failed',
                'error_code' => 'TRANSFER_ERROR'
            ], 500);
        }
    }

    /**
     * Bill payment using global validateTransaction function
     */
    public function billPayment(Request $request)
    {
        $request->validate([
            'bill_type' => 'required|in:electricity,gas,water,internet',
            'bill_number' => 'required|string',
            'service_provider' => 'required|string'
        ]);

        // Use global validateTransaction function
        $validation = validateTransaction($request);
        
        if ($validation['status'] == 0) {
            return response()->json([
                'status' => 0,
                'message' => $validation['message'],
                'error_code' => $validation['error_code']
            ], 400);
        }

        // Process bill payment
        $billType = $request->input('bill_type');
        $billNumber = $request->input('bill_number');
        $serviceProvider = $request->input('service_provider');
        $amount = $validation['transaction_amount'];

        try {
            $billPaymentData = [
                'transaction_id' => 'BP' . time() . rand(1000, 9999),
                'bill_type' => $billType,
                'bill_number' => $billNumber,
                'service_provider' => $serviceProvider,
                'amount' => $amount,
                'status' => 'SUCCESS',
                'timestamp' => now()->toISOString()
            ];

            return response()->json([
                'status' => 1,
                'message' => 'Bill payment successful',
                'data' => [
                    'payment' => $billPaymentData,
                    'account' => [
                        'account_id' => $validation['account_id'],
                        'account_name' => $validation['account_name'],
                        'remaining_balance' => $validation['remaining_balance']
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Bill payment failed',
                'error_code' => 'BILL_PAYMENT_ERROR'
            ], 500);
        }
    }

    /**
     * Simple transaction validation check
     */
    public function validateOnly(Request $request)
    {
        // Just validate without processing
        $validation = validateTransaction($request);
        
        return response()->json($validation);
    }
}
