<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    /**
     * Get the payroll for the employee.
     */
    public function payroll()
    {
        return $this->hasOne(Payroll::class, 'user_id', 'user_id');
    }

    protected $fillable = [
        'user_id',
        'super_user_id',
        'created_by',
        'admin_id',
        'emp_code',
        'department_id',
        'designation_id',
        'join_date',
        'dob',
        'gender',
        'contact_no',
        'address',
        'emergency_contact',
        'status'
    ];

    protected $casts = [
        'join_date' => 'date',
        'dob' => 'date',
    ];

    /**
     * Get the user that owns the employee record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the super user that owns the employee record.
     */
    public function superUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'super_user_id');
    }

    /**
     * Get the user who created this employee record
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the admin for this employee record
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the department that the employee belongs to.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the designation that the employee has.
     */
    public function designation(): BelongsTo
    {
        return $this->belongsTo(Designation::class);
    }

    /**
     * Scope a query to only include active employees.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    /**
     * Scope a query to only include inactive employees.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 0);
    }
}
