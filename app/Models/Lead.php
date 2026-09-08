<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'lead_type_id', 'name', 'phone', 'email', 'source_id', 'assigned_user_id', 
        'status_id', 'priority', 'details', 'followup_date', 'created_by', 
        'super_user_id', 'admin_id', 'deleted_by'
    ];

    protected $dates = ['deleted_at', 'followup_date'];

    // Relationships
    public function leadType()
    {
        return $this->belongsTo(LeadType::class);
    }

    public function source()
    {
        return $this->belongsTo(LeadSource::class, 'source_id');
    }

    public function status()
    {
        return $this->belongsTo(LeadStatus::class, 'status_id');
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    public function activities()
    {
        return $this->hasMany(LeadActivity::class);
    }

    public function followups()
    {
        return $this->hasMany(Followup::class);
    }

    public function latestFollowup()
    {
        return $this->hasOne(Followup::class)->latest('followup_date');
    }

    // Helper methods to get followup information
    public function getLatestFollowupTypeAttribute()
    {
        return $this->latestFollowup?->followupType?->name;
    }

    public function getLatestFollowupStatusAttribute()
    {
        return $this->latestFollowup?->followupStatus?->name;
    }

    public function getLeadStatusNameAttribute()
    {
        return $this->status?->name;
    }

    public function customValues()
    {
        return $this->hasMany(LeadCustomValue::class);
    }
}
