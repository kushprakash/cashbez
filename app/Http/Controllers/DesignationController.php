<?php

namespace App\Http\Controllers;

use App\Models\Designation;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DesignationController extends Controller
{
    /**
     * Display a listing of the designations.
     */
    public function index(Request $request)
    {
        $user=$request->get('user');
        $admin=$request->get('admin');
        // Get all designations with their departments and users
        $designations = Designation::with(['department', 'user:id,name,email'])
            ->where('admin_id', $admin->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 1,
            'designations' => $designations
        ]);
    }

    /**
     * Store a newly created designation.
     */
    public function store(Request $request)
    {
        $user=$request->get('user');
        $admin=$request->get('admin');
        // Validation
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:100',
            'department_id' => 'required|integer|exists:departments,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 422);
        }

        try {
            // Create designation with session user ID
            $designation = Designation::create([
                'user_id' => $user->id, // Session user ID automatically added
                'admin_id' => $admin->id, // Admin ID for designation ownership
                'created_by' => $user->id, // Admin ID for designation ownership
                'title' => $request->title,
                'department_id' => $request->department_id
            ]);

            // Load the relationships for response
            $designation->load(['department', 'user:id,name,email']);

            return response()->json([
                'status' => 1,
                'message' => 'Designation created successfully',
                'designation' => $designation
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create designation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified designation.
     */
    public function show(Request $request, $id)
    {
        $user=$request->get('user');
        $admin=$request->get('admin');

        $designation = Designation::with(['department', 'user:id,name,email'])->where('admin_id', $admin->id)->find($id);

        if (!$designation) {
            return response()->json([
                'status' => 0,
                'message' => 'Designation not found'
            ], 404);
        }

        return response()->json([
            'status' => 1,
            'designation' => $designation
        ]);
    }

    /**
     * Update the specified designation.
     */
    public function update(Request $request, $id)
    {
        $user=$request->get('user');

        $designation = Designation::find($id);

        if (!$designation) {
            return response()->json([
                'status' => 0,
                'message' => 'Designation not found'
            ], 404);
        }

        // Validation
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:100',
            'department_id' => 'required|integer|exists:departments,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 422);
        }

        try {
            // Update designation
            $designation->update([
                'title' => $request->title,
                'department_id' => $request->department_id
            ]);

            // Load the relationships for response
            $designation->load(['department', 'user:id,name,email']);

            return response()->json([
                'status' => 1,
                'message' => 'Designation updated successfully',
                'designation' => $designation
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update designation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified designation.
     */
    public function destroy(Request $request, $id)
    {
        $user=$request->get('user');

        $designation = Designation::find($id);

        if (!$designation) {
            return response()->json([
                'status' => 0,
                'message' => 'Designation not found'
            ], 404);
        }

        try {
            $designation->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Designation deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete designation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get designations by department
     */
    public function getByDepartment(Request $request, $departmentId)
    {
        $user=$request->get('user');

        $designations = Designation::where('department_id', $departmentId)
            ->with('user:id,name,email')
            ->orderBy('title', 'asc')
            ->get();

        return response()->json([
            'status' => 1,
            'designations' => $designations
        ]);
    }
}
