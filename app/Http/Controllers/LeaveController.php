<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class LeaveController extends Controller
{
    // List all leaves (admin/report)
    public function index(Request $request)
    {
       
        $query = Leave::with(['user', 'employee']);
        
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        } else{
            $user=$request->get('user');

            if($user->mid!=$user->admin_mid){
                $query->where('user_id', $user->id);
            } 
            
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    // Store leave request
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'leave_type' => 'required|string',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'reason' => 'required|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->get('user');
        $admin = $request->get('admin');

        $leave = Leave::create([
            'user_id' => $user->id,
            'created_by' => $user->id,
            'admin_id' => $admin->id,
            'leave_type' => $request->leave_type,
            'from_date' => $request->from_date,
            'to_date' => $request->to_date,
            'reason' => $request->reason,
            'status' => 0,
            'applied_at' => now(),
        ]);
        return response()->json($leave, 201);
    }

    // Show leave details
    public function show($id)
    {
        $leave = Leave::with(['user', 'employee'])->findOrFail($id);
        return response()->json($leave);
    }

    // Update leave (for approval/rejection)
    public function update(Request $request, $id)
    {
        $leave = Leave::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:1,2,0',
            'approval_remarks' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $leave->status = $request->status;
        $leave->approval_remarks = $request->approval_remarks;
        $leave->approved_by = Auth::id();
        $leave->approved_at = now();
        $leave->save();
        return response()->json($leave);
    }

    // Delete leave
    public function destroy($id)
    {
        $leave = Leave::findOrFail($id);
        $leave->delete();
        return response()->json(['message' => 'Leave deleted successfully']);
    }

    // Employee's own leave requests
    public function myLeaves(Request $request)
    {
        $user = $request->get('user');
        $userId = $request->user_id ?? $user->id;
        $leaves = Leave::where('user_id', $userId)->orderBy('created_at', 'desc')->get();
        return response()->json($leaves);
    }
}
