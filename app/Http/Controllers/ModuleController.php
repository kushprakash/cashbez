<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\MainModule;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index(Request $request)
    {
        $user=$request->get('user');



        if($request->get('isSuper')==true){
            // Admin: return all modules
           $modules = Module::with('mainModule')
            ->orderBy('position', 'ASC')
            ->get();

        } else {
            // Non-admin: return only modules where user has at least one permission
            $moduleIds = \DB::table('user_role_permissions')
                ->where('user_id', $user->id)
                ->pluck('module_id')
                ->unique()
                ->toArray();

            if (empty($moduleIds)) {
                $modules = collect();
            } else {
                $modules = Module::whereIn('id', $moduleIds)->orderBy('position', 'ASC')->get();
            }
        }

        

        return response()->json(['status' => 1, 'modules' => $modules]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'main_module_id' => 'required|integer|exists:main_modules,id',
            'name' => 'required|string',
            'icon' => 'nullable|string',
            'status' => 'required|integer|in:0,1',
        ]);
        $module = Module::create($request->only(['main_module_id','name','icon','status']));
        return response()->json(['status' => 1, 'message' => 'Module created', 'module' => $module]);
    }

    public function show($id)
    {
        $module = Module::find($id);
        if (!$module) {
            return response()->json(['status' => 0, 'message' => 'Module not found'], 404);
        }
        return response()->json(['status' => 1, 'module' => $module]);
    }

    public function update(Request $request, $id)
    {
        $module = Module::find($id);
        if (!$module) {
            return response()->json(['status' => 0, 'message' => 'Module not found'], 404);
        }
        $request->validate([
            'main_module_id' => 'required|integer|exists:main_modules,id',
            'name' => 'required|string',
            'icon' => 'nullable|string',
            'status' => 'required|integer|in:0,1',
        ]);
        $module->update($request->only(['main_module_id','name','icon','status']));
        return response()->json(['status' => 1, 'message' => 'Module updated', 'module' => $module]);
    }

    public function destroy($id)
    {
        $module = Module::find($id);
        if (!$module) {
            return response()->json(['status' => 0, 'message' => 'Module not found'], 404);
        }
        $module->delete();
        return response()->json(['status' => 1, 'message' => 'Module deleted']);
    }

    public function getByMainModule($mainModuleId)
    {
        $modules = Module::where('main_module_id', $mainModuleId)->where('status', 1)->get();
        return response()->json(['status' => 1, 'modules' => $modules]);
    }

    public function updateOrder(Request $request)
    {
        $request->validate([
            'modules' => 'required|array',
            'modules.*.id' => 'required|exists:modules,id',
        ]);

        foreach ($request->modules as $index => $moduleData) {
            Module::where('id', $moduleData['id'])->update(['position' => $index + 1]);
        }

        return response()->json(['status' => 1, 'message' => 'Module order updated successfully']);
    }
}
