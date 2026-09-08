<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Passbook extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'account_id',
        'transaction_id',
        'description',
        'type',
        'category_id',
        'pre_balance',
        'amount',
        'balance',
        'created_by',
        'admin_id'
    ];

    protected $casts = [
        'pre_balance' => 'decimal:2',
        'amount' => 'decimal:2',
        'balance' => 'decimal:2'
    ];

    const TYPE_CREDIT = 'CR';
    const TYPE_DEBIT = 'DR';

    /**
     * Get the user that owns the passbook entry
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the account associated with this passbook entry
     */
    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    /**
     * Get the user who created this entry
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the admin associated with this entry
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the category associated with this passbook entry
     */
    public function category()
    {
        return $this->belongsTo(TxnCategory::class, 'category_id');
    }

    /**
     * Get formatted amount with sign
     */
    public function getFormattedAmountAttribute()
    {
        $sign = $this->type === self::TYPE_CREDIT ? '+' : '-';
        return $sign . '₹' . number_format($this->amount, 2);
    }

    /**
     * Get formatted balance
     */
    public function getFormattedBalanceAttribute()
    {
        return '₹' . number_format($this->balance, 2);
    }

    /**
     * Get formatted pre balance
     */
    public function getFormattedPreBalanceAttribute()
    {
        return '₹' . number_format($this->pre_balance, 2);
    }

    /**
     * Get category label
     */
    public function getCategoryLabelAttribute()
    {
        return $this->category?->name ?? 'Uncategorized';
    }

    /**
     * Check if transaction is credit
     */
    public function getIsCreditAttribute()
    {
        return $this->type === self::TYPE_CREDIT;
    }

    /**
     * Check if transaction is debit
     */
    public function getIsDebitAttribute()
    {
        return $this->type === self::TYPE_DEBIT;
    }

    /**
     * Scope for credit transactions
     */
    public function scopeCredit($query)
    {
        return $query->where('type', self::TYPE_CREDIT);
    }

    /**
     * Scope for debit transactions
     */
    public function scopeDebit($query)
    {
        return $query->where('type', self::TYPE_DEBIT);
    }

    /**
     * Scope for account transactions
     */
    public function scopeForAccount($query, $accountId)
    {
        return $query->where('account_id', $accountId);
    }

    /**
     * Scope for user transactions
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for admin transactions
     */
    public function scopeForAdmin($query, $adminId)
    {
        return $query->where('admin_id', $adminId);
    }
}
