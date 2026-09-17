<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FinancialMasterService;
use App\Models\MembershipPlan;
use App\Models\FinancialPlan;
use App\Models\FinancialChargePenalty;
use App\Models\User;

class FinancialMasterController extends Controller
{
    protected $masterService;

    public function __construct(FinancialMasterService $masterService)
    {
        $this->masterService = $masterService;
    }

    /**
     * Get Master Summary Stats & Info
     */
    public function getSummary(Request $request)
    {
        try {
            $user = $request->user ?? auth()->user();
            $filterAdminId = $request->query('admin_id');

            $summary = $this->masterService->getMasterSummary($user, $filterAdminId);

            return response()->json([
                'status' => 1,
                'message' => 'Financial master summary fetched successfully',
                'data' => $summary
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching summary: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Settings
     */
    public function getSettings(Request $request)
    {
        try {
            $user = $request->user ?? auth()->user();
            $filterAdminId = $request->query('admin_id');

            $settings = $this->masterService->getSettings($user, $filterAdminId);

            return response()->json([
                'status' => 1,
                'message' => 'Settings fetched successfully',
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update Settings
     */
    public function updateSettings(Request $request)
    {
        try {
            $user = $request->user ?? auth()->user();
            $filterAdminId = $request->input('admin_id');

            $settings = $this->masterService->updateSettings($user, $request->all(), $filterAdminId);

            return response()->json([
                'status' => 1,
                'message' => 'Settings updated successfully',
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error updating settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Tenant Admins List (For Super Admin filtering)
     */
    public function getTenantAdmins(Request $request)
    {
        try {
            $user = $request->user ?? auth()->user();

            if ($user->id != 1 && $user->role != 1) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized: Super Admin access required'
                ], 403);
            }

            $admins = User::where(function($q) {
                $q->where('role', 1)->orWhere('role', 2)->orWhere('id', 1);
            })->select('id', 'name', 'email', 'mobile', 'mid', 'role')->get();

            return response()->json([
                'status' => 1,
                'message' => 'Admins list fetched successfully',
                'data' => $admins
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching admin list: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resolve the effective Admin ID for a user.
     * Super Admin (role 1 or id 1) -> null or custom filter if provided
     * Admin (role 2) -> user's own id
     * Agent / Subordinate -> Admin's id looked up via admin_mid
     */
    protected function resolveAdminId($user, $filterAdminId = null)
    {
        if ($user->id == 1 || $user->role == 1) {
            return $filterAdminId ? (int)$filterAdminId : null;
        }

        if ($user->role == 2) {
            return $user->id;
        }

        if (!empty($user->admin_mid)) {
            $adminUser = User::where('mid', $user->admin_mid)->first();
            if ($adminUser) {
                return $adminUser->id;
            }
        }

        if (!empty($user->admin_id)) {
            return $user->admin_id;
        }

        return $user->id;
    }

    // ==========================================
    // MEMBERSHIP PLANS CRUD
    // ==========================================

    public function getMembershipPlans(Request $request)
    {
        try {
            $user = $request->user ?? auth()->user();
            $filterAdminId = $request->query('admin_id');
            $search = $request->query('search');
            $status = $request->query('status');

            $query = MembershipPlan::query();

            $adminId = $this->resolveAdminId($user, $filterAdminId);

            if ($adminId) {
                $query->where(function($q) use ($adminId) {
                    $q->where('admin_id', $adminId)
                      ->orWhere('user_id', $adminId)
                      ->orWhere('created_by', $adminId);
                });
            }

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('membership_name', 'like', "%{$search}%")
                      ->orWhere('membership_code', 'like', "%{$search}%");
                });
            }

            if ($status) {
                $query->where('status', $status);
            }

            $plans = $query->orderBy('id', 'desc')->get();

            // Fallback for agent if specific admin has no membership plans
            if ($plans->isEmpty() && $adminId && $adminId != 1) {
                $fallbackQuery = MembershipPlan::query();
                $fallbackQuery->where(function($q) {
                    $q->where('admin_id', 1)
                      ->orWhere('user_id', 1)
                      ->orWhere('created_by', 1);
                });
                if ($search) {
                    $fallbackQuery->where(function($q) use ($search) {
                        $q->where('membership_name', 'like', "%{$search}%")
                          ->orWhere('membership_code', 'like', "%{$search}%");
                    });
                }
                if ($status) {
                    $fallbackQuery->where('status', $status);
                }
                $fallbackPlans = $fallbackQuery->orderBy('id', 'desc')->get();
                if ($fallbackPlans->isNotEmpty()) {
                    $plans = $fallbackPlans;
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Membership plans fetched successfully',
                'data' => $plans
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching membership plans: ' . $e->getMessage()
            ], 500);
        }
    }

    public function storeMembershipPlan(Request $request)
    {
        try {
            $user = $request->user ?? auth()->user();
            $adminId = $this->resolveAdminId($user);
            if (!$adminId) $adminId = $user->id;

            $request->validate([
                'membership_name' => 'required|string|max:255',
                'membership_code' => 'required|string|max:50',
                'membership_fee' => 'required|numeric|min:0',
            ]);

            // Calculate total fee if GST applicable
            $fee = (float) $request->input('membership_fee', 0);
            $gstApp = $request->boolean('gst_applicable', false);
            $gstPct = $gstApp ? (float) $request->input('gst_percentage', 0) : 0;
            $totalFee = $fee + ($fee * ($gstPct / 100));

            $plan = MembershipPlan::create(array_merge($request->all(), [
                'user_id' => $user->id,
                'admin_id' => $adminId,
                'total_fee' => $totalFee,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]));

            return response()->json([
                'status' => 1,
                'message' => 'Membership plan created successfully',
                'data' => $plan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error creating membership plan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateMembershipPlan(Request $request, $id)
    {
        try {
            $user = $request->user ?? auth()->user();

            $plan = MembershipPlan::findOrFail($id);

            $fee = (float) $request->input('membership_fee', $plan->membership_fee);
            $gstApp = $request->has('gst_applicable') ? $request->boolean('gst_applicable') : $plan->gst_applicable;
            $gstPct = $gstApp ? (float) $request->input('gst_percentage', $plan->gst_percentage) : 0;
            $totalFee = $fee + ($fee * ($gstPct / 100));

            $plan->update(array_merge($request->all(), [
                'total_fee' => $totalFee,
                'updated_by' => $user->id,
            ]));

            return response()->json([
                'status' => 1,
                'message' => 'Membership plan updated successfully',
                'data' => $plan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error updating membership plan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteMembershipPlan(Request $request, $id)
    {
        try {
            $plan = MembershipPlan::findOrFail($id);
            $plan->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Membership plan deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error deleting membership plan: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==========================================
    // FINANCIAL PLANS (SAVING, DD, RD, FD, MIS) CRUD
    // ==========================================

    public function getPlans(Request $request)
    {
        try {
            $user = $request->user ?? auth()->user();
            $filterAdminId = $request->query('admin_id');
            $serviceType = $request->query('service_type');
            $search = $request->query('search');
            $status = $request->query('status');

            $query = FinancialPlan::query();

            $adminId = $this->resolveAdminId($user, $filterAdminId);

            if ($adminId) {
                $query->where(function($q) use ($adminId) {
                    $q->where('admin_id', $adminId)
                      ->orWhere('user_id', $adminId)
                      ->orWhere('created_by', $adminId);
                });
            }

            if ($serviceType) {
                $query->where('service_type', strtoupper($serviceType));
            }

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('plan_name', 'like', "%{$search}%")
                      ->orWhere('plan_code', 'like', "%{$search}%");
                });
            }

            if ($status) {
                $query->where('status', $status);
            }

            $plans = $query->orderBy('id', 'desc')->get();

            // Fallback: If agent's admin has not created specific plans for this service type,
            // check if super admin (id = 1) has active system default plans
            if ($plans->isEmpty() && $adminId && $adminId != 1) {
                $fallbackQuery = FinancialPlan::query();
                $fallbackQuery->where(function($q) {
                    $q->where('admin_id', 1)
                      ->orWhere('user_id', 1)
                      ->orWhere('created_by', 1);
                });
                if ($serviceType) {
                    $fallbackQuery->where('service_type', strtoupper($serviceType));
                }
                if ($search) {
                    $fallbackQuery->where(function($q) use ($search) {
                        $q->where('plan_name', 'like', "%{$search}%")
                          ->orWhere('plan_code', 'like', "%{$search}%");
                    });
                }
                if ($status) {
                    $fallbackQuery->where('status', $status);
                }
                $fallbackPlans = $fallbackQuery->orderBy('id', 'desc')->get();
                if ($fallbackPlans->isNotEmpty()) {
                    $plans = $fallbackPlans;
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Financial plans fetched successfully',
                'data' => $plans
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching financial plans: ' . $e->getMessage()
            ], 500);
        }
    }

    public function storePlan(Request $request)
    {
        try {
            $user = $request->user ?? auth()->user();
            $adminId = $this->resolveAdminId($user);
            if (!$adminId) $adminId = $user->id;

            $request->validate([
                'service_type' => 'required|string|in:SAVING,DD,RD,FD,MIS',
                'plan_name' => 'required|string|max:255',
                'plan_code' => 'required|string|max:50',
            ]);

            $plan = FinancialPlan::create(array_merge($request->all(), [
                'user_id' => $user->id,
                'admin_id' => $adminId,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]));

            return response()->json([
                'status' => 1,
                'message' => 'Financial plan created successfully',
                'data' => $plan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error creating financial plan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updatePlan(Request $request, $id)
    {
        try {
            $user = $request->user ?? auth()->user();
            $plan = FinancialPlan::findOrFail($id);

            $plan->update(array_merge($request->all(), [
                'updated_by' => $user->id,
            ]));

            return response()->json([
                'status' => 1,
                'message' => 'Financial plan updated successfully',
                'data' => $plan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error updating financial plan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deletePlan(Request $request, $id)
    {
        try {
            $plan = FinancialPlan::findOrFail($id);
            $plan->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Financial plan deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error deleting financial plan: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==========================================
    // CHARGES & PENALTIES CRUD
    // ==========================================

    public function getChargesPenalties(Request $request)
    {
        try {
            $user = $request->user ?? auth()->user();
            $filterAdminId = $request->query('admin_id');
            $category = $request->query('category');
            $search = $request->query('search');

            $query = FinancialChargePenalty::query();

            $adminId = $this->resolveAdminId($user, $filterAdminId);

            if ($adminId) {
                $query->where(function($q) use ($adminId) {
                    $q->where('admin_id', $adminId)
                      ->orWhere('user_id', $adminId)
                      ->orWhere('created_by', $adminId);
                });
            }

            if ($category) {
                $query->where('category', strtoupper($category));
            }

            if ($search) {
                $query->where('name', 'like', "%{$search}%");
            }

            $items = $query->orderBy('id', 'desc')->get();

            if ($items->isEmpty() && $adminId && $adminId != 1) {
                $fallbackQuery = FinancialChargePenalty::query();
                $fallbackQuery->where(function($q) {
                    $q->where('admin_id', 1)
                      ->orWhere('user_id', 1)
                      ->orWhere('created_by', 1);
                });
                if ($category) {
                    $fallbackQuery->where('category', strtoupper($category));
                }
                if ($search) {
                    $fallbackQuery->where('name', 'like', "%{$search}%");
                }
                $fallbackItems = $fallbackQuery->orderBy('id', 'desc')->get();
                if ($fallbackItems->isNotEmpty()) {
                    $items = $fallbackItems;
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Charges and penalties fetched successfully',
                'data' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching charges and penalties: ' . $e->getMessage()
            ], 500);
        }
    }

    public function storeChargePenalty(Request $request)
    {
        try {
            $user = $request->user ?? auth()->user();
            $adminId = $this->resolveAdminId($user);
            if (!$adminId) $adminId = $user->id;

            $request->validate([
                'name' => 'required|string|max:255',
                'category' => 'required|string|in:CHARGE,PENALTY',
            ]);

            $item = FinancialChargePenalty::create(array_merge($request->all(), [
                'user_id' => $user->id,
                'admin_id' => $adminId,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]));

            return response()->json([
                'status' => 1,
                'message' => 'Charge / Penalty created successfully',
                'data' => $item
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error creating charge / penalty: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateChargePenalty(Request $request, $id)
    {
        try {
            $user = $request->user ?? auth()->user();
            $item = FinancialChargePenalty::findOrFail($id);

            $item->update(array_merge($request->all(), [
                'updated_by' => $user->id,
            ]));

            return response()->json([
                'status' => 1,
                'message' => 'Charge / Penalty updated successfully',
                'data' => $item
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error updating charge / penalty: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteChargePenalty(Request $request, $id)
    {
        try {
            $item = FinancialChargePenalty::findOrFail($id);
            $item->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Charge / Penalty deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error deleting charge / penalty: ' . $e->getMessage()
            ], 500);
        }
    }
}
