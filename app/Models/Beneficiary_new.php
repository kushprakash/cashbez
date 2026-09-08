<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Beneficiary extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'account',
        'ifsc',
        'branch',
        'admin_id',
        'created_by',
        'account_verified',
        'ifsc_verified',
        'verification_data'
    ];

    protected $casts = [
        'account_verified' => 'boolean',
        'ifsc_verified' => 'boolean',
        'verification_data' => 'json',
        'deleted_at' => 'datetime'
    ];

    /**
     * Get the user that owns the beneficiary
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the admin who processed this beneficiary
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the user who created this beneficiary
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope to get verified beneficiaries
     */
    public function scopeVerified($query)
    {
        return $query->where('account_verified', true)
                    ->where('ifsc_verified', true);
    }

    /**
     * Scope to get beneficiaries for a specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Check if beneficiary is fully verified
     */
    public function isFullyVerified()
    {
        return $this->account_verified && $this->ifsc_verified;
    }
}
