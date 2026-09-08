<?php

namespace App\Http\Controllers;

use App\Models\UserRolePermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Role;

class UserRolePermissionController extends Controller
{
    public function index()
    {
        $data = UserRolePermission::with(['user', 'role', 'module', 'permission'])->get();
        return response()->json(['status' => 1, 'user_role_permissions' => $data]);
    }

    public function store(Request $request)
    {
        // \Log::info('Incoming store request', $request->all()); // Uncomment for debugging
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
            'main_module_id' => 'required|exists:main_modules,id',
            'module_id' => 'required|exists:modules,id',
            'sub_module_id' => 'nullable|exists:sub_modules,id', // <-- add validation
            'permission_id' => 'required|exists:module_permissions,id',
            'status' => 'required|in:0,1',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()]);
        }
        $data = $request->only(['user_id', 'role_id', 'main_module_id', 'module_id', 'permission_id', 'status']);
        $data['sub_module_id'] = $request->has('sub_module_id') ? $request->input('sub_module_id') : null;
        $urp = UserRolePermission::create($data);
        return response()->json(['status' => 1, 'user_role_permission' => $urp]);
    }

    public function show($id)
    {
        $urp = UserRolePermission::with(['user', 'role', 'module', 'permission'])->find($id);
        if (!$urp) {
            return response()->json(['status' => 0, 'message' => 'Not found']);
        }
        return response()->json(['status' => 1, 'user_role_permission' => $urp]);
    }

    public function update(Request $request, $id)
    {
        $urp = UserRolePermission::find($id);
        if (!$urp) {
            return response()->json(['status' => 0, 'message' => 'Not found']);
        }
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
            'main_module_id' => 'required|exists:main_modules,id',
            'module_id' => 'required|exists:modules,id',
            'sub_module_id' => 'nullable|exists:sub_modules,id', // <-- add validation
            'permission_id' => 'required|exists:module_permissions,id',
            'status' => 'required|in:0,1',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()]);
        }
        $data = $request->only(['user_id', 'role_id', 'main_module_id', 'module_id', 'permission_id', 'status']);
        $data['sub_module_id'] = $request->has('sub_module_id') ? $request->input('sub_module_id') : null;
        $urp->update($data);
        return response()->json(['status' => 1, 'user_role_permission' => $urp]);
    }

    public function destroy($id)
    {
        $urp = UserRolePermission::find($id);
        if (!$urp) {
            return response()->json(['status' => 0, 'message' => 'Not found']);
        }
        $urp->delete();
        return response()->json(['status' => 1, 'message' => 'Deleted successfully']);
    }

    public function deleteAll(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()]);
        }
        UserRolePermission::where('user_id', $request->user_id)->delete();
        return response()->json(['status' => 1, 'message' => 'All permissions deleted for user']);
    }

    /**
     * Get modules for a user (admin gets all, others get only assigned modules)
     */
    public function userModules(Request $request)
    {
        $user = \App\Models\User::find($request->user_id);
        if (!$user) {
            return response()->json(['status' => 0, 'modules' => []]);
        }
        if($request->get('isSuper')==true){
            // Admin: return all modules
            $modules = \App\Models\Module::all();
        } else {
            // Non-admin: return only modules where user has at least one permission
            $moduleIds = \App\Models\UserRolePermission::where('user_id', $user->id)
                ->pluck('module_id')
                ->unique()
                ->toArray();
            if (empty($moduleIds)) {
                $modules = collect();
            } else {
                $modules = \App\Models\Module::whereIn('id', $moduleIds)->get();
            }
        }
        return response()->json(['status' => 1, 'modules' => $modules]);
    }

    /**
     * Return modules, submodules, and permissions for a user (if user_id provided),
     * or all if admin or no user_id.
     */
    public function moduleTree(Request $request)
    {
        $user = $request->get('user');
        if($request->get('isSuper')==false){
            $user_id = $user->id;
        } else {
            $user_id = null; // No valid user found
        }

        if ($user_id) {
            $user = \App\Models\User::find($user_id);
            if (!$user) {
                return response()->json(['status' => 0, 'modules' => []]);
            }
            if($request->get('isSuper')==true){
                // Admin: return all modules, submodules, permissions
                $modules = \App\Models\Module::with(['subModules.permissions'])->get();
            } else {
                // Get all permission_ids, module_ids, sub_module_ids for this user
                $urp = \App\Models\UserRolePermission::where('user_id', $user_id)->get();
                $moduleIds = $urp->pluck('module_id')->unique()->toArray();
                $permissionIds = $urp->pluck('permission_id')->unique()->toArray();
                // Get sub_module_ids from permissions
                $subModuleIds = \App\Models\ModulePermission::whereIn('id', $permissionIds)->pluck('sub_module_id')->unique()->toArray();

                // Get modules with only allowed submodules and permissions
                $modules = \App\Models\Module::whereIn('id', $moduleIds)
                    ->with(['subModules' => function($q) use ($subModuleIds, $permissionIds) {
                        $q->whereIn('id', $subModuleIds)
                          ->with(['permissions' => function($q2) use ($permissionIds) {
                              $q2->whereIn('id', $permissionIds);
                          }]);
                    }])
                    ->get();
            }
        } else {
            // No user_id: return all
            $modules = \App\Models\Module::with(['subModules.permissions'])->get();
        }
        return response()->json(['status' => 1, 'modules' => $modules]);
    }

   
    public function userPermissions(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()]);
        }

        $userId = $request->user_id;

        $permissions = \DB::table('user_role_permissions as urp')
            ->join('modules as m', 'urp.module_id', '=', 'm.id')
            ->leftJoin('sub_modules as sm', 'urp.sub_module_id', '=', 'sm.id')
            ->join('module_permissions as mp', 'urp.permission_id', '=', 'mp.id')
            ->where('urp.user_id', $userId)
            ->select(
                'urp.id as user_role_permission_id',
                'urp.user_id',
                'urp.role_id',
                'urp.module_id',
                'm.name as module_name',
                'urp.sub_module_id',
                'sm.name as sub_module_name',
                'urp.permission_id',
                'mp.name as permission_name',
                'urp.status'
            )
            ->get();

        return response()->json([
            'status' => 1,
            'permissions' => $permissions
        ]);
    }

    public function assignToAllUsers(Request $request)
    {
        // 1. Loop of roles
        $roles = Role::where('status', 1)->where('user_id', $request->get('user')->id)->get();
        $count = 0;

        foreach ($roles as $role) {
            // 2. Loop of role_module_commission role wise fetched
            $roleCommissions = \App\Models\RoleModulePermission::where('role_id', $role->id)
                ->where('status', 1) 
                ->get();
            
            if ($roleCommissions->isEmpty()) {
                continue;
            }

            // 3. Loop of user where get users.role=role.id
            $users = User::where('role', $role->id)->get();

            foreach ($users as $user) {
           
                UserRolePermission::where('user_id', $user->id)->delete();
                foreach ($roleCommissions as $comm) {
                    UserRolePermission::create(
                        [
                            'user_id' => $user->id,
                            'role_id' => $role->id,
                            'main_module_id' => $comm->main_module_id,
                            'module_id' => $comm->module_id,
                            'sub_module_id' => $comm->sub_module_id,
                            'permission_id' => $comm->permission_id,
                            'status' => 1 
                        ]
                    );
                    $count++;
                }
            }
        }

        return response()->json(['status' => 1, 'message' => "Assigned Permissions to all users successfully."]);
    }
}
