<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Attendance;
use App\Models\Leave;

Route::get('/attendance/summary/{user_id}/{month}/{year}', function($user_id, $month, $year) {
    // Get all attendance records for the month
    $attendances = Attendance::where('user_id', $user_id)
        ->whereMonth('date', $month)
        ->whereYear('date', $year)
        ->get();

    // Get all leaves for the month
    $leaves = Leave::where('user_id', $user_id)
        ->where('status', 1) // Only approved leaves
        ->whereMonth('from_date', '<=', $month)
        ->whereYear('from_date', '<=', $year)
        ->whereMonth('to_date', '>=', $month)
        ->whereYear('to_date', '>=', $year)
        ->get();

    $presentDays = 0;
    $halfDays = 0;
    $paidLeaves = 0;
    $allLeaves = 0;
    $totalDays = cal_days_in_month(CAL_GREGORIAN, $month, $year);
    $workingHour = 8;

    foreach ($attendances as $att) {
        $hours = floatval($att->total_hours);
        if ($hours >= $workingHour) {
            $presentDays += 1;
        } elseif ($hours >= $workingHour / 2) {
            $halfDays += 1;
        }
    }
    $presentDays += 0.5 * $halfDays;

    foreach ($leaves as $leave) {
        // Treat all approved leaves as paid (including Earned, Casual, Sick, etc.)
        $days = 1; // Default 1 day per leave row
        if ($leave->from_date && $leave->to_date) {
            $from = new DateTime($leave->from_date);
            $to = new DateTime($leave->to_date);
            $days = $from == $to ? 1 : $from->diff($to)->days + 1;
        }
        $paidLeaves += $days;
        $allLeaves += $days;
    }

    $payableDays = $presentDays + $paidLeaves;

    return response()->json([
        'total_days' => $totalDays,
        'present_days' => $presentDays,
        'paid_leaves' => $paidLeaves,
        'all_leaves' => $allLeaves,
        'payable_days' => $payableDays,
    ]);
});
