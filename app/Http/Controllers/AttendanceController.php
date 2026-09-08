<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Http\Traits\AuthenticatesUser;
use Carbon\Carbon;

class AttendanceController extends Controller
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

            // Get date filter parameters
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
            $userId = $request->get('user_id');

            // Build query
            $query = Attendance::with(['user', 'employee'])
                ->dateRange($startDate, $endDate)
                ->orderBy('date', 'desc');
            // Check if user is admin or super user
            if($request->get('isAdmin')==true){

                $query->where('admin_id', $admin->id);

                if ($userId) {
                    $query->where('user_id', $userId);
                    
                } else {
                    // Get all users under this super user (admin)
                    $userIds = Employee::where('admin_id', $user->id)->pluck('user_id');
                    $query->whereIn('user_id', $userIds);
                }

            } else {
                // Regular user can only see their own records
                $query->where('user_id', $user->id);
            }
            // If specific user_id is provided, filter by it, otherwise show all users under this super user
            
            $attendances = $query->get();

            // Calculate total hours for each attendance
            $attendances->each(function ($attendance) {
                $attendance->calculateTotalHours();
            });

            return response()->json([
                'status' => 1,
                'message' => 'Attendance records retrieved successfully',
                'data' => $attendances,
                'summary' => [
                    'total_records' => $attendances->count(),
                    'present_days' => $attendances->where('status', 'Present')->count(),
                    'absent_days' => $attendances->where('status', 'Absent')->count(),
                    'total_hours' => $attendances->sum('total_hours')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error retrieving attendance records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check in
     */
    public function checkIn(Request $request): JsonResponse
    {
        try {
            // Get authenticated user from middleware
            $user=$request->get('user');
            $admin=$request->get('admin');

            // Validate input
            $validator = Validator::make($request->all(), [
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                'address' => 'required|string',
                //'selfie' => 'required|string', // base64 image
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'error' => $validator->errors()
                ], 422);
            }

            // Check if already checked in today
            $today = Carbon::now()->format('Y-m-d');
            $existingAttendance = Attendance::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->first();

            if ($existingAttendance && $existingAttendance->check_in) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Already checked in today',
                ], 400);
            }

            // Handle selfie upload
            $selfiePath = null;
            if ($request->selfie) {
                $selfiePath = $this->saveSelfie($request->selfie, $user->id, 'checkin');
            }

            // Create or update attendance record
            $attendanceData = [
                'user_id' => $user->id,
                'created_by' => $user->id,
                'admin_id' => $admin->id,
                'date' => $today,
                'check_in' => Carbon::now(),
                'check_in_latitude' => $request->latitude,
                'check_in_longitude' => $request->longitude,
                'check_in_address' => $request->address,
                'check_in_selfie' => $selfiePath,
                'status' => 'Present',
                'notes' => $request->notes
            ];

            if ($existingAttendance) {
                $existingAttendance->update($attendanceData);
                $attendance = $existingAttendance;
            } else {
                $attendance = Attendance::create($attendanceData);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Checked in successfully',
                'data' => $attendance
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error during check in',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check out
     */
    public function checkOut(Request $request): JsonResponse
    {
        try {
            // Get authenticated user from middleware
            $user=$request->get('user');

            // Validate input
            $validator = Validator::make($request->all(), [
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                'address' => 'required|string',
                //'selfie' => 'required|string', // base64 image
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'error' => $validator->errors()
                ], 422);
            }

            // Find today's attendance record
            $today = Carbon::now()->format('Y-m-d');
            $attendance = Attendance::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->first();

            if (!$attendance || !$attendance->check_in) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No check-in record found for today',
                ], 400);
            }

            if ($attendance->check_out) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Already checked out today',
                ], 400);
            }

            // Handle selfie upload
            $selfiePath = null;
            if ($request->selfie) {
                $selfiePath = $this->saveSelfie($request->selfie, $user->id, 'checkout');
            }

            // Update attendance record
            $attendance->update([
                'check_out' => Carbon::now(),
                'check_out_latitude' => $request->latitude,
                'check_out_longitude' => $request->longitude,
                'check_out_address' => $request->address,
                'check_out_selfie' => $selfiePath,
                'notes' => $request->notes ? $attendance->notes . "\n" . $request->notes : $attendance->notes
            ]);

            // Calculate total hours
            $attendance->calculateTotalHours();
            $attendance->save();

            return response()->json([
                'status' => 1,
                'message' => 'Checked out successfully',
                'data' => $attendance
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error during check out',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get today's attendance status
     */
    public function todayStatus(Request $request): JsonResponse
    {
        try {
            // Get authenticated user from middleware
            $user=$request->get('user');

            $attendance = Attendance::getTodayAttendance($user->id);

            return response()->json([
                'status' => 1,
                'message' => 'Today\'s attendance status retrieved',
                'data' => [
                    'attendance' => $attendance,
                    'has_checked_in' => $attendance ? (bool)$attendance->check_in : false,
                    'has_checked_out' => $attendance ? (bool)$attendance->check_out : false,
                    'total_hours' => $attendance ? $attendance->formatted_total_hours : '00:00:00'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error retrieving today\'s status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get employees for dropdown (for admin view)
     */
    public function getEmployees(Request $request): JsonResponse
    {
        try {
            // Get authenticated user from middleware
            $user=$request->get('user');
            $admin=$request->get('admin');

            // Get employees under this super user
            $employees = Employee::with('user')
                ->where('admin_id', $admin->id)
                ->where('status', 1)
                ->get()
                ->map(function ($employee) {
                    return [
                        'id' => $employee->user_id,
                        'name' => $employee->user->name,
                        'emp_code' => $employee->emp_code,
                        'department' => $employee->department->name ?? '',
                        'designation' => $employee->designation->name ?? $employee->designation->title ?? ''
                    ];
                });

            return response()->json([
                'status' => 1,
                'message' => 'Employees retrieved successfully',
                'data' => $employees
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error retrieving employees',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            // Get authenticated user from middleware
            $user=$request->get('user');

            // Find attendance record for this user only
            $attendance = Attendance::with(['user', 'employee'])
                ->where('user_id', $user->id)
                ->first();

            if (!$attendance) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Attendance record not found',
                ], 200);
            }

            $attendance->calculateTotalHours();

            return response()->json([
                'status' => 1,
                'message' => 'Attendance record retrieved successfully',
                'data' => $attendance
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error retrieving attendance record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            // Get authenticated user from middleware
            $user=$request->get('user');
            $admin=$request->get('admin');
            // Validate input
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'date' => 'required|date',
                'check_in' => 'nullable|date',
                'check_out' => 'nullable|date|after:check_in',
                'status' => 'required|string',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'error' => $validator->errors()
                ], 422);
            }

            // Find attendance record
            $attendance = Attendance::find($id);
            if (!$attendance) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Attendance record not found1',
                ], 200);
            }

            // Check if user has access to this attendance record
            $userIds = Employee::where('admin_id', $admin->id)->pluck('user_id');
            if (!$userIds->contains($attendance->user_id)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized access',
                ], 200);
            }

            // Update attendance record
            $attendance->update([
                'user_id' => $request->user_id,
                'date' => $request->date,
                'check_in' => $request->check_in,
                'check_out' => $request->check_out,
                'status' => $request->status,
                'notes' => $request->notes
            ]);

            // Calculate total hours
            $attendance->calculateTotalHours();
            $attendance->save();

            return response()->json([
                'status' => 1,
                'message' => 'Attendance updated successfully',
                'data' => $attendance
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error updating attendance record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save selfie image
     */
    private function saveSelfie($base64Image, $userId, $type)
    {
        try {
            // Remove data:image/jpeg;base64, part
            $image = str_replace('data:image/jpeg;base64,', '', $base64Image);
            $image = str_replace('data:image/png;base64,', '', $image);
            $image = str_replace(' ', '+', $image);
            
            // Decode base64
            $imageData = base64_decode($image);
            
            // Generate filename
            $filename = 'attendance_' . $type . '_' . $userId . '_' . Carbon::now()->format('Y_m_d_H_i_s') . '.jpg';
            
            // Save to storage
            $path = 'attendance/selfies/' . $filename;
            Storage::disk('public')->put($path, $imageData);
            
            return $path;
            
        } catch (\Exception $e) {
            \Log::error('Error saving selfie: ' . $e->getMessage());
            return null;
        }
    }
}
