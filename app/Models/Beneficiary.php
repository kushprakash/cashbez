<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Beneficiary extends Model
{
    use HasFactory, SoftDeletes;

    // Type constants
    const TYPE_CUSTOMER = 0;
    const TYPE_SELF = 1;
    const TYPE_MOVE_TO_ACCOUNT = 3;

    // Status constants
    const STATUS_PENDING = 0;
    const STATUS_ACTIVE = 1;
    const STATUS_INACTIVE = 2;
    const STATUS_REJECTED = 3;

    protected $fillable = [
        'user_id',
        'name',
        'mobile',
        'account',
        'ifsc',
        'branch',
        'bank',
        'type',
        'status',
        'admin_id',
        'created_by',
        'account_verified',
        'ifsc_verified',
        'verification_data'
    ];

    protected $casts = [
        'account_verified' => 'boolean',
        'ifsc_verified' => 'boolean',
        'type' => 'integer',
        'status' => 'integer',
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


    public function setting()
    {
        return $this->belongsTo(Setting::class, 'admin_id', 'user_id');
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

    /**
     * Check if beneficiary is for internal use (self)
     */
    public function isSelf()
    {
        return $this->type === self::TYPE_SELF;
    }

    /**
     * Check if beneficiary is for customer use
     */
    public function isCustomer()
    {
        return $this->type === self::TYPE_CUSTOMER;
    }

    /**
     * Scope to get self beneficiaries (internal use)
     */
    public function scopeSelf($query)
    {
        return $query->where('type', self::TYPE_SELF);
    }

    /**
     * Scope to get customer beneficiaries
     */
    public function scopeCustomer($query)
    {
        return $query->where('type', self::TYPE_CUSTOMER);
    }

    /**
     * Get the type label
     */
    public function getTypeLabelAttribute()
    {
        return $this->type === self::TYPE_SELF ? 'Self' : (($this->type === self::TYPE_MOVE_TO_ACCOUNT) ? 'Move To Account' : 'Customer');
    }

    /**
     * Get the status label
     */
    public function getStatusLabelAttribute()
    {
        switch ($this->status) {
            case self::STATUS_PENDING:
                return 'Pending';
            case self::STATUS_ACTIVE:
                return 'Active';
            case self::STATUS_INACTIVE:
                return 'Inactive';
            case self::STATUS_REJECTED:
                return 'Rejected';
            default:
                return 'Unknown';
        }
    }

    /**
     * Check if beneficiary is active
     */
    public function isActive()
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if beneficiary is pending
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if beneficiary is inactive
     */
    public function isInactive()
    {
        return $this->status === self::STATUS_INACTIVE;
    }

    /**
     * Check if beneficiary is rejected
     */
    public function isRejected()
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Scope to get active beneficiaries
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope to get pending beneficiaries
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope to get inactive beneficiaries
     */
    public function scopeInactive($query)
    {
        return $query->where('status', self::STATUS_INACTIVE);
    }

    /**
     * Scope to get rejected beneficiaries
     */
    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }
}
