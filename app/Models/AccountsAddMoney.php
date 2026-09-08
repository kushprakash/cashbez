<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountsAddMoney extends Model
{
    use HasFactory;

    protected $table = 'accounts_add_money';

    protected $fillable = [
        'user_id',
        'account_id',
        'amount',
        'txnid',
        'utr',
        'status',
        'message',
        'callback',
        'admin_id',
        'created_by'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'callback' => 'json'
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_SUCCESS = 'success';
    const STATUS_FAILED = 'failed';

    /**
     * Get the user that owns the add money request
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the account associated with this add money request
     */
    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the admin that processed the request
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the user who created the request
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for successful requests
     */
    public function scopeSuccess($query)
    {
        return $query->where('status', self::STATUS_SUCCESS);
    }

    /**
     * Scope for failed requests
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Get status options
     */
    public static function getStatusOptions()
    {
        return [
            self::STATUS_PENDING => 'Pending',
            self::STATUS_SUCCESS => 'Success',
            self::STATUS_FAILED => 'Failed'
        ];
    }

    /**
     * Check if request is pending
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if request is successful
     */
    public function isSuccess()
    {
        return $this->status === self::STATUS_SUCCESS;
    }

    /**
     * Check if request is failed
     */
    public function isFailed()
    {
        return $this->status === self::STATUS_FAILED;
    }
}