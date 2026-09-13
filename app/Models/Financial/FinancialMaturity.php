<?php

namespace App\Models\Financial;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialMaturity extends Model
{
    use HasFactory;

    protected $table = 'financial_maturities';

    protected $fillable = [
        'account_id',
        'member_id',
        'user_id',
        'admin_id',
        'service_type',
        'principal',
        'interest_earned',
        'penalty',
        'final_amount',
        'maturity_date',
        'status',
        'payout_mode',
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
