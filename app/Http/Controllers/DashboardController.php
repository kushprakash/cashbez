<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Account;
use App\Models\AepsDraft;
use App\Models\AepsTransaction;
use App\Models\CashDeposit;
use App\Models\Recharge;
use App\Models\Payout;
use App\Models\Passbook;
use App\Models\AccountsAddMoney;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Role-based query filter closure helper
     */
    private function getRoleBasedFilter($user, $userColumn = 'user_id', $useIdForUser = true)
    {
        return function ($query) use ($user, $userColumn, $useIdForUser) {
            $userRole = (int) ($user->role ?? 0);
            $userId = (int) ($user->id ?? 0);

            if ($userRole === 1 || $userRole === 0 || $userId === 1) {
                // Role 1 (Super Admin / Master Admin) or User ID 1: NO WHERE FILTER AT ALL! Returns ALL system-wide data!
                return $query;
            } elseif ($userRole === 2) {
                // Role 2 (Admin): Filter by admin_mid
                $adminUserIds = User::where('admin_mid', $user->mid)->pluck('id')->toArray();
                $adminUserIds[] = $userId;
                if ($userColumn === 'mid') {
                    $adminMids = User::whereIn('id', $adminUserIds)->pluck('mid')->toArray();
                    return $query->whereIn('mid', $adminMids);
                }
                return $query->whereIn($userColumn, $adminUserIds);
            } else {
                // Retailer / Regular User: Filter strictly by their own user_id or mid
                $userValue = $useIdForUser ? $userId : $user->mid;
                return $query->where($userColumn, $userValue);
            }
        };
    }

    /**
     * Highly Optimized Dashboard API Endpoint
     */
    public function index(Request $request)
    {
        $user = $request->get('user');
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'User not authenticated'], 401);
        }

        $userId = $user->id;
        $userMid = $user->mid;
        $userRole = (int) $user->role;
        $filter = $this->getRoleBasedFilter($user);
        $aepsFilter = $this->getRoleBasedFilter($user, 'mid', false);

        $today = Carbon::today()->toDateTimeString();
        $thisMonth = Carbon::now()->startOfMonth()->toDateTimeString();
        $thisYear = Carbon::now()->startOfYear()->toDateTimeString();

        try {
            // 1. AEPS Aggregation (Single SQL Query)
            $aepsData = [
                'cw' => $this->emptyPeriodStructure(true),
                'ap' => $this->emptyPeriodStructure(true),
                'be' => $this->emptyPeriodStructure(false),
                'ms' => $this->emptyPeriodStructure(false),
            ];
            $aepsTypeMap = ['CW' => 'cw', 'AP' => 'ap', 'BE' => 'be', 'MS' => 'ms'];

            $aepsAgg = AepsTransaction::where($aepsFilter)
                ->selectRaw('
                    aeps_type,
                    response_status,
                    COUNT(*) as total_count,
                    COALESCE(SUM(amount), 0) as total_amount,
                    COUNT(CASE WHEN created_at >= ? THEN 1 END) as today_count,
                    COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as today_amount,
                    COUNT(CASE WHEN created_at >= ? THEN 1 END) as month_count,
                    COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as month_amount,
                    COUNT(CASE WHEN created_at >= ? THEN 1 END) as year_count,
                    COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as year_amount
                ', [$today, $today, $thisMonth, $thisMonth, $thisYear, $thisYear])
                ->groupBy('aeps_type', 'response_status')
                ->get();

            foreach ($aepsAgg as $row) {
                $key = $aepsTypeMap[$row->aeps_type] ?? null;
                if (!$key) continue;

                $status = $row->response_status ? 'success' : 'failed';
                $incAmt = in_array($row->aeps_type, ['CW', 'AP']);

                $aepsData[$key]['total'][$status]['count'] += (int)$row->total_count;
                $aepsData[$key]['today'][$status]['count'] += (int)$row->today_count;
                $aepsData[$key]['this_month'][$status]['count'] += (int)$row->month_count;
                $aepsData[$key]['this_year'][$status]['count'] += (int)$row->year_count;

                if ($incAmt) {
                    $aepsData[$key]['total'][$status]['amount'] += (float)$row->total_amount;
                    $aepsData[$key]['today'][$status]['amount'] += (float)$row->today_amount;
                    $aepsData[$key]['this_month'][$status]['amount'] += (float)$row->month_amount;
                    $aepsData[$key]['this_year'][$status]['amount'] += (float)$row->year_amount;
                }
            }

            // 2. Cash Deposit Aggregation (Single SQL Query)
            $cashDepositData = $this->emptyPeriodStructure(true);
            $cashAgg = CashDeposit::where($aepsFilter)
                ->selectRaw('
                    status,
                    COUNT(*) as total_count,
                    COALESCE(SUM(amount), 0) as total_amount,
                    COUNT(CASE WHEN created_at >= ? THEN 1 END) as today_count,
                    COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as today_amount,
                    COUNT(CASE WHEN created_at >= ? THEN 1 END) as month_count,
                    COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as month_amount,
                    COUNT(CASE WHEN created_at >= ? THEN 1 END) as year_count,
                    COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as year_amount
                ', [$today, $today, $thisMonth, $thisMonth, $thisYear, $thisYear])
                ->groupBy('status')
                ->get();

            foreach ($cashAgg as $row) {
                $status = ($row->status === 'success' || $row->status === '1' || $row->status === 1) ? 'success' : (($row->status === 'failed' || $row->status === '0' || $row->status === 0) ? 'failed' : 'pending');
                $cashDepositData['total'][$status]['count'] += (int)$row->total_count;
                $cashDepositData['total'][$status]['amount'] += (float)$row->total_amount;
                $cashDepositData['today'][$status]['count'] += (int)$row->today_count;
                $cashDepositData['today'][$status]['amount'] += (float)$row->today_amount;
                $cashDepositData['this_month'][$status]['count'] += (int)$row->month_count;
                $cashDepositData['this_month'][$status]['amount'] += (float)$row->month_amount;
                $cashDepositData['this_year'][$status]['count'] += (int)$row->year_count;
                $cashDepositData['this_year'][$status]['amount'] += (float)$row->year_amount;
            }

            // 3. Utility / Recharge Aggregation (Single SQL Query)
            $utilityData = [
                'mobile' => $this->emptyPeriodStructure(true),
                'dth' => $this->emptyPeriodStructure(true),
                'bill' => $this->emptyPeriodStructure(true),
            ];
            $utilityTypeMap = [1 => 'mobile', 2 => 'dth', 3 => 'bill'];

            $rechargeAgg = Recharge::where($filter)
                ->selectRaw('
                    type,
                    status,
                    COUNT(*) as total_count,
                    COALESCE(SUM(amount), 0) as total_amount,
                    COUNT(CASE WHEN created_at >= ? THEN 1 END) as today_count,
                    COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as today_amount,
                    COUNT(CASE WHEN created_at >= ? THEN 1 END) as month_count,
                    COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as month_amount,
                    COUNT(CASE WHEN created_at >= ? THEN 1 END) as year_count,
                    COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as year_amount
                ', [$today, $today, $thisMonth, $thisMonth, $thisYear, $thisYear])
                ->groupBy('type', 'status')
                ->get();

            foreach ($rechargeAgg as $row) {
                $key = $utilityTypeMap[$row->type] ?? null;
                if (!$key) continue;

                $status = ($row->status === 'success' || $row->status === '1' || $row->status === 1) ? 'success' : (($row->status === 'failed' || $row->status === '0' || $row->status === 0) ? 'failed' : 'pending');
                $utilityData[$key]['total'][$status]['count'] += (int)$row->total_count;
                $utilityData[$key]['total'][$status]['amount'] += (float)$row->total_amount;
                $utilityData[$key]['today'][$status]['count'] += (int)$row->today_count;
                $utilityData[$key]['today'][$status]['amount'] += (float)$row->today_amount;
                $utilityData[$key]['this_month'][$status]['count'] += (int)$row->month_count;
                $utilityData[$key]['this_month'][$status]['amount'] += (float)$row->month_amount;
                $utilityData[$key]['this_year'][$status]['count'] += (int)$row->year_count;
                $utilityData[$key]['this_year'][$status]['amount'] += (float)$row->year_amount;
            }

            // 4. Payout Aggregation (Single SQL Query)
            $payoutData = $this->emptyPeriodStructure(true);
            $payoutAgg = Payout::where($filter)
                ->selectRaw('
                    status,
                    COUNT(*) as total_count,
                    COALESCE(SUM(amount), 0) as total_amount,
                    COUNT(CASE WHEN created_at >= ? THEN 1 END) as today_count,
                    COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as today_amount,
                    COUNT(CASE WHEN created_at >= ? THEN 1 END) as month_count,
                    COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as month_amount,
                    COUNT(CASE WHEN created_at >= ? THEN 1 END) as year_count,
                    COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as year_amount
                ', [$today, $today, $thisMonth, $thisMonth, $thisYear, $thisYear])
                ->groupBy('status')
                ->get();

            foreach ($payoutAgg as $row) {
                $status = ($row->status === 'success' || $row->status === '1' || $row->status === 1) ? 'success' : (($row->status === 'failed' || $row->status === '0' || $row->status === 0) ? 'failed' : 'pending');
                $payoutData['total'][$status]['count'] += (int)$row->total_count;
                $payoutData['total'][$status]['amount'] += (float)$row->total_amount;
                $payoutData['today'][$status]['count'] += (int)$row->today_count;
                $payoutData['today'][$status]['amount'] += (float)$row->today_amount;
                $payoutData['this_month'][$status]['count'] += (int)$row->month_count;
                $payoutData['this_month'][$status]['amount'] += (float)$row->month_amount;
                $payoutData['this_year'][$status]['count'] += (int)$row->year_count;
                $payoutData['this_year'][$status]['amount'] += (float)$row->year_amount;
            }

            // 5. Add Fund Aggregation (Query active add_funds table with fallback to accounts_add_money)
            $addFundData = $this->emptyPeriodStructure(true);
            try {
                $addFundAgg = null;
                if (DB::getSchemaBuilder()->hasTable('add_funds')) {
                    $addFundAgg = DB::table('add_funds')
                        ->where($filter)
                        ->selectRaw('
                            status,
                            COUNT(*) as total_count,
                            COALESCE(SUM(amount), 0) as total_amount,
                            COUNT(CASE WHEN created_at >= ? THEN 1 END) as today_count,
                            COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as today_amount,
                            COUNT(CASE WHEN created_at >= ? THEN 1 END) as month_count,
                            COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as month_amount,
                            COUNT(CASE WHEN created_at >= ? THEN 1 END) as year_count,
                            COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as year_amount
                        ', [$today, $today, $thisMonth, $thisMonth, $thisYear, $thisYear])
                        ->groupBy('status')
                        ->get();
                }

                if ((!$addFundAgg || $addFundAgg->isEmpty()) && DB::getSchemaBuilder()->hasTable('accounts_add_money')) {
                    $addFundAgg = DB::table('accounts_add_money')
                        ->where($filter)
                        ->selectRaw('
                            status,
                            COUNT(*) as total_count,
                            COALESCE(SUM(amount), 0) as total_amount,
                            COUNT(CASE WHEN created_at >= ? THEN 1 END) as today_count,
                            COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as today_amount,
                            COUNT(CASE WHEN created_at >= ? THEN 1 END) as month_count,
                            COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as month_amount,
                            COUNT(CASE WHEN created_at >= ? THEN 1 END) as year_count,
                            COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as year_amount
                        ', [$today, $today, $thisMonth, $thisMonth, $thisYear, $thisYear])
                        ->groupBy('status')
                        ->get();
                }

                if ($addFundAgg) {
                    foreach ($addFundAgg as $row) {
                        $stRaw = strtoupper((string)$row->status);
                        $status = ($stRaw === 'SUCCESS' || $stRaw === '1' || $stRaw === 'APPROVED' || $stRaw === 'COMPLETED') ? 'success' : (($stRaw === 'FAILED' || $stRaw === '0' || $stRaw === 'REJECTED') ? 'failed' : 'pending');
                        $addFundData['total'][$status]['count'] += (int)$row->total_count;
                        $addFundData['total'][$status]['amount'] += (float)$row->total_amount;
                        $addFundData['today'][$status]['count'] += (int)$row->today_count;
                        $addFundData['today'][$status]['amount'] += (float)$row->today_amount;
                        $addFundData['this_month'][$status]['count'] += (int)$row->month_count;
                        $addFundData['this_month'][$status]['amount'] += (float)$row->month_amount;
                        $addFundData['this_year'][$status]['count'] += (int)$row->year_count;
                        $addFundData['this_year'][$status]['amount'] += (float)$row->year_amount;
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Add fund aggregation error: ' . $e->getMessage());
            }

            // 5b. Virtual Account Transactions (VA / QR Code Txns Aggregation)
            $vaTxnData = $this->emptyPeriodStructure(true);
            try {
                $vaFilter = $this->getRoleBasedFilter($user, 'mid', false);
                $vaTxnAgg = DB::table('vpa_transaction')
                    ->where($vaFilter)
                    ->selectRaw('
                        status,
                        COUNT(*) as total_count,
                        COALESCE(SUM(amount), 0) as total_amount,
                        COUNT(CASE WHEN created_at >= ? THEN 1 END) as today_count,
                        COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as today_amount,
                        COUNT(CASE WHEN created_at >= ? THEN 1 END) as month_count,
                        COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as month_amount,
                        COUNT(CASE WHEN created_at >= ? THEN 1 END) as year_count,
                        COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as year_amount
                    ', [$today, $today, $thisMonth, $thisMonth, $thisYear, $thisYear])
                    ->groupBy('status')
                    ->get();

                foreach ($vaTxnAgg as $row) {
                    $stRaw = strtoupper((string)$row->status);
                    $status = ($stRaw === 'SUCCESS' || $stRaw === '1') ? 'success' : (($stRaw === 'FAILED' || $stRaw === '0' || $stRaw === 'REFUNDED') ? 'failed' : 'pending');
                    $vaTxnData['total'][$status]['count'] += (int)$row->total_count;
                    $vaTxnData['total'][$status]['amount'] += (float)$row->total_amount;
                    $vaTxnData['today'][$status]['count'] += (int)$row->today_count;
                    $vaTxnData['today'][$status]['amount'] += (float)$row->today_amount;
                    $vaTxnData['this_month'][$status]['count'] += (int)$row->month_count;
                    $vaTxnData['this_month'][$status]['amount'] += (float)$row->month_amount;
                    $vaTxnData['this_year'][$status]['count'] += (int)$row->year_count;
                    $vaTxnData['this_year'][$status]['amount'] += (float)$row->year_amount;
                }
            } catch (\Exception $e) {
                Log::warning('Virtual account transactions aggregation error: ' . $e->getMessage());
            }

            // 6. User Accounts & Balances (Optimized 1 Query with MAX(id) Passbook Join)
            $accountsQuery = DB::table('accounts');
            if ($userRole === 1 || $userId === 1) {
                // Role 1 / Super Admin: NO FILTER! Returns ALL accounts in system!
            } elseif ($userRole === 2) {
                // Role 2 / Admin: Filter by admin_mid
                $adminUserIds = User::where('admin_mid', $userMid)->pluck('id')->toArray();
                $adminUserIds[] = $userId;
                $accountsQuery->whereIn('user_id', $adminUserIds);
            } else {
                // Retailer / Regular User: Filter strictly by own user_id
                $accountsQuery->where('user_id', $userId);
            }
            $accounts = $accountsQuery->select('id', 'name', 'number', 'primary_status', 'hold_amount', 'status', 'user_id')->get();

            $accountIds = $accounts->pluck('id')->toArray();
            $latestBalances = [];
            if (!empty($accountIds)) {
                $latestBalances = DB::table('passbooks as p')
                    ->whereIn('p.id', function ($sub) use ($accountIds) {
                        $sub->selectRaw('MAX(id)')
                            ->from('passbooks')
                            ->whereIn('account_id', $accountIds)
                            ->groupBy('account_id');
                    })
                    ->pluck('balance', 'account_id')
                    ->toArray();
            }

            $totalAccountBalance = 0.0;
            $totalHoldAmount = 0.0;
            $activeCount = 0;
            $inactiveCount = 0;

            $tradeWallet = [
                'count' => 0,
                'total_balance' => 0.0,
                'hold_balance' => 0.0,
                'available_balance' => 0.0,
            ];

            $utilityWallet = [
                'count' => 0,
                'total_balance' => 0.0,
                'hold_balance' => 0.0,
                'available_balance' => 0.0,
            ];

            $userWallets = $accounts->map(function ($acc) use ($latestBalances, &$totalAccountBalance, &$totalHoldAmount, &$activeCount, &$inactiveCount, &$tradeWallet, &$utilityWallet) {
                $bal = (float)($latestBalances[$acc->id] ?? 0);
                $hold = (float)($acc->hold_amount ?? 0);
                $avail = $bal - $hold;
                $isPrimary = ($acc->primary_status == 1 || $acc->primary_status === true || $acc->primary_status === '1');

                $totalAccountBalance += $bal;
                $totalHoldAmount += $hold;
                if ($acc->status == 1) $activeCount++; else $inactiveCount++;

                if ($isPrimary) {
                    $tradeWallet['count']++;
                    $tradeWallet['total_balance'] += $bal;
                    $tradeWallet['hold_balance'] += $hold;
                    $tradeWallet['available_balance'] += $avail;
                } else {
                    $utilityWallet['count']++;
                    $utilityWallet['total_balance'] += $bal;
                    $utilityWallet['hold_balance'] += $hold;
                    $utilityWallet['available_balance'] += $avail;
                }

                return [
                    'id' => $acc->id,
                    'name' => $acc->name,
                    'number' => '****' . substr($acc->number, -4),
                    'primary_status' => $isPrimary,
                    'is_primary' => $isPrimary,
                    'wallet_type' => $isPrimary ? 'Trade Wallet' : 'Utility Wallet',
                    'balance' => $bal,
                    'raw_balance' => $bal,
                    'raw_available_balance' => $avail,
                    'available_balance' => $avail,
                    'hold_amount' => $hold,
                ];
            });

            $accountStats = [
                'count' => $accounts->count(),
                'total_balance' => $totalAccountBalance,
                'hold_balance' => $totalHoldAmount,
                'available_balance' => $totalAccountBalance - $totalHoldAmount,
                'active_accounts' => $activeCount,
                'inactive_accounts' => $inactiveCount,
                'trade_wallet' => $tradeWallet,
                'utility_wallet' => $utilityWallet,
            ];

            // 7. Virtual Account (VA Data)
            $vaData = DB::table('va')->where('mid', $userMid)->first();
            if (!$vaData && ($userRole === 1 || $userId === 1)) {
                $vaData = DB::table('va')->first();
            }

            // 8. User KYC Account
            $kycAccount = DB::table('user_kyc')
                ->where('user_id', $userId)
                ->select('name', 'account_number', 'ifsc_code', 'bank_name')
                ->first();

            // 9. Recent Passbook (Last 7 items, select required columns only)
            $recentPassbook = DB::table('passbooks')
                ->where('user_id', $userId)
                ->select('id', 'account_id', 'amount', 'type', 'description', 'transaction_id', 'created_at')
                ->orderBy('id', 'desc')
                ->limit(7)
                ->get();

            // 10. Support Settings
            $adminId = $user->admin_id ?? 1;
            $supportSetting = DB::table('settings')->where('user_id', $adminId)->first();

            // 11. Retailer Commission & Charges Stats Aggregation (Account-based & Period-filtered)
            $primaryAccountIds = $accounts->filter(function($a) {
                return $a->primary_status == 1 || $a->primary_status === true || $a->primary_status === '1' || $a->primary_status === 'true';
            })->pluck('id')->toArray();

            $secondaryAccountIds = $accounts->filter(function($a) {
                return $a->primary_status == 0 || $a->primary_status === false || $a->primary_status === '0' || $a->primary_status === 'false';
            })->pluck('id')->toArray();

            $makeEmptyComm = function() {
                return [
                    'total_commission' => 0.0,
                    'recharge_commission' => 0.0,
                    'bbps_commission' => 0.0,
                    'aeps_commission' => 0.0,
                    'pan_commission' => 0.0,
                    'other_commission' => 0.0,
                    'recharge_txns' => 0,
                    'bbps_txns' => 0,
                    'aeps_txns' => 0,
                    'pan_txns' => 0,
                    'other_txns' => 0,
                ];
            };

            $makeEmptyCharges = function() {
                return [
                    'total_charges' => 0.0,
                    'tds' => 0.0,
                    'tds_txns' => 0,
                    'two_fa_charge' => 0.0,
                    'two_fa_txns' => 0,
                    'move_to_charge' => 0.0,
                    'move_to_txns' => 0,
                    'dmt_charge' => 0.0,
                    'dmt_txns' => 0,
                    'payout_charge' => 0.0,
                    'payout_txns' => 0,
                ];
            };

            $commissionStats = [
                'total' => $makeEmptyComm(),
                'today' => $makeEmptyComm(),
                'this_month' => $makeEmptyComm(),
                'this_year' => $makeEmptyComm(),
            ];

            $chargesStats = [
                'total' => $makeEmptyCharges(),
                'today' => $makeEmptyCharges(),
                'this_month' => $makeEmptyCharges(),
                'this_year' => $makeEmptyCharges(),
            ];

            $allPassbookEntries = DB::table('passbooks')
                ->where(function ($q) use ($userId, $accountIds) {
                    $q->where('user_id', $userId);
                    if (!empty($accountIds)) {
                        $q->orWhereIn('account_id', $accountIds);
                    }
                })
                ->select('account_id', 'type', 'description', 'amount', 'created_at')
                ->get();

            foreach ($allPassbookEntries as $p) {
                $amt = (float) $p->amount;
                $count = 1;
                $desc = strtoupper($p->description ?? '');
                $isPrimary = in_array($p->account_id, $primaryAccountIds);
                $createdAt = $p->created_at;

                $periods = ['total'];
                if ($createdAt >= $today) $periods[] = 'today';
                if ($createdAt >= $thisMonth) $periods[] = 'this_month';
                if ($createdAt >= $thisYear) $periods[] = 'this_year';

                foreach ($periods as $prd) {
                    if ($p->type === 'CR') {
                        if ($isPrimary) {
                            if (str_contains($desc, 'COMMISSION') || str_contains($desc, 'COMM') || str_contains($desc, 'CASHBACK')) {
                                $commissionStats[$prd]['aeps_commission'] += $amt;
                                $commissionStats[$prd]['aeps_txns'] += $count;
                                $commissionStats[$prd]['total_commission'] += $amt;
                            }
                        } else {
                            if (str_contains($desc, 'RECHARGE COMMISSION') || str_contains($desc, 'MOBILE') || str_contains($desc, 'DTH')) {
                                $commissionStats[$prd]['recharge_commission'] += $amt;
                                $commissionStats[$prd]['recharge_txns'] += $count;
                                $commissionStats[$prd]['total_commission'] += $amt;
                            } elseif (str_contains($desc, 'BILL PAYMENT COMMISSION') || str_contains($desc, 'BBPS') || str_contains($desc, 'ELECTRICITY')) {
                                $commissionStats[$prd]['bbps_commission'] += $amt;
                                $commissionStats[$prd]['bbps_txns'] += $count;
                                $commissionStats[$prd]['total_commission'] += $amt;
                            } elseif (str_contains($desc, 'PAN CARD COMMISSION') || str_contains($desc, 'CMS')) {
                                $commissionStats[$prd]['pan_commission'] += $amt;
                                $commissionStats[$prd]['pan_txns'] += $count;
                                $commissionStats[$prd]['total_commission'] += $amt;
                            } elseif (str_contains($desc, 'COMMISSION') || str_contains($desc, 'COMM') || str_contains($desc, 'CASHBACK')) {
                                $commissionStats[$prd]['other_commission'] += $amt;
                                $commissionStats[$prd]['other_txns'] += $count;
                                $commissionStats[$prd]['total_commission'] += $amt;
                            }
                        }
                    } elseif ($p->type === 'DR') {
                        if ($isPrimary) {
                            if (str_contains($desc, 'TDS')) {
                                $chargesStats[$prd]['tds'] += $amt;
                                $chargesStats[$prd]['tds_txns'] += $count;
                                $chargesStats[$prd]['total_charges'] += $amt;
                            } elseif (str_contains($desc, '2FA') || str_contains($desc, 'BIOMETRIC') || str_contains($desc, 'AUTH')) {
                                $chargesStats[$prd]['two_fa_charge'] += $amt;
                                $chargesStats[$prd]['two_fa_txns'] += $count;
                                $chargesStats[$prd]['total_charges'] += $amt;
                            }
                        } else {
                            if (str_contains($desc, 'MOVE TO') || str_contains($desc, 'SETTLEMENT')) {
                                $chargesStats[$prd]['move_to_charge'] += $amt;
                                $chargesStats[$prd]['move_to_txns'] += $count;
                                $chargesStats[$prd]['total_charges'] += $amt;
                            } elseif (str_contains($desc, 'MONEY TRANSFER') || str_contains($desc, 'DMT')) {
                                $chargesStats[$prd]['dmt_charge'] += $amt;
                                $chargesStats[$prd]['dmt_txns'] += $count;
                                $chargesStats[$prd]['total_charges'] += $amt;
                            } elseif (str_contains($desc, 'PAYOUT')) {
                                $chargesStats[$prd]['payout_charge'] += $amt;
                                $chargesStats[$prd]['payout_txns'] += $count;
                                $chargesStats[$prd]['total_charges'] += $amt;
                            }
                        }
                    }
                }
            }

            // Populate top-level keys with 'today' stats for backward compatibility:
            foreach ($commissionStats['today'] as $k => $v) {
                $commissionStats[$k] = $v;
            }
            foreach ($chargesStats['today'] as $k => $v) {
                $chargesStats[$k] = $v;
            }

            // 12. Users & Merchants Statistics (For Admin / Super Admin only)
            $userStats = null;
            $merchantStats = null;

            if ($userRole === 1 || $userRole === 2) {
                $userQuery = User::query();
                if ($userRole === 2) {
                    $userQuery->where('admin_mid', $userMid);
                }

                $userAgg = (clone $userQuery)
                    ->selectRaw('
                        status,
                        COUNT(*) as total_count,
                        COUNT(CASE WHEN created_at >= ? THEN 1 END) as today_count,
                        COUNT(CASE WHEN created_at >= ? THEN 1 END) as month_count
                    ', [$today, $thisMonth])
                    ->groupBy('status')
                    ->get();

                $userStats = [
                    'total' => ['active' => 0, 'inactive' => 0],
                    'today' => ['active' => 0, 'inactive' => 0],
                    'this_month' => ['active' => 0, 'inactive' => 0]
                ];

                foreach ($userAgg as $u) {
                    $st = ($u->status == 1) ? 'active' : 'inactive';
                    $userStats['total'][$st] += (int)$u->total_count;
                    $userStats['today'][$st] += (int)$u->today_count;
                    $userStats['this_month'][$st] += (int)$u->month_count;
                }

                $merchantStats = [
                    'total' => ['drafts' => 0, 'onboarding' => 0, 'ekyc' => 0, 'biomatrickyc' => 0, '2fa' => 0, 'total_active' => 0],
                    'today' => ['drafts' => 0, 'onboarding' => 0, 'ekyc' => 0, 'biomatrickyc' => 0, '2fa' => 0, 'total_active' => 0],
                    'this_month' => ['drafts' => 0, 'onboarding' => 0, 'ekyc' => 0, 'biomatrickyc' => 0, '2fa' => 0, 'total_active' => 0]
                ];
                $merchantStatusMap = [0 => 'drafts', 1 => 'onboarding', 2 => 'ekyc', 3 => 'biomatrickyc', 4 => '2fa'];

                $mAgg = AepsDraft::where($aepsFilter)
                    ->selectRaw('
                        aeps_status,
                        COUNT(*) as total_count,
                        COUNT(CASE WHEN created_at >= ? THEN 1 END) as today_count,
                        COUNT(CASE WHEN created_at >= ? THEN 1 END) as month_count
                    ', [$today, $thisMonth])
                    ->groupBy('aeps_status')
                    ->get();

                foreach ($mAgg as $m) {
                    $st = $merchantStatusMap[$m->aeps_status] ?? 'drafts';
                    $merchantStats['total'][$st] += (int)$m->total_count;
                    $merchantStats['today'][$st] += (int)$m->today_count;
                    $merchantStats['this_month'][$st] += (int)$m->month_count;
                    if ($m->aeps_status >= 1) {
                        $merchantStats['total']['total_active'] += (int)$m->total_count;
                        $merchantStats['today']['total_active'] += (int)$m->today_count;
                        $merchantStats['this_month']['total_active'] += (int)$m->month_count;
                    }
                }
            }

            // 12. Active Banners for Dashboard
            $activeBanners = DB::table('banners')
                ->where('status', 1)
                ->where(function($q) {
                    $q->where('type', 'home')->orWhereNull('type')->orWhere('type', '');
                })
                ->orderByDesc('id')
                ->get();

            $responseData = [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'mobile' => $user->mobile,
                    'role' => $user->role,
                    'mid' => $user->mid
                ],
                'banners' => $activeBanners,
                'aeps' => $aepsData,
                'cash_deposit' => $cashDepositData,
                'utility' => $utilityData,
                'payouts' => $payoutData,
                'accounts' => $accountStats,
                'add_fund' => $addFundData,
                'va_data' => $vaData,
                'va_txns' => $vaTxnData ?? $this->emptyPeriodStructure(true),
                'user_wallets' => $userWallets,
                'kyc_account' => $kycAccount,
                'recent_passbook' => $recentPassbook,
                'support_setting' => $supportSetting,
                'commission_stats' => $commissionStats,
                'charges_stats' => $chargesStats,
            ];

            if ($userRole === 1 || $userRole === 2) {
                $responseData['users'] = $userStats;
                $responseData['merchants'] = $merchantStats;
            }

            return response()->json([
                'status' => 1,
                'message' => 'Dashboard data fetched successfully',
                'data' => $responseData
            ]);

        } catch (\Exception $e) {
            Log::error('Dashboard data fetch error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function emptyPeriodStructure($includeAmount = true)
    {
        $struct = [
            'total' => ['success' => ['count' => 0], 'failed' => ['count' => 0], 'pending' => ['count' => 0]],
            'today' => ['success' => ['count' => 0], 'failed' => ['count' => 0], 'pending' => ['count' => 0]],
            'this_month' => ['success' => ['count' => 0], 'failed' => ['count' => 0], 'pending' => ['count' => 0]],
            'this_year' => ['success' => ['count' => 0], 'failed' => ['count' => 0], 'pending' => ['count' => 0]],
        ];
        if ($includeAmount) {
            foreach (['total', 'today', 'this_month', 'this_year'] as $period) {
                foreach (['success', 'failed', 'pending'] as $status) {
                    $struct[$period][$status]['amount'] = 0.0;
                }
            }
        }
        return $struct;
    }
}