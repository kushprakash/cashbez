<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Customer extends Model
{
    protected $table = 'bill_customers';

    protected $fillable = [
        'merchant_id',
        'name',
        'phone',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function merchant()
    {
        return $this->belongsTo(User::class , 'merchant_id');
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }
}
