<?php

namespace App\Http\Controllers;

use App\Models\RoleModulePermission;
use Illuminate\Http\Request;
use App\Models\User;

class RoleModulePermissionController extends Controller
{
    public function index(Request $request)
    {
        $user=$request->get('user');

        if($request->role_id) {
            $request->validate(['role_id' => 'integer|exists:roles,id']);
            $items = RoleModulePermission::where('user_id', $user->id)
                ->where('role_id', $request->role_id)
                ->with(['role', 'module', 'sub_module', 'permission', 'main_module'])
                ->get();
            return response()->json(['status' => 1, 'role_module_permissions' => $items]);
        } else {
            $items = RoleModulePermission::where('user_id',$user->id)->with(['role', 'module', 'sub_module', 'permission', 'main_module'])->get();
        }
        
        return response()->json(['status' => 1, 'role_module_permissions' => $items]);
    }

    public function store(Request $request)
    {
        $user=$request->get('user');

        $request->validate([
            'role_id' => 'required|integer|exists:roles,id',
            'main_module_id' => 'required|integer|exists:main_modules,id',      
            'module_id' => 'required|integer|exists:modules,id',
            'sub_module_id' => 'required|integer|exists:sub_modules,id',
            'permission_id' => 'required|integer|exists:module_permissions,id',
            'status' => 'required|boolean',
        ]);
        // Check for existing record
        $exists = RoleModulePermission::where([
            'user_id' => $user->id,
            'role_id' => $request->role_id,
            'main_module_id' => $request->main_module_id,
            'module_id' => $request->module_id,
            'sub_module_id' => $request->sub_module_id,
            'permission_id' => $request->permission_id
        ])->first();
        if ($exists) {
            return response()->json(['status' => 0, 'message' => 'Role Module Permission already exists'], 200);
        }
        $request->merge(['user_id' => $user->id]);
        $item = RoleModulePermission::create($request->only(['user_id','role_id','main_module_id','module_id','sub_module_id','permission_id','status']));
        return response()->json(['status' => 1, 'message' => 'RoleModulePermission created', 'role_module_permission' => $item]);
    }

    public function show($id)
    {
        $item = RoleModulePermission::find($id);
        if (!$item) {
            return response()->json(['status' => 0, 'message' => 'RoleModulePermission not found'], 200);
        }
        return response()->json(['status' => 1, 'role_module_permission' => $item]);
    }

    public function update(Request $request, $id)
    {
        $item = RoleModulePermission::find($id);
        if (!$item) {
            return response()->json(['status' => 0, 'message' => 'RoleModulePermission not found'], 200);
        }
        $request->validate([
            'role_id' => 'required|integer|exists:roles,id',
            'main_module_id' => 'required|integer|exists:main_modules,id',
            'module_id' => 'required|integer|exists:modules,id',
            'sub_module_id' => 'required|integer|exists:sub_modules,id',
            'permission_id' => 'required|integer|exists:module_permissions,id',
            'status' => 'required|boolean',
        ]);
        $item->update($request->only(['role_id','main_module_id','module_id','sub_module_id','permission_id','status']));
        return response()->json(['status' => 1, 'message' => 'RoleModulePermission updated', 'role_module_permission' => $item]);
    }

    public function destroy($id)
    {
        $item = RoleModulePermission::find($id);
        if (!$item) {
            return response()->json(['status' => 0, 'message' => 'RoleModulePermission not found'], 200);
        }
        $item->delete();
        return response()->json(['status' => 1, 'message' => 'RoleModulePermission deleted']);
    }

    public function deleteAll(Request $request)
    {
        $user=$request->get('user');

        $request->validate([
            'role_id' => 'required|integer|exists:roles,id',
        ]);

        RoleModulePermission::where('user_id', $user->id)
            ->where('role_id', $request->role_id)
            ->delete();

        return response()->json(['status' => 1, 'message' => 'All role module permissions deleted for the role']);
    }
}
