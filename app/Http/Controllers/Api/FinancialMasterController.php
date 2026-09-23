<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FinancialMasterService;
use App\Models\MembershipPlan;
use App\Models\FinancialPlan;
use App\Models\FinancialChargePenalty;
use App\Models\Financial\FinancialCommission;
use App\Services\FinancialCommissionService;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

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

    // ==========================================
    // Financial Commission Master Endpoints
    // ==========================================

    /**
     * Get list of supported financial service types
     */
    public function getCommissionServiceTypes()
    {
        return response()->json([
            'status' => 1,
            'data' => array_values(FinancialCommissionService::getServiceTypes())
        ]);
    }

    /**
     * Resolve authenticated user from request or auth guard
     */
    protected function getAuthUser(Request $request)
    {
        return $request->get('user') ?? ($request->user() ?? auth()->user());
    }

    /**
     * Get available roles for commission assignment
     * Sirf jo user login karega usi ka role list hoga (chahe super admin ho ya admin)
     */
    public function getCommissionRoles(Request $request)
    {
        try {
            $user = $this->getAuthUser($request);
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            // Filter roles strictly by logged-in user's user_id
            $query = Role::where('status', 1)
                ->where('user_id', $user->id);

            // Exclude user's own role so they only configure agent types
            if (!empty($user->role)) {
                $query->where('id', '!=', $user->role);
            }

            $roles = $query->orderBy('name', 'asc')->get(['id', 'name']);

            return response()->json([
                'status' => 1,
                'data' => $roles
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get all financial commission rules
     * Sabko apna apna commission master show hoga; admin ka data super ko show nahi hoga
     */
    public function getCommissions(Request $request)
    {
        try {
            $user = $this->getAuthUser($request);
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            // Strictly scoped to the logged-in user's own admin_id
            $query = FinancialCommission::with(['role', 'admin:id,name,email,mid'])
                ->where('admin_id', $user->id);

            if ($request->filled('service_type') && $request->service_type !== 'ALL') {
                $query->where('service_type', $request->service_type);
            }

            if ($request->filled('role_id')) {
                if ($request->role_id === 'GLOBAL') {
                    $query->whereNull('role_id');
                } else {
                    $query->where('role_id', $request->role_id);
                }
            }

            if ($request->filled('status') && $request->status !== 'ALL') {
                $query->where('status', $request->status);
            }

            if ($request->filled('search')) {
                $s = $request->search;
                $query->where(function ($q) use ($s) {
                    $q->where('name', 'LIKE', "%{$s}%")
                      ->orWhere('service_type', 'LIKE', "%{$s}%");
                });
            }

            $commissions = $query->orderBy('service_type')
                ->orderBy('is_slab')
                ->orderBy('from_amount')
                ->get();

            return response()->json([
                'status' => 1,
                'message' => 'Commissions fetched successfully',
                'data' => $commissions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching commissions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store new financial commission rule
     * Strictly saved under logged-in user's admin_id
     */
    public function storeCommission(Request $request)
    {
        try {
            $user = $this->getAuthUser($request);
            if (!$user) return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);

            $adminId = $user->id;

            $validator = Validator::make($request->all(), [
                'service_type' => 'required|string',
                'name' => 'nullable|string|max:255',
                'role_id' => 'nullable|integer',
                'is_slab' => 'required|boolean',
                'from_amount' => 'required_if:is_slab,1|numeric|min:0',
                'to_amount' => 'required_if:is_slab,1|numeric|min:0',
                'commission_type' => 'required|in:flat,percentage',
                'commission_value' => 'required|numeric|min:0',
                'distributor_commission_type' => 'nullable|in:flat,percentage',
                'distributor_commission_value' => 'nullable|numeric|min:0',
                'status' => 'nullable|in:ACTIVE,INACTIVE',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            // Verify role_id belongs to logged-in user
            if ($request->filled('role_id')) {
                $roleValid = Role::where('id', $request->role_id)->where('user_id', $user->id)->exists();
                if (!$roleValid) {
                    return response()->json(['status' => 0, 'message' => 'Selected role is invalid or does not belong to your account.'], 422);
                }
            }

            $isSlab = (bool)$request->is_slab;

            // Generate a default name if omitted
            $serviceTypes = FinancialCommissionService::getServiceTypes();
            $serviceLabel = $serviceTypes[$request->service_type]['label'] ?? $request->service_type;
            $name = $request->name;
            if (empty($name)) {
                $name = $serviceLabel . ' - ' . ($isSlab ? "Slab ({$request->from_amount} to {$request->to_amount})" : "Flat");
            }

            $item = FinancialCommission::create([
                'admin_id' => $adminId,
                'user_id' => $user->id,
                'role_id' => $request->role_id ?: null,
                'service_type' => $request->service_type,
                'name' => $name,
                'is_slab' => $isSlab,
                'from_amount' => $isSlab ? floatval($request->from_amount) : 0.00,
                'to_amount' => $isSlab ? floatval($request->to_amount) : 0.00,
                'commission_type' => $request->commission_type,
                'commission_value' => floatval($request->commission_value),
                'distributor_commission_type' => $request->distributor_commission_type ?: 'flat',
                'distributor_commission_value' => floatval($request->distributor_commission_value ?? 0),
                'status' => $request->status ?: 'ACTIVE',
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Commission rule created successfully!',
                'data' => $item->load('role')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error creating commission rule: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show single commission rule
     */
    public function showCommission(Request $request, $id)
    {
        try {
            $user = $this->getAuthUser($request);
            $item = FinancialCommission::with('role')
                ->where('id', $id)
                ->where('admin_id', $user->id)
                ->firstOrFail();
            return response()->json(['status' => 1, 'data' => $item]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'Commission rule not found.'], 404);
        }
    }

    /**
     * Update existing commission rule
     */
    public function updateCommission(Request $request, $id)
    {
        try {
            $user = $this->getAuthUser($request);
            $item = FinancialCommission::where('id', $id)
                ->where('admin_id', $user->id)
                ->firstOrFail();

            $validator = Validator::make($request->all(), [
                'service_type' => 'sometimes|required|string',
                'name' => 'nullable|string|max:255',
                'role_id' => 'nullable|integer',
                'is_slab' => 'sometimes|required|boolean',
                'from_amount' => 'nullable|numeric|min:0',
                'to_amount' => 'nullable|numeric|min:0',
                'commission_type' => 'sometimes|required|in:flat,percentage',
                'commission_value' => 'sometimes|required|numeric|min:0',
                'distributor_commission_type' => 'nullable|in:flat,percentage',
                'distributor_commission_value' => 'nullable|numeric|min:0',
                'status' => 'nullable|in:ACTIVE,INACTIVE',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            if ($request->filled('role_id')) {
                $roleValid = Role::where('id', $request->role_id)->where('user_id', $user->id)->exists();
                if (!$roleValid) {
                    return response()->json(['status' => 0, 'message' => 'Selected role is invalid or does not belong to your account.'], 422);
                }
            }

            $updateData = $request->only([
                'service_type',
                'name',
                'role_id',
                'is_slab',
                'from_amount',
                'to_amount',
                'commission_type',
                'commission_value',
                'distributor_commission_type',
                'distributor_commission_value',
                'status',
            ]);

            if (array_key_exists('role_id', $updateData) && empty($updateData['role_id'])) {
                $updateData['role_id'] = null;
            }

            $updateData['updated_by'] = $user->id;
            $item->update($updateData);

            return response()->json([
                'status' => 1,
                'message' => 'Commission rule updated successfully!',
                'data' => $item->fresh()->load('role')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error updating commission rule: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete commission rule
     */
    public function deleteCommission(Request $request, $id)
    {
        try {
            $user = $this->getAuthUser($request);
            $item = FinancialCommission::where('id', $id)
                ->where('admin_id', $user->id)
                ->firstOrFail();
            $item->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Commission rule deleted successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'Error deleting commission rule: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Quick toggle status (ACTIVE / INACTIVE)
     */
    public function toggleCommissionStatus(Request $request, $id)
    {
        try {
            $user = $this->getAuthUser($request);
            $item = FinancialCommission::where('id', $id)
                ->where('admin_id', $user->id)
                ->firstOrFail();
            $item->status = ($item->status === 'ACTIVE') ? 'INACTIVE' : 'ACTIVE';
            $item->save();

            return response()->json([
                'status' => 1,
                'message' => "Commission rule status updated to {$item->status}",
                'data' => $item
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }
}

