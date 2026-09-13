<?php

namespace App\Models\Financial;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialOtp extends Model
{
    use HasFactory;

    protected $table = 'financial_otps';

    protected $fillable = [
        'mobile',
        'otp',
        'purpose',
        'account_id',
        'member_id',
        'is_used',
        'expires_at',
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'expires_at' => 'datetime',
    ];
}
