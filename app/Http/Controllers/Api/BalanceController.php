<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\AccountBalanceTrait;
use Illuminate\Http\Request;

class BalanceController extends Controller
{
    use AccountBalanceTrait;

    /**
     * Get account balance for specific account
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBalance(Request $request)
    {
        // Method 1: Using the trait
        $balanceData = $this->getAccountBalance($request);
        
        return response()->json([
            'status' => $balanceData['status'],
            'message' => $balanceData['message'],
            'data' => $balanceData
        ]);
    }

    /**
     * Get account balance using middleware helper (Alternative method)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBalanceViaMiddleware(Request $request)
    {
        // Method 2: Using the middleware macro
        $balanceData = $request->getAccountBalance();
        
        return response()->json([
            'status' => $balanceData['status'],
            'message' => $balanceData['message'],
            'data' => $balanceData
        ]);
    }

    /**
     * Get all account balances for authenticated user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllBalances(Request $request)
    {
        $balanceData = $this->getAllAccountBalances($request);
        
        return response()->json([
            'status' => $balanceData['status'],
            'message' => $balanceData['message'],
            'data' => $balanceData
        ]);
    }

    /**
     * Check if account has sufficient balance for transaction
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkSufficientBalance(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer',
            'amount' => 'required|numeric|min:0.01'
        ]);

        $accountId = $request->input('account_id');
        $amount = $request->input('amount');

        $balanceData = $this->checkSufficientBalance($request, $accountId, $amount);
        
        return response()->json([
            'status' => $balanceData['status'],
            'message' => $balanceData['message'],
            'data' => $balanceData
        ]);
    }

    /**
     * Validate MPIN for account
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validateMpin(Request $request)
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
     * Validate complete transaction using global validateTransaction function
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validateTransaction(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer',
            'mpin' => 'required|string|size:4',
            'amount' => 'required|numeric|min:0.01'
        ]);

        // Use global validateTransaction function
        $validation = validateTransaction($request);
        
        return response()->json([
            'status' => $validation['status'],
            'message' => $validation['message'],
            'data' => $validation
        ]);
    }

    /**
     * Alternative endpoint for global transaction validation
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function globalValidateTransaction(Request $request)
    {
        // Direct call to global function without any validation
        // The global function handles all validations internally
        $validation = validateTransaction($request);
        
        return response()->json($validation);
    }
}
