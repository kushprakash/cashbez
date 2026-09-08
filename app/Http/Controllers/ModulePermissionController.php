<?php

namespace App\Http\Controllers;

use App\Models\ModulePermission;
use Illuminate\Http\Request;

class ModulePermissionController extends Controller
{
    public function index(Request $request)
    {
        $user=$request->get('user');

        if($request->get('isSuper')==true){
            // Admin: return all permissions
            $permissions = ModulePermission::all();
        } else {
            // Non-admin: return only permissions assigned to this user
            $permissionIds = \DB::table('user_role_permissions')
                ->where('user_id', $user->id)
                ->pluck('permission_id');
            $permissions = ModulePermission::whereIn('id', $permissionIds)->get();
        }

        return response()->json(['status' => 1, 'permissions' => $permissions]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'main_module_id' => 'nullable|integer|exists:main_modules,id', // Optional for validation
            'module_id' => 'required|integer|exists:modules,id',
            'sub_module_id' => 'required|integer|exists:sub_modules,id',
            'name' => 'required|string',
            'endpoint' => 'required|string',
            'route' => 'required|string',
            'status' => 'required|boolean',
            'menu_show' => 'required|boolean',
        ]);
        // Only use the fields that exist in the module_permissions table
        $permission = ModulePermission::create($request->only(['main_module_id','module_id','sub_module_id','name','endpoint','route','status','menu_show']));
        return response()->json(['status' => 1, 'message' => 'Permission created', 'permission' => $permission]);
    }

    public function show($id)
    {
        $permission = ModulePermission::find($id);
        if (!$permission) {
            return response()->json(['status' => 0, 'message' => 'Permission not found'], 404);
        }
        return response()->json(['status' => 1, 'permission' => $permission]);
    }

    public function update(Request $request, $id)
    {
        $permission = ModulePermission::find($id);
        if (!$permission) {
            return response()->json(['status' => 0, 'message' => 'Permission not found'], 404);
        }
        $request->validate([
            'main_module_id' => 'nullable|integer|exists:main_modules,id', // Optional for validation
            'module_id' => 'required|integer|exists:modules,id',
            'sub_module_id' => 'required|integer|exists:sub_modules,id',
            'name' => 'required|string',
            'endpoint' => 'required|string',
            'route' => 'required|string',
            'status' => 'required|boolean',
            'menu_show' => 'required|boolean',
        ]);
        // Only update the fields that exist in the module_permissions table
        $permission->update($request->only(['module_id','sub_module_id','name','endpoint','route','status','menu_show']));
        return response()->json(['status' => 1, 'message' => 'Permission updated', 'permission' => $permission]);
    }

    public function destroy($id)
    {
        $permission = ModulePermission::find($id);
        if (!$permission) {
            return response()->json(['status' => 0, 'message' => 'Permission not found'], 404);
        }
        $permission->delete();
        return response()->json(['status' => 1, 'message' => 'Permission deleted']);
    }

    /**
     * Get permissions by sub module id
     */
    public function getBySubModuleId($subModuleId)
    {
        $permissions = \App\Models\ModulePermission::where('sub_module_id', $subModuleId)->get();
        return response()->json([
            'status' => 1,
            'permissions' => $permissions
        ]);
    }
}
