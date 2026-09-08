<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CommissionReportController extends Controller
{
    /**
     * Get Commission and TDS/Charges report with date filters, service filters & summary
     */
    public function index(Request $request)
    {
        try {
            $user = $request->get('user');
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'User not authenticated'], 401);
            }

            $userId = $user->id;

            // Fetch Primary and Secondary accounts
            $accounts = DB::table('accounts')->where('user_id', $userId)->get();
            $primaryAccountIds = $accounts->filter(function($a) {
                return $a->primary_status == 1 || $a->primary_status === true || $a->primary_status === '1' || $a->primary_status === 'true';
            })->pluck('id')->toArray();

            $secondaryAccountIds = $accounts->filter(function($a) {
                return $a->primary_status == 0 || $a->primary_status === false || $a->primary_status === '0' || $a->primary_status === 'false';
            })->pluck('id')->toArray();

            // Date & Filter Parameters (robust parsing)
            $startDate = $request->input('start_date') ?? $request->query('start_date');
            $endDate = $request->input('end_date') ?? $request->query('end_date');
            $rawType = strtolower(trim($request->input('type') ?? $request->input('report_type') ?? $request->query('type') ?? $request->query('report_type') ?? ''));
            
            if (empty($rawType) && str_contains(strtolower($request->fullUrl()), 'charges')) {
                $rawType = 'charges';
            }

            $serviceType = strtoupper(trim($request->input('service_type') ?? $request->query('service_type') ?? $request->query('service') ?? 'ALL'));
            $accountTypeFilter = strtoupper(trim($request->input('account_type') ?? $request->query('account_type') ?? $request->query('account') ?? 'ALL'));
            $isExport = $request->boolean('export', false);

            $chargeServices = ['TDS', '2FA', 'MOVE_TO', 'DMT', 'PAYOUT'];
            $isChargesReport = ($rawType === 'charges' || $rawType === 'charge' || str_contains($rawType, 'charge') || in_array($serviceType, $chargeServices));

            $baseQuery = DB::table('passbooks as p')
                ->join('accounts as a', 'p.account_id', '=', 'a.id')
                ->where('p.user_id', $userId);

            // Apply Date Range
            if (!empty($startDate)) {
                $baseQuery->where('p.created_at', '>=', Carbon::parse($startDate)->startOfDay());
            }
            if (!empty($endDate)) {
                $baseQuery->where('p.created_at', '<=', Carbon::parse($endDate)->endOfDay());
            }

            // Apply Account Type Filter
            if ($accountTypeFilter === 'PRIMARY' && !empty($primaryAccountIds)) {
                $baseQuery->whereIn('p.account_id', $primaryAccountIds);
            } elseif ($accountTypeFilter === 'SECONDARY' && !empty($secondaryAccountIds)) {
                $baseQuery->whereIn('p.account_id', $secondaryAccountIds);
            }

            // Apply Filter for Commissions (CR) or Charges (DR)
            if ($isChargesReport) {
                $baseQuery->where('p.type', 'DR');

                if ($serviceType === 'TDS') {
                    $baseQuery->where('p.description', 'LIKE', '%TDS%');
                } elseif ($serviceType === '2FA') {
                    $baseQuery->where(function($s) {
                        $s->where('p.description', 'LIKE', '%2FA%')
                          ->orWhere('p.description', 'LIKE', '%BIOMETRIC%')
                          ->orWhere('p.description', 'LIKE', '%AUTH%');
                    });
                } elseif ($serviceType === 'MOVE_TO') {
                    $baseQuery->where(function($s) {
                        $s->where('p.description', 'LIKE', '%MOVE TO%')
                          ->orWhere('p.description', 'LIKE', '%SETTLEMENT%')
                          ->orWhere('p.description', 'LIKE', '%MOVE_TO%');
                    });
                } elseif ($serviceType === 'DMT') {
                    $baseQuery->where(function($s) {
                        $s->where('p.description', 'LIKE', '%MONEY TRANSFER%')
                          ->orWhere('p.description', 'LIKE', '%DMT%');
                    });
                } elseif ($serviceType === 'PAYOUT') {
                    $baseQuery->where('p.description', 'LIKE', '%PAYOUT%');
                } else {
                    // ALL Charges & Deductions
                    $baseQuery->where(function($s) {
                        $s->where('p.description', 'LIKE', '%TDS%')
                          ->orWhere('p.description', 'LIKE', '%2FA%')
                          ->orWhere('p.description', 'LIKE', '%BIOMETRIC%')
                          ->orWhere('p.description', 'LIKE', '%AUTH%')
                          ->orWhere('p.description', 'LIKE', '%MOVE TO%')
                          ->orWhere('p.description', 'LIKE', '%SETTLEMENT%')
                          ->orWhere('p.description', 'LIKE', '%MOVE_TO%')
                          ->orWhere('p.description', 'LIKE', '%MONEY TRANSFER%')
                          ->orWhere('p.description', 'LIKE', '%DMT%')
                          ->orWhere('p.description', 'LIKE', '%PAYOUT%');
                    });
                }
            } else {
                // Commission Report (CR)
                $baseQuery->where('p.type', 'CR');

                if ($serviceType === 'RECHARGE') {
                    $baseQuery->where(function($s) {
                        $s->where('p.description', 'LIKE', '%RECHARGE%')
                          ->orWhere('p.description', 'LIKE', '%MOBILE%')
                          ->orWhere('p.description', 'LIKE', '%DTH%');
                    });
                } elseif ($serviceType === 'BBPS') {
                    $baseQuery->where(function($s) {
                        $s->where('p.description', 'LIKE', '%BBPS%')
                          ->orWhere('p.description', 'LIKE', '%BILL%')
                          ->orWhere('p.description', 'LIKE', '%ELECTRICITY%');
                    });
                } elseif ($serviceType === 'AEPS') {
                    $baseQuery->where(function($s) {
                        $s->where('p.description', 'LIKE', '%COMMISSION%')
                          ->orWhere('p.description', 'LIKE', '%COMM%')
                          ->orWhere('p.description', 'LIKE', '%CASHBACK%');
                    });
                } elseif ($serviceType === 'PAN') {
                    $baseQuery->where(function($s) {
                        $s->where('p.description', 'LIKE', '%PAN%')
                          ->orWhere('p.description', 'LIKE', '%CMS%');
                    });
                } elseif ($serviceType === 'OTHER') {
                    $baseQuery->where(function($s) {
                        $s->where('p.description', 'LIKE', '%COMMISSION%')
                          ->orWhere('p.description', 'LIKE', '%COMM%')
                          ->orWhere('p.description', 'LIKE', '%MARGIN%')
                          ->orWhere('p.description', 'LIKE', '%CASHBACK%');
                    });
                } else {
                    // ALL Commissions: Must be actual commission entries, excluding wallet transfers & main deposits
                    $baseQuery->where(function($s) {
                        $s->where('p.description', 'LIKE', '%COMMISSION%')
                          ->orWhere('p.description', 'LIKE', '%COMM%')
                          ->orWhere('p.description', 'LIKE', '%MARGIN%')
                          ->orWhere('p.description', 'LIKE', '%CASHBACK%')
                          ->orWhere('p.description', 'LIKE', '%RECHARGE%')
                          ->orWhere('p.description', 'LIKE', '%BBPS%')
                          ->orWhere('p.description', 'LIKE', '%BILL%')
                          ->orWhere('p.description', 'LIKE', '%PAN%');
                    })
                    ->where('p.description', 'NOT LIKE', '%Self Transfer%')
                    ->where('p.description', 'NOT LIKE', '%Transfer from%')
                    ->where('p.description', 'NOT LIKE', '%Transfer to%')
                    ->where('p.description', 'NOT LIKE', '%Deposit%')
                    ->where('p.description', 'NOT LIKE', '%Credit Add%');
                }
            }

            // Calculate Summary Totals for the Filtered Query (without selecting non-aggregated columns)
            $summaryData = (clone $baseQuery)->selectRaw("
                COALESCE(SUM(CASE WHEN p.type = 'CR' THEN p.amount ELSE 0 END), 0) as total_commissions,
                COALESCE(SUM(CASE WHEN p.type = 'DR' THEN p.amount ELSE 0 END), 0) as total_charges,
                COUNT(*) as total_transactions
            ")->first();

            $totalCommissions = (float) ($summaryData->total_commissions ?? 0);
            $totalCharges = (float) ($summaryData->total_charges ?? 0);
            $netEarnings = $totalCommissions - $totalCharges;

            // Fetch records with column selection
            $query = (clone $baseQuery)
                ->select(
                    'p.id',
                    'p.account_id',
                    'p.amount',
                    'p.type',
                    'p.description',
                    'p.transaction_id',
                    'p.balance',
                    'p.created_at',
                    'a.name as account_name',
                    'a.number as account_number',
                    'a.primary_status'
                )
                ->orderBy('p.id', 'desc');

            if ($isExport) {
                $records = $query->get();
                return response()->json([
                    'status' => 1,
                    'message' => 'Export data fetched successfully',
                    'summary' => [
                        'total_commissions' => $totalCommissions,
                        'total_charges' => $totalCharges,
                        'net_earnings' => $netEarnings,
                        'total_transactions' => (int) ($summaryData->total_transactions ?? 0),
                    ],
                    'data' => $records
                ]);
            }

            $perPage = (int) $request->input('per_page', 20);
            $records = $query->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'Commission & charges report fetched successfully',
                'summary' => [
                    'total_commissions' => $totalCommissions,
                    'total_charges' => $totalCharges,
                    'net_earnings' => $netEarnings,
                    'total_transactions' => (int) ($summaryData->total_transactions ?? 0),
                ],
                'data' => $records
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching report: ' . $e->getMessage()
            ], 500);
        }
    }
}
