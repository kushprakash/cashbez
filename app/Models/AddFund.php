<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AddFund extends Model
{
    use HasFactory;

    protected $table = 'add_funds';

    protected $fillable = [
        'user_id',
        'account_id',
        'amount',
        'txnid',
        'order_id',
        'status',
        'utr',
        'paytm_response',
        'device_id',
        'sim_verified',
    ];

    /**
     * Get the user that owns the add fund request.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the account associated with the add fund request.
     */
    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}
