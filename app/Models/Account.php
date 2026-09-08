<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'number',
        'upi',
        'mpin',
        'hold_amount',
        'created_by',
        'admin_id',
        'status',
        'primary_status'
    ];

    protected $casts = [
        'hold_amount' => 'decimal:2',
        'status' => 'integer',
        'primary_status' => 'boolean'
    ];

    protected $hidden = [
        'mpin'
    ];

    /**
     * Get the user that owns the account
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who created this account
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the admin associated with this account
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get all passbook entries for this account
     */
    public function passbooks()
    {
        return $this->hasMany(Passbook::class);
    }

    /**
     * Get the latest passbook entry for balance
     */
    public function latestTransaction()
    {
        return $this->hasOne(Passbook::class)->latest('id');
    }

    /**
     * Get available balance (calculated from passbook - hold_amount)
     */
    public function getAvailableBalanceAttribute()
    {
        return $this->getBalanceAttribute() - $this->hold_amount;
    }

    /**
     * Get current balance from database column (primary) or passbook entries (fallback)
     */
    public function getBalanceAttribute($value = null)
    {
        // Use the database column value if it exists
        if (isset($this->attributes['balance'])) {
            return (float) $this->attributes['balance'];
        }
        
        // Fallback to passbook calculation
        $latestTransaction = $this->latestTransaction;
        return $latestTransaction ? $latestTransaction->balance : 0.00;
    }

    /**
     * Get formatted account number
     */
    public function getFormattedNumberAttribute()
    {
        return '****' . substr($this->number, -4);
    }

    /**
     * Get formatted balance
     */
    public function getFormattedBalanceAttribute()
    {
        return '₹' . number_format($this->getBalanceAttribute(), 2);
    }

    /**
     * Set MPIN with encryption
     */
    public function setMpinAttribute($value)
    {
        if ($value) {
            $this->attributes['mpin'] = bcrypt($value);
        }
    }

    /**
     * Verify MPIN
     */
    public function verifyMpin($mpin)
    {
        if (empty($this->mpin)) {
            return false;
        }
        if (\Hash::check($mpin, $this->mpin)) {
            return true;
        }
        return (string)$this->mpin === (string)$mpin;
    }

    /**
     * Check if account has MPIN set
     */
    public function hasMpin()
    {
        return !empty($this->mpin);
    }

    /**
     * Scope for active accounts
     */
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    /**
     * Scope for user accounts
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for admin accounts
     */
    public function scopeForAdmin($query, $adminId)
    {
        return $query->where('admin_id', $adminId);
    }

    /**
     * Scope for primary account
     */
    public function scopePrimary($query, $userId = null)
    {
        $query = $query->where('primary_status', true);
        
        if ($userId) {
            $query = $query->where('user_id', $userId);
        }
        
        return $query;
    }

    /**
     * Set this account as primary for the user
     * Automatically sets all other accounts for this user as non-primary
     */
    public function setPrimary()
    {
        \DB::transaction(function () {
            // Set all other accounts for this user as non-primary
            static::where('user_id', $this->user_id)
                ->where('id', '!=', $this->id)
                ->update(['primary_status' => false]);
            
            // Set this account as primary
            $this->update(['primary_status' => true]);
        });
        
        return $this;
    }

    /**
     * Remove primary status from this account
     */
    public function removePrimary()
    {
        $this->update(['primary_status' => false]);
        return $this;
    }

    /**
     * Check if this account is primary
     */
    public function isPrimary()
    {
        return $this->primary_status;
    }

    /**
     * Get the primary account for a user
     */
    public static function getPrimaryAccount($userId)
    {
        return static::where('user_id', $userId)
            ->where('primary_status', true)
            ->first();
    }
}
