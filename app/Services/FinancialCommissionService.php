<?php

namespace App\Services;

use App\Models\Financial\FinancialCommission;
use App\Models\Financial\FinancialTransaction;
use App\Models\Account;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class FinancialCommissionService
{
    /**
     * Supported Financial Service Types for Commission Master
     */
    public static function getServiceTypes()
    {
        return [
            'NEW_MEMBER' => [
                'code' => 'NEW_MEMBER',
                'label' => 'New Member Registration',
                'category' => 'Membership',
                'icon' => 'bx-id-card',
                'color' => 'success',
                'description' => 'Commission paid when an agent registers a new member',
            ],
            'SAVING_OPENING' => [
                'code' => 'SAVING_OPENING',
                'label' => 'Saving Account Opening',
                'category' => 'Account Opening',
                'icon' => 'bx-wallet',
                'color' => 'info',
                'description' => 'Commission paid when an agent opens a saving account',
            ],
            'RD_OPENING' => [
                'code' => 'RD_OPENING',
                'label' => 'RD Account Opening',
                'category' => 'Account Opening',
                'icon' => 'bx-refresh',
                'color' => 'purple',
                'description' => 'Commission paid when an agent opens a Recurring Deposit account',
            ],
            'DD_OPENING' => [
                'code' => 'DD_OPENING',
                'label' => 'DD Account Opening',
                'category' => 'Account Opening',
                'icon' => 'bx-calendar-event',
                'color' => 'warning',
                'description' => 'Commission paid when an agent opens a Daily Deposit account',
            ],
            'FD_OPENING' => [
                'code' => 'FD_OPENING',
                'label' => 'FD Account Opening',
                'category' => 'Account Opening',
                'icon' => 'bx-vault',
                'color' => 'danger',
                'description' => 'Commission paid when an agent opens a Fixed Deposit account',
            ],
            'MIS_OPENING' => [
                'code' => 'MIS_OPENING',
                'label' => 'MIS Account Opening',
                'category' => 'Account Opening',
                'icon' => 'bx-line-chart',
                'color' => 'teal',
                'description' => 'Commission paid when an agent opens a Monthly Income Scheme account',
            ],
            'RD_DEPOSIT' => [
                'code' => 'RD_DEPOSIT',
                'label' => 'RD Deposit / Installment',
                'category' => 'Deposit / Collection',
                'icon' => 'bx-money-withdraw',
                'color' => 'primary',
                'description' => 'Commission paid when an agent collects an RD monthly installment',
            ],
            'DD_DEPOSIT' => [
                'code' => 'DD_DEPOSIT',
                'label' => 'DD Deposit / Collection',
                'category' => 'Deposit / Collection',
                'icon' => 'bx-coin-stack',
                'color' => 'dark',
                'description' => 'Commission paid when an agent collects a DD daily deposit installment',
            ],
        ];
    }

    /**
     * Calculate commission for a given service and amount
     * 
     * @param string $serviceType
     * @param float $amount
     * @param User $user
     * @param int|null $adminId
     * @return array
     */
    public static function calculateCommission($serviceType, $amount, $user, $adminId = null)
    {
        try {
            $amount = floatval($amount);
            $serviceType = strtoupper(trim($serviceType));
            $targetAdminId = $adminId ?? ($user->admin_id ?? ($user->role == 2 ? $user->id : 1));

            // Fetch all active rules for this admin & service type
            $rules = FinancialCommission::where('admin_id', $targetAdminId)
                ->where('service_type', $serviceType)
                ->where('status', 'ACTIVE')
                ->get();

            if ($rules->isEmpty()) {
                // Fallback to super-admin (admin_id = 1) if company rules not found
                if ($targetAdminId != 1) {
                    $rules = FinancialCommission::where('admin_id', 1)
                        ->where('service_type', $serviceType)
                        ->where('status', 'ACTIVE')
                        ->get();
                }
            }

            if ($rules->isEmpty()) {
                return [
                    'rule' => null,
                    'agent_commission' => 0.00,
                    'distributor_commission' => 0.00,
                ];
            }

            $userRoleId = $user->role ?? null;

            // 1. First attempt to match role-specific rules
            $roleRules = $rules->where('role_id', $userRoleId);
            $matchedRule = self::pickBestMatchingRule($roleRules, $amount);

            // 2. If no role-specific match, fallback to global/any-role rules (role_id IS NULL)
            if (!$matchedRule) {
                $globalRules = $rules->whereNull('role_id');
                $matchedRule = self::pickBestMatchingRule($globalRules, $amount);
            }

            if (!$matchedRule) {
                return [
                    'rule' => null,
                    'agent_commission' => 0.00,
                    'distributor_commission' => 0.00,
                ];
            }

            // Calculate Agent Commission
            $agentComm = 0.00;
            if ($matchedRule->commission_type === 'percentage') {
                $agentComm = ($amount * floatval($matchedRule->commission_value)) / 100;
            } else {
                $agentComm = floatval($matchedRule->commission_value);
            }

            // Calculate Distributor Upline Commission if applicable
            $distComm = 0.00;
            if (floatval($matchedRule->distributor_commission_value) > 0) {
                if ($matchedRule->distributor_commission_type === 'percentage') {
                    $distComm = ($amount * floatval($matchedRule->distributor_commission_value)) / 100;
                } else {
                    $distComm = floatval($matchedRule->distributor_commission_value);
                }
            }

            return [
                'rule' => $matchedRule,
                'agent_commission' => round($agentComm, 2),
                'distributor_commission' => round($distComm, 2),
            ];

        } catch (\Exception $e) {
            Log::error('FinancialCommission calculate error: ' . $e->getMessage());
            return [
                'rule' => null,
                'agent_commission' => 0.00,
                'distributor_commission' => 0.00,
            ];
        }
    }

    /**
     * Pick best matching rule (prioritizes Slab range match over Non-Slab Flat match)
     */
    protected static function pickBestMatchingRule($ruleCollection, $amount)
    {
        if ($ruleCollection->isEmpty()) {
            return null;
        }

        // 1. Try to match Slab rules first: amount between from_amount and to_amount
        $slabMatches = $ruleCollection->filter(function ($rule) use ($amount) {
            return $rule->is_slab && $amount >= floatval($rule->from_amount) && $amount <= floatval($rule->to_amount);
        });

        if ($slabMatches->isNotEmpty()) {
            return $slabMatches->first();
        }

        // 2. Try non-slab (Flat / universal) rules
        $nonSlabMatches = $ruleCollection->filter(function ($rule) {
            return !$rule->is_slab;
        });

        return $nonSlabMatches->first();
    }

    /**
     * Calculate and disburse financial commission across user hierarchy
     * Entry point: calls private distributeCommission
     * 
     * @param string $serviceType
     * @param float $amount
     * @param User $user
     * @param int|null $adminId
     * @param string $refTxnId
     * @param string $narration
     * @return array
     */
    public static function processCommission($serviceType, $amount, $user, $adminId = null, $refTxnId = '', $narration = '')
    {
        return self::distributeCommission($user, $amount, $serviceType, $adminId, $refTxnId, $narration);
    }

    /**
     * Private Function 1:
     * Session user ka root get hoga, explode hoga, usme session user ka id add hoga,
     * and fir loop chala kar common private function call hoga
     *
     * @param User $sessionUser
     * @param float $amount
     * @param string $serviceType
     * @param int|null $adminId
     * @param string $refTxnId
     * @param string $narration
     * @return array
     */
    private static function distributeCommission($sessionUser, $amount, $serviceType, $adminId = null, $refTxnId = '', $narration = '')
    {
        try {
            if (!$sessionUser) {
                return ['status' => 0, 'message' => 'User not provided'];
            }

            $amount = floatval($amount);
            $serviceType = strtoupper(trim($serviceType));
            $targetAdminId = $adminId;

            // Resolve target admin if not explicitly passed
            if (!$targetAdminId) {
                if (!empty($sessionUser->admin_mid)) {
                    $adminObj = User::where('mid', $sessionUser->admin_mid)->first();
                    if ($adminObj) $targetAdminId = $adminObj->id;
                }
                if (!$targetAdminId && !empty($sessionUser->role)) {
                    $roleObj = \App\Models\Role::find($sessionUser->role);
                    if ($roleObj && !empty($roleObj->user_id)) {
                        $targetAdminId = $roleObj->user_id;
                    }
                }
                if (!$targetAdminId) {
                    $targetAdminId = $sessionUser->admin_id ?? ($sessionUser->role == 2 ? $sessionUser->id : 1);
                }
            }

            // 1. Session user ka root get kiya
            $taems = $sessionUser->root;
            $userid = $sessionUser->id;

            // 2. Session user ka id add kiya and explode kiya
            $string1 = !empty($taems) ? ($userid . ',' . $taems) : (string)$userid;
            $rootArrays = array_values(array_filter(array_unique(explode(',', $string1))));

            $distributedUsers = [];
            $totalDistributed = 0.00;

            // 3. Loop chala kar common private function call kiya (user data and amount passed)
            foreach ($rootArrays as $uId) {
                $uId = trim($uId);
                if (empty($uId)) continue;

                $targetUser = ($uId == $sessionUser->id) ? $sessionUser : User::where('id', $uId)->first();
                if (!$targetUser) continue;

                $result = self::distributeToSingleUser($targetUser, $amount, $serviceType, $targetAdminId, $sessionUser, $refTxnId, $narration);

                if ($result && !empty($result['status']) && $result['status'] == 1 && $result['commission'] > 0) {
                    $distributedUsers[] = $result;
                    $totalDistributed += $result['commission'];
                }
            }

            return [
                'status' => 1,
                'message' => 'Commission distributed successfully across hierarchy',
                'total_commission' => round($totalDistributed, 2),
                'distributed_count' => count($distributedUsers),
                'data' => $distributedUsers,
            ];

        } catch (\Exception $e) {
            Log::error('FinancialCommission distributeCommission error: ' . $e->getMessage());
            return [
                'status' => 0,
                'message' => 'Commission distribution failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Private Function 2 (Common Function):
     * Jisme user ki data and amount pass hota hai, aur unke role ke anusaar
     * commission calculate karke utility wallet me credit hota hai
     *
     * @param User $targetUser
     * @param float $amount
     * @param string $serviceType
     * @param int $targetAdminId
     * @param User $sessionUser
     * @param string $refTxnId
     * @param string $narration
     * @return array
     */
    private static function distributeToSingleUser($targetUser, $amount, $serviceType, $targetAdminId, $sessionUser, $refTxnId = '', $narration = '')
    {
        try {
            if (!$targetUser) return ['status' => 0, 'message' => 'Target user invalid'];

            $isWorker = ($targetUser->id == $sessionUser->id);

            // Fetch active rules for this service and admin
            $rules = FinancialCommission::where('admin_id', $targetAdminId)
                ->where('service_type', $serviceType)
                ->where('status', 'ACTIVE')
                ->get();

            if ($rules->isEmpty() && $targetAdminId != 1) {
                // Fallback to super-admin (admin_id = 1) if admin hasn't configured
                $rules = FinancialCommission::where('admin_id', 1)
                    ->where('service_type', $serviceType)
                    ->where('status', 'ACTIVE')
                    ->get();
            }

            if ($rules->isEmpty()) {
                return ['status' => 0, 'commission' => 0, 'message' => 'No commission rules found'];
            }

            // 1. Role-specific rule match
            $userRoleId = $targetUser->role ?? null;
            $matchedRule = null;

            if ($userRoleId) {
                $roleRules = $rules->where('role_id', $userRoleId);
                $matchedRule = self::pickBestMatchingRule($roleRules, $amount);
            }

            // 2. Agar worker (session user) hai aur role-specific rule nahi mila to Global rule match karega
            if (!$matchedRule && $isWorker) {
                $globalRules = $rules->whereNull('role_id');
                $matchedRule = self::pickBestMatchingRule($globalRules, $amount);
            }

            // 3. Agar upline distributor hai aur direct role rule nahi mila,
            // worker ke matched rule se distributor_commission_value check karega
            $commAmount = 0.00;

            if ($matchedRule) {
                if ($matchedRule->commission_type === 'percentage') {
                    $commAmount = ($amount * floatval($matchedRule->commission_value)) / 100;
                } else {
                    $commAmount = floatval($matchedRule->commission_value);
                }
            } elseif (!$isWorker) {
                // Worker ke rule se distributor commission fallback
                $workerRole = $sessionUser->role ?? null;
                $workerRule = null;
                if ($workerRole) {
                    $workerRule = self::pickBestMatchingRule($rules->where('role_id', $workerRole), $amount);
                }
                if (!$workerRule) {
                    $workerRule = self::pickBestMatchingRule($rules->whereNull('role_id'), $amount);
                }

                if ($workerRule && floatval($workerRule->distributor_commission_value) > 0) {
                    if ($workerRule->distributor_commission_type === 'percentage') {
                        $commAmount = ($amount * floatval($workerRule->distributor_commission_value)) / 100;
                    } else {
                        $commAmount = floatval($workerRule->distributor_commission_value);
                    }
                    $matchedRule = $workerRule;
                }
            }

            $commAmount = round($commAmount, 2);
            if ($commAmount <= 0) {
                return [
                    'status' => 1,
                    'user_id' => $targetUser->id,
                    'user_name' => $targetUser->name,
                    'role_id' => $targetUser->role,
                    'commission' => 0,
                    'message' => 'Zero commission for user'
                ];
            }

            // Wallet credit via transaction helper
            if (!function_exists('createTransaction')) {
                require_once app_path('Helpers/TransactionHelper.php');
            }

            // Secondary / Utility wallet account
            $wallet = Account::where('user_id', $targetUser->id)->where('primary_status', false)->first();
            if (!$wallet) {
                return [
                    'status' => 0,
                    'user_id' => $targetUser->id,
                    'commission' => $commAmount,
                    'message' => "Utility wallet not found for user {$targetUser->id}"
                ];
            }

            $types = self::getServiceTypes();
            $serviceMeta = $types[$serviceType] ?? null;
            $serviceLabel = $serviceMeta['label'] ?? $serviceType;

            $commTxnId = 'COMM-' . ($isWorker ? '' : 'UPLINE-') . ($refTxnId ?: date('YmdHis') . rand(100, 999));
            $desc = $isWorker 
                ? "Commission: {$serviceLabel}" . ($refTxnId ? " ({$refTxnId})" : "")
                : "Upline Commission: {$serviceLabel} ({$sessionUser->name})";

            $passbookData = [
                'account_id' => $wallet->id,
                'type' => 'CR',
                'amount' => $commAmount,
                'description' => $desc,
                'transaction_id' => $commTxnId,
                'created_by' => $sessionUser->id,
                'admin_id' => $targetAdminId,
                'user_id' => $targetUser->id,
                'category_code' => 'COMMISSION'
            ];

            createTransaction($passbookData);

            // FinancialTransaction record
            FinancialTransaction::create([
                'transaction_id' => $commTxnId,
                'user_id' => $targetUser->id,
                'admin_id' => $targetAdminId,
                'service_type' => $serviceType,
                'txn_type' => 'COMMISSION',
                'amount' => $commAmount,
                'charges' => 0,
                'net_amount' => $commAmount,
                'payment_mode' => 'UTILITY_WALLET',
                'reference' => $refTxnId,
                'narration' => $isWorker ? ($narration ?: "Commission for {$serviceLabel}") : "Upline commission from {$sessionUser->name}",
                'status' => 'SUCCESS',
            ]);

            return [
                'status' => 1,
                'user_id' => $targetUser->id,
                'user_name' => $targetUser->name,
                'role_id' => $targetUser->role,
                'commission' => $commAmount,
                'is_worker' => $isWorker,
                'rule_id' => $matchedRule->id ?? null,
                'transaction_id' => $commTxnId,
            ];

        } catch (\Exception $e) {
            Log::error("FinancialCommission distributeToSingleUser error (User: {$targetUser->id}): " . $e->getMessage());
            return [
                'status' => 0,
                'user_id' => $targetUser->id,
                'commission' => 0,
                'message' => $e->getMessage()
            ];
        }
    }
}
