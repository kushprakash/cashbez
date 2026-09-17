<?php

namespace App\Services;

use App\Models\FinancialSetting;
use App\Models\MembershipPlan;
use App\Models\FinancialPlan;
use App\Models\FinancialChargePenalty;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class FinancialMasterService
{
    /**
     * Get or create default financial settings for given user/admin scope
     */
    public function getSettings($user, $filterAdminId = null)
    {
        $targetAdminId = ($user->role == 2) ? $user->id : ($user->admin_mid ? (User::where('mid', $user->admin_mid)->value('id') ?? $user->id) : ($user->admin_id ?? $user->id));

        if (($user->id == 1 || $user->role == 1)) {
            $targetAdminId = $filterAdminId ? (int)$filterAdminId : 1;
        }

        $setting = FinancialSetting::where(function($q) use ($targetAdminId) {
            $q->where('admin_id', $targetAdminId)->orWhere('user_id', $targetAdminId);
        })->first();

        if (!$setting) {
            $setting = FinancialSetting::create([
                'user_id' => $targetAdminId,
                'admin_id' => $targetAdminId,
                'financial_service_name' => 'Financial Services',
                'financial_service_code' => 'FIN',
                'currency' => 'INR',
                'financial_year' => '2026-2027',
                'member_id_prefix' => 'MEM',
                'account_number_prefix' => 'ACC',
                'transaction_id_prefix' => 'TXN',
                'receipt_prefix' => 'REC',
                'minimum_member_age' => 18,
                'maximum_member_age' => 80,
                'kyc_required_at_account_opening' => false,
                'kyc_required_at_withdrawal' => true,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);
        }

        return $setting;
    }

    /**
     * Update settings
     */
    public function updateSettings($user, array $data, $filterAdminId = null)
    {
        $setting = $this->getSettings($user, $filterAdminId);
        $data['updated_by'] = $user->id;
        $setting->update($data);
        return $setting->fresh();
    }

    /**
     * Get summary statistics for Financial Master Hub dashboard
     */
    public function getMasterSummary($user, $filterAdminId = null)
    {
        $isSuperAdmin = ($user->id == 1 || $user->role == 1);
        
        $queryPlans = FinancialPlan::query();
        $queryMemberships = MembershipPlan::query();
        $queryCharges = FinancialChargePenalty::query();

        if ($isSuperAdmin) {
            if ($filterAdminId) {
                $queryPlans->where(function($q) use ($filterAdminId) {
                    $q->where('user_id', $filterAdminId)->orWhere('admin_id', $filterAdminId)->orWhere('created_by', $filterAdminId);
                });
                $queryMemberships->where(function($q) use ($filterAdminId) {
                    $q->where('user_id', $filterAdminId)->orWhere('admin_id', $filterAdminId)->orWhere('created_by', $filterAdminId);
                });
                $queryCharges->where(function($q) use ($filterAdminId) {
                    $q->where('user_id', $filterAdminId)->orWhere('admin_id', $filterAdminId)->orWhere('created_by', $filterAdminId);
                });
            }
        } else {
            $adminId = ($user->role == 2) ? $user->id : ($user->admin_mid ? (User::where('mid', $user->admin_mid)->value('id') ?? $user->id) : ($user->admin_id ?? $user->id));
            $queryPlans->where(function($q) use ($adminId) {
                $q->where('admin_id', $adminId)->orWhere('user_id', $adminId)->orWhere('created_by', $adminId);
            });
            $queryMemberships->where(function($q) use ($adminId) {
                $q->where('admin_id', $adminId)->orWhere('user_id', $adminId)->orWhere('created_by', $adminId);
            });
            $queryCharges->where(function($q) use ($adminId) {
                $q->where('admin_id', $adminId)->orWhere('user_id', $adminId)->orWhere('created_by', $adminId);
            });
        }

        $settings = $this->getSettings($user, $filterAdminId);

        return [
            'is_super_admin' => $isSuperAdmin,
            'settings' => $settings,
            'total_plans' => (clone $queryPlans)->count(),
            'active_plans' => (clone $queryPlans)->where('status', 'ACTIVE')->count(),
            'plans_by_service' => [
                'SAVING' => (clone $queryPlans)->where('service_type', 'SAVING')->count(),
                'DD'     => (clone $queryPlans)->where('service_type', 'DD')->count(),
                'RD'     => (clone $queryPlans)->where('service_type', 'RD')->count(),
                'FD'     => (clone $queryPlans)->where('service_type', 'FD')->count(),
                'MIS'    => (clone $queryPlans)->where('service_type', 'MIS')->count(),
            ],
            'total_memberships' => (clone $queryMemberships)->count(),
            'active_memberships' => (clone $queryMemberships)->where('status', 'ACTIVE')->count(),
            'total_charges_penalties' => (clone $queryCharges)->count(),
            'active_charges' => (clone $queryCharges)->where('category', 'CHARGE')->where('status', 'ACTIVE')->count(),
            'active_penalties' => (clone $queryCharges)->where('category', 'PENALTY')->where('status', 'ACTIVE')->count(),
        ];
    }
}
