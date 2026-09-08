<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FollowupType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'color',
        'description',
        'is_active',
        'sort_order',
        'lead_type_id',
        'lead_source_id',
        'admin_id',
        'created_by',
        'deleted_by'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // Relationships
    public function followupStatuses()
    {
        return $this->hasMany(FollowupStatus::class)->active()->ordered();
    }

    public function followups()
    {
        return $this->hasMany(Followup::class);
    }

    public function leadStatuses()
    {
        return $this->hasMany(LeadStatus::class, 'followup_type_id');
    }

    public function leadType()
    {
        return $this->belongsTo(LeadType::class, 'lead_type_id');
    }

    public function leadSource()
    {
        return $this->belongsTo(LeadSource::class, 'lead_source_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
