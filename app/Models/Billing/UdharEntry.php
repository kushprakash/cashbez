<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class UdharEntry extends Model
{
    protected $table = 'bill_udhar_entries';

    protected $fillable = [
        'merchant_id',
        'customer_id',
        'local_id',
        'bill_id',
        'customer_name',
        'customer_phone',
        'customer_address',
        'amount',
        'paid_amount',
        'due_date',
        'status',
        'reminder_day_before_sent',
        'reminder_day_sent',
    ];

    protected $casts = [
        'amount'                   => 'decimal:2',
        'paid_amount'              => 'decimal:2',
        'due_date'                 => 'date',
        'reminder_day_before_sent' => 'boolean',
        'reminder_day_sent'        => 'boolean',
    ];

    public function merchant()
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    public function udharPayments()
    {
        return $this->hasMany(UdharPayment::class);
    }
}
