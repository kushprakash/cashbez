<?php

namespace App\Http\Controllers;

use App\Models\SubModule;
use Illuminate\Http\Request;

class SubModuleController extends Controller
{
    // public function index()
    // {
    //     return SubModule::all();
    // }

    public function index(Request $request)
    {
        $subModules = \App\Models\SubModule::all();
        return response()->json(['status' => 1, 'modules' => $subModules]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'main_module_id' => 'nullable|exists:main_modules,id', // Optional for validation
            'module_id' => 'required|exists:modules,id',
            'name' => 'required|string|max:255',
            'status' => 'required|in:0,1',
        ]);
        
        // Only use the fields that exist in the sub_modules table
        $subModule = SubModule::create($request->only(['main_module_id','module_id', 'name', 'status']));
        return response()->json(['status' => 1, 'message' => 'Sub Module created successfully', 'data' => $subModule], 201);
    }

    public function show($id)
    {
        $subModule = SubModule::find($id);
        if (!$subModule) {
            return response()->json(['status' => 0, 'message' => 'Sub Module not found'], 404);
        }
        return response()->json($subModule);
    }

    public function update(Request $request, $id)
    {
        $subModule = SubModule::find($id);
        if (!$subModule) {
            return response()->json(['status' => 0, 'message' => 'Sub Module not found'], 404);
        }
        $validated = $request->validate([
            'main_module_id' => 'nullable|exists:main_modules,id', // Optional for validation
            'module_id' => 'required|exists:modules,id',
            'name' => 'required|string|max:255',
            'status' => 'required|in:0,1',
        ]);
        
        // Only update the fields that exist in the sub_modules table
        $subModule->update($request->only(['module_id', 'name', 'status']));
        return response()->json(['status' => 1, 'message' => 'Sub Module updated successfully', 'data' => $subModule]);
    }

    public function destroy($id)
    {
        $subModule = SubModule::findOrFail($id);
        $subModule->delete();
        return response()->json(['success' => true]);
    }

    public function getByModule(Request $request)
    {
        $moduleId = $request->query('module_id');
        if (!$moduleId) {
            return response()->json(['status' => 0, 'message' => 'module_id is required'], 400);
        }
        $subModules = \App\Models\SubModule::where('module_id', $moduleId)->get();
        return response()->json(['status' => 1, 'modules' => $subModules]);
    }

    /**
     * Get sub modules by module id (RESTful style)
     */
    public function getByModuleId($moduleId)
    {
        $subModules = \App\Models\SubModule::where('module_id', $moduleId)->get();
        return response()->json([
            'status' => 1,
            'sub_modules' => $subModules
        ]);
    }

    /**
     * Get all sub modules (for /api/sub-modules)
     */
    public function allSubModules()
    {
        $subModules = \App\Models\SubModule::all();
        return response()->json([
            'status' => 1,
            'sub_modules' => $subModules
        ]);
    }
}
