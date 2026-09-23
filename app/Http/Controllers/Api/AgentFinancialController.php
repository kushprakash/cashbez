<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Financial\FinancialMember;
use App\Models\Financial\FinancialAccount;
use App\Models\Financial\FinancialTransaction;
use App\Models\Financial\FinancialOtp;
use App\Models\MembershipPlan;
use App\Models\Account;
use App\Models\Va;
use App\Models\FinancialPlan;
use App\Models\FinancialSetting;
use App\Services\FinancialScopeService;
use App\Services\FinancialCommissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AgentFinancialController extends Controller
{
    /**
     * Agent Financial Dashboard Summary
     */
    public function getDashboardSummary(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
            }

            $isSuper = ($user->id == 1 || $user->role == 1);
            $isAdmin = ($user->role == 2 || !empty($user->is_admin));
            $adminId = $isAdmin ? $user->id : ($user->admin_id ?? ($user->role == 2 ? $user->id : 1));

            // Helper to apply scope to query builder
            $applyScope = function($q) use ($user) {
                return FinancialScopeService::applyScope($q, $user);
            };

            // ── Period date range ─────────────────────────────────────────────────
            $period = $request->input('period', 'Today'); // Today | This Week | This Month | This Year
            $now    = Carbon::now();

            switch ($period) {
                case 'This Week':
                    $periodStart = $now->copy()->startOfWeek();
                    $periodEnd   = $now->copy()->endOfWeek();
                    break;
                case 'This Month':
                    $periodStart = $now->copy()->startOfMonth();
                    $periodEnd   = $now->copy()->endOfMonth();
                    break;
                case 'This Year':
                    $periodStart = $now->copy()->startOfYear();
                    $periodEnd   = $now->copy()->endOfYear();
                    break;
                default: // Today
                    $periodStart = $now->copy()->startOfDay();
                    $periodEnd   = $now->copy()->endOfDay();
                    break;
            }

            // ── Single aggregate query for member stats ─────────────────────────────
            $memberStats = $applyScope(FinancialMember::query())
                ->selectRaw("
                    COUNT(id) as total_members,
                    SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_members,
                    SUM(CASE WHEN kyc_status IN ('PENDING', 'SUBMITTED') THEN 1 ELSE 0 END) as kyc_pending,
                    SUM(CASE WHEN kyc_status = 'APPROVED' THEN 1 ELSE 0 END) as kyc_approved
                ")->first();

            $totalMembers  = intval($memberStats->total_members ?? 0);
            $activeMembers = intval($memberStats->active_members ?? 0);
            $kycPending    = intval($memberStats->kyc_pending ?? 0);
            $kycApproved   = intval($memberStats->kyc_approved ?? 0);

            // ── Single aggregate query for account stats ────────────────────────────
            $accountStats = $applyScope(FinancialAccount::query())
                ->selectRaw("
                    COUNT(id) as total_accounts,
                    SUM(CASE WHEN service_type = 'SAVING' THEN 1 ELSE 0 END) as saving_accounts,
                    SUM(CASE WHEN service_type = 'DD' THEN 1 ELSE 0 END) as dd_accounts,
                    SUM(CASE WHEN service_type = 'RD' THEN 1 ELSE 0 END) as rd_accounts,
                    SUM(CASE WHEN service_type = 'FD' THEN 1 ELSE 0 END) as fd_accounts,
                    SUM(CASE WHEN service_type = 'MIS' THEN 1 ELSE 0 END) as mis_accounts
                ")->first();

            $savingAccounts = intval($accountStats->saving_accounts ?? 0);
            $ddAccounts     = intval($accountStats->dd_accounts ?? 0);
            $rdAccounts     = intval($accountStats->rd_accounts ?? 0);
            $fdAccounts     = intval($accountStats->fd_accounts ?? 0);
            $misAccounts    = intval($accountStats->mis_accounts ?? 0);
            $totalAccounts  = intval($accountStats->total_accounts ?? 0);

            // ── Single query for all-time totals and today's stats ──────────────────
            $today = Carbon::today()->toDateString();
            $txnStats = $applyScope(FinancialTransaction::query())
                ->selectRaw("
                    COUNT(id) as total_transactions_count,
                    SUM(CASE WHEN txn_type = 'DEPOSIT' THEN amount ELSE 0 END) as total_deposits_sum,
                    SUM(CASE WHEN txn_type = 'DEPOSIT' AND DATE(created_at) = ? THEN amount ELSE 0 END) as today_deposit,
                    SUM(CASE WHEN txn_type = 'WITHDRAWAL' AND DATE(created_at) = ? THEN amount ELSE 0 END) as today_withdrawal
                ", [$today, $today])->first();

            $todayDeposit     = floatval($txnStats->today_deposit ?? 0);
            $todayWithdrawal  = floatval($txnStats->today_withdrawal ?? 0);
            $totalDepositsSum = floatval($txnStats->total_deposits_sum ?? 0);
            $totalTxnCount    = intval($txnStats->total_transactions_count ?? 0);

            // ── Single query for period-scoped deposits, count, and commissions ─────
            $periodStats = $applyScope(FinancialTransaction::query())
                ->whereBetween('created_at', [$periodStart, $periodEnd])
                ->selectRaw("
                    COUNT(id) as period_txn_count,
                    SUM(CASE WHEN txn_type = 'DEPOSIT' THEN amount ELSE 0 END) as period_deposits_sum,
                    SUM(CASE WHEN service_type = 'MEMBERSHIP' THEN charges ELSE 0 END) as member_comm,
                    SUM(CASE WHEN service_type = 'MEMBERSHIP' THEN amount ELSE 0 END) as member_fee_sum,
                    SUM(CASE WHEN service_type = 'SAVING' THEN charges ELSE 0 END) as saving_comm,
                    SUM(CASE WHEN service_type = 'DD' THEN charges ELSE 0 END) as dd_comm,
                    SUM(CASE WHEN service_type = 'RD' THEN charges ELSE 0 END) as rd_comm,
                    SUM(CASE WHEN service_type = 'FD' THEN charges ELSE 0 END) as fd_comm,
                    SUM(CASE WHEN service_type = 'MIS' THEN charges ELSE 0 END) as mis_comm
                ")->first();

            $periodDepositsSum = floatval($periodStats->period_deposits_sum ?? 0);
            $periodTxnCount    = intval($periodStats->period_txn_count ?? 0);

            $memberComm = floatval($periodStats->member_comm ?? 0);
            if ($memberComm == 0) {
                $memberFeeSum = floatval($periodStats->member_fee_sum ?? 0);
                $memberComm   = round($memberFeeSum * 0.5, 2);
            }

            $savingComm = floatval($periodStats->saving_comm ?? 0);
            $ddComm     = floatval($periodStats->dd_comm ?? 0);
            $rdComm     = floatval($periodStats->rd_comm ?? 0);
            $fdComm     = floatval($periodStats->fd_comm ?? 0);
            $misComm    = floatval($periodStats->mis_comm ?? 0);

            $totalEarnings = $memberComm + $savingComm + $ddComm + $rdComm + $fdComm + $misComm;

            $recentTransactions = $applyScope(FinancialTransaction::query())
                ->with(['member:id,name,member_id', 'account:id,account_number'])
                ->orderBy('id', 'desc')
                ->take(10)
                ->get();

            $recentMembers = $applyScope(FinancialMember::query())
                ->orderBy('id', 'desc')
                ->take(5)
                ->get();

            $utilityWallet = FinancialScopeService::getUtilityWallet($user);

            // ── Monthly Trend (Past 12 months) in 2 single GROUP BY queries ─────────
            $twelveMonthsAgo = Carbon::now()->subMonths(11)->startOfMonth();
            $nowEnd          = Carbon::now()->endOfMonth();

            $monthlyTxnRows = $applyScope(FinancialTransaction::query())
                ->whereBetween('created_at', [$twelveMonthsAgo, $nowEnd])
                ->selectRaw("
                    DATE_FORMAT(created_at, '%Y-%m') as ym,
                    SUM(CASE WHEN txn_type = 'DEPOSIT' THEN amount ELSE 0 END) as deposit,
                    SUM(charges) as commission,
                    COUNT(id) as txn_count
                ")
                ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
                ->get()
                ->keyBy('ym');

            $monthlyMemberRows = $applyScope(FinancialMember::query())
                ->whereBetween('created_at', [$twelveMonthsAgo, $nowEnd])
                ->selectRaw("
                    DATE_FORMAT(created_at, '%Y-%m') as ym,
                    COUNT(id) as new_members
                ")
                ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
                ->get()
                ->keyBy('ym');

            $monthlyTrend = [];
            for ($i = 11; $i >= 0; $i--) {
                $monthDate = Carbon::now()->subMonths($i);
                $ym        = $monthDate->format('Y-m');
                $tRow      = $monthlyTxnRows->get($ym);
                $mRow      = $monthlyMemberRows->get($ym);

                $monthlyTrend[] = [
                    'month'       => $monthDate->format('M'),
                    'deposit'     => floatval($tRow->deposit ?? 0),
                    'commission'  => floatval($tRow->commission ?? 0),
                    'txn_count'   => intval($tRow->txn_count ?? 0),
                    'new_members' => intval($mRow->new_members ?? 0),
                ];
            }

            // ── Period-specific trend in 1 single grouped query ────────────────────
            $periodTrend = [];
            if ($period === 'Today') {
                $hourlyTxnRows = $applyScope(FinancialTransaction::query())
                    ->whereBetween('created_at', [$periodStart, $periodEnd])
                    ->selectRaw("
                        FLOOR(HOUR(created_at) / 2) * 2 as h_bucket,
                        SUM(CASE WHEN txn_type = 'DEPOSIT' THEN amount ELSE 0 END) as deposit,
                        SUM(charges) as commission,
                        COUNT(id) as txn_count
                    ")
                    ->groupBy(DB::raw("FLOOR(HOUR(created_at) / 2) * 2"))
                    ->get()
                    ->keyBy('h_bucket');

                for ($h = 0; $h < 24; $h += 2) {
                    $row    = $hourlyTxnRows->get($h);
                    $hLabel = sprintf('%02d:00', $h);
                    $periodTrend[] = [
                        'label'      => $hLabel,
                        'deposit'    => floatval($row->deposit ?? 0),
                        'commission' => floatval($row->commission ?? 0),
                        'txn_count'  => intval($row->txn_count ?? 0),
                    ];
                }
            } elseif ($period === 'This Week') {
                $dailyTxnRows = $applyScope(FinancialTransaction::query())
                    ->whereBetween('created_at', [$periodStart, $periodEnd])
                    ->selectRaw("
                        DATE(created_at) as d_date,
                        SUM(CASE WHEN txn_type = 'DEPOSIT' THEN amount ELSE 0 END) as deposit,
                        SUM(charges) as commission,
                        COUNT(id) as txn_count
                    ")
                    ->groupBy(DB::raw("DATE(created_at)"))
                    ->get()
                    ->keyBy('d_date');

                for ($d = 0; $d < 7; $d++) {
                    $dayDate = $periodStart->copy()->addDays($d);
                    $dKey    = $dayDate->toDateString();
                    $row     = $dailyTxnRows->get($dKey);
                    $periodTrend[] = [
                        'label'      => $dayDate->format('D'),
                        'deposit'    => floatval($row->deposit ?? 0),
                        'commission' => floatval($row->commission ?? 0),
                        'txn_count'  => intval($row->txn_count ?? 0),
                    ];
                }
            } elseif ($period === 'This Month') {
                $dailyTxnRows = $applyScope(FinancialTransaction::query())
                    ->whereBetween('created_at', [$periodStart, $periodEnd])
                    ->selectRaw("
                        DATE(created_at) as d_date,
                        SUM(CASE WHEN txn_type = 'DEPOSIT' THEN amount ELSE 0 END) as deposit,
                        SUM(charges) as commission,
                        COUNT(id) as txn_count
                    ")
                    ->groupBy(DB::raw("DATE(created_at)"))
                    ->get()
                    ->keyBy('d_date');

                $daysInMonth = $now->daysInMonth;
                for ($d = 1; $d <= $daysInMonth; $d++) {
                    $dayDate = $periodStart->copy()->addDays($d - 1);
                    $dKey    = $dayDate->toDateString();
                    $row     = $dailyTxnRows->get($dKey);
                    $periodTrend[] = [
                        'label'      => $dayDate->format('d'),
                        'deposit'    => floatval($row->deposit ?? 0),
                        'commission' => floatval($row->commission ?? 0),
                        'txn_count'  => intval($row->txn_count ?? 0),
                    ];
                }
            } else {
                // This Year
                $monthlyYearRows = $applyScope(FinancialTransaction::query())
                    ->whereBetween('created_at', [$periodStart, $periodEnd])
                    ->selectRaw("
                        MONTH(created_at) as m_num,
                        SUM(CASE WHEN txn_type = 'DEPOSIT' THEN amount ELSE 0 END) as deposit,
                        SUM(charges) as commission,
                        COUNT(id) as txn_count
                    ")
                    ->groupBy(DB::raw("MONTH(created_at)"))
                    ->get()
                    ->keyBy('m_num');

                for ($m = 1; $m <= 12; $m++) {
                    $monthDate = $periodStart->copy()->month($m);
                    $row       = $monthlyYearRows->get($m);
                    $periodTrend[] = [
                        'label'      => $monthDate->format('M'),
                        'deposit'    => floatval($row->deposit ?? 0),
                        'commission' => floatval($row->commission ?? 0),
                        'txn_count'  => intval($row->txn_count ?? 0),
                    ];
                }
            }

            return response()->json([
                'status' => 1,
                'data'   => [
                    'period'       => $period,
                    'period_start' => $periodStart->toDateTimeString(),
                    'period_end'   => $periodEnd->toDateTimeString(),
                    'kpis' => [
                        'total_members'            => $totalMembers,
                        'active_members'           => $activeMembers,
                        'kyc_pending'              => $kycPending,
                        'kyc_approved'             => $kycApproved,
                        'saving_accounts'          => $savingAccounts,
                        'dd_accounts'              => $ddAccounts,
                        'rd_accounts'              => $rdAccounts,
                        'fd_accounts'              => $fdAccounts,
                        'mis_accounts'             => $misAccounts,
                        'total_accounts'           => $totalAccounts,
                        'today_deposit'            => floatval($todayDeposit),
                        'today_withdrawal'         => floatval($todayWithdrawal),
                        'total_deposits_sum'       => floatval($totalDepositsSum),
                        'total_transactions_count' => $totalTxnCount,
                        // Period-scoped metrics
                        'period_deposits_sum'      => $periodDepositsSum,
                        'period_txn_count'         => $periodTxnCount,
                        'total_earnings'           => $totalEarnings,
                        'commissions' => [
                            'member_commission'  => $memberComm,
                            'saving_commission'  => $savingComm,
                            'dd_commission'      => $ddComm,
                            'rd_commission'      => $rdComm,
                            'fd_commission'      => $fdComm,
                            'mis_commission'     => $misComm,
                        ],
                    ],
                    'utility_wallet' => $utilityWallet ? [
                        'account_id' => $utilityWallet->id,
                        'number'     => $utilityWallet->number,
                        'balance'    => floatval($utilityWallet->balance),
                    ] : null,
                    'recent_transactions' => $recentTransactions,
                    'recent_members'      => $recentMembers,
                    'monthly_trend'       => $monthlyTrend,
                    'period_trend'        => $periodTrend,
                    'company_name'        => $this->getCompanyName($adminId),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Members (Scoped List with Filter & Search)
     */
    public function getMembers(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $query = FinancialScopeService::applyScope(FinancialMember::query(), $user);

            if ($request->filled('search')) {
                $s = trim($request->search);
                $query->where(function($q) use ($s) {
                    $q->where('name', 'like', "%{$s}%")
                      ->orWhere('member_id', 'like', "%{$s}%")
                      ->orWhere('mobile', 'like', "%{$s}%")
                      ->orWhere('email', 'like', "%{$s}%");
                });
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('kyc_status')) {
                $query->where('kyc_status', $request->kyc_status);
            }

            $perPage = (int)$request->input('per_page', 15);
            $members = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'data' => $members
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Create Member (With Utility Wallet Auto-Debit if Membership Fee > 0)
     */
    public function createMember(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $adminId = $user->admin_id ?? ($user->role == 2 ? $user->id : 1);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'father_name' => 'nullable|string|max:255',
                'dob' => 'nullable|date',
                'gender' => 'required|in:male,female,other',
                'mobile' => 'required|string|max:15',
                'email' => 'nullable|email|max:255',
                'address' => 'nullable|string',
                'membership_plan_id' => 'nullable|exists:membership_plans,id',
                'membership_fee' => 'nullable|numeric|min:0',
                'mpin' => 'nullable|string|size:4',
                'nominee_name' => 'nullable|string|max:255',
                'nominee_relation' => 'nullable|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
            }

            $membershipFee = floatval($request->input('membership_fee', 0));
            $txnId = FinancialScopeService::generateTxnId();

            // If membership fee > 0, MPIN is required and Utility Wallet will be debited
            if ($membershipFee > 0) {
                if (!$request->filled('mpin')) {
                    return response()->json(['status' => 0, 'message' => 'Agent MPIN is required to pay membership fee.'], 400);
                }

                $debitRes = FinancialScopeService::processUtilityWalletDebit(
                    $request,
                    $user,
                    $request->mpin,
                    $membershipFee,
                    "Member Registration Fee ({$request->name})",
                    $txnId
                );

                if ($debitRes['status'] == 0) {
                    return response()->json($debitRes, 400);
                }
            }

            $memberId = FinancialScopeService::generateMemberId();

            $member = FinancialMember::create([
                'member_id' => $memberId,
                'user_id' => $user->id,
                'admin_id' => $adminId,
                'created_by' => $user->id,
                'name' => $request->name,
                'father_name' => $request->father_name,
                'husband_name' => $request->husband_name,
                'dob' => $request->dob,
                'gender' => $request->gender,
                'mobile' => $request->mobile,
                'email' => $request->email,
                'address' => $request->address,
                'state' => $request->state,
                'district' => $request->district,
                'pincode' => $request->pincode,
                'occupation' => $request->occupation,
                'membership_plan_id' => $request->membership_plan_id,
                'membership_fee' => $membershipFee,
                'nominee_name' => $request->nominee_name,
                'nominee_relation' => $request->nominee_relation,
                'nominee_mobile' => $request->nominee_mobile,
                'status' => 'ACTIVE',
                'kyc_status' => 'PENDING',
            ]);

            if ($membershipFee > 0) {
                FinancialTransaction::create([
                    'transaction_id' => $txnId,
                    'member_id' => $member->id,
                    'user_id' => $user->id,
                    'admin_id' => $adminId,
                    'service_type' => 'MEMBERSHIP',
                    'txn_type' => 'MEMBERSHIP_FEE',
                    'amount' => $membershipFee,
                    'charges' => 0,
                    'net_amount' => $membershipFee,
                    'payment_mode' => 'UTILITY_WALLET',
                    'narration' => "Membership fee registration for {$member->name} ({$member->member_id})",
                    'status' => 'SUCCESS',
                ]);
            }

            // Calculate & Disburse Commission for New Member Registration
            FinancialCommissionService::processCommission(
                'NEW_MEMBER',
                $membershipFee > 0 ? $membershipFee : 1.0,
                $user,
                $adminId,
                $txnId,
                "New Member Registration ({$member->name} - {$member->member_id})"
            );

            return response()->json([
                'status' => 1,
                'message' => 'Member registered successfully!',
                'data' => $member
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Member 360 Details
     */
    public function getMemberDetails($id)
    {
        try {
            $user = request()->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $member = FinancialScopeService::applyScope(FinancialMember::where('id', $id), $user)
                                    ->with(['accounts', 'transactions'])
                                    ->firstOrFail();

            return response()->json([
                'status' => 1,
                'data' => $member
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'Member not found or unauthorized access.'], 404);
        }
    }

    /**
     * Update Member
     */
    public function updateMember(Request $request, $id)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $member = FinancialScopeService::applyScope(FinancialMember::where('id', $id), $user)
                                    ->firstOrFail();

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'mobile' => 'sometimes|required|string|max:15',
                'email' => 'sometimes|nullable|email|max:255',
                'dob' => 'sometimes|nullable|date',
                'gender' => 'sometimes|nullable|in:male,female,other',
                'status' => 'sometimes|nullable|in:ACTIVE,INACTIVE,BLOCKED',
                'kyc_status' => 'sometimes|nullable|in:PENDING,SUBMITTED,APPROVED,REJECTED',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
            }

            $member->update($request->only([
                'name', 'father_name', 'husband_name', 'dob', 'gender',
                'mobile', 'email', 'address', 'state', 'district', 'pincode',
                'occupation', 'nominee_name', 'nominee_relation', 'nominee_mobile',
                'status', 'kyc_status'
            ]));

            return response()->json([
                'status' => 1,
                'message' => 'Member updated successfully!',
                'data' => $member
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get KYC Pending List
     */
    public function getKycPendingList(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $members = FinancialScopeService::applyScope(FinancialMember::query(), $user)
                                      ->whereIn('kyc_status', ['PENDING', 'SUBMITTED', 'REJECTED'])
                                      ->orderBy('id', 'desc')
                                      ->paginate(15);

            return response()->json([
                'status' => 1,
                'data' => $members
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Send Aadhaar OTP for Member KYC
     */
    public function sendMemberAadhaarOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'aadhar_number' => 'required|string|size:12',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first()
            ]);
        }

        $user = $request->user();
        if (!$user) {
            $token = $request->header('Token');
            $user = User::where('remember_token', $token)->first();
        }
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
        }

        try {
            $admin = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$admin || !$admin->mid || !$admin->mkey) {
                $admin = $user;
            }
            if (!$admin || !$admin->mid || !$admin->mkey) {
                $admin = User::whereNotNull('mid')->whereNotNull('mkey')->where('mid', '!=', '')->first();
            }

            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url(''). '/api/v2/verify/aadhar-send-otp',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode([
                    "aadhaar_number" => $request->aadhar_number
                ]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . ($user ? $user->mid : ''),
                    'mkey: ' . ($user ? $user->mkey : '')
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);
            
            $rj = json_decode($response, true);

            if (isset($rj['status']) && $rj['status'] == 1) {
                $refid = $rj['data']['refid'] ?? '';
                return response()->json([
                    'status' => 1,
                    'message' => 'OTP sent successfully',
                    'refid' => $refid,
                    'txnid' => $refid,
                    'otp_sent' => true
                ]);
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => $rj['message'] ?? 'Technical Issue Try again',
                    'txnid' => '',
                    'otp_sent' => false,
                    'data' => $response
                ]);
            }
        }
        catch (\Exception $e) {
            Log::error('Aadhaar OTP Error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to send OTP: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Verify Aadhaar OTP for Member KYC
     */
    public function verifyMemberAadhaarOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'otp' => 'required|string|size:6',
            'refid' => 'nullable|string',
            'txnid' => 'nullable|string',
            'aadhar_number' => 'required|string|size:12',
            'member_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first()
            ]);
        }

        $user = $request->user();
        if (!$user) {
            $token = $request->header('Token');
            $user = User::where('remember_token', $token)->first();
        }
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
        }

        $refid = $request->refid ?? $request->txnid;
        if (!$refid) {
            return response()->json(['status' => 0, 'message' => 'Transaction reference ID (refid) is required.']);
        }

        try {
            $admin = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$admin || !$admin->mid || !$admin->mkey) {
                $admin = $user;
            }
            if (!$admin || !$admin->mid || !$admin->mkey) {
                $admin = User::whereNotNull('mid')->whereNotNull('mkey')->where('mid', '!=', '')->first();
            }

            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url(''). '/api/v2/verify/aadhaar-verify-otp',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode([
                    "otp" => $request->otp,
                    "refid" => $refid
                ]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . ($user ? $user->mid : ''),
                    'mkey: ' . ($user ? $user->mkey : '')
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);
            $rj = json_decode($response, true);

            if (isset($rj['status']) && $rj['status'] == 1) {
                $aadhaarInfo = $rj['data'];

                // Format photo if needed
                $photo = $aadhaarInfo['photo_link'] ?? null;
                if ($photo && strpos($photo, 'data:image') === false) {
                    $photo = 'data:image/png;base64,' . $photo;
                }

                // Format gender
                $genderRaw = strtoupper($aadhaarInfo['gender'] ?? 'M');
                $gender = ($genderRaw === 'M' || $genderRaw === 'MALE') ? 'male' : (($genderRaw === 'F' || $genderRaw === 'FEMALE') ? 'female' : 'other');

                // Address formatting
                $split = $aadhaarInfo['split_address'] ?? [];
                $address = $aadhaarInfo['address'] ?? ($split ? implode(', ', array_filter($split)) : null);

                // Format DOB if needed
                $dobFormatted = null;
                if (isset($aadhaarInfo['dob'])) {
                    try {
                        $dobFormatted = \Carbon\Carbon::createFromFormat('d-m-Y', $aadhaarInfo['dob'])->format('Y-m-d');
                    } catch (\Exception $ex) {
                        $dobFormatted = $aadhaarInfo['dob'];
                    }
                }

                $member = null;
                // Immediately persist verified Aadhaar so it is never lost even if user logs out or leaves
                if ($request->filled('member_id')) {
                    $member = FinancialScopeService::applyScope(FinancialMember::where('id', $request->member_id), $user)
                        ->first();

                    if ($member) {
                        $updateData = [
                            'aadhar_number' => $request->aadhar_number,
                            'aadhar_verified' => true,
                        ];
                        if (!empty($aadhaarInfo['name'])) $updateData['name'] = $aadhaarInfo['name'];
                        if (!empty($aadhaarInfo['care_of'])) $updateData['father_name'] = $aadhaarInfo['care_of'];
                        if (!empty($dobFormatted)) $updateData['dob'] = $dobFormatted;
                        if (!empty($gender)) $updateData['gender'] = $gender;
                        if (!empty($address)) $updateData['address'] = $address;
                        if (!empty($split['state'])) $updateData['state'] = $split['state'];
                        if (!empty($split['pincode'])) $updateData['pincode'] = $split['pincode'];
                        if (!empty($photo)) $updateData['photo'] = $photo;

                        $member->update($updateData);
                    }
                }

                return response()->json([
                    'status' => 1,
                    'message' => 'Aadhaar verified successfully',
                    'aadhaar_data' => [
                        'name' => $aadhaarInfo['name'] ?? null,
                        'care_of' => $aadhaarInfo['care_of'] ?? null,
                        'dob' => $dobFormatted,
                        'gender' => $gender,
                        'address' => $address,
                        'state' => $split['state'] ?? null,
                        'pincode' => $split['pincode'] ?? null,
                        'photo' => $photo,
                        'aadhar_number' => $request->aadhar_number,
                        'verified' => true
                    ],
                    'member' => $member
                ]);
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => $rj['message'] ?? 'Technical Issue try again..'
                ]);
            }
        }
        catch (\Exception $e) {
            Log::error('Aadhaar Verification Error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Verification failed: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Verify Bank Account for Member KYC via /api/v2/verify/bank-account
     */
    public function verifyMemberBankAccount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'member_id' => 'required|integer',
            'account_number' => 'required|string',
            'ifsc_code' => 'required|string|size:11',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first()
            ]);
        }

        $user = $request->user();
        if (!$user) {
            $token = $request->header('Token');
            $user = User::where('remember_token', $token)->first();
        }
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Invalid token'], 401);
        }

        try {
            $member = FinancialScopeService::applyScope(FinancialMember::where('id', $request->member_id), $user)
                ->first();

            if (!$member) {
                return response()->json(['status' => 0, 'message' => 'Member not found'], 404);
            }

            if (!$member->aadhar_verified) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Please complete Aadhaar verification first before verifying bank account.'
                ]);
            }

            $admin = User::where('mid', $user->admin_mid)->select('mid', 'mkey')->first();
            if (!$admin || !$admin->mid || !$admin->mkey) {
                $admin = $user;
            }
            if (!$admin || !$admin->mid || !$admin->mkey) {
                $admin = User::whereNotNull('mid')->whereNotNull('mkey')->where('mid', '!=', '')->first();
            }

            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => url('') . '/api/v2/verify/bank-account',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode([
                    "accountno" => $request->account_number,
                    "ifsccode" => strtoupper($request->ifsc_code)
                ]),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'mid: ' . ($user ? $user->mid : ''),
                    'mkey: ' . ($user ? $user->mkey : '')
                ),
            ));

            $response = curl_exec($curl);
            curl_close($curl);
            $rj = json_decode($response, true);

            if (isset($rj['status']) && $rj['status'] == 1) {
                $bankData = $rj['data'] ?? [];
                $accountName = $bankData['AccountName'] ?? ($bankData['account_holder_name'] ?? ($bankData['full_name'] ?? ($bankData['name'] ?? '')));

                $prefixes = [
                    'Mr. ', 'MR. ', 'Mr ', 'MR ',
                    'Mrs. ', 'MRS. ', 'Mrs ', 'MRS ',
                    'Ms. ', 'MS. ', 'Ms ', 'MS ',
                    'Miss ', 'MISS ',
                    'Shri. ', 'SHRI. ', 'Shri ', 'SHRI ',
                    'Sri. ', 'SRI. ', 'Sri ', 'SRI ',
                    'Smt. ', 'SMT. ', 'Smt ', 'SMT ',
                    'Dr. ', 'DR. ', 'Prof. ', 'PROF. ',
                    'Mx. ', 'Master ', 'MASTER '
                ];
                $cleanAccountName = trim(str_ireplace($prefixes, '', $accountName));
                $finalAccountHolder = $cleanAccountName ?: $accountName;
                $bankName = $bankData['bank_name'] ?? ($bankData['BANK'] ?? '');
                $branch = $bankData['branch'] ?? ($bankData['BRANCH'] ?? '');

                // Immediately persist bank account data so it is never lost even if user logs out
                $member->update([
                    'account_number' => $request->account_number,
                    'ifsc_code' => strtoupper($request->ifsc_code),
                    'bank_name' => $bankName,
                    'bank_branch' => $branch,
                    'account_holder_name' => $finalAccountHolder,
                    'account_verified' => true,
                ]);

                return response()->json([
                    'status' => 1,
                    'message' => 'Bank Account verified successfully!',
                    'bank_data' => [
                        'account_number' => $request->account_number,
                        'ifsc_code' => strtoupper($request->ifsc_code),
                        'account_holder_name' => $finalAccountHolder,
                        'bank_name' => $bankName,
                        'branch' => $branch,
                        'verified' => true,
                    ],
                    'member' => $member
                ]);
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => $rj['message'] ?? 'Bank Account verification failed. Please check details and try again.'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Bank Account Verification Error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Bank Account verification failed: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Submit Member KYC & Save Verified Data
     */
    public function submitMemberKyc(Request $request, $id)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $member = FinancialScopeService::applyScope(FinancialMember::where('id', $id), $user)
                                    ->firstOrFail();

            // Require verified Aadhaar data to approve KYC
            if (!$member->aadhar_verified && !$request->boolean('verified') && !$request->filled('aadhar_number')) {
                return response()->json([
                    'status' => 0,
                    'message' => 'KYC cannot be approved without completing Aadhaar OTP verification!'
                ], 422);
            }

            // Require verified Bank Account data to approve KYC
            if (!$member->account_verified && !$request->boolean('account_verified') && !$request->filled('account_number')) {
                return response()->json([
                    'status' => 0,
                    'message' => 'KYC cannot be approved without completing Bank Account verification!'
                ], 422);
            }

            $updateData = [
                'kyc_status' => 'APPROVED',
                'aadhar_verified' => true,
                'account_verified' => true,
            ];

            if ($request->filled('aadhar_number')) {
                $updateData['aadhar_number'] = $request->aadhar_number;
            }
            if ($request->filled('name')) {
                $updateData['name'] = $request->name;
            }
            if ($request->filled('care_of')) {
                $updateData['father_name'] = $request->care_of;
            }
            if ($request->filled('dob')) {
                $updateData['dob'] = $request->dob;
            }
            if ($request->filled('gender')) {
                $updateData['gender'] = $request->gender;
            }
            if ($request->filled('address')) {
                $updateData['address'] = $request->address;
            }
            if ($request->filled('state')) {
                $updateData['state'] = $request->state;
            }
            if ($request->filled('pincode')) {
                $updateData['pincode'] = $request->pincode;
            }
            if ($request->filled('photo')) {
                $updateData['photo'] = $request->photo;
            }

            // Save Bank details if supplied in request
            if ($request->filled('account_number')) {
                $updateData['account_number'] = $request->account_number;
            }
            if ($request->filled('ifsc_code')) {
                $updateData['ifsc_code'] = strtoupper($request->ifsc_code);
            }
            if ($request->filled('bank_name')) {
                $updateData['bank_name'] = $request->bank_name;
            }
            if ($request->filled('bank_branch')) {
                $updateData['bank_branch'] = $request->bank_branch;
            }
            if ($request->filled('account_holder_name')) {
                $updateData['account_holder_name'] = $request->account_holder_name;
            }

            $member->update($updateData);

            return response()->json([
                'status' => 1,
                'message' => 'Member KYC (Aadhaar + Bank Account) verified & approved successfully!',
                'data' => $member
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Saving Accounts List
     */
    public function getSavingAccounts(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $query = FinancialScopeService::applyScope(FinancialAccount::query(), $user)
                                     ->where('service_type', 'SAVING')
                                     ->with(['member']);

            if ($request->filled('search')) {
                $s = trim($request->search);
                $query->where(function($q) use ($s) {
                    $q->where('account_number', 'like', "%{$s}%")
                      ->orWhereHas('member', function($mq) use ($s) {
                          $mq->where('name', 'like', "%{$s}%")
                             ->orWhere('mobile', 'like', "%{$s}%")
                             ->orWhere('member_id', 'like', "%{$s}%");
                      });
                });
            }

            $perPage = (int)$request->input('per_page', 15);
            $accounts = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'data' => $accounts,
                'company_name' => $this->getCompanyName($adminId),
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Open Saving Account (With Utility Wallet Auto-Debit & Agent MPIN)
     */
    public function openSavingAccount(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $adminId = $user->admin_id ?? ($user->role == 2 ? $user->id : 1);

            $validator = Validator::make($request->all(), [
                'member_id' => 'required|exists:financial_members,id',
                'plan_id' => 'nullable|exists:financial_plans,id',
                'opening_amount' => 'required|numeric|min:0',
                'mpin' => 'required|string|size:4',
                'nominee_name' => 'nullable|string|max:255',
                'nominee_relation' => 'nullable|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
            }

            $member = FinancialScopeService::applyScope(FinancialMember::where('id', $request->member_id), $user)
                                    ->firstOrFail();

            // 1. Strict KYC check - Member KYC must be APPROVED
            if (strtoupper($member->kyc_status ?? '') !== 'APPROVED') {
                return response()->json([
                    'status' => 0,
                    'message' => "Member KYC is not approved (Current status: " . ($member->kyc_status ?? 'PENDING') . "). Saving account can only be opened for KYC APPROVED members."
                ], 422);
            }

            // 2. Verified bank account and IFSC check for QR generation
            if (empty($member->account_number) || empty($member->ifsc_code)) {
                return response()->json([
                    'status' => 0,
                    'message' => "Member's verified bank account and IFSC details are required for QR generation. Please complete member KYC verification."
                ], 422);
            }



            $openingAmount = floatval($request->opening_amount);
            $txnId = FinancialScopeService::generateTxnId();

            // Auto-debit opening amount from Utility Wallet if openingAmount > 0
            if ($openingAmount > 0) {
                $debitRes = FinancialScopeService::processUtilityWalletDebit(
                    $request,
                    $user,
                    $request->mpin,
                    $openingAmount,
                    "Saving Account Opening ({$member->name})",
                    $txnId
                );

                if ($debitRes['status'] == 0) {
                    return response()->json($debitRes, 400);
                }
            }

            // 3. Call generate-qr API before opening saving account
            $qrUrl = "https://icchhamatidataservice.com/api/v2/generate-qr";
            $qrPayload = [
                "name"           => $member->name,
                "account_number" => $member->account_number,
                "account_ifsc"   => strtoupper(trim($member->ifsc_code))
            ];

            $ch = curl_init($qrUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => json_encode($qrPayload),
                CURLOPT_HTTPHEADER     => [
                    "Content-Type: application/json",
                    "Accept: application/json",
                    "mid: AGENT1475",
                    "mkey: 8ECgqn6xep6FPdVvzOs4ketqWQxG9qGY"
                ],
                CURLOPT_TIMEOUT        => 60,
                CURLOPT_CONNECTTIMEOUT => 20
            ]);

            $qrRawResponse = curl_exec($ch);
            $curlErr = curl_error($ch);
            curl_close($ch);

            // Log API call
            DB::table('logs')->insert([
                'mid'           => $user->mid ?? null,
                'type'          => 'Member Saving Account QR Generate',
                'platform'      => 'API',
                'headers'       => json_encode(["Content-Type" => "application/json"]),
                'request_data'  => json_encode($qrPayload),
                'response_data' => $qrRawResponse ?: $curlErr,
                'url'           => $qrUrl,
                'txnid'         => 'QR_GEN_' . time(),
                'status'        => 0,
                'timestamp'     => now(),
                'created_at'    => now()->format('Y-m-d H:i:s'),
            ]);

            $qrResult = json_decode($qrRawResponse, true);

            if (!isset($qrResult['status']) || $qrResult['status'] != 1 || empty($qrResult['data'])) {
                $errorMsg = $qrResult['message'] ?? (is_string($qrResult['data'] ?? null) ? $qrResult['data'] : 'Failed to generate QR code from partner bank');
                return response()->json([
                    'status' => 0,
                    'message' => "QR Generation failed: {$errorMsg}. Saving account opening aborted."
                ], 400);
            }

            $qrData = $qrResult['data'];
            $virtualAccountId    = $qrData['virtual_account_id'] ?? null;
            $virtualAccountNumber = $qrData['virtual_account_number'] ?? null;
            $virtualIfsc         = $qrData['virtual_ifsc'] ?? null;
            $virtualUpiHandle    = $qrData['virtual_upi_handle'] ?? null;
            $qrcodeImage         = $qrData['qrcode_image'] ?? null;
            $qrcodePdf           = $qrData['qrcode_pdf'] ?? null;

           

            $accountNumber = FinancialScopeService::generateAccountNumber('SB');

            $account = FinancialAccount::create([
                'account_number'         => $virtualAccountNumber,
                'member_id'              => $member->id,
                'user_id'                => $user->id,
                'admin_id'               => $adminId,
                'plan_id'                => $request->plan_id ?? null,
                'created_by'             => $user->id,
                'service_type'           => 'SAVING',
                'current_balance'        => $openingAmount,
                'available_balance'      => $openingAmount,
                'opening_amount'         => $openingAmount,
                'status'                 => 'ACTIVE',
                'nominee_name'           => $request->nominee_name ?? $member->nominee_name,
                'nominee_relation'       => $request->nominee_relation ?? $member->nominee_relation,
                'virtual_account_id'     => $virtualAccountId,
                'virtual_account_number' => $virtualAccountNumber,
                'virtual_ifsc'           => $virtualIfsc,
                'virtual_upi_handle'     => $virtualUpiHandle,
                'qrcode_image'           => $qrcodeImage,
                'qrcode_pdf'             => $qrcodePdf,
            ]);

            // Save in `va` table with user_type = 'MEMBER'
            Va::create([
                'mid'                    => $user->mid ?? null,
                'mobile'                 => $member->mobile ?? null,
                'username'               => $member->name,
                'account_number'         => $member->account_number,
                'account_ifsc'           => strtoupper(trim($member->ifsc_code)),
                'virtual_account_id'     => $virtualAccountId,
                'virtual_account_number' => $virtualAccountNumber,
                'virtual_ifsc'           => $virtualIfsc,
                'virtual_upi_handle'     => $virtualUpiHandle,
                'qrcode_image'           => $qrcodeImage,
                'qrcode_pdf'             => $qrcodePdf,
                'user_type'              => 'MEMBER',
                'member_id'              => $member->id,
                'financial_account_id'   => $account->id,
                'status'                 => 1,
            ]);

            if ($openingAmount > 0) {
                FinancialTransaction::create([
                    'transaction_id' => $txnId,
                    'account_id'     => $account->id,
                    'member_id'      => $member->id,
                    'user_id'        => $user->id,
                    'admin_id'       => $adminId,
                    'service_type'   => 'SAVING',
                    'txn_type'       => 'DEPOSIT',
                    'amount'         => $openingAmount,
                    'charges'        => 0,
                    'net_amount'     => $openingAmount,
                    'balance_before' => 0,
                    'balance_after'  => $openingAmount,
                    'payment_mode'   => 'UTILITY_WALLET',
                    'narration'      => "Saving Account Opening Deposit for Account {$account->account_number}",
                    'status'         => 'SUCCESS',
                ]);
            }

            // Calculate & Disburse Commission for Saving Account Opening
            FinancialCommissionService::processCommission(
                'SAVING_OPENING',
                $openingAmount > 0 ? $openingAmount : 1.0,
                $user,
                $adminId,
                $txnId,
                "Saving Account Opening ({$account->account_number})"
            );

            return response()->json([
                'status' => 1,
                'message' => "Saving Account {$accountNumber} opened successfully!",
                'data' => $account
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Saving Account Deposit (With Utility Wallet Auto-Debit & Agent MPIN)
     */
    public function depositSaving(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $adminId = $user->admin_id ?? ($user->role == 2 ? $user->id : 1);

            $validator = Validator::make($request->all(), [
                'account_id' => 'required|exists:financial_accounts,id',
                'amount' => 'required|numeric|min:1',
                'mpin' => 'required|string|size:4',
                'narration' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
            }

            $account = FinancialScopeService::applyScope(FinancialAccount::where('id', $request->account_id), $user)
                                      ->where('service_type', 'SAVING')
                                      ->firstOrFail();

            $amount = floatval($request->amount);
            $txnId = FinancialScopeService::generateTxnId();

            // Auto-debit from Utility Wallet
            $debitRes = FinancialScopeService::processUtilityWalletDebit(
                $request,
                $user,
                $request->mpin,
                $amount,
                "Saving Deposit for Account {$account->account_number}",
                $txnId
            );

            if ($debitRes['status'] == 0) {
                return response()->json($debitRes, 400);
            }

            DB::transaction(function() use ($account, $amount, $txnId, $user, $adminId, $request) {
                $balanceBefore = $account->current_balance;
                $balanceAfter = $balanceBefore + $amount;

                $account->update([
                    'current_balance' => $balanceAfter,
                    'available_balance' => $balanceAfter,
                ]);

                FinancialTransaction::create([
                    'transaction_id' => $txnId,
                    'account_id' => $account->id,
                    'member_id' => $account->member_id,
                    'user_id' => $user->id,
                    'admin_id' => $adminId,
                    'service_type' => 'SAVING',
                    'txn_type' => 'DEPOSIT',
                    'amount' => $amount,
                    'charges' => 0,
                    'net_amount' => $amount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $balanceAfter,
                    'payment_mode' => 'UTILITY_WALLET',
                    'narration' => $request->narration ?? "Saving Deposit for Account {$account->account_number}",
                    'status' => 'SUCCESS',
                ]);
            });

            return response()->json([
                'status' => 1,
                'message' => "Deposit of ₹{$amount} to Account {$account->account_number} completed successfully!",
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Send Withdrawal OTP to Member's Registered Mobile Number
     */
    public function sendWithdrawalOtp(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $adminId = $user->admin_id ?? ($user->role == 2 ? $user->id : 1);

            $validator = Validator::make($request->all(), [
                'account_id' => 'required|exists:financial_accounts,id',
                'amount' => 'required|numeric|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
            }

            $account = FinancialScopeService::applyScope(FinancialAccount::where('id', $request->account_id), $user)
                                      ->with('member')
                                      ->firstOrFail();

            $member = $account->member;

            // Strict Backend KYC Check for Withdrawal
            $setting = FinancialSetting::where('admin_id', $adminId)->first();
            $kycMandatory = $setting ? ($setting->kyc_required_at_withdrawal ?? true) : true;

            if ($kycMandatory && $member->kyc_status !== 'APPROVED') {
                return response()->json([
                    'status' => 0,
                    'message' => 'Withdrawal Rejected: Member KYC is not approved.'
                ], 400);
            }

            $amount = floatval($request->amount);
            if ($account->available_balance < $amount) {
                return response()->json([
                    'status' => 0,
                    'message' => "Insufficient available balance. Available: ₹{$account->available_balance}"
                ], 400);
            }

            // Generate 6-digit OTP
            $otp = (string)rand(100000, 999999);
            
            // Hardcode bypass for test number if needed
            if ($member->mobile === '9835153380') {
                $otp = '957295';
            }

            FinancialOtp::create([
                'mobile' => $member->mobile,
                'otp' => $otp,
                'purpose' => 'WITHDRAWAL',
                'account_id' => $account->id,
                'member_id' => $member->id,
                'expires_at' => Carbon::now()->addMinutes(10),
            ]);

            // Send SMS using approved DLT template
            $messageRow = function_exists('getMessageRow') ? (getMessageRow("VerificationOTP", $adminId) ?? getMessageRow("VerificationOTP", 1)) : null;
            $templateId = $messageRow ? $messageRow->template_id : '1207161536281928374';
            if ($messageRow && !empty($messageRow->message)) {
                $messageTemplate = $messageRow->message;
                eval("\$message = \"$messageTemplate\";");
            } else {
                $message = "Your OTP for verification is {$otp}.";
            }

            $smsResult = null;
            if (function_exists('sendSms')) {
                $smsResult = sendSms($message, $adminId, $member->mobile, $templateId);
            }

            \Log::info("Saving withdrawal OTP generated for member {$member->mobile}: {$otp}. SMS Result: " . json_encode($smsResult));

            return response()->json([
                'status' => 1,
                'message' => "OTP sent successfully to member's registered mobile number (" . substr($member->mobile, 0, 3) . "*****" . substr($member->mobile, -2) . ").",
                'mobile' => $member->mobile,
                'otp' =>  null,
                'sms_status' => $smsResult['status'] ?? null,
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Saving Account Withdrawal (Verifies Member OTP + Agent MPIN)
     */
    public function withdrawSaving(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $adminId = $user->admin_id ?? ($user->role == 2 ? $user->id : 1);

            $validator = Validator::make($request->all(), [
                'account_id' => 'required|exists:financial_accounts,id',
                'amount' => 'required|numeric|min:1',
                'otp' => 'required|string|size:6',
                'narration' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
            }

            $account = FinancialScopeService::applyScope(FinancialAccount::where('id', $request->account_id), $user)
                                      ->where('service_type', 'SAVING')
                                      ->with('member')
                                      ->firstOrFail();

            $member = $account->member;

            // 1. Verify Member Mobile OTP
            $otpRecord = FinancialOtp::where('mobile', $member->mobile)
                                     ->where('account_id', $account->id)
                                     ->where('purpose', 'WITHDRAWAL')
                                     ->where('otp', $request->otp)
                                     ->where('is_used', false)
                                     ->where('expires_at', '>=', Carbon::now())
                                     ->latest()
                                     ->first();

            if (!$otpRecord) {
                return response()->json(['status' => 0, 'message' => 'Invalid or expired OTP. Please try again.'], 400);
            }

            $amount = floatval($request->amount);
            if ($account->available_balance < $amount) {
                return response()->json(['status' => 0, 'message' => "Insufficient available balance in account."], 400);
            }


            // 2. Strict Backend KYC Check
            $setting = FinancialSetting::where('admin_id', $adminId)->first();
            $kycMandatory = $setting ? ($setting->kyc_required_at_withdrawal ?? true) : true;

            if ($kycMandatory && $member->kyc_status !== 'APPROVED') {
                return response()->json(['status' => 0, 'message' => 'Withdrawal Rejected: Member KYC is not approved.'], 400);
            }

            $Walletaccount = Account::where('user_id', $user->id)->where('primary_status', false)->first();

            if (!$Walletaccount) {
                return response()->json(['status' => 0, 'message' => 'Agent Utility Wallet not found.'], 400);
            }

            $txnId = FinancialScopeService::generateTxnId();
            
            $transactionData1 = [
                'account_id' => $Walletaccount->id,
                'type' => 'CR',
                'amount' => $amount,
                'description' => 'Saving Withdrawal from Account '.$account->account_number,
                'transaction_id' => $txnId,
                'created_by' => $Walletaccount->user_id,
                'admin_id' => $Walletaccount->admin_id,
                'user_id' => $Walletaccount->user_id,
                'category_code' => 'SAVING_WITHDRAWAL'
            ];

            // Create the wallet transaction
            $transaction = createTransaction($transactionData1);
            if (isset($transaction['status']) && $transaction['status'] != 1) {
                return response()->json(['status' => 0, 'message' => $transaction['message'] ?? 'Wallet transaction failed.'], 400);
            }

            $financialTxn = null;
            DB::transaction(function() use ($account, $amount, $user, $adminId, $request, $otpRecord, $txnId, &$financialTxn) {
                $otpRecord->update(['is_used' => true]);

                $balanceBefore = $account->current_balance;
                $balanceAfter = $balanceBefore - $amount;

                $account->update([
                    'current_balance' => $balanceAfter,
                    'available_balance' => $balanceAfter,
                ]);

                $financialTxn = FinancialTransaction::create([
                    'transaction_id' => $txnId,
                    'account_id' => $account->id,
                    'member_id' => $account->member_id,
                    'user_id' => $user->id,
                    'admin_id' => $adminId,
                    'service_type' => 'SAVING',
                    'txn_type' => 'WITHDRAWAL',
                    'amount' => $amount,
                    'charges' => 0,
                    'net_amount' => $amount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $balanceAfter,
                    'payment_mode' => 'CASH',
                    'narration' => $request->narration ?? "Saving Withdrawal from Account {$account->account_number}",
                    'status' => 'SUCCESS',
                ]);
            });

            return response()->json([
                'status' => 1,
                'message' => "Withdrawal of ₹{$amount} from Account {$account->account_number} completed successfully!",
                'transaction' => $financialTxn,
                'transaction_id' => $txnId,
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Accounts by Service Type (DD, RD, FD, MIS)
     */
    public function getAccountsByType(Request $request, $serviceType)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $adminId = $user->admin_id ?? ($user->role == 2 ? $user->id : 1);
            $type = strtoupper($serviceType);

            $query = FinancialScopeService::applyScope(FinancialAccount::query(), $user)
                                     ->where('service_type', $type)
                                     ->with(['member']);

            if ($request->filled('search')) {
                $s = trim($request->search);
                $query->where(function($q) use ($s) {
                    $q->where('account_number', 'like', "%{$s}%")
                      ->orWhereHas('member', function($mq) use ($s) {
                          $mq->where('name', 'like', "%{$s}%")
                             ->orWhere('mobile', 'like', "%{$s}%")
                             ->orWhere('member_id', 'like', "%{$s}%");
                      });
                });
            }

            $perPage = (int)$request->input('per_page', 15);
            $accounts = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'data' => $accounts,
                'company_name' => $this->getCompanyName($adminId),
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Open DD, RD, FD, or MIS Account (Utility Wallet Debit + MPIN)
     */
    public function openFinancialAccount(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $adminId = $user->admin_id ?? ($user->role == 2 ? $user->id : 1);

            $validator = Validator::make($request->all(), [
                'member_id' => 'required|exists:financial_members,id',
                'service_type' => 'required|in:DD,RD,FD,MIS',
                'amount' => 'required|numeric|min:1',
                'duration_months' => 'nullable|integer|min:1',
                'mpin' => 'required|string|size:4',
                'nominee_name' => 'nullable|string|max:255',
                'nominee_relation' => 'nullable|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
            }

            $member = FinancialScopeService::applyScope(FinancialMember::where('id', $request->member_id), $user)
                                    ->firstOrFail();

            $serviceType = strtoupper($request->service_type);
            $amount = floatval($request->amount);
            $txnId = FinancialScopeService::generateTxnId();

            // Auto-debit opening amount from Utility Wallet
            $debitRes = FinancialScopeService::processUtilityWalletDebit(
                $request,
                $user,
                $request->mpin,
                $amount,
                "{$serviceType} Account Opening ({$member->name})",
                $txnId
            );

            if ($debitRes['status'] == 0) {
                return response()->json($debitRes, 400);
            }

            $accountNumber = FinancialScopeService::generateAccountNumber($serviceType);

            $account = FinancialAccount::create([
                'account_number' => $accountNumber,
                'member_id' => $member->id,
                'user_id' => $user->id,
                'admin_id' => $adminId,
                'created_by' => $user->id,
                'service_type' => $serviceType,
                'plan_id' => $request->plan_id ?? null,
                'current_balance' => $amount,
                'available_balance' => $amount,
                'opening_amount' => $amount,
                'interest_rate' => floatval($request->interest_rate ?? 7.5),
                'duration_months' => (int)($request->duration_months ?? 12),
                'status' => 'ACTIVE',
                'nominee_name' => $request->nominee_name ?? $member->nominee_name,
                'nominee_relation' => $request->nominee_relation ?? $member->nominee_relation,
            ]);

            FinancialTransaction::create([
                'transaction_id' => $txnId,
                'account_id' => $account->id,
                'member_id' => $member->id,
                'user_id' => $user->id,
                'admin_id' => $adminId,
                'service_type' => $serviceType,
                'txn_type' => 'DEPOSIT',
                'amount' => $amount,
                'charges' => 0,
                'net_amount' => $amount,
                'balance_before' => 0,
                'balance_after' => $amount,
                'payment_mode' => 'UTILITY_WALLET',
                'narration' => "{$serviceType} Account Opening Deposit for {$account->account_number}",
                'status' => 'SUCCESS',
            ]);

            // Calculate & Disburse Commission for RD / DD / FD / MIS Account Opening
            $commServiceKey = strtoupper($serviceType) . '_OPENING';
            FinancialCommissionService::processCommission(
                $commServiceKey,
                $amount > 0 ? $amount : 1.0,
                $user,
                $adminId,
                $txnId,
                "{$serviceType} Account Opening ({$account->account_number})"
            );

            return response()->json([
                'status' => 1,
                'message' => "{$serviceType} Account {$accountNumber} opened successfully!",
                'data' => $account
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Collect DD / RD Installment or Field Collection (Utility Wallet Debit + MPIN)
     */
    public function collectInstallment(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $adminId = $user->admin_id ?? ($user->role == 2 ? $user->id : 1);

            $validator = Validator::make($request->all(), [
                'account_id' => 'required|exists:financial_accounts,id',
                'amount' => 'required|numeric|min:1',
                'mpin' => 'required|string|size:4',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
            }

            $account = FinancialScopeService::applyScope(FinancialAccount::where('id', $request->account_id), $user)
                                      ->firstOrFail();

            $amount = floatval($request->amount);
            $txnId = FinancialScopeService::generateTxnId();

            // Auto-debit from Utility Wallet
            $debitRes = FinancialScopeService::processUtilityWalletDebit(
                $request,
                $user,
                $request->mpin,
                $amount,
                "{$account->service_type} Collection for Account {$account->account_number}",
                $txnId
            );

            if ($debitRes['status'] == 0) {
                return response()->json($debitRes, 400);
            }

            $txn = null;
            DB::transaction(function() use ($account, $amount, $txnId, $user, $adminId, $request, &$txn) {
                $balanceBefore = $account->current_balance;
                $balanceAfter = $balanceBefore + $amount;

                $account->update([
                    'current_balance' => $balanceAfter,
                    'available_balance' => $balanceAfter,
                ]);

                $txn = FinancialTransaction::create([
                    'transaction_id' => $txnId,
                    'account_id' => $account->id,
                    'member_id' => $account->member_id,
                    'user_id' => $user->id,
                    'admin_id' => $adminId,
                    'service_type' => $account->service_type,
                    'txn_type' => 'DEPOSIT',
                    'amount' => $amount,
                    'charges' => 0,
                    'net_amount' => $amount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $balanceAfter,
                    'payment_mode' => 'UTILITY_WALLET',
                    'narration' => $request->narration ?? "{$account->service_type} Collection for Account {$account->account_number}",
                    'status' => 'SUCCESS',
                ]);
            });

            // Calculate & Disburse Commission for RD / DD Deposit Collection
            $commServiceKey = strtoupper($account->service_type) . '_DEPOSIT';
            FinancialCommissionService::processCommission(
                $commServiceKey,
                $amount,
                $user,
                $adminId,
                $txnId,
                "{$account->service_type} Installment Collection ({$account->account_number})"
            );

            return response()->json([
                'status' => 1,
                'message' => "Collection of ₹{$amount} for Account {$account->account_number} posted successfully!",
                'transaction' => $txn,
                'account' => $account->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get FD Certificate Details
     */
    public function getFdCertificate($id)
    {
        try {
            $user = request()->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $account = FinancialScopeService::applyScope(FinancialAccount::where('id', $id), $user)
                                      ->where('service_type', 'FD')
                                      ->with('member')
                                      ->firstOrFail();

            $openingDate = Carbon::parse($account->created_at);
            $maturityDate = (clone $openingDate)->addMonths($account->duration_months ?? 12);
            $rate = floatval($account->interest_rate ?? 7.5);
            $principal = floatval($account->opening_amount);
            $estimatedInterest = ($principal * $rate * (($account->duration_months ?? 12) / 12)) / 100;
            $maturityAmount = $principal + $estimatedInterest;

            return response()->json([
                'status' => 1,
                'data' => [
                    'account_number' => $account->account_number,
                    'member_name' => $account->member->name,
                    'member_id' => $account->member->member_id,
                    'mobile' => $account->member->mobile,
                    'principal' => $principal,
                    'interest_rate' => $rate,
                    'duration_months' => $account->duration_months ?? 12,
                    'opening_date' => $openingDate->toDateString(),
                    'maturity_date' => $maturityDate->toDateString(),
                    'maturity_amount' => $maturityAmount,
                    'nominee_name' => $account->nominee_name ?? $account->member->nominee_name,
                    'nominee_relation' => $account->nominee_relation ?? $account->member->nominee_relation,
                    'status' => $account->status,
                    'company_name' => $this->getCompanyName($adminId),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'FD Account not found.'], 404);
        }
    }

    /**
     * Get Maturities Center List
     */
    public function getMaturityList(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $maturities = FinancialScopeService::applyScope(FinancialMaturity::query(), $user)
                                          ->with(['account:id,account_number,service_type', 'member:id,name,member_id,mobile'])
                                          ->orderBy('id', 'desc')
                                          ->paginate(15);

            return response()->json([
                'status' => 1,
                'data' => $maturities
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Scoped Passbook Statement
     */
    public function getPassbookStatement(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $query = FinancialScopeService::applyScope(FinancialTransaction::query(), $user)
                                         ->with(['member:id,name,member_id', 'account:id,account_number,service_type']);

            // If account_id or account_number is specified, filter by that account specifically
            if ($request->filled('account_id')) {
                $query->where('account_id', $request->account_id);
            } elseif ($request->filled('account_number')) {
                $accNo = trim($request->account_number);
                $query->whereHas('account', function($q) use ($accNo) {
                    $q->where('account_number', $accNo);
                });
            }

            if ($request->filled('service_type')) {
                $query->where('service_type', $request->service_type);
            }

            if ($request->filled('txn_type')) {
                $query->where('txn_type', $request->txn_type);
            }

            if ($request->filled('from_date')) {
                $query->whereDate('created_at', '>=', $request->from_date);
            }

            if ($request->filled('to_date')) {
                $query->whereDate('created_at', '<=', $request->to_date);
            }

            $perPage = (int)$request->input('per_page', 100);
            $transactions = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'data' => $transactions,
                'company_name' => $this->getCompanyName($adminId),
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Scoped Agent Reports Data
     */
    public function getAgentReports(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $adminId = $user->admin_id ?? ($user->role == 2 ? $user->id : 1);
            $reportType = $request->input('report_type', 'MEMBERS');

            if ($reportType === 'MEMBERS') {
                $data = FinancialScopeService::applyScope(FinancialMember::query(), $user)->orderBy('id', 'desc')->get();
            } else if ($reportType === 'SAVING') {
                $data = FinancialScopeService::applyScope(FinancialAccount::query(), $user)->where('service_type', 'SAVING')->with('member')->get();
            } else if ($reportType === 'DD') {
                $data = FinancialScopeService::applyScope(FinancialAccount::query(), $user)->where('service_type', 'DD')->with('member')->get();
            } else if ($reportType === 'RD') {
                $data = FinancialScopeService::applyScope(FinancialAccount::query(), $user)->where('service_type', 'RD')->with('member')->get();
            } else if ($reportType === 'FD') {
                $data = FinancialScopeService::applyScope(FinancialAccount::query(), $user)->where('service_type', 'FD')->with('member')->get();
            } else {
                $data = FinancialScopeService::applyScope(FinancialTransaction::query(), $user)->with(['member', 'account'])->orderBy('id', 'desc')->take(100)->get();
            }

            return response()->json([
                'status' => 1,
                'report_type' => $reportType,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Daily Closing Calculations for Agent
     */
    public function getDailyClosingInfo(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $adminId = $user->admin_id ?? ($user->role == 2 ? $user->id : 1);
            $today = Carbon::today()->toDateString();

            // Calculate opening balance from last approved closing or 0
            $lastClosing = FinancialDailyClosing::where('user_id', $user->id)
                                                ->where('admin_id', $adminId)
                                                ->where('status', 'APPROVED')
                                                ->orderBy('closing_date', 'desc')
                                                ->first();

            $openingBalance = $lastClosing ? floatval($lastClosing->closing_balance) : 0.00;

            $txnQuery = FinancialTransaction::where('user_id', $user->id)
                                            ->where('admin_id', $adminId)
                                            ->whereDate('created_at', $today);

            $totalDeposit = (clone $txnQuery)->where('txn_type', 'DEPOSIT')->sum('amount');
            $totalWithdrawal = (clone $txnQuery)->where('txn_type', 'WITHDRAWAL')->sum('amount');
            $closingBalance = $openingBalance + $totalDeposit - $totalWithdrawal;

            $existingClosing = FinancialDailyClosing::where('user_id', $user->id)
                                                    ->where('admin_id', $adminId)
                                                    ->whereDate('closing_date', $today)
                                                    ->first();

            return response()->json([
                'status' => 1,
                'data' => [
                    'closing_date' => $today,
                    'opening_balance' => $openingBalance,
                    'total_deposit' => floatval($totalDeposit),
                    'total_withdrawal' => floatval($totalWithdrawal),
                    'calculated_closing_balance' => floatval($closingBalance),
                    'today_status' => $existingClosing ? $existingClosing->status : 'NOT_SUBMITTED',
                    'existing_closing' => $existingClosing,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Submit Agent Daily Closing
     */
    public function submitDailyClosing(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $adminId = $user->admin_id ?? ($user->role == 2 ? $user->id : 1);

            $validator = Validator::make($request->all(), [
                'physical_cash' => 'required|numeric|min:0',
                'remark' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
            }

            $today = Carbon::today()->toDateString();
            $txnQuery = FinancialTransaction::where('user_id', $user->id)
                                            ->where('admin_id', $adminId)
                                            ->whereDate('created_at', $today);

            $lastClosing = FinancialDailyClosing::where('user_id', $user->id)
                                                ->where('admin_id', $adminId)
                                                ->where('status', 'APPROVED')
                                                ->orderBy('closing_date', 'desc')
                                                ->first();

            $openingBalance = $lastClosing ? floatval($lastClosing->closing_balance) : 0.00;
            $totalDeposit = floatval((clone $txnQuery)->where('txn_type', 'DEPOSIT')->sum('amount'));
            $totalWithdrawal = floatval((clone $txnQuery)->where('txn_type', 'WITHDRAWAL')->sum('amount'));
            $closingBalance = $openingBalance + $totalDeposit - $totalWithdrawal;
            $physicalCash = floatval($request->physical_cash);
            $difference = $physicalCash - $closingBalance;

            $closing = FinancialDailyClosing::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'admin_id' => $adminId,
                    'closing_date' => $today,
                ],
                [
                    'opening_balance' => $openingBalance,
                    'total_deposit' => $totalDeposit,
                    'total_withdrawal' => $totalWithdrawal,
                    'closing_balance' => $closingBalance,
                    'physical_cash' => $physicalCash,
                    'difference' => $difference,
                    'status' => 'PENDING',
                    'remark' => $request->remark,
                ]
            );

            return response()->json([
                'status' => 1,
                'message' => 'Daily closing submitted successfully for Admin approval!',
                'data' => $closing
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Company Name from admin settings
     */
    protected function getCompanyName($adminId)
    {
        $setting = DB::table('settings')->where('user_id', $adminId)->first();
        if (!$setting) {
            $setting = DB::table('settings')->where('status', 1)->first() ?? DB::table('settings')->first();
        }
        return $setting->company_name ?? 'FINANCIAL SERVICES LIMITED';
    }
}

