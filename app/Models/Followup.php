<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Followup extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'lead_id', 
        'user_id', 
        'followup_date', 
        'followup_time',
        'followup_type',
        'followup_status',
        'followup_type_id',
        'followup_status_id',
        'lead_status_id',
        'notes', 
        'status', 
        'is_completed',
        'admin_id', 
        'created_by', 
        'deleted_by'
    ];

    protected $dates = ['deleted_at', 'followup_date'];

    protected $casts = [
        'followup_date' => 'datetime',
        'is_completed' => 'boolean',
    ];

    // Constants for followup types
    const FOLLOWUP_TYPES = [
        'Call' => 'Call',
        'Meeting' => 'Meeting',
        'Email' => 'Email',
        'Demo' => 'Demo',
        'Proposal' => 'Proposal',
    ];

    // Constants for followup statuses
    const FOLLOWUP_STATUSES = [
        'connected' => 'Connected',
        'positive' => 'Positive Response',
        'interested' => 'Interested',
        'not_reachable' => 'Not Reachable',
        'busy' => 'Busy',
        'callback_requested' => 'Callback Requested',
        'not_interested' => 'Not Interested',
        'wrong_number' => 'Wrong Number',
        'meeting_scheduled' => 'Meeting Scheduled',
        'proposal_sent' => 'Proposal Sent',
        'follow_up_later' => 'Follow Up Later',
    ];

    // Helper methods
    public function getFollowupTypeLabel()
    {
        return self::FOLLOWUP_TYPES[$this->followup_type] ?? $this->followup_type;
    }

    public function getFollowupStatusLabel()
    {
        return self::FOLLOWUP_STATUSES[$this->followup_status] ?? $this->followup_status;
    }

    public function getFollowupStatusColor()
    {
        $colors = [
            'connected' => 'success',
            'positive' => 'success',
            'interested' => 'info',
            'not_reachable' => 'warning',
            'busy' => 'warning',
            'callback_requested' => 'info',
            'not_interested' => 'danger',
            'wrong_number' => 'danger',
            'meeting_scheduled' => 'primary',
            'proposal_sent' => 'primary',
            'follow_up_later' => 'secondary',
        ];
        
        return $colors[$this->followup_status] ?? 'secondary';
    }

    // Relationships
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function followupType()
    {
        return $this->belongsTo(FollowupType::class, 'followup_type_id');
    }

    public function followupStatus()
    {
        return $this->belongsTo(FollowupStatus::class, 'followup_status_id');
    }

    public function leadStatus()
    {
        return $this->belongsTo(LeadStatus::class, 'lead_status_id');
    }
}
