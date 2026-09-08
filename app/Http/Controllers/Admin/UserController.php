<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use App\Models\Account;
use App\Models\UserKyc;
use App\Models\Passbook;
use App\Models\AepsDraft;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use App\Models\AepsTransaction;
use App\Models\Recharge;
use App\Services\CatchLogService;

class UserController extends Controller
{

    public function index(Request $request)
    {
        try {

            $authUser = auth()->user();

            /* ============================================================
             * DATE FILTER HELPER
             * Defined once, reused across all queries
             * ============================================================ */
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');

            $applyDate = function ($q) use ($startDate, $endDate) {
                if ($startDate && $endDate) {
                    $q->whereBetween('created_at', [
                        $startDate . ' 00:00:00',
                        $endDate . ' 23:59:59',
                    ]);
                }
            };

            /* ============================================================
             * RESOLVE EFFECTIVE FILTER ID
             *
             * Role 20 (Support) is a proxy account — they should see only
             * the downline of their direct parent admin, not everything.
             *
             * `root` is a CSV ancestry chain e.g. "1,21,45"
             * The direct parent is the LAST value in that chain.
             *
             * Examples:
             *   Support user root = "1,21"  → parentId = 21
             *   Support user root = "1,5"   → parentId = 5  (dynamic!)
             *   Any other role              → filterId  = their own id
             * ============================================================ */
            $effectiveFilterId = $authUser->id; // default: filter by self

            if ($authUser->role == 20 && !empty($authUser->root)) {
                $rootChain = array_filter(explode(',', $authUser->root));
                $effectiveFilterId = (int) end($rootChain); // direct parent admin
            }

            /* ============================================================
             * HIERARCHY FILTER HELPER
             * Uses $effectiveFilterId so role 20 transparently acts as
             * their parent admin — no hardcoded IDs anywhere
             * ============================================================ */
            $applyHierarchyFilter = function ($q) use ($authUser, $request, $effectiveFilterId) {
                if (!empty($request->selected_admin_id) && $request->selected_admin_id !== 'all') {
                    // Explicit admin selected from dropdown
                    $selectedId = $request->selected_admin_id;
                    $q->where(function ($inner) use ($selectedId) {
                        $inner->whereRaw("FIND_IN_SET(?, users.root)", [$selectedId])
                            ->orWhere('users.id', $selectedId);
                    })->where('users.id', '!=', $authUser->id);
                } else {
                    // Default: filter by effective ID (own id, or parent's id for role 20)
                    $q->where(function ($inner) use ($effectiveFilterId) {
                        $inner->whereRaw("FIND_IN_SET(?, users.root)", [$effectiveFilterId])
                            ->orWhere('users.id', $effectiveFilterId);
                    })->where('users.id', '!=', $authUser->id);
                }
            };

            /* ============================================================
             * BASE QUERY
             * ============================================================ */
            $query = User::with(['account', 'aepsDraft', 'kyc', 'role_info'])
                ->where('status', 1);

            // Super Admin (role 1) sees everyone — no hierarchy filter applied
            if ($authUser->role != 1) {
                $applyHierarchyFilter($query);
            }

            /* ============================================================
             * SEARCH FILTERS
             * ============================================================ */
            if (!empty($request->q)) {
                $q = $request->q;
                $query->where(function ($sub) use ($q) {
                    $sub->where('users.name', 'LIKE', "%{$q}%")
                        ->orWhere('users.email', 'LIKE', "%{$q}%")
                        ->orWhere('users.mobile', 'LIKE', "%{$q}%")
                        ->orWhere('users.mid', 'LIKE', "%{$q}%")
                        ->orWhere('users.id', 'LIKE', "%{$q}%")
                        ->orWhereHas('aepsDraft', function ($draftQ) use ($q) {
                            $draftQ->where('shop_name', 'LIKE', "%{$q}%")
                                ->orWhere('full_name', 'LIKE', "%{$q}%")
                                ->orWhere('shop_address', 'LIKE', "%{$q}%")
                                ->orWhere('shop_pin_code', 'LIKE', "%{$q}%")
                                ->orWhere('shop_city', 'LIKE', "%{$q}%")
                                ->orWhere('phone', 'LIKE', "%{$q}%")
                                ->orWhere('mid', 'LIKE', "%{$q}%");
                        });
                });
            }

            /* ============================================================
             * OTHER FILTERS
             * ============================================================ */
            if (!empty($request->role)) {
                $query->where('role', $request->role);
            }

            if ($request->has('aeps_status')) {
                $status = $request->aeps_status;
                $query->whereHas('aepsDraft', fn($q) => $q->where('aeps_status', $status));
            }

            /* ============================================================
             * SORTING
             * ============================================================ */
            $query->orderByRaw(
                '(SELECT balance FROM passbooks WHERE passbooks.user_id = users.id ORDER BY passbooks.id DESC LIMIT 1) DESC'
            );

            /* ============================================================
             * SUMMARY — Clone BEFORE paginate to avoid stale query state
             * ============================================================ */
            $summaryQuery = $query->clone()->select(['users.id', 'users.mid']);
            $filteredUsers = $summaryQuery->get();
            $userIds = $filteredUsers->pluck('id')->toArray();
            $userMids = $filteredUsers->pluck('mid')->filter()->toArray();

            /* ============================================================
             * PAGINATION
             * ============================================================ */
            $perPage = $request->get('per_page', 500);
            $users = $query->paginate($perPage);

            /* ============================================================
             * BATCH QUERIES — Run once for all paginated users (kills N+1)
             * ============================================================ */
            $pageUserIds = $users->pluck('id')->toArray();
            $pageUserMids = $users->pluck('mid')->filter()->toArray();

            // Latest balance per user
            // Uses Eloquent (not DB::table) so results are proper Model objects, not stdClass.
            // Groups by user_id and picks the row with the highest id (latest entry).
            $balanceMap = Passbook::whereIn('user_id', $pageUserIds)
                ->whereRaw('id = (SELECT MAX(p2.id) FROM passbooks p2 WHERE p2.user_id = passbooks.user_id)')
                ->pluck('balance', 'user_id');

            // Hold amounts
            $holdMap = Account::whereIn('user_id', $pageUserIds)
                ->where('primary_status', 1)
                ->pluck('hold_amount', 'user_id');

            // Role names
            $roleIds = $users->pluck('role')->unique()->toArray();
            $roleMap = Role::whereIn('id', $roleIds)->pluck('name', 'id');

            // AEPS business — all types in one query, pivot in PHP
            $aepsMap = AepsTransaction::whereIn('mid', $pageUserMids)
                ->whereIn('aeps_type', ['CW', 'CD', 'M', 'MATMCW'])
                ->where('response_status', 1)
                ->when($startDate && $endDate, fn($q) => $applyDate($q))
                ->select('mid', 'aeps_type', DB::raw('SUM(amount) as total'))
                ->groupBy('mid', 'aeps_type')
                ->get()
                ->groupBy('mid')
                ->map(fn($rows) => $rows->keyBy('aeps_type'));

            // Utility (Recharge)
            $utilityMap = Recharge::whereIn('user_id', $pageUserIds)
                ->whereIn('status', ['Success', 'SUCCESS', 'success'])
                ->when($startDate && $endDate, fn($q) => $applyDate($q))
                ->select('user_id', DB::raw('SUM(amount) as total'))
                ->groupBy('user_id')
                ->pluck('total', 'user_id');

            // Passbook aggregates — commission, charge, TDS in one query
            $passbookAggMap = Passbook::whereIn('user_id', $pageUserIds)
                ->when($startDate && $endDate, fn($q) => $applyDate($q))
                ->select([
                    'user_id',
                    DB::raw("SUM(CASE WHEN description LIKE '%Commission%' THEN amount ELSE 0 END) as commission"),
                    DB::raw("SUM(CASE WHEN description LIKE '%Charge%' AND description NOT LIKE '%Recharge%' THEN amount ELSE 0 END) as charge"),
                    DB::raw("SUM(CASE WHEN description LIKE '%TDS%' THEN amount ELSE 0 END) as tds"),
                ])
                ->groupBy('user_id')
                ->get()
                ->keyBy('user_id');

            /* ============================================================
             * TRANSFORM — Now just map data, zero DB calls inside
             * ============================================================ */
            $admin = $request->get('admin');

            $users->getCollection()->transform(function ($user) use ($admin, $balanceMap, $holdMap, $roleMap, $aepsMap, $utilityMap, $passbookAggMap) {
                $balance = $balanceMap[$user->id] ?? 0;
                $hold = $holdMap[$user->id] ?? 0;
                $passAgg = $passbookAggMap[$user->id] ?? null;
                $aepsMid = $aepsMap[$user->mid] ?? collect();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'contact' => [
                        'mid' => $user->mid,
                        'mobile' => $user->mobile,
                        'email' => $user->email,
                        'address' => implode(', ', array_filter([
                            $user->aepsDraft?->shop_address,
                            $user->aepsDraft?->shop_city,
                            $user->aepsDraft?->shop_pin_code,
                        ])) ?: null,
                    ],
                    'company_info' => $this->formatCompanyInfo($user, $admin),
                    'role' => $user->role,
                    'role_name' => $roleMap[$user->role] ?? 'Unknown',
                    'profession' => $user->profession ?? 'N/A',
                    'balances' => [
                        'total' => $balance,
                        'hold' => $hold,
                        'available' => $balance - $hold,
                    ],
                    'business' => [
                        'cw' => $aepsMid['CW']['total'] ?? 0,
                        'cd' => $aepsMid['CD']['total'] ?? 0,
                        'ap' => $aepsMid['M']['total'] ?? 0,
                        'atm' => $aepsMid['MATMCW']['total'] ?? 0,
                        'cms' => 0,
                        'utility' => $utilityMap[$user->id] ?? 0,
                        'commission' => $passAgg?->commission ?? 0,
                        'charge' => $passAgg?->charge ?? 0,
                        'tds' => $passAgg?->tds ?? 0,
                    ],
                    'aeps_status' => $user->aepsDraft->aeps_status ?? 'N/A',
                    'created_at' => $user->created_at,
                ];
            });

            /* ============================================================
             * SUMMARY AGGREGATES
             * ============================================================ */
            $summary = [
                'balance' => 0,
                'business' => [
                    'cw' => 0,
                    'cd' => 0,
                    'ap' => 0,
                    'atm' => 0,
                    'cms' => 0,
                    'utility' => 0,
                    'commission' => 0,
                    'charge' => 0,
                    'tds' => 0,
                ],
            ];

            if (!empty($userIds)) {
                // Balance snapshot (not date-filtered — intentional)
                $summary['balance'] = DB::table('users')
                    ->whereIn('id', $userIds)
                    ->sum(DB::raw("(
                        COALESCE((SELECT balance FROM passbooks WHERE user_id = users.id ORDER BY id DESC LIMIT 1), 0) -
                        COALESCE((SELECT hold_amount FROM accounts WHERE user_id = users.id AND primary_status = 1 LIMIT 1), 0)
                    )"));

                // AEPS summary
                $aepsSummary = AepsTransaction::whereIn('mid', $userMids)
                    ->whereIn('aeps_type', ['CW', 'CD', 'M', 'MATMCW'])
                    ->where('response_status', 1)
                    ->when($startDate && $endDate, fn($q) => $applyDate($q))
                    ->select('aeps_type', DB::raw('SUM(amount) as total'))
                    ->groupBy('aeps_type')
                    ->pluck('total', 'aeps_type');

                // Passbook summary (commission, charge, TDS) in one query
                $passbookSummary = Passbook::whereIn('user_id', $userIds)
                    ->when($startDate && $endDate, fn($q) => $applyDate($q))
                    ->select([
                        DB::raw("SUM(CASE WHEN description LIKE '%Commission%' THEN amount ELSE 0 END) as commission"),
                        DB::raw("SUM(CASE WHEN description LIKE '%Charge%' AND description NOT LIKE '%Recharge%' THEN amount ELSE 0 END) as charge"),
                        DB::raw("SUM(CASE WHEN description LIKE '%TDS%' THEN amount ELSE 0 END) as tds"),
                    ])
                    ->first();

                $utility = Recharge::whereIn('user_id', $userIds)
                    ->whereIn('status', ['Success', 'SUCCESS', 'success'])
                    ->when($startDate && $endDate, fn($q) => $applyDate($q))
                    ->sum('amount');

                $summary['business'] = [
                    'cw' => $aepsSummary['CW'] ?? 0,
                    'cd' => $aepsSummary['CD'] ?? 0,
                    'ap' => $aepsSummary['M'] ?? 0,
                    'atm' => $aepsSummary['MATMCW'] ?? 0,
                    'cms' => 0,
                    'utility' => $utility,
                    'commission' => $passbookSummary?->commission ?? 0,
                    'charge' => $passbookSummary?->charge ?? 0,
                    'tds' => $passbookSummary?->tds ?? 0,
                ];
            }

            /* ============================================================
             * AEPS STATUS COUNTS (for Frontend Tabs)
             * ============================================================ */
            $baseCountQuery = User::query()->where('status', 1);

            if ($authUser->role != 1) {
                $applyHierarchyFilter($baseCountQuery);
            }

            $aepsStatusCounts = [
                'all' => (clone $baseCountQuery)->count(),
            ];

            foreach ([0, 1, 2, 3, 4] as $status) {
                $aepsStatusCounts[$status] = (clone $baseCountQuery)
                    ->whereHas('aepsDraft', fn($q) => $q->where('aeps_status', $status))
                    ->count();
            }

            /* ============================================================
             * COMMISSION BREAKDOWN BY SERVICE TYPE
             * ============================================================ */
            $commissionBreakdown = ['total' => 0, 'total_count' => 0, 'categories' => []];

            if (!empty($userIds)) {
                $commQuery = DB::table('passbook_commissions_view')
                    ->whereIn('user_id', $userIds)
                    ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                        $q->whereBetween('created_at', [
                            $startDate . ' 00:00:00',
                            $endDate . ' 23:59:59',
                        ]);
                    })
                    ->select([
                        'service_type',
                        DB::raw('COUNT(*) as transaction_count'),
                        DB::raw('SUM(amount) as total_amount'),
                    ])
                    ->groupBy('service_type')
                    ->orderByDesc('total_amount')
                    ->get();

                $totalCommission = $commQuery->sum('total_amount');
                $totalCount = $commQuery->sum('transaction_count');

                $serviceConfig = [
                    'MOBILE' => ['label' => 'Mobile Recharge', 'icon' => '📱', 'color' => '#52c41a'],
                    'DTH' => ['label' => 'DTH Recharge', 'icon' => '📺', 'color' => '#722ed1'],
                    'BILLPAY' => ['label' => 'Bill Payment', 'icon' => '📋', 'color' => '#1890ff'],
                    'CASH_WITHDRAWAL' => ['label' => 'Cash Withdrawal', 'icon' => '💵', 'color' => '#fa8c16'],
                    'MINI_STATEMENT' => ['label' => 'Mini Statement', 'icon' => '🧾', 'color' => '#13c2c2'],
                    'MON_BUSS' => ['label' => 'Monthly Business', 'icon' => '📦', 'color' => '#8c8c8c'],
                    'OTHER' => ['label' => 'Other', 'icon' => '📦', 'color' => '#8c8c8c'],
                ];

                $commissionBreakdown = [
                    'total' => (float) $totalCommission,
                    'total_count' => (int) $totalCount,
                    'categories' => $commQuery->map(function ($item) use ($serviceConfig, $totalCommission) {
                        $config = $serviceConfig[$item->service_type] ?? $serviceConfig['OTHER'];
                        return [
                            'service_type' => $item->service_type,
                            'label' => $config['label'],
                            'icon' => $config['icon'],
                            'color' => $config['color'],
                            'transaction_count' => (int) $item->transaction_count,
                            'total_amount' => (float) $item->total_amount,
                            'percentage' => $totalCommission > 0
                                ? round(($item->total_amount / $totalCommission) * 100, 1)
                                : 0,
                        ];
                    }),
                ];
            }

