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
     * Calculate and disburse financial commission to agent & upline wallets
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
        try {
            if (!$user) return ['status' => 0, 'message' => 'User not provided'];

            $targetAdminId = $adminId ?? ($user->admin_id ?? ($user->role == 2 ? $user->id : 1));
            $calc = self::calculateCommission($serviceType, $amount, $user, $targetAdminId);

            $agentCommission = $calc['agent_commission'];
            $distributorCommission = $calc['distributor_commission'];
            $matchedRule = $calc['rule'];

            if ($agentCommission <= 0 && $distributorCommission <= 0) {
                return [
                    'status' => 1,
                    'message' => 'No commission applicable for this transaction',
                    'agent_commission' => 0,
                    'distributor_commission' => 0,
                ];
            }

            if (!function_exists('createTransaction')) {
                require_once app_path('Helpers/TransactionHelper.php');
            }

            $types = self::getServiceTypes();
            $serviceMeta = $types[$serviceType] ?? null;
            $serviceLabel = $serviceMeta['label'] ?? $serviceType;

            // 1. Credit Agent Utility Wallet
            if ($agentCommission > 0) {
                $agentWallet = Account::where('user_id', $user->id)->where('primary_status', false)->first();

                if ($agentWallet) {
                    $commTxnId = 'COMM-' . ($refTxnId ?: date('YmdHis') . rand(100, 999));

                    $passbookData = [
                        'account_id' => $agentWallet->id,
                        'type' => 'CR',
                        'amount' => $agentCommission,
                        'description' => "Commission: {$serviceLabel}" . ($refTxnId ? " ({$refTxnId})" : ""),
                        'transaction_id' => $commTxnId,
                        'created_by' => $user->id,
                        'admin_id' => $targetAdminId,
                        'user_id' => $user->id,
                        'category_code' => 'COMMISSION'
                    ];

                    createTransaction($passbookData);

                    // Record in FinancialTransaction ledger
                    FinancialTransaction::create([
                        'transaction_id' => $commTxnId,
                        'user_id' => $user->id,
                        'admin_id' => $targetAdminId,
                        'service_type' => $serviceType,
                        'txn_type' => 'COMMISSION',
                        'amount' => $agentCommission,
                        'charges' => 0,
                        'net_amount' => $agentCommission,
                        'payment_mode' => 'UTILITY_WALLET',
                        'reference' => $refTxnId,
                        'narration' => $narration ?: "Commission earned for {$serviceLabel} (#{$refTxnId})",
                        'status' => 'SUCCESS',
                    ]);
                }
            }

            // 2. Credit Distributor Upline if applicable
            if ($distributorCommission > 0) {
                $distributorId = null;

                if (!empty($user->root)) {
                    $rootArray = explode(',', $user->root);
                    // Usually first ancestor after user in root
                    foreach ($rootArray as $ancestorId) {
                        $ancestorId = trim($ancestorId);
                        if (!empty($ancestorId) && $ancestorId != $user->id && $ancestorId != $targetAdminId) {
                            $distributorId = (int)$ancestorId;
                            break;
                        }
                    }
                }

                if (!$distributorId && !empty($user->parent_id) && $user->parent_id != $user->id && $user->parent_id != $targetAdminId) {
                    $distributorId = (int)$user->parent_id;
                }

                if ($distributorId) {
                    $distWallet = Account::where('user_id', $distributorId)->where('primary_status', false)->first();

                    if ($distWallet) {
                        $distTxnId = 'COMM-UPLINE-' . ($refTxnId ?: date('YmdHis') . rand(100, 999));

                        $distPassbook = [
                            'account_id' => $distWallet->id,
                            'type' => 'CR',
                            'amount' => $distributorCommission,
                            'description' => "Upline Comm: {$serviceLabel} ({$user->name})",
                            'transaction_id' => $distTxnId,
                            'created_by' => $user->id,
                            'admin_id' => $targetAdminId,
                            'user_id' => $distributorId,
                            'category_code' => 'COMMISSION'
                        ];

                        createTransaction($distPassbook);
                    }
                }
            }

            return [
                'status' => 1,
                'message' => 'Commission calculated and processed successfully',
                'agent_commission' => $agentCommission,
                'distributor_commission' => $distributorCommission,
                'rule_id' => $matchedRule->id ?? null,
            ];

        } catch (\Exception $e) {
            Log::error('FinancialCommission processCommission error: ' . $e->getMessage());
            return [
                'status' => 0,
                'message' => 'Commission processing failed: ' . $e->getMessage(),
            ];
        }
    }
}
