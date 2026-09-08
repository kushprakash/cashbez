<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavingAccountApplication extends Model
{
    protected $fillable = [
        'user_id',
        'bank_name',
        'account_number',
        'customer_name',
        'mobile_number',
        'status',
        'payout_amount',
        'remarks',
        'admin_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getStatusAttribute($value)
    {
        $statusMap = [
            0 => 'pending',
            1 => 'approved',
            2 => 'rejected'
        ];
        return $statusMap[$value] ?? 'pending';
    }
}
