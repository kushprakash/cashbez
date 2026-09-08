<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Model;

class UdharPayment extends Model
{
    protected $table = 'bill_udhar_payments';

    protected $fillable = [
        'udhar_entry_id',
        'local_id',
        'amount',
        'note',
        'paid_at',
    ];

    protected $casts = [
        'amount'  => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function udharEntry()
    {
        return $this->belongsTo(UdharEntry::class);
    }
}
