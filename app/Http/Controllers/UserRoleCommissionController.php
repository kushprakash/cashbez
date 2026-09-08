<?php

namespace App\Http\Controllers;

use App\Models\UserRoleCommission;
use App\Models\ModuleCommission;
use App\Models\User;
use App\Models\Role;
use App\Models\Module;
use Illuminate\Http\Request;

class UserRoleCommissionController extends Controller
{
    public function index()
    {
        return UserRoleCommission::with(['user', 'role', 'module'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
            'main_module_id' => 'required|exists:main_modules,id',
            'module_id' => 'required|exists:modules,id',
            'sub_module_id' => 'required|exists:sub_modules,id',
            'commission_id' => 'required|numeric',
            'status' => 'required|in:0,1',
        ]);
        $commission = UserRoleCommission::create($validated);
        return response()->json($commission, 201);
    }

    public function show($id)
    {
        return UserRoleCommission::with(['user', 'role', 'module'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $commission = UserRoleCommission::findOrFail($id);
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
            'main_module_id' => 'required|exists:main_modules,id',
            'sub_module_id' => 'required|exists:sub_modules,id',
            'module_id' => 'required|exists:modules,id',
            'commission_amt' => 'required|numeric',
            'status' => 'required|in:0,1',
        ]);
        $commission->update($validated);
        return response()->json($commission);
    }

    public function destroy($id)
    {
        $commission = UserRoleCommission::findOrFail($id);
        $commission->delete();
        return response()->json(['success' => true]);
    }


    public function roles()
    {
        return Role::all();
    }

    public function modules()
    {
        return Module::all();
    }

    public function moduleTree(Request $request)
    {
        $user = $request->get('user');
        $user_id = $user->id ?? null;

        if ($user_id) {
            $user = \App\Models\User::find($user_id);
            if (!$user) {
                return response()->json(['status' => 0, 'modules' => []]);
            }
            if ($request->get('isSuper') == true) {
                // Admin: return all modules, submodules, commissions
                $modules = \App\Models\Module::with(['subModules.commissions'])->get();
            } else {
                // Get modules and sub_module_ids from commissions created by the current user
                $moduleCommissions = \App\Models\ModuleCommission::where('user_id', $request->get('user')->id)->get();
                $moduleIds = $moduleCommissions->pluck('module_id')->unique()->toArray();
                $subModuleIds = $moduleCommissions->pluck('sub_module_id')->unique()->toArray();
                $permissionIds = $moduleCommissions->pluck('id')->unique()->toArray();

                // Get modules with only allowed submodules and commissions
                $modules = \App\Models\Module::whereIn('id', $moduleIds)
                    ->with(['subModules' => function($q) use ($subModuleIds, $permissionIds) {
                        $q->whereIn('id', $subModuleIds)
                          ->with(['commissions' => function($q2) use ($permissionIds) {
                              $q2->whereIn('id', $permissionIds);
                          }]);
                    }])
                    ->get();
            }
        } else {
            // No user_id: return all
            $modules = \App\Models\Module::with(['subModules.commissions'])->get();
        }
        return response()->json(['status' => 1, 'modules' => $modules]);
    }

    public function deleteAll(Request $request)
    {
        $userId = $request->input('user_id');
        if (!$userId) {
            return response()->json(['status' => 0, 'message' => 'User ID is required'], 400);
        }

        //->where('user_id', $request->get('user')->id)
        $CommissionIds = ModuleCommission::where('user_id', $request->get('user')->id)
        ->pluck('id')->toArray();

       
        // Get the IDs before deletion
        $deletedIds = UserRoleCommission::where('user_id', $userId)
            ->whereIn('commission_id', $CommissionIds)
            ->pluck('id')
            ->toArray();


        UserRoleCommission::where('user_id', $userId)->whereIn('commission_id', $CommissionIds)->delete();

        return response()->json([
            'status' => 1, 
            'message' => 'All user role commissions deleted successfully',
            'deleted_ids' => $deletedIds
        ]);
    }

    public function commissions(Request $request)
    {
        $userId = $request->input('user_id');
        if (!$userId) {
            return response()->json(['status' => 0, 'message' => 'User ID is required'], 400);
        }

        $commissions = \App\Models\UserRoleCommission::where('user_id', $userId)
            ->get(['module_id', 'sub_module_id', 'commission_id']);

        return response()->json([
            'status' => 1,
            'commissions' => $commissions
        ]);
    }



    public function assignToAllUsers(Request $request)
    {
        // 1. Loop of roles
        $roles = Role::where('status', 1)->where('user_id', $request->get('user')->id)->get();
        $count = 0;

        foreach ($roles as $role) {
            // 2. Loop of role_module_commission role wise fetched
            $roleCommissions = \App\Models\RoleModuleCommission::where('role_id', $role->id)
                ->where('status', 1) 
                ->get();
            
            if ($roleCommissions->isEmpty()) {
                continue;
            }

            // 3. Loop of user where get users.role=role.id
            $users = User::where('role', $role->id)->get();

            foreach ($users as $user) {
           
                UserRoleCommission::where('user_id', $user->id)->delete();

                foreach ($roleCommissions as $comm) {

                    UserRoleCommission::create(
                        [
                            'user_id' => $user->id,
                            'role_id' => $role->id,
                            'main_module_id' => $comm->main_module_id,
                            'module_id' => $comm->module_id,
                            'sub_module_id' => $comm->sub_module_id,
                            'commission_id' => $comm->commission_id,
                            'status' => 1 
                        ]
                    );
                    $count++;
                }
            }
        }

        return response()->json(['status' => 1, 'message' => "Assigned commissions & Charges to all users successfully."]);
    }



    public function submodulebyCommission($id)
    {
       
        // 1. Loop of role_module_commission role wise fetched
        $roleCommissionss = \App\Models\RoleModuleCommission::where('status', 1)->where('sub_module_id', $id)->get();
        
        foreach ($roleCommissionss as $comm) {

        
            // 2. Loop of user where get users.role=role.id
            $users = User::where('role', $comm->role_id)->get();

            foreach ($users as $user) {
            
                UserRoleCommission::where('user_id', $user->id)
                ->where('commission_id', $comm->commission_id)
                ->delete();
               

                UserRoleCommission::create(
                    [
                        'user_id' => $user->id,
                        'role_id' => $comm->role_id,
                        'main_module_id' => $comm->main_module_id,
                        'module_id' => $comm->module_id,
                        'sub_module_id' => $comm->sub_module_id,
                        'commission_id' => $comm->commission_id,
                        'status' => 1 
                    ]
                );
                
            }

        }
    
        return response()->json(['status' => 1, 'message' => "Assigned commissions & Charges to all users successfully."]);
    }
}

