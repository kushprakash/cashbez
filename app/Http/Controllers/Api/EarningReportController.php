<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

/**
 * Earnings Report Controller
 * 
 * Provides accurate, auditable, category-wise earnings and business reports.
 * All calculations are done server-side. Frontend displays only.
 * 
 * Data Sources:
 * - AEPS Transactions: aeps_cw_success_base
 * - AEPS Business: aeps_merchant_total_volume_base
 * - Commission Records: passbook_commissions_view (has service_type)
 * - Daily Summary: passbook_commission_daily_summary
 * - Monthly Summary: passbook_commission_monthly_summary
 * - Service Mapping: passbook_commission_service_map
 */
class EarningReportController extends Controller
{
    /**
     * GET /api/earnings/categories
     * Returns active service categories from database (not hardcoded)
     */
    public function categories(Request $request)
    {
        try {
            // Fetch from passbook_commission_service_map - dynamic, not hardcoded
            $services = Cache::remember('earnings_service_categories', 300, function () {
                return DB::table('passbook_commission_service_map')
                    ->where('is_active', 1)
                    ->orderBy('id')
                    ->get(['service_code', 'match_pattern']);
            });

            // Build category list with ALL as first option
            $categories = collect([
                ['code' => 'ALL', 'name' => 'All Services', 'icon' => 'category'],
            ]);

            // Map database services to display names
            $iconMap = [
                'CASH_WITHDRAWAL' => 'account_balance',
                'MATM_WITHDRAWAL' => 'card',
                'MINI_STATEMENT' => 'receipt',
                'MOBILE' => 'phone_android',
                'DTH' => 'tv',
                'BILLPAY' => 'receipt_long',
                'MON_BUSS' => 'business',
            ];

            $nameMap = [
                'CASH_WITHDRAWAL' => 'AEPS Cash Withdrawal',
                'MATM_WITHDRAWAL' => 'MATM Cash Withdrawal',
                'MINI_STATEMENT' => 'Mini Statement',
                'MOBILE' => 'Mobile Recharge',
                'DTH' => 'DTH Recharge',
                'BILLPAY' => 'Bill Pay',
                'MON_BUSS' => 'Monthly Business',
            ];

            foreach ($services as $service) {
                $code = $service->service_code;
                $categories->push([
                    'code' => $code,
                    'name' => $nameMap[$code] ?? ucwords(str_replace('_', ' ', strtolower($code))),
                    'icon' => $iconMap[$code] ?? 'category',
                ]);
            }

            return response()->json([
                'status' => 1,
                'data' => $categories->values(),
            ]);
        } catch (\Exception $e) {
            Log::error('EarningReportController: categories error', ['error' => $e->getMessage()]);
            return response()->json(['status' => 0, 'message' => 'Failed to fetch categories'], 500);
        }
    }

    /**
     * GET /api/earnings/summary
     * Main summary endpoint with comparison
     * 
     * Params:
     * - service: ALL or any service_code from passbook_commission_service_map
     * - range: daily|weekly|monthly
     * - date: YYYY-MM-DD (optional, defaults to today)
     * - till_date: true|false (for "till now" calculation)
     */
    public function summary(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
            }
            
            $userId = $user->id;
            $mid = $user->mid ?? null;

            $service = $request->get('service', 'ALL');
            $range = $request->get('range', 'monthly');
            $date = $request->get('date') ? Carbon::parse($request->get('date')) : Carbon::now();
            $tillDate = filter_var($request->get('till_date', true), FILTER_VALIDATE_BOOLEAN);

            // Resolve periods (IST timezone)
            $date->setTimezone('Asia/Kolkata');
            [$start, $end, $prevStart, $prevEnd] = $this->resolvePeriod($range, $date, $tillDate);

            // Get current and previous period data
            $current = $this->aggregate($userId, $mid, $service, $start, $end);
            $previous = $this->aggregate($userId, $mid, $service, $prevStart, $prevEnd);

            // Get chart data (backend prepared, frontend displays only)
            $chart = $this->chartData($userId, $mid, $service, $range, $date);

            // Get all-time best
            $allTimeBest = $this->allTimeBest($userId, $mid, $service);

