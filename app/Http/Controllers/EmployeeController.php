<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Mid;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Http\Traits\AuthenticatesUser;
use Illuminate\Support\Str;

class EmployeeController extends Controller
{
    use AuthenticatesUser;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {

            $user=$request->get('user');
            $admin=$request->get('admin');

            if($user->id==1){
                $employees = Employee::with(['user', 'department', 'designation', 'superUser'])
                ->orderBy('created_at', 'desc')
                ->get();
            } else {

            if($request->get('isAdmin')==true){

                $employees = Employee::with(['user', 'department', 'designation', 'superUser'])
                ->where('admin_id', $admin->id)
                ->orderBy('created_at', 'desc')
                ->get();

            } else {

                $employees = Employee::with(['user', 'department', 'designation', 'superUser'])
                ->where('admin_id', $admin->id)
                ->orderBy('created_at', 'desc')
                ->get();
            }
        }

            return response()->json($employees);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching employees',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $sessionUser=$request->get('user');
        $admin=$request->get('admin');

        $validator = Validator::make($request->all(), [
            // User validation
            'name' => 'required|string|max:255',
            'mobile' => 'required|digits:10|unique:users,mobile',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
            // Employee validation
            'emp_code' => 'required|string|max:50|unique:employees,emp_code',
            'department_id' => 'required|exists:departments,id',
            'designation_id' => 'required|exists:designations,id',
            'join_date' => 'required|date',
            'dob' => 'nullable|date|before:today',
            'gender' => 'nullable|in:Male,Female,Other',
            'contact_no' => 'nullable|string|max:15',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
            'status' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'error' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            if(!empty($sessionUser->id)) {
                $referUser = User::where('id', $sessionUser->id)->first();
                if ($referUser) {
                    $root= $referUser->root.','.$sessionUser->id;
                    if($referUser->role==2) {
                        $admin_id = $referUser->mid;
                    } else {
                        $admin_id = $referUser->admin_mid;
                    }
                } else {
                    $admin_id='ENX0000002';
                    $root=',3';
                }
            }  else {
                $admin_id='ENX0000002';
                $root=',3';
            }


            $lastUser = Mid::where('status', 0)->first();
            $nextMid = $lastUser->mid;
            $lastUser->markAsUsed();
        
            $user = User::create([
                'mid' => $nextMid, // Example: CW0000001 (last mid + 1)
                'mkey' => Str::random(32), // Generate a unique hash as MKEY
                'admin_mid' => $admin_id, // ID of the admin creating the user
                'mobile' => $request->mobile,
                'name' => $request->name,
                'email' => $request->email ?? null,
                'role' => $request->role_id ?? null,
                'root' => $root ?? null,
                'refer_by' => null,
                'password' => Hash::make($request->password), // Hash the mobile number as password
            ]);
            // Assign permissions and commissions from role template
            $this->assignRolePermissionsAndCommissions($user->id, $user->role);

            // Step 2: Create employee with the new user_id and session user as super_user_id
            $employeeData = $request->only([
                'emp_code', 'department_id', 'designation_id', 'join_date',
                'dob', 'gender', 'contact_no', 'address', 'emergency_contact', 'status'
            ]);
            $employeeData['user_id'] = $user->id;
            $employeeData['super_user_id'] = $sessionUser->id; // Session user ID
            $employeeData['admin_id'] = $admin->id; // ID of the admin creating the user
            $employeeData['created_by'] = $sessionUser->id; // ID of the admin creating the user
            $employee = Employee::create($employeeData);

            // Load relationships for response
            $employee->load(['user', 'department', 'designation', 'superUser']);

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Employee created successfully',
                'data' => $employee
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error creating employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Employee $employee): JsonResponse
    {
        try {
         
            $employee->load(['user', 'department', 'designation', 'superUser']);
            return response()->json([
                'status' => 1,
                'data' => $employee
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'emp_code' => 'required|string|max:50|unique:employees,emp_code,' . $employee->id,
            'department_id' => 'required|exists:departments,id',
            'designation_id' => 'required|exists:designations,id',
            'join_date' => 'required|date',
            'dob' => 'nullable|date|before:today',
            'gender' => 'nullable|in:Male,Female,Other',
            'contact_no' => 'nullable|string|max:15',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
            'status' => 'required|in:Active,Inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Update only employee fields (not user fields)
            $employee->update($request->only([
                'emp_code', 'department_id', 'designation_id', 'join_date',
                'dob', 'gender', 'contact_no', 'address', 'emergency_contact', 'status'
            ]));

            // Load relationships for response
            $employee->load(['user', 'department', 'designation', 'superUser']);

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Employee updated successfully',
                'data' => $employee
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error updating employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Employee $employee): JsonResponse
    {
        try {
         
            DB::beginTransaction();

            // Store user_id before deleting employee
            $userId = $employee->user_id;

            // Delete employee record
            $employee->delete();

            // Optionally delete the associated user as well
            if ($userId) {
                User::find($userId)?->delete();
            }

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Employee deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error deleting employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update employee status.
     */
    public function updateStatus(Request $request, Employee $employee): JsonResponse
    {
       

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Active,Inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $employee->update(['status' => $request->status]);

            return response()->json([
                'status' => 1,
                'message' => 'Employee status updated successfully',
                'data' => $employee
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error updating employee status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dropdown data for employee form.
     */
    public function getDropdownData(Request $request): JsonResponse
    {
        try {
            $user = $request->get('user');
            $admin = $request->get('admin');

            if($user->id==1){
                $roles = \App\Models\Role::select('id', 'name')->where('status', 1)->get();
            } else {
                $roles = \App\Models\Role::select('id', 'name')
                    ->where('user_id', $admin->id)
                    ->where('status', 1)
                    ->get();
            }
            

            $data = [
                'roles' => $roles,
                'departments' => Department::select('id', 'name')
                    ->where('admin_id', $admin->id)
                    ->where('status', 1)
                    ->get(),
                'designations' => Designation::select('id', 'title as name')->where('admin_id', $admin->id)->get()
            ];

            return response()->json([
                'status' => 1,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching dropdown data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search employees.
     */
    public function search(Request $request): JsonResponse
    {
        try {
            // Get authenticated user
            $user = $request->get('user');
            $admin = $request->get('admin');

            $query = Employee::with(['user', 'department', 'designation'])
                ->where('admin_id', $admin->id);

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('emp_code', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->has('department_id') && $request->department_id) {
                $query->where('department_id', $request->department_id);
            }

            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            $employees = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'status' => 1,
                'data' => $employees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error searching employees',
                'error' => $e->getMessage()
            ], 500);
        }
    }

      // Helper: Assign user_role_permission and user_role_commission from role templates
    protected function assignRolePermissionsAndCommissions($userId, $roleId)
    {
        // Assign Permissions
        $rolePermissions = DB::table('role_module_permissions')->where('role_id', $roleId)->get();
        foreach ($rolePermissions as $perm) {
            DB::table('user_role_permissions')->insert([
                'user_id' => $userId,
                'role_id' => $roleId,
                'main_module_id' => $perm->main_module_id,
                'module_id' => $perm->module_id,
                'sub_module_id' => $perm->sub_module_id,
                'permission_id' => $perm->permission_id,
            ]);
        }
        // Assign Commissions
        $roleCommissions = DB::table('role_module_commission')->where('role_id', $roleId)->get();
        foreach ($roleCommissions as $comm) {
            DB::table('user_role_commissions')->insert([
                'user_id' => $userId,
                'role_id' => $roleId,
                'main_module_id' => $comm->main_module_id,
                'module_id' => $comm->module_id,
                'sub_module_id' => $comm->sub_module_id,
                'commission_id' => $comm->commission_id,
            ]);
        }
    }
}
