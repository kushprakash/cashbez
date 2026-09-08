<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';

    protected $fillable = [
        'user_id',
        'created_by',
        'admin_id',
        'date',
        'check_in',
        'check_out',
        'status',
        // Additional fields for location and selfie
        'check_in_latitude',
        'check_in_longitude',
        'check_out_latitude',
        'check_out_longitude',
        'check_in_address',
        'check_out_address',
        'check_in_selfie',
        'check_out_selfie',
        'total_hours',
        'notes'
    ];

    protected $casts = [
        'date' => 'date',
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'check_in_latitude' => 'decimal:8',
        'check_in_longitude' => 'decimal:8',
        'check_out_latitude' => 'decimal:8',
        'check_out_longitude' => 'decimal:8',
    ];

    /**
     * Get the user that owns the attendance.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the employee record for this user
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'user_id', 'user_id');
    }

    /**
     * Get the user who created this attendance record
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the admin for this attendance record
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Calculate total hours worked
     */
    public function calculateTotalHours()
    {
        if ($this->check_in && $this->check_out) {
            $checkIn = \Carbon\Carbon::parse($this->check_in);
            $checkOut = \Carbon\Carbon::parse($this->check_out);
            $totalHours = $checkOut->diffInHours($checkIn, true);
            $this->total_hours = round($totalHours, 2);
            return $this->total_hours;
        }
        return 0;
    }

    /**
     * Get formatted total hours
     */
    public function getFormattedTotalHoursAttribute()
    {
        if ($this->check_in && $this->check_out) {
            $checkIn = \Carbon\Carbon::parse($this->check_in);
            $checkOut = \Carbon\Carbon::parse($this->check_out);
            $diff = $checkOut->diff($checkIn);
            return $diff->format('%H:%I:%S');
        }
        return '00:00:00';
    }

    /**
     * Scope for filtering by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope for filtering by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for today's attendance
     */
    public function scopeToday($query)
    {
        return $query->whereDate('date', today());
    }

    /**
     * Check if user has checked in today
     */
    public static function hasCheckedInToday($userId)
    {
        return self::where('user_id', $userId)
            ->whereDate('date', today())
            ->whereNotNull('check_in')
            ->exists();
    }

    /**
     * Check if user has checked out today
     */
    public static function hasCheckedOutToday($userId)
    {
        return self::where('user_id', $userId)
            ->whereDate('date', today())
            ->whereNotNull('check_out')
            ->exists();
    }

    /**
     * Get today's attendance for user
     */
    public static function getTodayAttendance($userId)
    {
        return self::where('user_id', $userId)
            ->whereDate('date', today())
            ->first();
    }
}
