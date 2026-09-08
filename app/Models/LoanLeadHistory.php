<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoanLeadHistory extends Model
{
    use HasFactory;

    protected $table = 'loan_lead_history';

    public $timestamps = false; // Only using created_at

    protected $fillable = [
        'lead_id',
        'old_status',
        'new_status',
        'changed_by',
        'changed_by_role',
        'remarks',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // Automatically set created_at on create
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->created_at = now();
        });
    }

    // Relationships
    public function loanLead()
    {
        return $this->belongsTo(LoanLead::class, 'lead_id', 'lead_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    // Accessors
    public function getFormattedOldStatusAttribute()
    {
        return $this->old_status ? ucwords(str_replace('_', ' ', $this->old_status)) : 'N/A';
    }

    public function getFormattedNewStatusAttribute()
    {
        return ucwords(str_replace('_', ' ', $this->new_status));
    }

    public function getChangedByNameAttribute()
    {
        return $this->changedBy ? $this->changedBy->name : 'System';
    }

    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at->format('M d, Y h:i A');
    }

    // Scopes
    public function scopeByLeadId($query, $leadId)
    {
        return $query->where('lead_id', $leadId);
    }

    public function scopeByChangedBy($query, $userId)
    {
        return $query->where('changed_by', $userId);
    }

    public function scopeRecentFirst($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeStatusChanges($query)
    {
        return $query->whereNotNull('old_status')->whereNotNull('new_status');
    }
}