<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplaintAction extends Model
{
    use HasFactory;

    protected $table = 'complaint_actions';
    protected $primaryKey = 'action_id';

    protected $fillable = [
        'complaint_id',
        'action_type',
        'old_status',
        'new_status',
        'old_assigned_to',
        'new_assigned_to',
        'remarks',
        'action_by',
        'action_by_role',
        'ip_address',
        'user_agent',
        'created_at'
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public $timestamps = false;

    // Relationships
    public function complaint()
    {
        return $this->belongsTo(Complaint::class, 'complaint_id', 'complaint_id');
    }

    public function actionBy()
    {
        return $this->belongsTo(User::class, 'action_by', 'mid');
    }
}
