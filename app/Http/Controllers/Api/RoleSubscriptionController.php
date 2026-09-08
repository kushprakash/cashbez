<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RoleSubscriptionMaster;
use App\Models\SubscriptionMaster;
use App\Models\Role;
use App\Models\MainModule;
use App\Models\Module;
use App\Models\User;

class RoleSubscriptionController extends Controller
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

        // Get roles created by admin users under current user's admin_mid
        $adminUser = User::where('mid', $user->admin_mid)->first();
        if (!$adminUser) {
            return response()->json([
                'status' => 0,
                'message' => 'Admin user not found: '.$user->admin_mid,
            ], 200);
        }

        $roles = Role::where('user_id', $adminUser->id)->where('status', 1)->where('id', '!=', $adminUser->role)->get();

        // Get main modules with their modules and sub-modules
        $mainModules = MainModule::where('status', 1)
            ->with([
                'modules' => function($query) {
                    $query->where('status', 1);
                },
                'modules.subModules' => function($query) {
                    $query->where('status', 1);
                },
                'modules.subModules.permissions' => function($query) {
                    $query->where('status', 1);
                }
            ])
            ->get();

        return response()->json([
            'status' => 1,
            'roles' => $roles,
            'mainModules' => $mainModules,
        ]);
    }

    public function getRoleSubscriptions(Request $request, $roleId)
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

        // Get admin user for current session
        $adminUser = User::where('mid', $user->admin_mid)->first();
        if (!$adminUser) {
            return response()->json([
                'status' => 0,
                'message' => 'Admin user not found: '.$user->admin_mid,
            ], 200);
        }

        // Verify that the role belongs to the current session user's admin
        $role = Role::where('id', $roleId)
            ->where('user_id', $adminUser->id)
            ->where('status', 1)
            ->first();

        if (!$role) {
            return response()->json([
                'status' => 0,
                'message' => 'Role not found or access denied',
            ], 200);
        }

        $subscriptions = RoleSubscriptionMaster::where('role_id', $roleId)
            ->where('status', 1)
            ->get();

        return response()->json([
            'status' => 1,
            'subscriptions' => $subscriptions
        ]);
    }

    public function store(Request $request)
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

        // Get admin user for current session
        $adminUser = User::where('mid', $user->admin_mid)->first();
        if (!$adminUser) {
            return response()->json([
                'status' => 0,
                'message' => 'Admin user not found: '.$user->admin_mid,
            ], 200);
        }

        $validated = $request->validate([
            'role_id' => 'required|integer',
            'subscriptions' => 'required|array',
            'subscriptions.*.main_module_id' => 'required|integer',
            'subscriptions.*.module_id' => 'required|integer',
            'subscriptions.*.subscription_master_id' => 'required|integer',
        ]);

        // Verify that the role belongs to the current session user's admin
        $role = Role::where('id', $validated['role_id'])
            ->where('user_id', $adminUser->id)
            ->where('status', 1)
            ->first();

        if (!$role) {
            return response()->json([
                'status' => 0,
                'message' => 'Role not found or access denied',
            ], 200);
        }

        try {
            // First, remove existing role subscriptions for this role
            RoleSubscriptionMaster::where('role_id', $validated['role_id'])->delete();

            // Create new role subscriptions
            foreach ($validated['subscriptions'] as $subscription) {
                // Get subscription master details
                $subscriptionMaster = SubscriptionMaster::where('id', $subscription['subscription_master_id'])
                    ->where('main_module_id', $subscription['main_module_id'])
                    ->where('module_id', $subscription['module_id'])
                    ->where('status', 1)
                    ->first();

                if ($subscriptionMaster) {
                    RoleSubscriptionMaster::create([
                        'role_id' => $validated['role_id'],
                        'main_module_id' => $subscription['main_module_id'],
                        'module_id' => $subscription['module_id'],
                        'duration' => $subscriptionMaster->duration,
                        'duration_type' => $subscriptionMaster->duration_type,
                        'description' => $subscriptionMaster->description,
                        'price' => $subscriptionMaster->price,
                        'status' => 1,
                    ]);
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Role subscriptions saved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error saving role subscriptions: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $item = RoleSubscriptionMaster::with(['role', 'mainModule', 'module'])->findOrFail($id);
        return response()->json(['status' => 1, 'data' => $item]);
    }

    public function update(Request $request, $id)
    {
        $item = RoleSubscriptionMaster::findOrFail($id);
        $validated = $request->validate([
            'role_id' => 'required|integer',
            'main_module_id' => 'required|integer',
            'module_id' => 'required|integer',
            'duration' => 'required|integer',
            'duration_type' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'status' => 'required|integer',
        ]);
        
        $item->update($validated);
        return response()->json(['status' => 1, 'data' => $item]);
    }

    public function destroy($id)
    {
        $item = RoleSubscriptionMaster::findOrFail($id);
        $item->delete();
        return response()->json(['status' => 1, 'message' => 'Deleted successfully']);
    }
}