            // Comparison label
            $comparisonLabel = $this->getComparisonLabel($range, $tillDate, $end);

            return response()->json([
                'status' => 1,
                'data' => [
                    'period' => [
                        'start' => $start->toDateString(),
                        'end' => $end->toDateString(),
                        'label' => $this->formatPeriodLabel($range, $start, $end, $tillDate),
                    ],
                    'comparison_label' => $comparisonLabel,
                    'transactions' => $this->compare($current['transactions'], $previous['transactions']),
                    'business' => $this->compare($current['business'], $previous['business']),
                    'earning' => $this->compare($current['earning'], $previous['earning']),
                    'chart' => $chart,
                    'all_time_best' => $allTimeBest,
                    'service_code' => $service,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('EarningReportController: summary error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['status' => 0, 'message' => 'Failed to fetch summary'], 500);
        }
    }

    /**
     * Aggregate earnings data for a period
     * 
     * Sources:
     * - Transactions: passbook_commissions_view (count) OR aeps_cw_success_base for AEPS
     * - Business: aeps_merchant_total_volume_base (only for CASH_WITHDRAWAL)
     * - Earnings: passbook_commissions_view (sum where type=CR)
     */
    private function aggregate($userId, $mid, $service, Carbon $start, Carbon $end): array
    {
        // Earnings - from passbook_commissions_view (has service_type column)
        $earningQ = DB::table('passbook_commissions_view')
            ->where('user_id', $userId)
            ->where('type', 'CR')
            ->whereBetween('created_at', [$start, $end]);

        if ($service !== 'ALL') {
            $earningQ->where('service_type', $service);
        }

        $earning = round((float) $earningQ->sum('amount'), 2);

        // Transaction count - from same view, but exclude MON_BUSS
        $txnQ = DB::table('passbook_commissions_view')
            ->where('user_id', $userId)
            ->where('type', 'CR')
            ->where('service_type', '!=', 'MON_BUSS')
            ->whereBetween('created_at', [$start, $end]);

        if ($service !== 'ALL' && $service !== 'MON_BUSS') {
            $txnQ->where('service_type', $service);
        }

        $transactions = (int) $txnQ->count();

        // Business volume
        $business = 0.0;
        if ($mid) {
            if ($service === 'ALL' || $service === 'CASH_WITHDRAWAL') {
                $business += round((float) DB::table('aeps_merchant_total_volume_base')
                    ->where('mid', $mid)
                    ->whereBetween('txn_date', [$start->toDateString(), $end->toDateString()])
                    ->sum('total_amount'), 2);
            }
            if ($service === 'ALL' || $service === 'MATM_WITHDRAWAL') {
                $business += round((float) DB::table('matm_merchant_total_volume_base')
                    ->where('mid', $mid)
                    ->whereBetween('txn_date', [$start->toDateString(), $end->toDateString()])
                    ->sum('total_amount'), 2);
            }
        }

        return compact('transactions', 'business', 'earning');
    }

    /**
     * Resolve period boundaries (IST timezone)
     */
    private function resolvePeriod(string $range, Carbon $date, bool $tillDate): array
    {
        switch ($range) {
            case 'daily':
                $start = $date->copy()->startOfDay();
                $end = $date->copy()->endOfDay();
                $prevStart = $start->copy()->subDay();
                $prevEnd = $end->copy()->subDay();
                break;

            case 'weekly':
                $start = $date->copy()->startOfWeek(Carbon::MONDAY);
                $end = $tillDate ? Carbon::now('Asia/Kolkata') : $date->copy()->endOfWeek(Carbon::SUNDAY);
                $prevStart = $start->copy()->subWeek();
                $daysDiff = $start->diffInDays($end);
                $prevEnd = $prevStart->copy()->addDays($daysDiff);
                break;

            default: // monthly
                $start = $date->copy()->startOfMonth();
                $end = $tillDate ? Carbon::now('Asia/Kolkata') : $date->copy()->endOfMonth();
                $prevStart = $start->copy()->subMonth();
                $daysDiff = $start->diffInDays($end);
                $prevEnd = $prevStart->copy()->addDays($daysDiff);
        }

        return [$start, $end, $prevStart, $prevEnd];
    }

    /**
     * Format period label for display
     */
    private function formatPeriodLabel(string $range, Carbon $start, Carbon $end, bool $tillDate): string
    {
        switch ($range) {
            case 'daily':
                return $start->format('d M Y');
            case 'weekly':
                return $start->format('d M') . ' - ' . $end->format('d M Y');
            default: // monthly
                if ($tillDate) {
                    return $start->format('d M') . ' - ' . $end->format('d M Y');
                }
                return $end->format('F Y');
        }
    }

    /**
     * Get comparison label text
     */
    private function getComparisonLabel(string $range, bool $tillDate, Carbon $end): string
    {
        $dayLabel = $end->format('d M');
        
        switch ($range) {
            case 'daily':
                return "vs yesterday";
            case 'weekly':
                return $tillDate ? "vs same days last week (till $dayLabel)" : "vs last week";
            default:
                return $tillDate ? "vs last month (till $dayLabel)" : "vs last month";
        }
    }

    /**
     * Compare current vs previous and calculate trend
     * Frontend must display this, not recalculate
     */
    private function compare($current, $previous): array
    {
        $diff = $current - $previous;
        
        return [
            'current' => round((float)$current, 2),
            'previous' => round((float)$previous, 2),
            'difference' => round($diff, 2),
            'trend' => $diff > 0 ? 'UP' : ($diff < 0 ? 'DOWN' : 'NEUTRAL'),
        ];
    }

    /**
     * Get chart data for the selected period type
     * Returns chart-ready data. Frontend must NOT aggregate.
     * 
     * Sources:
     * - Daily/Weekly: passbook_commission_daily_summary
     * - Monthly: passbook_commission_monthly_summary
     * - Business: aeps_merchant_total_volume_base
     */
    private function chartData($userId, $mid, $service, $range, Carbon $date): array
    {
        $isAll = $service === 'ALL';
        $labels = [];
        $earning = [];
        $transactions = [];
        $business = [];
        $highlightIndex = null;

        switch ($range) {
            case 'daily':
                // Last 7 days
                $startDate = $date->copy()->subDays(6)->toDateString();
                
                $rows = DB::table('passbook_commission_daily_summary')
                    ->where('user_id', $userId)
                    ->when(!$isAll, fn($q) => $q->where('service_type', $service))
                    ->where('day', '>=', $startDate)
                    ->groupBy('day')
                    ->orderBy('day')
                    ->selectRaw('day, SUM(total_commission) as earning, SUM(transaction_count) as transactions')
                    ->get()
                    ->keyBy('day');

                // Fill all 7 days (missing = 0)
                for ($i = 6; $i >= 0; $i--) {
                    $d = $date->copy()->subDays($i)->toDateString();
                    $dayLabel = Carbon::parse($d)->format('D');
                    $labels[] = $dayLabel;
                    $earning[] = round((float)($rows[$d]->earning ?? 0), 2);
                    $transactions[] = (int)($rows[$d]->transactions ?? 0);
                }

                // Business volume
                $business = [];
                if ($mid) {
                    $bizData = [];
                    
                    if ($isAll || $service === 'CASH_WITHDRAWAL') {
                        $aepsRows = DB::table('aeps_merchant_total_volume_base')
                            ->where('mid', $mid)
                            ->where('txn_date', '>=', $startDate)
                            ->groupBy('txn_date')
                            ->selectRaw('txn_date as day, SUM(total_amount) as total')
                            ->get()
                            ->keyBy('day');
                            
                        foreach ($aepsRows as $day => $row) {
                            $bizData[$day] = ($bizData[$day] ?? 0) + $row->total;
                        }
                    }
                    
                    if ($isAll || $service === 'MATM_WITHDRAWAL') {
                        $matmRows = DB::table('matm_merchant_total_volume_base')
                            ->where('mid', $mid)
                            ->where('txn_date', '>=', $startDate)
                            ->groupBy('txn_date')
                            ->selectRaw('txn_date as day, SUM(total_amount) as total')
                            ->get()
                            ->keyBy('day');
                            
                        foreach ($matmRows as $day => $row) {
                            $bizData[$day] = ($bizData[$day] ?? 0) + $row->total;
                        }
                    }
                    
                    for ($i = 6; $i >= 0; $i--) {
                        $d = $date->copy()->subDays($i)->toDateString();
                        $business[] = round((float)($bizData[$d] ?? 0), 2);
                    }
                } else {
                    $business = array_fill(0, 7, 0);
                }
                break;

            case 'weekly':
                // Last 8 weeks
                $startDate = $date->copy()->subWeeks(7)->startOfWeek(Carbon::MONDAY)->toDateString();
                
                $rows = DB::table('passbook_commission_daily_summary')
                    ->where('user_id', $userId)
                    ->when(!$isAll, fn($q) => $q->where('service_type', $service))
                    ->where('day', '>=', $startDate)
                    ->selectRaw('YEARWEEK(day, 1) as yw, MIN(day) as week_start, SUM(total_commission) as earning, SUM(transaction_count) as transactions')
                    ->groupBy('yw')
                    ->orderBy('yw')
                    ->get();

                foreach ($rows as $row) {
                    $labels[] = 'W' . Carbon::parse($row->week_start)->weekOfYear;
                    $earning[] = round((float)$row->earning, 2);
                    $transactions[] = (int)$row->transactions;
                }

                // Business for weekly
                $business = [];
                if ($mid) {
                    $bizData = [];
                    
                    if ($isAll || $service === 'CASH_WITHDRAWAL') {
                        $aepsRows = DB::table('aeps_merchant_total_volume_base')
                            ->where('mid', $mid)
                            ->where('txn_date', '>=', $startDate)
                            ->selectRaw('YEARWEEK(txn_date, 1) as yw, SUM(total_amount) as total')
                            ->groupBy('yw')
                            ->pluck('total', 'yw');
                            
                        foreach ($aepsRows as $yw => $total) {
                            $bizData[$yw] = ($bizData[$yw] ?? 0) + $total;
                        }
                    }
                    
                    if ($isAll || $service === 'MATM_WITHDRAWAL') {
                        $matmRows = DB::table('matm_merchant_total_volume_base')
                            ->where('mid', $mid)
                            ->where('txn_date', '>=', $startDate)
                            ->selectRaw('YEARWEEK(txn_date, 1) as yw, SUM(total_amount) as total')
                            ->groupBy('yw')
                            ->pluck('total', 'yw');
                            
                        foreach ($matmRows as $yw => $total) {
                            $bizData[$yw] = ($bizData[$yw] ?? 0) + $total;
                        }
                    }

                    foreach ($rows as $row) {
                        $business[] = round((float)($bizData[$row->yw] ?? 0), 2);
                    }
                } else {
                    $business = array_fill(0, count($labels), 0);
                }
                break;

            default: // monthly
                // Last 6 months from summary table
                $rows = DB::table('passbook_commission_monthly_summary')
                    ->where('user_id', $userId)
                    ->when(!$isAll, fn($q) => $q->where('service_type', $service))
                    ->groupBy('month')
                    ->orderBy('month')
                    ->selectRaw('month, SUM(total_commission) as earning, SUM(transaction_count) as transactions')
                    ->limit(12)
                    ->get();

                foreach ($rows as $row) {
                    $labels[] = Carbon::parse($row->month . '-01')->format('M');
                    $earning[] = round((float)$row->earning, 2);
                    $transactions[] = (int)$row->transactions;
                }

                // Business for monthly
                $business = [];
                if ($mid) {
                    $bizData = [];
                    
                    if ($isAll || $service === 'CASH_WITHDRAWAL') {
                        $aepsRows = DB::table('aeps_merchant_total_volume_base')
                            ->where('mid', $mid)
                            ->selectRaw('DATE_FORMAT(txn_date, "%Y-%m") as month, SUM(total_amount) as total')
                            ->groupBy('month')
                            ->pluck('total', 'month');
                            
                        foreach ($aepsRows as $month => $total) {
                            $bizData[$month] = ($bizData[$month] ?? 0) + $total;
                        }
                    }
                    
                    if ($isAll || $service === 'MATM_WITHDRAWAL') {
                        $matmRows = DB::table('matm_merchant_total_volume_base')
                            ->where('mid', $mid)
                            ->selectRaw('DATE_FORMAT(txn_date, "%Y-%m") as month, SUM(total_amount) as total')
                            ->groupBy('month')
                            ->pluck('total', 'month');
                            
                        foreach ($matmRows as $month => $total) {
                            $bizData[$month] = ($bizData[$month] ?? 0) + $total;
                        }
                    }

                    foreach ($rows as $row) {
                        $business[] = round((float)($bizData[$row->month] ?? 0), 2);
                    }
                } else {
                    $business = array_fill(0, count($labels), 0);
                }
        }

        // Find highlight (all-time best in this dataset)
        if (!empty($earning)) {
            $maxVal = max($earning);
            if ($maxVal > 0) {
                $highlightIndex = array_search($maxVal, $earning);
            }
        }

        return [
            'labels' => $labels,
            'earning' => $earning,
            'transactions' => $transactions,
            'business' => $business,
            'highlight' => $highlightIndex !== null && isset($labels[$highlightIndex]) ? $labels[$highlightIndex] : null,
        ];
    }

    /**
     * Get all-time best records
     * 
     * Returns:
     * - Best month for earnings
     * - Best month for business (if AEPS)
     */
    private function allTimeBest($userId, $mid, $service): ?array
    {
        $isAll = $service === 'ALL';

        // Best earnings month
        $bestEarning = DB::table('passbook_commission_monthly_summary')
            ->where('user_id', $userId)
            ->when(!$isAll, fn($q) => $q->where('service_type', $service))
            ->selectRaw('month, SUM(total_commission) as total')
            ->groupBy('month')
            ->orderByDesc('total')
            ->first();

        if (!$bestEarning) {
            return null;
        }

        $monthDate = Carbon::parse($bestEarning->month . '-01');
        $message = "Your best earning month is ₹" . number_format($bestEarning->total, 2) . 
                   " in " . $monthDate->format('M Y') . ".";

        // Best business month
        $bestBusiness = null;
        if ($mid && ($isAll || $service === 'CASH_WITHDRAWAL' || $service === 'MATM_WITHDRAWAL')) {
            $bizData = [];
            
            if ($isAll || $service === 'CASH_WITHDRAWAL') {
                $aepsRows = DB::table('aeps_merchant_total_volume_base')
                    ->where('mid', $mid)
                    ->selectRaw('DATE_FORMAT(txn_date, "%Y-%m") as month, SUM(total_amount) as total')
                    ->groupBy('month')
                    ->pluck('total', 'month');
                    
                foreach ($aepsRows as $month => $total) {
                    $bizData[$month] = ($bizData[$month] ?? 0) + $total;
                }
            }
            
            if ($isAll || $service === 'MATM_WITHDRAWAL') {
                $matmRows = DB::table('matm_merchant_total_volume_base')
                    ->where('mid', $mid)
                    ->selectRaw('DATE_FORMAT(txn_date, "%Y-%m") as month, SUM(total_amount) as total')
                    ->groupBy('month')
                    ->pluck('total', 'month');
                    
                foreach ($matmRows as $month => $total) {
                    $bizData[$month] = ($bizData[$month] ?? 0) + $total;
                }
            }
            
            if (!empty($bizData)) {
                arsort($bizData); // Sort descending
                $bestMonth = array_key_first($bizData);
                $bestTotal = $bizData[$bestMonth];
                
                if ($bestTotal > 0) {
                    $bizMonth = Carbon::parse($bestMonth . '-01');
                    $bestBusiness = [
                        'month' => $bestMonth,
                        'month_label' => $bizMonth->format('M Y'),
                        'amount' => round((float)$bestTotal, 2),
                    ];
                }
            }
        }

        return [
            'month' => $bestEarning->month,
            'month_label' => $monthDate->format('M Y'),
            'earning' => round((float)$bestEarning->total, 2),
            'message' => $message,
            'best_business' => $bestBusiness,
        ];
    }
}
