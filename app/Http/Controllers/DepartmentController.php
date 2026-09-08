<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the departments.
     */
    public function index(Request $request)
    {
        $user=$request->get('user');
        $admin=$request->get('admin');

        // Get all departments with latest first, including user relationship
        $departments = Department::with('user:id,name,email')
            ->where('admin_id', $admin->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 1,
            'departments' => $departments
        ]);
    }

    /**
     * Store a newly created department.
     */
    public function store(Request $request)
    {
        $user=$request->get('user');
        $admin=$request->get('admin');

        // Validation
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:departments,name',
            'status' => 'required|integer|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 422);
        }

        try {
            // Create department with session user ID
            $department = Department::create([
                'user_id' => $user->id, // Session user ID automatically added
                'created_by' => $user->id, // Session user ID automatically added
                'admin_id' => $admin->id, // Admin ID for department ownership
                'name' => $request->name,
                'status' => (bool) $request->status
            ]);

            // Load the user relationship for response
            $department->load('user:id,name,email');

            return response()->json([
                'status' => 1,
                'message' => 'Department created successfully',
                'department' => $department
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified department.
     */
    public function show(Request $request, $id)
    {
        $user=$request->get('user');
        $admin=$request->get('admin');
        $department = Department::with('user:id,name,email')->where('admin_id', $admin->id)->find($id);

        if (!$department) {
            return response()->json([
                'status' => 0,
                'message' => 'Department not found'
            ], 404);
        }

        return response()->json([
            'status' => 1,
            'department' => $department
        ]);
    }

    /**
     * Update the specified department.
     */
    public function update(Request $request, $id)
    {
        $user=$request->get('user');

        $department = Department::find($id);

        if (!$department) {
           return response()->json([
                'status' => 0,
                'message' => 'Department not found'
            ], 404);
        }

        Log::info('Found department for update', [
            'id' => $id,
            'current_name' => $department->name,
            'current_status' => $department->status,
            'user_id' => $user->id
        ]);

        // Validation
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:departments,name,' . $id,
            'status' => 'required|integer|in:0,1'
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed for department update', [
                'id' => $id,
                'errors' => $validator->errors()->toArray()
            ]);
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'error' => $validator->errors()
            ], 422);
        }

        try {
            // Log the update attempt for debugging
            Log::info('Attempting to update department', [
                'id' => $id,
                'name' => $request->name,
                'status' => $request->status,
                'user_id' => $user->id
            ]);

            // Alternative approach: Update fields individually
            $department->name = $request->name;
            $department->status = (bool) $request->status;
            $saved = $department->save();

            if (!$saved) {
                Log::error('Department save failed - save() returned false', ['id' => $id]);
                return response()->json([
                    'status' => 0,
                    'message' => 'Failed to save department changes'
                ], 500);
            }

            // Refresh department data
            $department = $department->fresh();
            
            // Load the user relationship for response
            $department->load('user:id,name,email');

            Log::info('Department updated successfully', ['id' => $id]);

            return response()->json([
                'status' => 1,
                'message' => 'Department updated successfully',
                'department' => $department
            ]);

        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Database error updating department', [
                'id' => $id,
                'error' => $e->getMessage(),
                'sql' => $e->getSql() ?? 'N/A'
            ]);
            
            return response()->json([
                'status' => 0,
                'message' => 'Database error: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            Log::error('General error updating department', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update department: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified department.
     */
    public function destroy(Request $request, $id)
    {
        $user=$request->get('user');

        $department = Department::find($id);

        if (!$department) {
            return response()->json([
                'status' => 0,
                'message' => 'Department not found'
            ], 404);
        }

        try {
            $department->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Department deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle department status
     */
    public function toggleStatus(Request $request, $id)
    {
        $user=$request->get('user');
        $department = Department::find($id);

        if (!$department) {
            return response()->json([
                'status' => 0,
                'message' => 'Department not found'
            ], 404);
        }

        try {
            $department->status = !$department->status;
            $department->save();

            // Load the user relationship for response
            $department->load('user:id,name,email');

            return response()->json([
                'status' => 1,
                'message' => 'Department status updated successfully',
                'department' => $department
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update department status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active departments only
     */
    public function getActiveDepartments(Request $request)
    {
        $user=$request->get('user');

        $departments = Department::active()
            ->with('user:id,name,email')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'status' => 1,
            'departments' => $departments
        ]);
    }

    /**
     * Test endpoint to debug department issues
     */
    public function testDepartment(Request $request, $id = null)
    {
        try {
            $result = [
                'database_connection' => 'OK',
                'departments_table' => 'OK',
                'test_timestamp' => now()
            ];

            // Test basic query
            $count = Department::count();
            $result['total_departments'] = $count;

            if ($id) {
                $department = Department::find($id);
                $result['department_found'] = $department ? 'YES' : 'NO';
                if ($department) {
                    $result['department_data'] = $department->toArray();
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Test completed successfully',
                'debug_info' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Test failed',
                'error' => $e->getMessage(),
                'debug_info' => [
                    'error_type' => get_class($e),
                    'error_line' => $e->getLine(),
                    'error_file' => $e->getFile()
                ]
            ], 500);
        }
    }
}
