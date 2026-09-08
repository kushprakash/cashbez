<?php

namespace App\Http\Controllers;

use App\Models\MainModule;
use Illuminate\Http\Request;

class MainModuleController extends Controller
{
    public function index(Request $request)
    {
        $user=$request->get('user');

        if($request->get('isSuper')==true){
            // Admin: return all modules
            $modules = MainModule::all();
        } else {
            // Non-admin: return only main modules where user has at least one permission for their child modules
            $mainModuleIds = \DB::table('user_role_permissions as urp')
                ->join('modules as m', 'urp.module_id', '=', 'm.id')
                ->where('urp.user_id', $user->id)
                ->where('urp.status', 1)
                ->whereNotNull('m.main_module_id')
                ->pluck('m.main_module_id')
                ->unique()
                ->toArray();
                
            if (empty($mainModuleIds)) {
                $modules = collect();
            } else {
                $modules = MainModule::whereIn('id', $mainModuleIds)->where('status', 1)->get();
            }
        }

        return response()->json(['status' => 1, 'modules' => $modules]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:main_modules,name',
            'status' => 'required|integer|in:0,1',
        ]);
        $module = MainModule::create($request->only(['name','status']));
        return response()->json(['status' => 1, 'message' => 'Main Module created', 'module' => $module]);
    }

    public function show($id)
    {
        $module = MainModule::find($id);
        if (!$module) {
            return response()->json(['status' => 0, 'message' => 'Main Module not found'], 404);
        }
        return response()->json(['status' => 1, 'module' => $module]);
    }

    public function update(Request $request, $id)
    {
        $module = MainModule::find($id);
        if (!$module) {
            return response()->json(['status' => 0, 'message' => 'Main Module not found'], 404);
        }
        $request->validate([
            'name' => 'required|string|unique:modules,name,' . $id,
            'status' => 'required|integer|in:0,1',
        ]);
        $module->update($request->only(['name','status']));
        return response()->json(['status' => 1, 'message' => 'Main Module updated', 'module' => $module]);
    }

    public function destroy($id)
    {
        $module = MainModule::find($id);
        if (!$module) {
            return response()->json(['status' => 0, 'message' => 'Main Module not found'], 404);
        }
        $module->delete();
        return response()->json(['status' => 1, 'message' => 'Main Module deleted']);
    }
}
