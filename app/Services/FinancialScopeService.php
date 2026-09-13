<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Financial\FinancialMember;
use App\Models\Financial\FinancialAccount;
use App\Models\Financial\FinancialTransaction;
use Illuminate\Support\Facades\DB;

if (!function_exists('validateTransaction')) {
    require_once app_path('Helpers/TransactionHelper.php');
}

class FinancialScopeService
{
    /**
     * Apply user_id + admin_id scope to any query builder
     */
    public static function applyScope($query, $user)
    {
        $adminId = $user->admin_id ?? ($user->role == 2 ? $user->id : 1);
        return $query->where('user_id', $user->id)
                     ->where('admin_id', $adminId);
    }

    /**
     * Get the Agent's Utility Wallet (primary_status = 0 / false)
     */
    public static function getUtilityWallet($user)
    {
        return Account::where('user_id', $user->id)
                      ->where('primary_status', false)
                      ->first();
    }

    /**
     * Verify Agent MPIN & Debit Utility Wallet for a transaction
     */
    public static function processUtilityWalletDebit($request, $user, $mpin, $amount, $description, $txnId)
    {
        $wallet = self::getUtilityWallet($user);

        if (!$wallet) {
            return [
                'status' => 0,
                'message' => 'Utility Wallet (primary_status=0) not found for your account.'
            ];
        }

        if (empty($mpin)) {
            return [
                'status' => 0,
                'message' => 'MPIN is required for Utility Wallet transaction.'
            ];
        }

        $txnData = [
            'account_id' => $wallet->id,
            'mpin' => $mpin,
            'type' => 'DR',
            'amount' => floatval($amount),
            'description' => $description,
            'transaction_id' => $txnId,
            'category_code' => 'FINANCIAL'
        ];

        $res = processTransaction($request, $txnData, true);

        if (isset($res['status']) && $res['status'] == 0) {
            return [
                'status' => 0,
                'message' => $res['message'] ?? 'Utility Wallet debit failed.'
            ];
        }

        return [
            'status' => 1,
            'message' => 'Utility Wallet debited successfully.',
            'wallet' => $wallet,
            'result' => $res
        ];
    }

    /**
     * Generate unique sequential Member ID (e.g. MEM-2026-000001)
     */
    public static function generateMemberId()
    {
        $year = date('Y');
        $count = FinancialMember::whereYear('created_at', $year)->count() + 1;
        return sprintf('MEM-%s-%06d', $year, $count);
    }

    /**
     * Generate unique sequential Financial Account Number (e.g. SB-2026-000001, DD-2026-000001)
     */
    public static function generateAccountNumber($serviceType = 'SB')
    {
        $prefix = strtoupper($serviceType);
        $year = date('Y');
        $count = FinancialAccount::where('service_type', $serviceType)
                                 ->whereYear('created_at', $year)
                                 ->count() + 1;
        return sprintf('%s-%s-%06d', $prefix, $year, $count);
    }

    /**
     * Generate unique Transaction ID (e.g. TXN-FIN-20260915-XXXXX)
     */
    public static function generateTxnId()
    {
        return 'TXN-FIN-' . date('YmdHis') . '-' . rand(1000, 9999);
    }
}
