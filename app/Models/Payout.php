<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payout extends Model
{
    use HasFactory;

    // Type constants
    const TYPE_IMPS = 'IMPS';
    const TYPE_NEFT = 'NEFT';
    const TYPE_RTGS = 'RTGS';

    // Status constants
    const STATUS_PENDING = 0;
    const STATUS_SUCCESS = 1;
    const STATUS_FAILED = 2;
    const STATUS_PROCESSING = 3;

    protected $fillable = [
        'user_id',
        'beneficiary_id',
        'account_id',
        'bank_name',
        'ifsc',
        'name',
        'mobile',
        'account',
        'amount',
        'transaction_id',
        'charge',
        'type',
        'status',
        'status_number',
        'utr',
        'message',
        'api_response',
        'call_back_url',
        'call_back_response',
        'admin_id',
        'created_by'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'charge' => 'decimal:2',
        'api_response' => 'json',
        'call_back_response' => 'json'
    ];

    /**
     * Get the user that owns the payout
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the beneficiary for this payout
     */
    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class);
    }

    /**
     * Get the account for this payout
     */
    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the admin that processed the payout
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function setting()
    {
        return $this->belongsTo(Setting::class, 'admin_id', 'user_id');
    }
    /**
     * Get the user who created the payout
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for filtering by user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for successful payouts
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', self::STATUS_SUCCESS);
    }

    /**
     * Scope for pending payouts
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for failed payouts
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope for processing payouts
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', self::STATUS_PROCESSING);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        switch ($this->status) {
            case self::STATUS_PENDING:
                return 'Pending';
            case self::STATUS_SUCCESS:
                return 'Success';
            case self::STATUS_FAILED:
                return 'Failed';
            case self::STATUS_PROCESSING:
                return 'Processing';
            default:
                return 'Unknown';
        }
    }

    /**
     * Get type options
     */
    public static function getTypeOptions()
    {
        return [
            self::TYPE_IMPS => 'IMPS',
            self::TYPE_NEFT => 'NEFT',
            self::TYPE_RTGS => 'RTGS'
        ];
    }

    /**
     * Get status options
     */
    public static function getStatusOptions()
    {
        return [
            self::STATUS_PENDING => 'Pending',
            self::STATUS_SUCCESS => 'Success',
            self::STATUS_FAILED => 'Failed',
            self::STATUS_PROCESSING => 'Processing'
        ];
    }

    /**
     * Check if payout is successful
     */
    public function isSuccessful()
    {
        return $this->status === self::STATUS_SUCCESS;
    }

    /**
     * Check if payout is pending
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if payout is failed
     */
    public function isFailed()
    {
        return $this->status === self::STATUS_FAILED;
    }

    /**
     * Check if payout is processing
     */
    public function isProcessing()
    {
        return $this->status === self::STATUS_PROCESSING;
    }
}
