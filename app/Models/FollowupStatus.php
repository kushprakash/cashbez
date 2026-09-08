<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FollowupStatus extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'color',
        'description',
        'is_active',
        'sort_order',
        'followup_type_id',
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

    public function scopeForType($query, $typeId)
    {
        return $query->where('followup_type_id', $typeId);
    }

    // Relationships
    public function followupType()
    {
        return $this->belongsTo(FollowupType::class);
    }

    public function followups()
    {
        return $this->hasMany(Followup::class);
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
