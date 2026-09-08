<?php

namespace App\Http\Controllers;

use App\Models\RoleModuleCommission;
use Illuminate\Http\Request;
use App\Models\User;

class RoleModuleCommissionController extends Controller
{
  

    public function index(Request $request)
    {
        $user=$request->get('user');

        if($request->role_id) {
            $request->validate(['role_id' => 'integer|exists:roles,id']);
            $items = RoleModuleCommission::where('user_id', $user->id)
                ->where('role_id', $request->role_id)
                ->with(['role', 'module', 'subModule', 'commission'])
                ->get();
            return response()->json(['status' => 1, 'role_module_commissions' => $items]);
        } else {
            $items = RoleModuleCommission::where('user_id',$user->id)->with(['role', 'module', 'subModule', 'commission'])->get();
        }
        
        return response()->json(['status' => 1, 'role_module_commissions' => $items]);
    }

    public function store(Request $request)
    {
        $user=$request->get('user');

        $request->validate([
            'role_id' => 'required|integer|exists:roles,id',
            'main_module_id' => 'required|integer|exists:main_modules,id',
            'module_id' => 'required|integer|exists:modules,id',
            'sub_module_id' => 'required|integer|exists:sub_modules,id',
            'commission_id' => 'required|integer',
            'status' => 'required|boolean',
        ]);
        // Check for existing record
        $exists = RoleModuleCommission::where([
            'user_id' => $user->id,
            'role_id' => $request->role_id,
            'main_module_id' => $request->main_module_id,
            'module_id' => $request->module_id,
            'sub_module_id' => $request->sub_module_id,
            'commission_id' => $request->commission_id
        ])->first();
        if ($exists) {
            return response()->json(['status' => 0, 'message' => 'Role Module Permission already exists'], 200);
        }
        $request->merge(['user_id' => $user->id]);

        $item = RoleModuleCommission::create($request->only(['user_id','role_id','main_module_id','module_id','sub_module_id','commission_id','status']));
        return response()->json(['status' => 1, 'message' => 'RoleModuleCommission created', 'role_module_commission' => $item]);
    }

    public function show($id)
    {
        $item = RoleModuleCommission::with(['role', 'module', 'subModule', 'commission'])->findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'main_module_id' => 'required|exists:main_modules,id',
            'module_id' => 'required|exists:modules,id',
            'sub_module_id' => 'nullable|exists:sub_modules,id',
            'commission_id' => 'required|exists:commissions,id',
            'status' => 'required|integer',
        ]);
        $item = RoleModuleCommission::findOrFail($id);
        $item->update($validated);
        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = RoleModuleCommission::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function moduleTreeCommissions()
    {
        $modules = \App\Models\Module::with([
            'subModules.commissions' // assumes relationships are set up
        ])->get();

        $result = $modules->map(function($module) {
            return [
                'id' => $module->id,
                'name' => $module->name,
                'sub_modules' => $module->subModules->map(function($sub) {
                    return [
                        'id' => $sub->id,
                        'name' => $sub->name,
                        'commissions' => $sub->commissions->map(function($comm) {
                            return [
                                'id' => $comm->id,
                                'name' => $comm->name,
                            ];
                        }),
                    ];
                }),
            ];
        });

        return response()->json(['modules' => $result]);
    }

    public function deleteAll(Request $request)
    {
        $roleId = $request->input('role_id');
        if (!$roleId) {
            return response()->json(['status' => 0, 'message' => 'Role ID is required'], 400);
        }

        RoleModuleCommission::where('role_id', $roleId)->delete();

        return response()->json(['status' => 1, 'message' => 'All role module commissions deleted successfully']);
    }
}
