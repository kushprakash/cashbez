<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SubscriptionMaster;
use App\Models\RoleSubscriptionMaster;
use App\Models\Module;
use App\Models\MainModule;
use App\Models\Subscription;
use App\Models\User;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $token = null;
        // Try to get token from Authorization header
        if ($request->hasHeader('Token')) {
            $authHeader = $request->header('Token');
        } else {
            return response()->json([
                'status' => 0,
                'message' => 'No token provided',
            ], 200);
        }

        $user = User::where('remember_token', $authHeader)->first();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Invalid token'], 200);
        }

        // Check if user is super admin (user_id = 1)
        if ($user->id == 1) {
            // Super admin - get all main modules with their modules and plans
            $mainModules = \App\Models\MainModule::where('status', 1)
                ->with(['modules' => function($query) {
                    $query->where('status', 1);
                }])
                ->get();
        } else {
            // Get admin user (whose mid matches current user's admin_mid)
            $adminUser = User::where('mid', $user->admin_mid)->first();
            if (!$adminUser) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Admin user not found',
                ], 200);
            }

            // Get permitted main module IDs for the admin user
            $permittedMainModuleIds = \App\Models\UserRolePermission::where('user_id', $adminUser->id)
                ->where('status', 1)
                ->distinct()
                ->pluck('main_module_id')
                ->filter()
                ->toArray();

            // If no main_module_id permissions found, try to get from module permissions
            if (empty($permittedMainModuleIds)) {
                $permittedModuleIds = \App\Models\UserRolePermission::where('user_id', $adminUser->id)
                    ->where('status', 1)
                    ->distinct()
                    ->pluck('module_id')
                    ->toArray();
                
                // Get main_module_id from modules table
                $permittedMainModuleIds = \App\Models\Module::whereIn('id', $permittedModuleIds)
                    ->distinct()
                    ->pluck('main_module_id')
                    ->filter()
                    ->toArray();
            } else {
                // Get permitted module IDs for the admin user
                $permittedModuleIds = \App\Models\UserRolePermission::where('user_id', $adminUser->id)
                    ->where('status', 1)
                    ->distinct()
                    ->pluck('module_id')
                    ->toArray();
            }

            // Get main modules with their modules and plans - only permitted ones
            $mainModules = \App\Models\MainModule::where('status', 1)
                ->whereIn('id', $permittedMainModuleIds)
                ->with(['modules' => function($query) use ($permittedModuleIds) {
                    $query->where('status', 1)->whereIn('id', $permittedModuleIds);
                }])
                ->get();
        }

        $result = [];
        foreach ($mainModules as $mainModule) {
            $moduleData = [];
            foreach ($mainModule->modules as $module) {
                $plans = RoleSubscriptionMaster::where('module_id', $module->id)
                    ->where('main_module_id', $mainModule->id)
                    ->where('status', 1)
                    ->where('role_id', $user->role) // Default to role 1 if not set
                    ->get()
                    ->map(function($plan) {
                        return [
                            'id' => $plan->id,    
                            'main_module_id' => $plan->main_module_id,
                            'module_id' => $plan->module_id,    
                            'title' => $plan->duration . ' ' . ucfirst($plan->duration_type),
                            'price' => $plan->price,
                            'priceText' => 'INR ' . number_format($plan->price, 2),
                            'features' => array_map('trim', explode(',', $plan->description)),
                        ];
                    });

                if ($plans->count() > 0) {
                    $moduleData[] = [
                        'id' => $module->id,
                        'name' => $module->name,
                        'plans' => $plans->values()
                    ];
                }
            }

            if (count($moduleData) > 0) {
                $result[] = [
                    'id' => $mainModule->id,
                    'name' => $mainModule->name,
                    'modules' => $moduleData
                ];
            }
        }

        // Get user's active subscriptions
        $activeSubscriptions = Subscription::where('user_id', $user->id)
            ->where('status', 1)
            ->whereDate('end_at', '>=', now()->toDateString())
            ->get();

        // Get user's wallet accounts
        $userAccounts = \App\Models\Account::where('user_id', $user->id)
            ->where('status', 1)
            ->get()
            ->map(function($acc) {
                return [
                    'id' => $acc->id,
                    'name' => $acc->name,
                    'number' => $acc->number,
                    'primary_status' => (int)$acc->primary_status,
                    'balance' => $acc->balance,
                    'available_balance' => $acc->available_balance,
                    'has_mpin' => !empty($acc->mpin),
                ];
            });

        return response()->json([
            'status' => 1,
            'mainModules' => $result,
            'activeSubscriptions' => $activeSubscriptions,
            'userAccounts' => $userAccounts,
        ]);
    }

    // Subscription Master CRUD
    public function indexMaster(Request $request)
    {
        $token = null;
        // Try to get token from Authorization header
        if ($request->hasHeader('Token')) {
            $authHeader = $request->header('Token');
        } else {
            return response()->json([
                'status' => 0,
                'message' => 'No token provided',
            ], 400);
        }

        $user = User::where('remember_token', $authHeader)->first();
       
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'User not authenticated'], 200);
        }

        $subscriptions = SubscriptionMaster::with(['mainModule', 'module', 'subModule'])
        ->where('user_id', $user->id)
        ->get();
        return response()->json([
            'status' => 1,
            'data' => $subscriptions
        ]);
    }

    public function storeMaster(Request $request)
    {
        $token = null;
        // Try to get token from Authorization header
        if ($request->hasHeader('Token')) {
            $authHeader = $request->header('Token');
        } else {
            return response()->json([
                'status' => 0,
                'message' => 'No token provided',
            ], 400);
        }

        $user = User::where('remember_token', $authHeader)->first();
       
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'User not authenticated'], 200);
        }
        
        $validated = $request->validate([
            'role_id' => 'sometimes|nullable|integer',
            'main_module_id' => 'required|integer',
            'module_id' => 'required|integer',
            'sub_module_id' => 'sometimes|nullable',
            'duration' => 'required|integer',
            'duration_type' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'status' => 'required|integer',
        ]);

       $validated['user_id'] = $user->id;

        $item = SubscriptionMaster::create($validated);
        return response()->json(['status' => 1, 'data' => $item]);
    }

    public function showMaster($id)
    {
        $item = SubscriptionMaster::with(['mainModule', 'module', 'subModule'])->findOrFail($id);
        return response()->json(['status' => 1, 'data' => $item]);
    }

    public function updateMaster(Request $request, $id)
    {
        $item = SubscriptionMaster::findOrFail($id);
        $validated = $request->validate([
            'role_id' => 'sometimes|nullable|integer',
            'main_module_id' => 'required|integer',
            'module_id' => 'required|integer',
            'sub_module_id' => 'sometimes|nullable',
            'duration' => 'required|integer',
            'duration_type' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'status' => 'required|integer',
        ]);
        $item->update($validated);
        return response()->json(['status' => 1, 'data' => $item]);
    }

    public function destroyMaster($id)
    {
        $item = SubscriptionMaster::findOrFail($id);
        $item->delete();
        return response()->json(['status' => 1, 'message' => 'Deleted successfully']);
    }

    /**
     * Get all subscriptions for the current user
     */
    public function userSubscriptions(Request $request)
    {
        $userId = auth()->id();
        $subs = Subscription::where('user_id', $userId)->where('status', 1)->get();
        return response()->json([
            'status' => 1,
            'subscriptions' => $subs
        ]);
    }


    public function userSubscribe(Request $request)
    {
        $validated = $request->validate([
            'main_module_id' => 'required|integer',
            'module_id' => 'required|integer',
            'plan_id' => 'required|integer',
            'account_id' => 'nullable|integer',
            'mpin' => 'required|string|size:4',
        ]);

        $user = $request->get('user');
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'User not authenticated'], 200);
        }

        // Check if user already has an active subscription for this module (not expired)
        $existingSub = Subscription::where('user_id', $user->id)
            ->where('main_module_id', $validated['main_module_id'])
            ->where('module_id', $validated['module_id'])
            ->where('status', 1)
            ->whereDate('end_at', '>=', now()->toDateString())
            ->orderByDesc('end_at')
            ->first();

        if ($existingSub) {
            return response()->json(['status' => 0, 'message' => 'You already have an active subscription for this Service'], 200);
        }

        $plans = RoleSubscriptionMaster::where('id', $validated['plan_id'])
            ->where('main_module_id', $validated['main_module_id'])
            ->where('module_id', $validated['module_id'])
            ->where('status', 1)
            ->first();
        
        if (!$plans) {
            return response()->json(['status' => 0, 'message' => 'Invalid plan selected'], 200);
        }

        $price = (float) $plans->price;

        // Find selected account or default to account where primary_status = 0 (Utility Wallet) or fallback
        if (!empty($validated['account_id'])) {
            $account = \App\Models\Account::where('id', $validated['account_id'])->where('user_id', $user->id)->first();
        } else {
            $account = \App\Models\Account::where('user_id', $user->id)->where(function($q) {
                $q->where('primary_status', 0)->orWhere('primary_status', false);
            })->first();

            if (!$account) {
                $account = \App\Models\Account::where('user_id', $user->id)->first();
            }
        }

        if (!$account) {
            return response()->json(['status' => 0, 'message' => 'No wallet account found for this user'], 200);
        }

        // Verify MPIN
        if (!$account->hasMpin()) {
            return response()->json(['status' => 0, 'message' => 'MPIN is not set for your wallet. Please set MPIN in settings.'], 200);
        }

        if (!$account->verifyMpin($validated['mpin'])) {
            return response()->json(['status' => 0, 'message' => 'Invalid MPIN entered. Please check and try again.'], 200);
        }

        // Check available balance
        $availableBalance = (float) $account->available_balance;
        if ($availableBalance < $price) {
            return response()->json([
                'status' => 0,
                'message' => 'Insufficient wallet balance! Required: ₹' . number_format($price, 2) . ', Available: ₹' . number_format($availableBalance, 2)
            ], 200);
        }

        $module = \App\Models\Module::find($validated['module_id']);
        $moduleName = $module ? $module->name : 'Service';
        $planTitle = $plans->duration . ' ' . ucfirst($plans->duration_type);
        $description = "Subscription Purchase: " . $planTitle . " - " . $moduleName;

        // Process Transaction (Debit Wallet)
        $txData = [
            'account_id' => $account->id,
            'type' => 'DR',
            'amount' => $price,
            'mpin' => $validated['mpin'],
            'description' => $description,
            'transaction_id' => 'SUB' . date('YmdHis') . rand(1000, 9999),
        ];

        $txResult = processTransaction($request, $txData, true);
        if (isset($txResult['status']) && $txResult['status'] == 0) {
            return response()->json([
                'status' => 0,
                'message' => $txResult['message'] ?? 'Payment transaction failed'
            ], 200);
        }

        // Calculate subscription end date
        $duration = $plans->duration;
        $duration_type = $plans->duration_type;
        if ($duration_type == 'Month') {
            $endAt = now()->addMonths($duration);
        } elseif ($duration_type == 'Year') {
            $endAt = now()->addYears($duration);
        } else {
            return response()->json(['status' => 0, 'message' => 'Invalid duration type'], 200);
        }

        // Create new subscription
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'main_module_id' => $validated['main_module_id'],
            'module_id' => $validated['module_id'],
            'plan_id' => $validated['plan_id'],
            'start_at' => now(),
            'end_at' => $endAt,
            'status' => 1,
        ]);

        // Update user's module permissions for this subscription
        $mainModuleId = $validated['main_module_id'];
        $moduleId = $validated['module_id'];
        $userId = $user->id;
        $roleId = $user->role ?? 1;

        $subModules = \App\Models\SubModule::where('module_id', $moduleId)->get();
        foreach ($subModules as $subModule) {
            $permissions = \App\Models\ModulePermission::where('sub_module_id', $subModule->id)->get();
            foreach ($permissions as $permission) {
                \App\Models\UserRolePermission::updateOrCreate([
                    'user_id' => $userId,
                    'role_id' => $roleId,
                    'main_module_id' => $mainModuleId,
                    'module_id' => $moduleId,
                    'sub_module_id' => $subModule->id,
                    'permission_id' => $permission->id,
                ], [
                    'status' => 1,
                ]);
            }
        }

        return response()->json([
            'status' => 1,
            'message' => 'Subscription purchased successfully!',
            'data' => $subscription,
            'new_balance' => $account->fresh()->available_balance
        ]);
    }

    public function setWalletMpin(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|integer',
            'newMpin' => 'required|string|size:4|regex:/^[0-9]{4}$/',
            'confirmMpin' => 'required|string|size:4|same:newMpin',
        ]);

        $token = null;
        if ($request->hasHeader('Token')) {
            $authHeader = $request->header('Token');
        } else {
            return response()->json(['status' => 0, 'message' => 'No token provided'], 200);
        }

        $user = User::where('remember_token', $authHeader)->first();
        if (!$user) {
            $user = $request->get('user');
        }
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'User not authenticated'], 200);
        }

        $account = \App\Models\Account::where('id', $validated['account_id'])
            ->where('user_id', $user->id)
            ->first();

        if (!$account) {
            return response()->json(['status' => 0, 'message' => 'Wallet account not found'], 200);
        }

        $account->update([
            'mpin' => $validated['newMpin'],
        ]);

        return response()->json([
            'status' => 1,
            'message' => 'MPIN set successfully!'
        ]);
    }
}