            /* ============================================================
             * FINAL RESPONSE
             * ============================================================ */
            $response = $users->toArray();
            $response['summary'] = $summary;
            $response['aeps_status_counts'] = $aepsStatusCounts;
            $response['commission_breakdown'] = $commissionBreakdown;

            return response()->json($response);

        } catch (\Illuminate\Database\QueryException $e) {
            $refId = CatchLogService::logException($request, 'UserController@index error', $e, [
                'context' => 'index failed',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'A database error occurred. Please try again.',
                'refId' => $refId,
            ], 500);

        } catch (\Exception $e) {

            $refId = CatchLogService::logException($request, 'UserController@index error', $e, [
                'context' => 'index failed',
            ]);


            return response()->json([
                'success' => false,
                'message' => 'Something went wrong. Please try again.',
            ], 500);
        }
    }

    public function export(Request $request)
    {
        $user = $authUser = auth()->user();
        $admin = DB::table('users')->where('mid', $user->admin_mid)->first();
        $fileName = 'merchant_list_' . date('Y-m-d_H-i-s') . '.csv';

        return response()->streamDownload(function () use ($request, $authUser, $admin) {
            $handle = fopen('php://output', 'w');

            // CSV Headers
            fputcsv($handle, [
                'Date',
                'Merchant ID',
                'Name',
                'Shop Name',
                'Mobile',
                'Shop Address',
                'Shop City',
                'Shop Pin Code',
                'AEPS Status',
                'Email',
                'Role',
                'Company',
                'Status',
                'Wallet Balance'
            ]);

            $query = User::with(['account', 'aepsDraft', 'role_info']);

            // --- REUSING FILTER LOGIC FROM INDEX ---

            // Role Filter
            if ($authUser->role != 1) {
                if (!empty($request->selected_admin_id) && $request->selected_admin_id !== 'all') {
                    $selectedId = $request->selected_admin_id;
                    $query->where(function ($q) use ($selectedId, $authUser) {
                        $q->whereRaw("FIND_IN_SET(?, users.root)", [$selectedId]);
                        $q->orWhere('users.id', $selectedId);
                    })->where('users.id', '!=', $authUser->id);
                } else {
                    $query->where(function ($q) use ($authUser) {
                        if ($authUser->id != 21 && $authUser->role != 20) {
                            $q->whereRaw("FIND_IN_SET(?, users.root)", [$authUser->id]);
                        }
                    })->where('users.id', '!=', $authUser->id);
                }
            } else {
                // Super Admin - specific admin filter
                if (!empty($request->selected_admin_id) && $request->selected_admin_id !== 'all') {
                    $selectedId = $request->selected_admin_id;
                    $query->where(function ($q) use ($selectedId) {
                        $q->whereRaw("FIND_IN_SET(?, users.root)", [$selectedId]);
                        $q->orWhere('users.id', $selectedId);
                    });
                }
            }

            // Search Filter
            if ($request->has('q') && !empty($request->q)) {
                $q = $request->q;
                $query->where(function ($sub) use ($q) {
                    $sub->where('users.name', 'LIKE', "%{$q}%")
                        ->orWhere('users.email', 'LIKE', "%{$q}%")
                        ->orWhere('users.mobile', 'LIKE', "%{$q}%")
                        ->orWhere('users.mid', 'LIKE', "%{$q}%")
                        ->orWhere('users.id', 'LIKE', "%{$q}%")
                        ->orWhereHas('aepsDraft', function ($draftQ) use ($q) {
                            $draftQ->where('shop_name', 'LIKE', "%{$q}%")
                                ->orWhere('full_name', 'LIKE', "%{$q}%")
                                ->orWhere('shop_address', 'LIKE', "%{$q}%")
                                ->orWhere('shop_pin_code', 'LIKE', "%{$q}%")
                                ->orWhere('shop_city', 'LIKE', "%{$q}%")
                                ->orWhere('phone', 'LIKE', "%{$q}%")
                                ->orWhere('mid', 'LIKE', "%{$q}%");
                        });
                });
            }

            // Other Filters
            if ($request->has('role') && !empty($request->role)) {
                $query->where('role', $request->role);
            }

            if ($request->has('aeps_status') && $request->has('aeps_status')) {
                $status = $request->aeps_status;
                $query->whereHas('aepsDraft', function ($q) use ($status) {
                    $q->where('aeps_status', $status);
                });
            }

            $query->where('status', 1);

            // Date Filter
            if ($request->has('start_date') && $request->has('end_date') && !empty($request->start_date) && !empty($request->end_date)) {
                $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
            }

            // Sorting
            $query->orderBy('id', 'DESC');

            // Chunking for performance
            $query->chunk(500, function ($users) use ($handle, $admin) {
                foreach ($users as $user) {
                    // Fetch Balance (optimized)
                    $balance = DB::table('passbooks')
                        ->where('user_id', $user->id)
                        ->orderBy('id', 'DESC')
                        ->value('balance') ?? 0;

                    // Format Company Info
                    $companyStr = $this->formatCompanyInfo($user, $admin);

                    // AEPS Status Text
                    $aepsStatus = 'N/A';
                    if ($user->aepsDraft) {
                        $statusMap = [
                            0 => "Onboarding Pending",
                            1 => "EKYC Pending",
                            2 => "Biometric KYC Pending",
                            3 => "TwoFA Pending",
                            4 => "Working",
                        ];
                        $aepsStatus = $statusMap[$user->aepsDraft->aeps_status] ?? $user->aepsDraft->aeps_status;
                    }

                    fputcsv($handle, [
                        $user->created_at->format('Y-m-d H:i:s'),
                        $user->mid,
                        $user->name,
                        $user->shop_name ?? $user->aepsDraft->shop_name ?? '',
                        $user->mobile,
                        $user->aepsDraft->shop_address ?? '',
                        $user->aepsDraft->shop_city ?? '',
                        $user->aepsDraft->shop_pin_code ?? '',
                        $aepsStatus,
                        $user->email,
                        $user->role_info ? $user->role_info->name : $user->role,
                        $companyStr,
                        $user->status == 1 ? 'Active' : 'Inactive',
                        $balance
                    ]);
                }
            });

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function api(Request $request)
    {
        try {

            $authUser = auth()->user();

            if (!($authUser->role == 1 || $authUser->id == 21 || ($authUser->role == 2 && $authUser->is_api_partner == 1))) {
                return response()->json([
                    'status' => 1,
                    'data' => [],
                    'message' => 'You are not authorized to perform this action'
                ]);
            }

            $query = AepsDraft::with(['createdBy', 'admin'])
                ->join('users', 'aeps_drafts.admin_id', '=', 'users.id')
                ->where('users.is_api_partner', 1)
                ->select(
                    'aeps_drafts.*',
                    DB::raw('CASE WHEN users.mid = aeps_drafts.mid THEN 1 ELSE 0 END as is_admin')
                );

            /* -----------------------------
            ROLE-BASED FILTER
            ----------------------------- */

            // Role 1: Super Admin → get all
            if ($authUser->role == 1) {
                return;
            }


            if (!empty($request->selected_admin_id) && $request->selected_admin_id !== 'all') {
                $selectedId = $request->selected_admin_id;

                $query->where(function ($q) use ($selectedId, $authUser) {

                    $q->where(function ($sub) use ($selectedId) {
                        $sub->where('aeps_drafts.id', $selectedId)
                            ->orWhere('aeps_drafts.admin_id', $selectedId);
                    });

                    if ($authUser->id != 21 && $authUser->role != 20) {
                        $q->where('aeps_drafts.admin_id', $authUser->id);
                    } else {
                        $q->where('users.id', '!=', $authUser->id);
                    }
                });

            } else {

                $query->where(function ($q) use ($authUser) {
                    if ($authUser->id != 21 && $authUser->role != 20) {
                        $q->where('users.id', $authUser->id);
                        $q->orWhere('aeps_drafts.admin_id', $authUser->id);
                    } else {
                        $q->where('users.id', '!=', $authUser->id);
                    }
                });

            }

            /* -----------------------------
            SEARCH FILTERS
            ----------------------------- */
            if ($request->has('q') && !empty($request->q)) {
                $q = $request->q;
                $query->where(function ($sub) use ($q) {
                    $sub->where('users.name', 'LIKE', "%{$q}%")
                        ->orWhere('users.email', 'LIKE', "%{$q}%")
                        ->orWhere('users.mobile', 'LIKE', "%{$q}%")
                        ->orWhere('users.mid', 'LIKE', "%{$q}%")
                        ->orWhere('users.id', 'LIKE', "%{$q}%")
                        ->orWhere('aeps_drafts.shop_name', 'LIKE', "%{$q}%")
                        ->orWhere('aeps_drafts.full_name', 'LIKE', "%{$q}%")
                        ->orWhere('aeps_drafts.phone', 'LIKE', "%{$q}%");
                });
            }

            /* -----------------------------
            OTHER FILTERS
            ----------------------------- */
            if ($request->has('role') && !empty($request->role)) {
                $query->where('users.role', $request->role);
            }

            if ($request->has('aeps_status')) {
                $status = $request->aeps_status;
                $query->where('aeps_drafts.aeps_status', $status);
            }

            $query->where('users.status', 1);
            /* -----------------------------
            SORTING - By Passbook Balance DESC
            ----------------------------- */
            $query->orderByRaw('(SELECT balance FROM passbooks WHERE passbooks.user_id = users.id ORDER BY passbooks.id DESC LIMIT 1) DESC');

            /* -----------------------------
            PAGINATION
            ----------------------------- */
            $perPage = $request->get('per_page', 500);
            $users = $query->paginate($perPage);

            /* -----------------------------
            TRANSFORM OUTPUT
            ----------------------------- */
            $admin = $request->get('admin');

            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');

            // Helper to apply date filter if present
            $applyDate = function ($q) use ($startDate, $endDate) {
                if ($startDate && $endDate) {
                    // Ensure we cover the entire end day
                    $q->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
                }
            };

            $users->getCollection()->transform(function ($user) use ($admin, $applyDate) {
                $role = Role::where('id', $user->role)->first();
                $account = Account::where('user_id', $user->id)->where('primary_status', 1)->first() ?? null;
                $balance = Passbook::where('user_id', $user->id)->orderBy('id', 'DESC')->value('balance') ?? 0;

                // Business Queries with Date Filter
                $cwQuery = AepsTransaction::where('mid', $user->mid)->where('aeps_type', 'CW')->where('response_status', 1);
                $applyDate($cwQuery);

                $cdQuery = AepsTransaction::where('mid', $user->mid)->where('aeps_type', 'CD')->where('response_status', 1);
                $applyDate($cdQuery);

                $apQuery = AepsTransaction::where('mid', $user->mid)->where('aeps_type', 'M')->where('response_status', 1);
                $applyDate($apQuery);

                $atmQuery = AepsTransaction::where('mid', $user->mid)->where('aeps_type', 'ATM')->where('response_status', 1);
                $applyDate($atmQuery);

                $utilityQuery = Recharge::where('user_id', $user->admin_id)->whereIn('status', ['Success', 'SUCCESS', 'success']);
                $applyDate($utilityQuery);

                $commQuery = Passbook::where('user_id', $user->admin_id)->where('description', 'like', '%Commission%');
                $applyDate($commQuery);

                $chargeQuery = Passbook::where('user_id', $user->admin_id)->where('description', 'like', '%Charge%')->where('description', 'not like', '%Recharge%');
                $applyDate($chargeQuery);

                $tdsQuery = Passbook::where('user_id', $user->admin_id)->where('description', 'like', '%TDS%');
                $applyDate($tdsQuery);

                $xadmin = $admin;
                $xadmin->id = $user->admin_id;

                return [
                    'id' => $user->id,
                    'name' => $user->name ?? $user->shop_name ?? 'N/A',
                    'contact' => [
                        'mid' => $user->mid,
                        'mobile' => $user->mobile ?? $user->phone,
                        'email' => $user->email,
                    ],
                    'company_info' => $this->formatCompanyInfo($user, $xadmin),
                    'role' => $user->role,
                    'role_name' => $role ? $role->name : 'API Merchant',
                    'profession' => $user->profession ?? 'N/A',
                    'balances' => [
                        'total' => $balance,
                        'hold' => $account?->hold_amount ?? 0,
                        'available' => $balance - ($account?->hold_amount ?? 0),
                    ],
                    'business' => [
                        'cw' => $cwQuery->sum('amount'),
                        'ap' => $apQuery->sum('amount'),
                        'cms' => 0,
                    ],
                    'aeps_status' => $user->aeps_status ?? 'N/A',
                    'is_admin' => $user->is_admin ?? 0,
                    'admin_id' => $user->admin_id ?? 0,
                    'created_at' => $user->created_at,
                ];
            });

            /* -----------------------------
            CALCULATE SUMMARY
            ----------------------------- */
            $summary = [
                'balance' => 0,
                'business' => [
                    'cw' => 0,
                    'cd' => 0,
                    'ap' => 0,
                    'atm' => 0,
                    'cms' => 0,
                    'utility' => 0,
                    'commission' => 0,
                    'charge' => 0
                ]
            ];

            // Clone standard query to apply same filters for summary
            $summaryQuery = $query->clone();

            // Get aggregated IDs/MIDs
            $filteredCtx = $summaryQuery->select(['aeps_drafts.admin_id', 'aeps_drafts.mid'])->get();
            $userIds = $filteredCtx->pluck('admin_id')->toArray();
            $userMids = $filteredCtx->pluck('mid')->filter()->toArray();

            if (!empty($userIds)) {
                // 1. Total Available Balance (SNAPSHOT - NOT filtered by Date)
                $balanceSum = DB::table('users')
                    ->whereIn('id', $userIds)
                    ->sum(DB::raw("(
                        COALESCE((SELECT balance FROM passbooks WHERE user_id = users.id ORDER BY id DESC LIMIT 1), 0) -
                        COALESCE((SELECT hold_amount FROM accounts WHERE user_id = users.id AND primary_status = 1 LIMIT 1), 0)
                    )"));

                // 2. Business Sums (FILTERED BY DATE)

                // Helper for summary queries
                $summaryDate = function ($q) use ($startDate, $endDate) {
                    if ($startDate && $endDate) {
                        $q->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
                    }
                };

                $cwQ = AepsTransaction::whereIn('mid', $userMids)->where('aeps_type', 'CW')->where('response_status', 1);
                $summaryDate($cwQ);
                $cw = (!empty($userMids)) ? $cwQ->sum('amount') : 0;

                $cdQ = AepsTransaction::whereIn('mid', $userMids)->where('aeps_type', 'CD')->where('response_status', 1);
                $summaryDate($cdQ);
                $cd = (!empty($userMids)) ? $cdQ->sum('amount') : 0;

                $apQ = AepsTransaction::whereIn('mid', $userMids)->where('aeps_type', 'M')->where('response_status', 1);
                $summaryDate($apQ);
                $ap = (!empty($userMids)) ? $apQ->sum('amount') : 0;

                $atmQ = AepsTransaction::whereIn('mid', $userMids)->where('aeps_type', 'MATMCW')->where('response_status', 1);
                $summaryDate($atmQ);
                $atm = (!empty($userMids)) ? $atmQ->sum('amount') : 0;

                $utilQ = Recharge::whereIn('user_id', $userIds)->whereIn('status', ['Success', 'SUCCESS', 'success']);
                $summaryDate($utilQ);
                $utility = $utilQ->sum('amount');

                $commQ = Passbook::whereIn('user_id', $userIds)->where('description', 'like', '%Commission%');
                $summaryDate($commQ);
                $commission = $commQ->sum('amount');

                $chargeQ = Passbook::whereIn('user_id', $userIds)->where('description', 'like', '%Charge%')->where('description', 'not like', '%Recharge%');
                $summaryDate($chargeQ);
                $charge = $chargeQ->sum('amount');

                $tdsQ = Passbook::whereIn('user_id', $userIds)->where('description', 'like', '%TDS%');
                $summaryDate($tdsQ);
                $tds = $tdsQ->sum('amount');

                $summary = [
                    'balance' => $balanceSum,
                    'business' => [
                        'cw' => $cw,
                        'cd' => $cd,
                        'ap' => $ap,
                        'atm' => $atm,
                        'cms' => 0,
                        'utility' => $utility,
                        'commission' => $commission,
                        'charge' => $charge,
                        'tds' => $tds
                    ]
                ];
            }

            $response = $users->toArray();
            $response['summary'] = $summary;

            /* -----------------------------
            AEPS STATUS COUNTS (for Frontend Tabs)
            ----------------------------- */
            $baseCountQuery = AepsDraft::with(['createdBy', 'admin'])
                ->join('users', 'aeps_drafts.admin_id', '=', 'users.id')
                ->where('users.is_api_partner', 1)
                ->select('aeps_drafts.*');

            // Apply same role/admin filters as main query
            if ($authUser->role != 1) {
                if (!empty($request->selected_admin_id) && $request->selected_admin_id !== 'all') {
                    $selectedId = $request->selected_admin_id;

                    $baseCountQuery->where(function ($q) use ($selectedId, $authUser) {

                        $q->where('aeps_drafts.id', $selectedId);
                        $q->orWhere('aeps_drafts.admin_id', $selectedId);

                        if ($authUser->id != 21 && $authUser->role != 20) {
                            $q->orWhere('aeps_drafts.admin_id', $authUser->id);
                        } else {
                            $q->where('users.id', '!=', $authUser->id);
                        }
                    });

                } else {

                    $baseCountQuery->where(function ($q) use ($authUser) {
                        if ($authUser->id != 21 && $authUser->role != 20) {
                            $q->where('users.id', $authUser->id);
                            $q->orWhere('aeps_drafts.admin_id', $authUser->id);
                        } else {
                            $q->where('users.id', '!=', $authUser->id);
                        }
                    });

                }
            }

            $baseCountQuery->where('users.status', 1);

            // Count for each AEPS status
            $response['aeps_status_counts'] = [
                'all' => $baseCountQuery->count(),
                '0' => (clone $baseCountQuery)->where('aeps_drafts.aeps_status', 0)->count(),
                '1' => (clone $baseCountQuery)->where('aeps_drafts.aeps_status', 1)->count(),
                '2' => (clone $baseCountQuery)->where('aeps_drafts.aeps_status', 2)->count(),
                '3' => (clone $baseCountQuery)->where('aeps_drafts.aeps_status', 3)->count(),
                '4' => (clone $baseCountQuery)->where('aeps_drafts.aeps_status', 4)->count(),
            ];

            /* -----------------------------
            COMMISSION BREAKDOWN BY SERVICE TYPE
            ----------------------------- */
            $commissionBreakdown = [
                'total' => 0,
                'total_count' => 0,
                'categories' => []
            ];

            if (!empty($userIds)) {
                // Query commission breakdown from passbook_commissions_view
                $commQuery = DB::table('passbook_commissions_view')
                    ->whereIn('user_id', $userIds);

                // Apply date filter
                if ($startDate && $endDate) {
                    $commQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
                }

                // Get breakdown by service type
                $breakdown = $commQuery->select([
                    'service_type',
                    DB::raw('COUNT(*) as transaction_count'),
                    DB::raw('SUM(amount) as total_amount')
                ])
                    ->groupBy('service_type')
                    ->orderByDesc('total_amount')
                    ->get();

                // Calculate total
                $totalCommission = $breakdown->sum('total_amount');
                $totalCount = $breakdown->sum('transaction_count');

                // Format response with icons and colors for each service type
                $serviceConfig = [
                    'MOBILE' => ['label' => 'Mobile Recharge', 'icon' => '📱', 'color' => '#52c41a'],
                    'DTH' => ['label' => 'DTH Recharge', 'icon' => '📺', 'color' => '#722ed1'],
                    'BILLPAY' => ['label' => 'Bill Payment', 'icon' => '📋', 'color' => '#1890ff'],
                    'CASH_WITHDRAWAL' => ['label' => 'Cash Withdrawal', 'icon' => '💵', 'color' => '#fa8c16'],
                    'MINI_STATEMENT' => ['label' => 'Mini Statement', 'icon' => '🧾', 'color' => '#13c2c2'],
                    'MON_BUSS' => ['label' => 'Monthly Business', 'icon' => '📦', 'color' => '#8c8c8c'],
                    'OTHER' => ['label' => 'Other', 'icon' => '📦', 'color' => '#8c8c8c'],
                ];

                $categories = $breakdown->map(function ($item) use ($serviceConfig, $totalCommission) {
                    $config = $serviceConfig[$item->service_type] ?? $serviceConfig['OTHER'];
                    return [
                        'service_type' => $item->service_type,
                        'label' => $config['label'],
                        'icon' => $config['icon'],
                        'color' => $config['color'],
                        'transaction_count' => (int) $item->transaction_count,
                        'total_amount' => (float) $item->total_amount,
                        'percentage' => $totalCommission > 0 ? round(($item->total_amount / $totalCommission) * 100, 1) : 0
                    ];
                });

                $commissionBreakdown = [
                    'total' => (float) $totalCommission,
                    'total_count' => (int) $totalCount,
                    'categories' => $categories
                ];
            }

            $response['commission_breakdown'] = $commissionBreakdown;

            return response()->json($response);

        } catch (\Illuminate\Database\QueryException $e) {
            $refId = CatchLogService::logException($request, 'UserController@api error', $e, [
                'context' => 'api failed',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'A database error occurred. Please try again.',
                'refId' => $refId,
            ], 500);

        } catch (\Exception $e) {

            $refId = CatchLogService::logException($request, 'UserController@api error', $e, [
                'context' => 'api failed',
            ]);


            return response()->json([
                'success' => false,
                'message' => 'Something went wrong. Please try again.',
            ], 500);
        }

    }

    private function formatCompanyInfo($user, $admin)
    {
        $parts = [];


        $aepsDraft = AepsDraft::where('mid', $user->mid)->first();
        if ($aepsDraft && $aepsDraft->shop_name) {
            $parts[] = "Shop: " . $aepsDraft->shop_name;
            $parts[] = $aepsDraft->shop_address;
        }

        // company from admin (your original logic)
        if ($admin && isset($admin->id) && $admin->id != 21) {
            $company = Setting::where('user_id', $admin->id)->first();
            if ($company && $company->company_name) {
                $parts[] = $company->company_name;
            }
        }

        // ---- ROOT USERS LOOP ----
        if (!empty($user->root)) {

            $ids = array_filter(explode(',', $user->root));

            $rootUsers = User::whereIn('id', $ids)
                ->select('id', 'name', 'mid')
                ->get();

            foreach ($rootUsers as $i => $ru) {
                if ($i == 0) {
                    continue;
                } else {
                    $parts[] = "R: {$ru->name}, {$ru->id}, {$ru->mid}";
                }
            }
        }


        return implode(' | ', $parts);
    }


    public function show($id)
    {
        $user = User::with(['account', 'kyc', 'role_info'])->find($id);
        if (!$user)
            return response()->json(['message' => 'User not found'], 404);

        return response()->json($user);
    }

    public function kyc($id)
    {
        $kyc = UserKyc::where('user_id', $id)->first();
        return response()->json($kyc);
    }

    public function aeps_kyc($id)
    {
        // Fetch KYC data from AepsDraft model (for API merchants)
        $draft = AepsDraft::find($id);

        if (!$draft) {
            return response()->json(['message' => 'AEPS Draft not found'], 404);
        }

        // Return comprehensive KYC data from AepsDraft
        return response()->json([
            'id' => $draft->id,
            'mid' => $draft->mid,
            'full_name' => $draft->full_name,
            'shop_name' => $draft->shop_name,
            'shop_address' => $draft->shop_address,
            'shop_city' => $draft->shop_city,
            'shop_district' => $draft->shop_district,
            'shop_pin_code' => $draft->shop_pin_code,
            'phone' => $draft->phone,
            'email' => $draft->email,
            'aadhaar_number' => $draft->aadhaar_number,
            'pan_no' => $draft->pan_no,
            'account_number' => $draft->account_number,
            'ifsc_code' => $draft->ifsc_code,
            'bank_name' => $draft->bank_name,
            'bank_branch' => $draft->bank_branch,
            // Verification Status
            'phone_verified' => !empty($draft->phone_verified_at),
            'email_verified' => !empty($draft->email_verified_at),
            'aadhaar_verified' => !empty($draft->aadhaar_verified_at),
            'pan_verified' => !empty($draft->pan_verified_at),
            'bank_verified' => !empty($draft->bank_verified_at),
            'video_kyc_status' => $draft->video_kyc_status,
            // Media
            'shop_inner' => $draft->shop_inner,
            'shop_outer' => $draft->shop_outer,
            'video_url' => $draft->video_url,
            // Status
            'aeps_status' => $draft->aeps_status,
            'ap_status' => $draft->ap_status,
            'status' => $draft->status,
            'remarks' => $draft->remarks,
            'created_at' => $draft->created_at,
        ]);
    }

    public function passbook(Request $request, $id)
    {
        $query = Passbook::where('user_id', $id);

        // Search filter - search in description
        if ($request->has('q') && !empty($request->q)) {
            $q = $request->q;
            $query->where('description', 'LIKE', "%{$q}%");
        }

        // Type filter (CR/DR)
        if ($request->has('type') && !empty($request->type)) {
            $query->where('type', $request->type);
        }

        // Date range filter
        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = $request->start_date;
            $endDate = $request->end_date;
            $query->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        $entries = $query->orderBy('id', 'desc')->paginate($request->get('per_page', 50));
        return response()->json($entries);
    }

    public function transactions(Request $request, $id)
    {
        $draft = AepsDraft::find($id);

        if (!$draft) {
            return response()->json(['message' => 'AEPS Draft not found'], 404);
        }

        $mid = $draft->mid;
        $tab = $request->get('tab', 'aeps'); // aeps, recharge, billpay
        $filter = $request->get('filter', 'all');
        $perPage = $request->get('per_page', 50);

        $response = [
            'tab' => $tab,
            'filter' => $filter,
            'data' => [],
            'filters' => [],
            'summary' => []
        ];

        if ($tab === 'aeps') {
            // Fetch AEPS transactions grouped by aeps_type
            $query = AepsTransaction::where('mid', $mid)->orderBy('id', 'desc');

            // Get unique aeps_types for pill filters
            $aepsTypes = AepsTransaction::where('mid', $mid)
                ->select('aeps_type', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
                ->groupBy('aeps_type')
                ->get();

            $response['filters'] = $aepsTypes->map(function ($item) {
                return [
                    'key' => $item->aeps_type,
                    'label' => $this->getAepsTypeLabel($item->aeps_type),
                    'count' => $item->count,
                    'total' => $item->total
                ];
            });

            // Apply filter if not 'all'
            if ($filter !== 'all') {
                $query->where('aeps_type', $filter);
            }

            // Get summary
            $summaryQuery = AepsTransaction::where('mid', $mid);
            if ($filter !== 'all') {
                $summaryQuery->where('aeps_type', $filter);
            }
            $response['summary'] = [
                'total_count' => $summaryQuery->count(),
                'success_count' => (clone $summaryQuery)->where('response_status', 1)->count(),
                'failed_count' => (clone $summaryQuery)->where('response_status', 0)->count(),
                'total_amount' => (clone $summaryQuery)->where('response_status', 1)->sum('amount'),
            ];

            $response['data'] = $query->paginate($perPage);

        } elseif ($tab === 'recharge') {
            // Fetch Recharges where type = 1
            $query = Recharge::where('user_id', $draft->admin_id)->where('type', 1)->orderBy('id', 'desc');

            // Get unique operators for pill filters
            $operators = Recharge::where('user_id', $draft->admin_id)->where('type', 1)
                ->select('oprator', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
                ->groupBy('oprator')
                ->get();

            $response['filters'] = $operators->map(function ($item) {
                return [
                    'key' => $item->oprator,
                    'label' => $item->oprator ?: 'Unknown',
                    'count' => $item->count,
                    'total' => $item->total
                ];
            });

            // Apply filter if not 'all'
            if ($filter !== 'all') {
                $query->where('oprator', $filter);
            }

            // Get summary
            $summaryQuery = Recharge::where('user_id', $draft->admin_id)->where('type', 1);
            if ($filter !== 'all') {
                $summaryQuery->where('oprator', $filter);
            }
            $response['summary'] = [
                'total_count' => $summaryQuery->count(),
                'success_count' => (clone $summaryQuery)->whereIn('status', ['Success', 'SUCCESS', 'success'])->count(),
                'failed_count' => (clone $summaryQuery)->whereIn('status', ['Failed', 'FAILED', 'failed'])->count(),
                'total_amount' => (clone $summaryQuery)->whereIn('status', ['Success', 'SUCCESS', 'success'])->sum('amount'),
            ];

            $response['data'] = $query->paginate($perPage);

        } elseif ($tab === 'billpay') {
            // Fetch Recharges where type != 1 (Bill Pay)
            $query = Recharge::where('user_id', $draft->admin_id)->where('type', '!=', 1)->orderBy('id', 'desc');

            // Get unique operators for pill filters
            $operators = Recharge::where('user_id', $draft->admin_id)->where('type', '!=', 1)
                ->select('oprator', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
                ->groupBy('oprator')
                ->get();

            $response['filters'] = $operators->map(function ($item) {
                return [
                    'key' => $item->oprator,
                    'label' => $item->oprator ?: 'Unknown',
                    'count' => $item->count,
                    'total' => $item->total
                ];
            });

            // Apply filter if not 'all'
            if ($filter !== 'all') {
                $query->where('oprator', $filter);
            }

            // Get summary
            $summaryQuery = Recharge::where('user_id', $draft->admin_id)->where('type', '!=', 1);
            if ($filter !== 'all') {
                $summaryQuery->where('oprator', $filter);
            }
            $response['summary'] = [
                'total_count' => $summaryQuery->count(),
                'success_count' => (clone $summaryQuery)->whereIn('status', ['Success', 'SUCCESS', 'success'])->count(),
                'failed_count' => (clone $summaryQuery)->whereIn('status', ['Failed', 'FAILED', 'failed'])->count(),
                'total_amount' => (clone $summaryQuery)->whereIn('status', ['Success', 'SUCCESS', 'success'])->sum('amount'),
            ];

            $response['data'] = $query->paginate($perPage);
        }

        return response()->json($response);
    }

    private function getAepsTypeLabel($type)
    {
        $labels = [
            'CW' => 'Cash Withdrawal',
            'CD' => 'Cash Deposit',
            'M' => 'Aadhaar Pay',
            'MS' => 'Mini Statement',
            'BE' => 'Balance Enquiry',
            'ATM' => 'ATM',
            'MATMCW' => 'M-ATM CW',
            'MATMBE' => 'M-ATM BE',
        ];
        return $labels[$type] ?? $type;
    }

    public function referrals(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user)
            return response()->json(['message' => 'User not found'], 404);

        // Assuming referrals are users who have this user's MID as refer_by
        $referrals = User::where('refer_by', $user->mid)
            ->select('id', 'name', 'mobile', 'role', 'created_at', 'mid')
            ->paginate($request->get('per_page', 20));

        return response()->json($referrals);
    }

}
