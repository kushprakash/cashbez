<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeadActivity extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'lead_id', 'user_id', 'activity_type', 'details', 'next_followup',
        'followup_type_id', 'followup_status_id', 'lead_status_id',
        'followup_time', 'followup_notes',
        'admin_id', 'created_by', 'deleted_by'
    ];

    protected $dates = ['deleted_at', 'next_followup'];

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
