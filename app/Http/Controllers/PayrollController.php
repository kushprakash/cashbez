<?php
namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PayrollController extends Controller
{
    // Create or update salary structure
    public function setup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'basic' => 'required|numeric',
            'hra' => 'nullable|numeric',
            'travel' => 'nullable|numeric',
            'bonus' => 'nullable|numeric',
            'allowances' => 'nullable|numeric',
            'deductions' => 'nullable|numeric',
            'pf' => 'nullable|numeric',
            'tax' => 'nullable|numeric',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->get('user');
        $admin = $request->get('admin');
   
        $payroll = Payroll::create(array_merge(
            ['user_id' => $request->user_id],
            ['created_by' => $user->id],
            ['admin_id' => $admin->id],
            $request->only(['basic','hra','travel','bonus','allowances','deductions','pf','tax'])
        ));
        return response()->json(['status' => 1, 'payroll' => $payroll]);
    }

    // List all employees with payroll setup
    public function employees()
    {
        $employees = Employee::with(['user', 'department', 'payroll' => function($q) {
            $q->with('createdBy');
            $q->orderByDesc('id')->limit(1);
        }])->get();
        return response()->json(['employees' => $employees]);
    }

    // List all payrolls
    public function list()
    {
        $payrolls = Payroll::with(['user', 'createdBy'])->get();
        return response()->json(['status' => 1, 'data' => $payrolls]);
    }

    // View a single payroll
    public function view($id)
    {
        $payroll = Payroll::with(['user', 'createdBy'])->find($id);
        if (!$payroll) {
            return response()->json(['status' => 0, 'message' => 'Payroll not found'], 404);
        }
        return response()->json(['status' => 1, 'data' => $payroll]);
    }

    // Update a payroll
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'basic' => 'required|numeric',
            'hra' => 'nullable|numeric',
            'travel' => 'nullable|numeric',
            'bonus' => 'nullable|numeric',
            'allowances' => 'nullable|numeric',
            'deductions' => 'nullable|numeric',
            'pf' => 'nullable|numeric',
            'tax' => 'nullable|numeric',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()], 422);
        }
        $payroll = Payroll::find($id);
        if (!$payroll) {
            return response()->json(['status' => 0, 'message' => 'Payroll not found'], 404);
        }
        $payroll->update($request->only(['basic','hra','travel','bonus','allowances','deductions','pf','tax']));
        return response()->json(['status' => 1, 'data' => $payroll]);
    }
}
