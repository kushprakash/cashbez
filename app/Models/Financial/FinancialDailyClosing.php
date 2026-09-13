<?php

namespace App\Models\Financial;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialDailyClosing extends Model
{
    use HasFactory;

    protected $table = 'financial_daily_closings';

    protected $fillable = [
        'user_id',
        'admin_id',
        'closing_date',
        'opening_balance',
        'total_deposit',
        'total_withdrawal',
        'closing_balance',
        'physical_cash',
        'difference',
        'status',
        'remark',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'closing_date' => 'date',
        'approved_at' => 'datetime',
    ];
}
