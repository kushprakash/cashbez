<?php
namespace App\Http\Controllers;

use App\Models\SalaryPayment;
use App\Models\Payroll;
use App\Models\Attendance;
use App\Models\Leave;
use App\Models\Employee;
use App\Models\User;
use App\Models\Payslip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SalaryController extends Controller
{
    // Generate salary for selected month
    public function generate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $user_id = $request->user_id;
        $month = $request->month;
        $year = $request->year;
        
        // Check if salary already exists for this period
        $existingSalary = SalaryPayment::where('user_id', $user_id)
            ->where('month', $month)
            ->where('year', $year)
            ->first();
        
        if ($existingSalary) {
            if ($existingSalary->status === 'paid') {
                return response()->json([
                    'status' => 0, 
                    'message' => 'Salary already paid for this period',
                    'payment_status' => 'paid',
                    'month' => (int)$month,
                    'year' => (int)$year
                ], 200);
            } 
        }
        
        $payroll = Payroll::where('user_id', $user_id)->orderBy('id', 'desc')->first();
        if (!$payroll) {
            return response()->json(['status' => 0, 'message' => 'Payroll not set for employee'], 200);
        }
        // Calculate working days in month
        $total_days = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        // Attendance: present days
        $present_days = Attendance::where('user_id', $user_id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->where('status', 'Present')
            ->count();

        // Approved paid leaves (count all days for all approved leaves in the month)
        // Define paid leave types
        $paidLeaveTypes = ['Casual', 'Earned', 'Sick'];
        $leaves = Leave::where('user_id', $user_id)
            ->where('status', 1)
            ->where(function($q) use ($month, $year) {
                $q->where(function($q2) use ($month, $year) {
                    $q2->whereYear('from_date', '<=', $year)
                        ->whereYear('to_date', '>=', $year)
                        ->whereMonth('from_date', '<=', $month)
                        ->whereMonth('to_date', '>=', $month);
                });
            })
            ->get();
        $paid_leaves = 0;
        $unpaid_leaves = 0;
        foreach ($leaves as $leave) {
            $from = \Carbon\Carbon::parse($leave->from_date)->startOfDay();
            $to = \Carbon\Carbon::parse($leave->to_date)->startOfDay();
            $monthStart = \Carbon\Carbon::create($year, $month, 1)->startOfDay();
            $monthEnd = \Carbon\Carbon::create($year, $month, $total_days)->startOfDay();
            $actualStart = $from->greaterThan($monthStart) ? $from : $monthStart;
            $actualEnd = $to->lessThan($monthEnd) ? $to : $monthEnd;
            if ($actualStart->lte($actualEnd)) {
                $days = $actualStart->diffInDays($actualEnd) + 1;
                if (in_array($leave->leave_type, $paidLeaveTypes)) {
                    $paid_leaves += $days;
                } else {
                    $unpaid_leaves += $days;
                }
            }
        }
        // Only approved leaves (status=1) are counted as paid leaves (already filtered above)
        // Ensure payable_days is always a whole number
        $payable_days = (int)$present_days + (int)$paid_leaves;

        // Prorate both gross and deductions
        $gross_monthly = ($payroll->basic + $payroll->hra + $payroll->travel + $payroll->bonus + $payroll->allowances);
        $deductions_monthly = ($payroll->deductions + $payroll->pf + $payroll->tax);
        $per_day_gross = $gross_monthly / $total_days;
        $per_day_deductions = $deductions_monthly / $total_days;
        $gross = $per_day_gross * $payable_days;
        $deductions = $per_day_deductions * $payable_days;
        $net = $gross - $deductions;

        $salary = [
            'user_id' => $user_id,
            'month' => $month,
            'year' => $year,
            'total_days' => $total_days,
            'payable_days' => $payable_days,
            'gross' => $gross,
            'deductions' => $deductions,
            'net' => $net,
            'status' => 'pending',
            'paid_leaves'=>$paid_leaves,
            'present_days'=>$present_days,
        ];
      
        $payslip=[
            'salary_payment_id' => 1,
            'user_id' => $user_id,
            'month' => $month,
            'year' => $year,
            'earnings' => [
                'basic' => $payroll->basic,
                'hra' => $payroll->hra,
                'travel' => $payroll->travel,
                'bonus' => $payroll->bonus,
                'allowances' => $payroll->allowances,
            ],
            'deductions' => [
                'deductions' => $payroll->deductions,
                'pf' => $payroll->pf,
                'tax' => $payroll->tax,
            ],
            'net' => $net,
            'pdf_path' => null,
        ];
        return response()->json(['status' => 1, 'salary' => $salary, 'payslip' => $payslip]);
    }

    // Mark salary as paid
    public function pay(Request $request)
    {
        
        $user = $request->get('user');
        $admin = $request->get('admin');

        //{"user_id":17,"month":"8","year":2025,"company_bank":"hdfc","transaction_mode":"online","utr":"123456"}
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000',
            'company_bank' => 'required|string|max:100',
            'transaction_mode' => 'required|in:cash,cheque,online',
            'cheque_no' => 'required_if:transaction_mode,cheque|string|max:50',
            'utr' => 'required_if:transaction_mode,online|string|max:100',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user_id = $request->user_id;
        $month = $request->month;
        $year = $request->year;
        
        // Check if salary already paid for this period
        $existingSalary = SalaryPayment::where('user_id', $user_id)
            ->where('month', $month)
            ->where('year', $year)
            ->where('status', 'paid')
            ->first();
        
        if ($existingSalary) {
            return response()->json([
                'status' => 0, 
                'message' => 'Salary already paid for this period',
                'payment_status' => 'paid',
                'month' => (int)$month,
                'year' => (int)$year
            ], 200);
        }

        $payroll = Payroll::where('user_id', $user_id)->orderBy('id', 'desc')->first();
        if (!$payroll) {
            return response()->json(['status' => 0, 'message' => 'Payroll not set for employee'], 200);
        }
        // Calculate working days in month
        $total_days = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        // Attendance: present days
        $present_days = Attendance::where('user_id', $user_id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->where('status', 'Present')
            ->count();

        // Approved paid leaves (count all days for all approved leaves in the month)
        // Define paid leave types
        $paidLeaveTypes = ['Casual', 'Earned', 'Sick'];
        $leaves = Leave::where('user_id', $user_id)
            ->where('status', 1)
            ->where(function($q) use ($month, $year) {
                $q->where(function($q2) use ($month, $year) {
                    $q2->whereYear('from_date', '<=', $year)
                        ->whereYear('to_date', '>=', $year)
                        ->whereMonth('from_date', '<=', $month)
                        ->whereMonth('to_date', '>=', $month);
                });
            })
            ->get();
        $paid_leaves = 0;
        $unpaid_leaves = 0;
        foreach ($leaves as $leave) {
            $from = \Carbon\Carbon::parse($leave->from_date)->startOfDay();
            $to = \Carbon\Carbon::parse($leave->to_date)->startOfDay();
            $monthStart = \Carbon\Carbon::create($year, $month, 1)->startOfDay();
            $monthEnd = \Carbon\Carbon::create($year, $month, $total_days)->startOfDay();
            $actualStart = $from->greaterThan($monthStart) ? $from : $monthStart;
            $actualEnd = $to->lessThan($monthEnd) ? $to : $monthEnd;
            if ($actualStart->lte($actualEnd)) {
                $days = $actualStart->diffInDays($actualEnd) + 1;
                if (in_array($leave->leave_type, $paidLeaveTypes)) {
                    $paid_leaves += $days;
                } else {
                    $unpaid_leaves += $days;
                }
            }
        }
        // Only approved leaves (status=1) are counted as paid leaves (already filtered above)
        // Ensure payable_days is always a whole number
        $payable_days = (int)$present_days + (int)$paid_leaves;

        // Prorate both gross and deductions
        $gross_monthly = ($payroll->basic + $payroll->hra + $payroll->travel + $payroll->bonus + $payroll->allowances);
        $deductions_monthly = ($payroll->deductions + $payroll->pf + $payroll->tax);
        $per_day_gross = $gross_monthly / $total_days;
        $per_day_deductions = $deductions_monthly / $total_days;
        $gross = $per_day_gross * $payable_days;
        $deductions = $per_day_deductions * $payable_days;
        $net = $gross - $deductions;

        $salary = [
            'user_id' => $user_id,
            'admin_id' => $admin->id,
            'created_by' => $user->id,
            'month' => $month,
            'year' => $year,
            'total_days' => $total_days,
            'payable_days' => $payable_days,
            'gross' => $gross,
            'deductions' => $deductions,
            'net' => $net,
            'status' => 'paid',
            'paid_leaves' => $paid_leaves,
            'present_days' => $present_days,
            'company_bank' => $request->company_bank,
            'transaction_mode' => $request->transaction_mode,
            'cheque_no' => $request->cheque_no,
            'utr' => $request->utr,
        ];
        $salary = SalaryPayment::create($salary);
        // Create payslip
        $payslip=[
            'salary_payment_id' => $salary->id,
            'user_id' => $user_id,
            'admin_id' => $admin->id,
            'created_by' => $user->id,
            'month' => $month,
            'year' => $year,
            'earnings' => [
                'basic' => $payroll->basic,
                'hra' => $payroll->hra,
                'travel' => $payroll->travel,
                'bonus' => $payroll->bonus,
                'allowances' => $payroll->allowances,
            ],
            'deductions' => [
                'deductions' => $payroll->deductions,
                'pf' => $payroll->pf,
                'tax' => $payroll->tax,
            ],
            'net' => $net,
            'pdf_path' => null,
        ];
        $payslip = Payslip::create($payslip);

        $salary->status = 'paid';
        $salary->save();
        return response()->json(['status' => 1, 'salary' => $salary]);
    }

    // List salary by user/month
    public function list(Request $request)
    {
        $user = $request->get('user');
        $admin = $request->get('admin');

        $query = SalaryPayment::with(['user', 'payslip']);
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->has('month')) {
            $query->where('month', $request->month);
        }
        if ($request->has('year')) {
            $query->where('year', $request->year);
        }
        $query->where('admin_id', $admin->id);
        return response()->json($query->orderBy('year', 'desc')->orderBy('month', 'desc')->get());
    }

    // Check payment status for employees in a specific month/year
    public function checkPaymentStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'required|exists:users,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userIds = $request->user_ids;
        $month = $request->month;
        $year = $request->year;

        $paidSalaries = SalaryPayment::whereIn('user_id', $userIds)
            ->where('month', $month)
            ->where('year', $year)
            ->where('status', 'paid')
            ->pluck('user_id')
            ->toArray();

  

        $result = [];
        foreach ($userIds as $userId) {
            if (in_array($userId, $paidSalaries)) {
                $result[$userId] = 'paid';
            }  else {
                $result[$userId] = 'not generated';
            }
        }

        return response()->json([
            'status' => 1,
            'payment_status' => $result
        ]);
    }

    // Bulk generate salary for multiple employees
    public function bulkGenerate(Request $request)
    {
        $user = $request->get('user');
        $admin = $request->get('admin');

        $validator = Validator::make($request->all(), [
            'employees' => 'required|array|min:1',
            'employees.*.user_id' => 'required|exists:users,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $employees = $request->employees;
        $month = $request->month;
        $year = $request->year;
        $results = [];

        foreach ($employees as $employeeData) {
            $user_id = $employeeData['user_id'];
            
            try {
                // Check if salary already exists
                $existingSalary = SalaryPayment::where('user_id', $user_id)
                    ->where('month', $month)
                    ->where('year', $year)
                    ->first();

                if ($existingSalary) {
                    $results[] = [
                        'user_id' => $user_id,
                        'status' => 'skipped',
                        'message' => 'Salary already generated for this period'
                    ];
                    continue;
                }

                // Generate salary using existing logic
                $payroll = Payroll::where('user_id', $user_id)->orderBy('id', 'desc')->first();
                if (!$payroll) {
                    $results[] = [
                        'user_id' => $user_id,
                        'status' => 'error',
                        'message' => 'Payroll not set for employee'
                    ];
                    continue;
                }

                // Calculate working days in month
                $total_days = cal_days_in_month(CAL_GREGORIAN, $month, $year);
                
                // Attendance: present days
                $present_days = Attendance::where('user_id', $user_id)
                    ->whereMonth('date', $month)
                    ->whereYear('date', $year)
                    ->where('status', 'Present')
                    ->count();

                // Skip payment generation if employee has 0 attendance for the month
                if ($present_days == 0) {
                    $results[] = [
                        'user_id' => $user_id,
                        'status' => 'skipped',
                        'message' => 'Employee has 0 attendance for this month'
                    ];
                    continue;
                }

                // Approved paid leaves
                $paidLeaveTypes = ['Casual', 'Earned', 'Sick'];
                $leaves = Leave::where('user_id', $user_id)
                    ->where('status', 1)
                    ->where(function($q) use ($month, $year) {
                        $q->where(function($q2) use ($month, $year) {
                            $q2->whereYear('from_date', '<=', $year)
                                ->whereYear('to_date', '>=', $year)
                                ->whereMonth('from_date', '<=', $month)
                                ->whereMonth('to_date', '>=', $month);
                        });
                    })
                    ->get();
                
                $paid_leaves = 0;
                foreach ($leaves as $leave) {
                    $from = \Carbon\Carbon::parse($leave->from_date)->startOfDay();
                    $to = \Carbon\Carbon::parse($leave->to_date)->startOfDay();
                    $monthStart = \Carbon\Carbon::create($year, $month, 1)->startOfDay();
                    $monthEnd = \Carbon\Carbon::create($year, $month, $total_days)->startOfDay();
                    $actualStart = $from->greaterThan($monthStart) ? $from : $monthStart;
                    $actualEnd = $to->lessThan($monthEnd) ? $to : $monthEnd;
                    if ($actualStart->lte($actualEnd)) {
                        $days = $actualStart->diffInDays($actualEnd) + 1;
                        if (in_array($leave->leave_type, $paidLeaveTypes)) {
                            $paid_leaves += $days;
                        }
                    }
                }

                $payable_days = (int)$present_days + (int)$paid_leaves;

                // Calculate salary
                $gross_monthly = ($payroll->basic + $payroll->hra + $payroll->travel + $payroll->bonus + $payroll->allowances);
                $deductions_monthly = ($payroll->deductions + $payroll->pf + $payroll->tax);
                $per_day_gross = $gross_monthly / $total_days;
                $per_day_deductions = $deductions_monthly / $total_days;
                $gross = $per_day_gross * $payable_days;
                $deductions = $per_day_deductions * $payable_days;
                $net = $gross - $deductions;

                // Create salary payment record
                $salary = SalaryPayment::create([
                    'user_id' => $user_id,
                    'admin_id' => $admin->id,
                    'created_by' => $user->id,
                    'month' => $month,
                    'year' => $year,
                    'total_days' => $total_days,
                    'payable_days' => $payable_days,
                    'gross' => $gross,
                    'deductions' => $deductions,
                    'net' => $net,
                    'status' => 'paid',
                    'paid_leaves' => $paid_leaves,
                    'present_days' => $present_days,
                ]);

                // Create payslip
                $payslip = Payslip::create([
                    'salary_payment_id' => $salary->id,
                    'user_id' => $user_id,
                    'admin_id' => $admin->id,
                    'created_by' => $user->id,
                    'month' => $month,
                    'year' => $year,
                    'earnings' => [
                        'basic' => $payroll->basic,
                        'hra' => $payroll->hra,
                        'travel' => $payroll->travel,
                        'bonus' => $payroll->bonus,
                        'allowances' => $payroll->allowances,
                    ],
                    'deductions' => [
                        'deductions' => $payroll->deductions,
                        'pf' => $payroll->pf,
                        'tax' => $payroll->tax,
                    ],
                    'net' => $net,
                    'pdf_path' => null,
                ]);

                $results[] = [
                    'user_id' => $user_id,
                    'status' => 'success',
                    'salary_id' => $salary->id,
                    'payslip_id' => $payslip->id,
                    'net_salary' => $net
                ];

            } catch (\Exception $e) {
                $results[] = [
                    'user_id' => $user_id,
                    'status' => 'error',
                    'message' => 'Failed to generate salary: ' . $e->getMessage()
                ];
            }
        }

        $successful = collect($results)->where('status', 'success')->count();
        $failed = collect($results)->where('status', 'error')->count();
        $skipped = collect($results)->where('status', 'skipped')->count();

        return response()->json([
            'status' => 1,
            'message' => "Bulk processing completed: {$successful} successful, {$failed} failed, {$skipped} skipped",
            'results' => $results,
            'summary' => [
                'total' => count($results),
                'successful' => $successful,
                'failed' => $failed,
                'skipped' => $skipped
            ]
        ]);
    }
}
