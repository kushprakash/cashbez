<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DailySummaryReportController extends Controller
{
    /**
     * Item definitions for Trade Wallet (primary_status = true)
     * You can customize the keywords or add new items as needed.
     */
    public function getTradeWalletDefinitions()
    {
        return [
            'credit' => [
                [
                    'key' => 'matm_cw',
                    'label' => 'MATM CW',
                    'keywords' => ['MATMCW - Transaction', 'MATM CW - Transaction', 'MATM - Transaction']
                ],
                [
                    'key' => 'matm_cw_commission',
                    'label' => 'MATM CW Commission',
                    'keywords' => ['MATMCW - Commission', 'MATM CW - Commission', 'MATM - Commission']
                ],
                [
                    'key' => 'aeps_cw',
                    'label' => 'AEPS CW',
                    'keywords' => ['CW - Transaction']
                ],
                [
                    'key' => 'aeps_cw_commission',
                    'label' => 'AEPS CW Commission',
                    'keywords' => ['CW - Commission']
                ],
                [
                    'key' => 'aeps_ms',
                    'label' => 'AEPS MS',
                    'keywords' => ['MS - Commission']
                ],
                [
                    'key' => 'cash_deposit_commission',
                    'label' => 'Cash Deposit Commission',
                    'keywords' => ['CD - Commission']
                ],
                [
                    'key' => 'cash_deposit_refund',
                    'label' => 'Cash Deposit Failed & Refund',
                    'keywords' => ['CD - Transaction Failled & Refund']
                ],
                [
                    'key' => 'upicw',
                    'label' => 'UPI CW',
                    'keywords' => ['UPICW - Transaction', 'UPI CW - Transaction', 'UPICW- Transaction']
                ],
                [
                    'key' => 'upicw_commission',
                    'label' => 'UPI CW Commission',
                    'keywords' => ['UPICW - Commission', 'UPI CW - Commission', 'UPICW- Commission']
                ],
                [
                    'key' => 'upicw_refund',
                    'label' => 'UPI CW Failed & Refund',
                    'keywords' => ['UPICW Failed & Refund', 'UPICW - Transaction Failled & Refund']
                ],
                [
                    'key' => 'admin_credit',
                    'label' => 'Admin Credit',
                    'keywords' => ['Admin Credit']
                ],
                [
                    'key' => 'payout_refund',
                    'label' => 'Payout Refund',
                    'keywords' => ['MOVE_TO Failled & Refund']
                ],
                [
                    'key' => 'payout_charge_refund',
                    'label' => 'Payout Charge Refund',
                    'keywords' => ['Refund of Move to Charge']
                ],
                [
                    'key' => 'money_transfer_refund',
                    'label' => 'Money Transfer Refund',
                    'keywords' => ['DMT Failled & Refund']
                ],
                [
                    'key' => 'money_transfer_charge_refund',
                    'label' => 'Money Transfer Charge Refund',
                    'keywords' => ['Refund of Fund Transfer Charge']
                ],
            ],
            'debit' => [
                [
                    'key' => 'payout',
                    'label' => 'Payout',
                    'keywords' => ['MOVE_TO -']
                ],
                [
                    'key' => 'payout_charge',
                    'label' => 'Payout Charge',
                    'keywords' => ['MOVE_TO Charge']
                ],
                [
                    'key' => 'money_transfer',
                    'label' => 'Money Transfer',
                    'keywords' => ['DMT -']
                ],
                [
                    'key' => 'money_transfer_charge',
                    'label' => 'Money Transfer Charge',
                    'keywords' => ['DMT Charge']
                ],
                [
                    'key' => 'trade_to_utility',
                    'label' => 'Trade Wallet to Utility Wallet',
                    'keywords' => ['Self Transfer to Utility Wallet']
                ],
                [
                    'key' => 'admin_debit',
                    'label' => 'Admin Debit',
                    'keywords' => ['Admin Debit']
                ],
                [
                    'key' => 'tds',
                    'label' => 'TDS',
                    'keywords' => ['TDS']
                ],
                [
                    'key' => 'cash_deposit',
                    'label' => 'Cash Deposit',
                    'keywords' => ['CD - Transaction']
                ],
            ]
        ];
    }

    /**
     * Item definitions for Utility Wallet (primary_status = false)
     * You can customize the keywords or add new items as needed.
     */
    public function getUtilityWalletDefinitions()
    {
        return [
            'credit' => [
                [
                    'key' => 'payout_refund',
                    'label' => 'Payout Refund',
                    'keywords' => ['MOVE_TO Failled & Refund']
                ],
                [
                    'key' => 'payout_charge_refund',
                    'label' => 'Payout Charge Refund',
                    'keywords' => ['Refund of Move to Charge']
                ],
                [
                    'key' => 'money_transfer_refund',
                    'label' => 'Money Transfer Refund',
                    'keywords' => ['DMT Failled & Refund']
                ],
                [
                    'key' => 'money_transfer_charge_refund',
                    'label' => 'Money Transfer Charge Refund',
                    'keywords' => ['Refund of Fund Transfer Charge']
                ],
                [
                    'key' => 'trade_to_utility_credit',
                    'label' => 'Trade Wallet to Utility',
                    'keywords' => ['Self Transfer from Primary Account']
                ],
                [
                    'key' => 'payment_gateway',
                    'label' => 'Payment Getway',
                    'keywords' => ['Easebuzz Payment']
                ],
                [
                    'key' => 'qr_collection',
                    'label' => 'QR Collection',
                    'keywords' => ['VPA Credit','VPA Deposit']
                ],
                [
                    'key' => 'admin_credit_utility',
                    'label' => 'Admin Credit',
                    'keywords' => ['Admin Credit']
                ],
                [
                    'key' => 'mobile_recharge_commission',
                    'label' => 'Mobile Recharge Commission',
                    'keywords' => ['Recharge Commission']
                ],
                [
                    'key' => 'dth_recharge_commission',
                    'label' => 'DTH Recharge Commission',
                    'keywords' => ['DTH Commission']
                ],
                [
                    'key' => 'bill_payment_commission',
                    'label' => 'Bill Payment Commission',
                    'keywords' => ['Bill Payment Commission']
                ],
                [
                    'key' => 'recharge_refund',
                    'label' => 'Recharge Refund',
                    'keywords' => ['Recharge Failed & Refunded','RECH-REFUND - Mobile Recharge','Recharge Failed & Refund Mobile Recharge -']
                ],
                [
                    'key' => 'dth_recharge_refund',
                    'label' => 'DTH Recharge Refund',
                    'keywords' => ['DTH Failed & Refunded','RECH-REFUND - DTH Recharge']
                ],
                [
                    'key' => 'bill_payment_refund',
                    'label' => 'Bill Payment Refund',
                    'keywords' => ['Bill Payment Failed & Refunded','RECH-REFUND - Bill Payment ']
                ],
                [
                    'key' => 'pancard_commission',
                    'label' => 'Pan Card Commission',
                    'keywords' => ['PAN Card Commission']
                ],
                [
                    'key' => 'pancard_fund_req_refund',
                    'label' => 'Pan Card Fund Request Refund',
                    'keywords' => ['PAN Card Fund Request Rejected & Refund','PAN Card Fund Request Faiiled & Refund']
                ],
            ],
            'debit' => [
                [
                    'key' => 'payout',
                    'label' => 'Payout',
                    'keywords' => ['MOVE_TO -']
                ],
                [
                    'key' => 'payout_charge',
                    'label' => 'Payout Charge',
                    'keywords' => ['MOVE_TO Charge']
                ],
                [
                    'key' => 'money_transfer',
                    'label' => 'Money Transfer',
                    'keywords' => ['DMT -']
                ],
                [
                    'key' => 'money_transfer_charge',
                    'label' => 'Money Transfer Charge',
                    'keywords' => ['DMT Charge']
                ],
                [
                    'key' => 'mobile_recharge',
                    'label' => 'Mobile Recharge',
                    'keywords' => ['Mobile Recharge']
                ],
                [
                    'key' => 'dth_recharge',
                    'label' => 'DTH Recharge',
                    'keywords' => ['DTH Recharge']
                ],
                [
                    'key' => 'bill_payment',
                    'label' => 'Bill Payment',
                    'keywords' => ['Bill Payment']
                ],
                [
                    'key' => 'admin_debit',
                    'label' => 'Admin Debit',
                    'keywords' => ['Admin Debit']
                ],
                [
                    'key' => 'pancard_fund_request',
                    'label' => 'Pan Card Fund Request',
                    'keywords' => ['PAN Card Fund Request Debit']
                ],
                [
                    'key' => 'qr_create_charge',
                    'label' => 'QR Create Charge',
                    'keywords' => ['VPA Generation Charge']
                ],
                [
                    'key' => 'qr_collection_charge',
                    'label' => 'QR Collection Charge',
                    'keywords' => ['VPA Credit Charge']
                ],
                [
                    'key' => 'verification_charge',
                    'label' => 'Verification Charge',
                    'keywords' => ['Aadhar Verification', 'Pan Verification', 'Account Verification', 'IFSC Verification', 'cibil check']
                ],
            ]
        ];
    }

    /**
     * Resolve authenticated user
     */
    private function getAuthUser(Request $request)
    {
        return $request->get('user') ?? $request->get('admin') ?? auth()->user();
    }

    /**
     * Get list of selectable entities:
     * - Super Admin: returns list of admins (role = 2)
     * - Admin: returns list of downline users (under this admin's admin_mid/admin_id)
     */
    public function getAdminList(Request $request)
    {
        try {
            $authUser = $this->getAuthUser($request);

            if (!$authUser) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $isSuperAdmin = ((string)$authUser->role === '1' || strtolower((string)$authUser->role) === 'super_admin');
            $isAdmin = ((string)$authUser->role === '2' || strtolower((string)$authUser->role) === 'admin');

            if ($isSuperAdmin) {
                // Super Admin gets list of all Admins (role = 2). No regular users!
                $admins = DB::table('users')
                    ->whereIn('role', [2, 'admin', '2'])
                    ->select('id', 'name', 'mid', 'mobile')
                    ->orderBy('name', 'asc')
                    ->get();

                return response()->json([
                    'status' => 1,
                    'message' => 'Admins retrieved successfully',
                    'is_super_admin' => true,
                    'is_admin' => false,
                    'data' => $admins
                ]);
            } elseif ($isAdmin) {
                // Admin gets list of their own downline users (for user-wise filter)
                $downlineUsers = DB::table('users')
                    ->where('admin_mid', $authUser->mid)
                    ->where('id', '!=', $authUser->id)
                    ->select('id', 'name', 'mid', 'mobile', 'role')
                    ->orderBy('name', 'asc')
                    ->get();

                return response()->json([
                    'status' => 1,
                    'message' => 'Users retrieved successfully',
                    'is_super_admin' => false,
                    'is_admin' => true,
                    'current_user' => [
                        'id' => $authUser->id,
                        'name' => $authUser->name,
                        'mid' => $authUser->mid
                    ],
                    'data' => $downlineUsers
                ]);
            } else {
                return response()->json([
                    'status' => 1,
                    'message' => 'Self user only',
                    'is_super_admin' => false,
                    'is_admin' => false,
                    'current_user' => [
                        'id' => $authUser->id,
                        'name' => $authUser->name,
                        'mid' => $authUser->mid
                    ],
                    'data' => []
                ]);
            }
        } catch (\Exception $e) {
            Log::error('DailySummaryReportController@getAdminList error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch options list'
            ], 500);
        }
    }

    /**
     * Get Daily Summary Report Data
     * Strictly filters by user_id — NEVER uses admin_id for calculations
     * to avoid double-counting between admin and user transactions!
     */
    public function getDailySummaryReport(Request $request)
    {
        try {
            $authUser = $this->getAuthUser($request);
            if (!$authUser) {
                return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
            }

            $date = $request->input('date', date('Y-m-d'));
            $isSuperAdmin = ((string)$authUser->role === '1' || strtolower((string)$authUser->role) === 'super_admin');
            $isAdmin = ((string)$authUser->role === '2' || strtolower((string)$authUser->role) === 'admin');

            $selectedAdminId = $request->input('admin_id');
            $selectedUserId = $request->input('user_id');

            $targetUserIds = [];
            $targetInfo = null;

            if ($isSuperAdmin) {
                // Super Admin view:
                $filterId = $selectedUserId ?? $selectedAdminId;
                if ($filterId && $filterId !== 'all') {
                    $selectedUserObj = DB::table('users')->where('id', (int)$filterId)->orWhere('mid', $filterId)->first();
                    if ($selectedUserObj) {
                        if ((string)$selectedUserObj->role === '2' || (string)$selectedUserObj->role === '1' || strtolower((string)$selectedUserObj->role) === 'admin') {
                            // If an Admin is selected, get that Admin + all downline users under that Admin
                            $targetUserIds = DB::table('users')
                                ->where('admin_mid', $selectedUserObj->mid)
                                ->orWhere('id', $selectedUserObj->id)
                                ->pluck('id')
                                ->toArray();
                            $targetInfo = $selectedUserObj;
                        } else {
                            // Specific regular user selected
                            $targetUserIds = [(int)$selectedUserObj->id];
                            $targetInfo = $selectedUserObj;
                        }
                    } else {
                        // All Users in the system (Admins + Regular Users + API Partners)
                        $targetUserIds = DB::table('users')->pluck('id')->toArray();
                    }
                } else {
                    // All Users in the system (Admins + Regular Users + API Partners)
                    $targetUserIds = DB::table('users')->pluck('id')->toArray();
                }
            } elseif ($isAdmin) {
                // Admin view:
                if ($selectedUserId && (int)$selectedUserId !== (int)$authUser->id && $selectedUserId !== 'self' && $selectedUserId !== 'all') {
                    // Admin selected a specific downline user:
                    $isDownline = DB::table('users')
                        ->where('id', (int)$selectedUserId)
                        ->where('admin_mid', $authUser->mid)
                        ->exists();

                    if ($isDownline) {
                        $targetUserIds = [(int)$selectedUserId];
                        $targetInfo = DB::table('users')->where('id', (int)$selectedUserId)->select('id', 'name', 'mid', 'mobile', 'role')->first();
                    } else {
                        // Fallback: Admin's own users (Admin + downline users under this admin)
                        $targetUserIds = DB::table('users')
                            ->where('admin_mid', $authUser->mid)
                            ->orWhere('id', $authUser->id)
                            ->pluck('id')
                            ->toArray();
                    }
                } else {
                    // Admin's own users (Admin + downline users under this admin)
                    $targetUserIds = DB::table('users')
                        ->where('admin_mid', $authUser->mid)
                        ->orWhere('id', $authUser->id)
                        ->pluck('id')
                        ->toArray();
                }
            } else {
                // Regular Retailer / User: STRICTLY own user_id
                $targetUserIds = [(int)$authUser->id];
                $targetInfo = DB::table('users')->where('id', (int)$authUser->id)->select('id', 'name', 'mid', 'mobile', 'role')->first();
            }

            $startDate = $date . ' 00:00:00';
            $endDate = $date . ' 23:59:59';

            // Txn categories label/code lookup
            $categoriesMap = DB::table('txn_categories')->pluck('label', 'id')->toArray();

            // Process Trade Wallet (primary_status = 1 / true)
            $tradeReport = $this->calculateWalletReport(
                $targetUserIds,
                true,
                $startDate,
                $endDate,
                $this->getTradeWalletDefinitions(),
                $categoriesMap
            );

            // Process Utility Wallet (primary_status = 0 / false)
            $utilityReport = $this->calculateWalletReport(
                $targetUserIds,
                false,
                $startDate,
                $endDate,
                $this->getUtilityWalletDefinitions(),
                $categoriesMap
            );

            return response()->json([
                'status' => 1,
                'message' => 'Daily summary report fetched successfully',
                'data' => [
                    'date' => $date,
                    'is_super_admin' => $isSuperAdmin,
                    'is_admin' => $isAdmin,
                    'user_role' => $authUser->role,
                    'selected_admin_id' => $selectedAdminId ?? ($isSuperAdmin ? 'all' : $authUser->id),
                    'selected_user_id' => $selectedUserId ?? ($isAdmin ? $authUser->id : ($isSuperAdmin ? 'all' : $authUser->id)),
                    'target_info' => $targetInfo,
                    'trade_wallet' => $tradeReport,
                    'utility_wallet' => $utilityReport
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('DailySummaryReportController@getDailySummaryReport error: ' . $e->getMessage() . ' line: ' . $e->getLine());
            return response()->json([
                'status' => 0,
                'message' => 'Error generating daily summary report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate wallet report for given user accounts and definitions
     * STRICTLY uses user_id and account_id — NEVER admin_id!
     */
    private function calculateWalletReport(array $targetUserIds, bool $isPrimary, string $startDate, string $endDate, array $definitions, array $categoriesMap)
    {
        if (empty($targetUserIds)) {
            return [
                'wallet_name' => $isPrimary ? 'Trade Wallet' : 'Utility Wallet',
                'primary_status' => $isPrimary,
                'opening_balance' => 0.0,
                'credits' => [],
                'debits' => [],
                'total_credit' => 0.0,
                'total_debit' => 0.0,
                'closing_balance' => 0.0,
                'system_closing_balance' => 0.0
            ];
        }

        // 1. Get Accounts for the target users (STRICTLY user_id, NEVER admin_id!)
        $accounts = DB::table('accounts')
            ->where('primary_status', $isPrimary ? 1 : 0)
            ->whereIn('user_id', $targetUserIds)
            ->get();

        $accountIds = $accounts->pluck('id')->toArray();

        $openingBalance = 0.0;
        $systemClosingBalance = 0.0;

        foreach ($accounts as $acc) {
            // Latest passbook overall for system current balance (STRICTLY user_id and account_id)
            $latestPassbookAllTime = DB::table('passbooks')
                ->where('account_id', $acc->id)
                ->where('user_id', $acc->user_id)
                ->orderBy('id', 'desc')
                ->first();

            $systemClosingBalance += $latestPassbookAllTime ? (float)$latestPassbookAllTime->balance : (float)($acc->balance ?? 0.0);

            // Opening Balance: Last passbook before target date 12:00 AM (created_at < startDate)
            // STRICTLY user_id and account_id, NEVER admin_id!
            $lastPrevPassbook = DB::table('passbooks')
                ->where('account_id', $acc->id)
                ->where('user_id', $acc->user_id)
                ->where('created_at', '<', $startDate)
                ->orderBy('id', 'desc')
                ->first();

            if ($lastPrevPassbook) {
                $openingBalance += (float)$lastPrevPassbook->balance;
            } else {
                // If no passbook before startDate, check earliest passbook on/after startDate
                $firstNextPassbook = DB::table('passbooks')
                    ->where('account_id', $acc->id)
                    ->where('user_id', $acc->user_id)
                    ->orderBy('id', 'asc')
                    ->first();

                if ($firstNextPassbook) {
                    $openingBalance += (float)$firstNextPassbook->pre_balance;
                }
            }
        }

        // Initialize Credit Items Map
        $creditItemsMap = [];
        foreach ($definitions['credit'] as $def) {
            $creditItemsMap[$def['key']] = [
                'key' => $def['key'],
                'label' => $def['label'],
                'keywords' => $def['keywords'],
                'count' => 0,
                'amount' => 0.0
            ];
        }

        // Initialize Debit Items Map
        $debitItemsMap = [];
        foreach ($definitions['debit'] as $def) {
            $debitItemsMap[$def['key']] = [
                'key' => $def['key'],
                'label' => $def['label'],
                'keywords' => $def['keywords'],
                'count' => 0,
                'amount' => 0.0
            ];
        }

        $otherCredit = [
            'key' => 'other_credit',
            'label' => 'Other Credits',
            'count' => 0,
            'amount' => 0.0,
            'descriptions' => []
        ];

        $otherDebit = [
            'key' => 'other_debit',
            'label' => 'Other Debits',
            'count' => 0,
            'amount' => 0.0,
            'descriptions' => []
        ];

        // 2. Fetch passbooks for the date range
        // STRICTLY whereIn('user_id', $targetUserIds) AND whereIn('account_id', $accountIds)
        // NEVER filter by admin_id!
        if (!empty($accountIds)) {
            $passbooks = DB::table('passbooks')
                ->whereIn('user_id', $targetUserIds)
                ->whereIn('account_id', $accountIds)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->select('id', 'user_id', 'account_id', 'type', 'amount', 'balance', 'pre_balance', 'description', 'category_id')
                ->get();

            foreach ($passbooks as $pb) {
                $type = strtoupper(trim((string)$pb->type));
                $amount = abs((float)$pb->amount);

                $catName = isset($categoriesMap[$pb->category_id]) ? strtolower((string)$categoriesMap[$pb->category_id]) : '';
                $desc = strtolower((string)($pb->description ?? ''));
                $searchContent = $desc . ' ' . $catName;

                if ($type === 'CR') {
                    $matchedKey = null;
                    foreach ($definitions['credit'] as $item) {
                        foreach ($item['keywords'] as $kw) {
                            if (str_contains($searchContent, strtolower($kw))) {
                                $matchedKey = $item['key'];
                                break 2;
                            }
                        }
                    }

                    if ($matchedKey && isset($creditItemsMap[$matchedKey])) {
                        $creditItemsMap[$matchedKey]['count'] += 1;
                        $creditItemsMap[$matchedKey]['amount'] += $amount;
                    } else {
                        $otherCredit['count'] += 1;
                        $otherCredit['amount'] += $amount;
                        $rawDesc = trim((string)($pb->description ?? ''));
                        if ($rawDesc !== '' && !in_array($rawDesc, $otherCredit['descriptions'], true)) {
                            $otherCredit['descriptions'][] = $rawDesc;
                        }
                    }
                } elseif ($type === 'DR') {
                    $matchedKey = null;
                    foreach ($definitions['debit'] as $item) {
                        foreach ($item['keywords'] as $kw) {
                            if (str_contains($searchContent, strtolower($kw))) {
                                $matchedKey = $item['key'];
                                break 2;
                            }
                        }
                    }

                    if ($matchedKey && isset($debitItemsMap[$matchedKey])) {
                        $debitItemsMap[$matchedKey]['count'] += 1;
                        $debitItemsMap[$matchedKey]['amount'] += $amount;
                    } else {
                        $otherDebit['count'] += 1;
                        $otherDebit['amount'] += $amount;
                        $rawDesc = trim((string)($pb->description ?? ''));
                        if ($rawDesc !== '' && !in_array($rawDesc, $otherDebit['descriptions'], true)) {
                            $otherDebit['descriptions'][] = $rawDesc;
                        }
                    }
                }
            }
        }

        // Prepare response lists
        $creditsList = [];
        $totalCredit = 0.0;
        foreach ($definitions['credit'] as $def) {
            $entry = $creditItemsMap[$def['key']];
            $amt = round($entry['amount'], 2);
            $creditsList[] = [
                'key' => $entry['key'],
                'label' => $entry['label'],
                'count' => $entry['count'],
                'amount' => $amt
            ];
            $totalCredit += $amt;
        }
        if ($otherCredit['count'] > 0 || $otherCredit['amount'] > 0) {
            $amt = round($otherCredit['amount'], 2);
            $descSuffix = !empty($otherCredit['descriptions']) ? ' (' . implode(', ', $otherCredit['descriptions']) . ')' : '';
            $creditsList[] = [
                'key' => $otherCredit['key'],
                'label' => 'Other Credits' . $descSuffix,
                'count' => $otherCredit['count'],
                'amount' => $amt,
                'descriptions' => $otherCredit['descriptions']
            ];
            $totalCredit += $amt;
        }

        $debitsList = [];
        $totalDebit = 0.0;
        foreach ($definitions['debit'] as $def) {
            $entry = $debitItemsMap[$def['key']];
            $amt = round($entry['amount'], 2);
            $debitsList[] = [
                'key' => $entry['key'],
                'label' => $entry['label'],
                'count' => $entry['count'],
                'amount' => $amt
            ];
            $totalDebit += $amt;
        }
        if ($otherDebit['count'] > 0 || $otherDebit['amount'] > 0) {
            $amt = round($otherDebit['amount'], 2);
            $descSuffix = !empty($otherDebit['descriptions']) ? ' (' . implode(', ', $otherDebit['descriptions']) . ')' : '';
            $debitsList[] = [
                'key' => $otherDebit['key'],
                'label' => 'Other Debits' . $descSuffix,
                'count' => $otherDebit['count'],
                'amount' => $amt,
                'descriptions' => $otherDebit['descriptions']
            ];
            $totalDebit += $amt;
        }

        $totalCredit = round($totalCredit, 2);
        $totalDebit = round($totalDebit, 2);
        $openingBalance = round($openingBalance, 2);
        // Mathematical invariant: Closing Balance = Opening Balance + Total Credit - Total Debit
        $closingBalance = round($openingBalance + $totalCredit - $totalDebit, 2);

        return [
            'wallet_name' => $isPrimary ? 'Trade Wallet' : 'Utility Wallet',
            'primary_status' => $isPrimary,
            'opening_balance' => $openingBalance,
            'credits' => $creditsList,
            'debits' => $debitsList,
            'total_credit' => $totalCredit,
            'total_debit' => $totalDebit,
            'closing_balance' => $closingBalance,
            'system_closing_balance' => round($systemClosingBalance, 2)
        ];
    }
}
