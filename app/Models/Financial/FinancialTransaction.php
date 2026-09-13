<?php

namespace App\Models\Financial;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialTransaction extends Model
{
    use HasFactory;

    protected $table = 'financial_transactions';

    protected $fillable = [
        'transaction_id',
        'account_id',
        'member_id',
        'user_id',
        'admin_id',
        'service_type',
        'txn_type',
        'amount',
        'charges',
        'net_amount',
        'balance_before',
        'balance_after',
        'payment_mode',
        'reference',
        'narration',
        'status',
    ];

    public function account()
    {
        return $this->belongsTo(FinancialAccount::class, 'account_id', 'id');
    }

    public function member()
    {
        return $this->belongsTo(FinancialMember::class, 'member_id', 'id');
    }
}
