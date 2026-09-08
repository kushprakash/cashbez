<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    use HasFactory;

    protected $table = 'leaves';

    protected $fillable = [
        'user_id',
        'created_by',
        'admin_id',
        'leave_type',
        'from_date',
        'to_date',
        'reason',
        'status',
        'applied_at',
        'approved_by',
        'approved_at',
        'approval_remarks',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'user_id', 'user_id');
    }

    /**
     * Get the user who created this leave record
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the admin for this leave record
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
