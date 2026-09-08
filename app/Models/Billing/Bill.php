<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Bill extends Model
{
    protected $table = 'bills';

    protected $fillable = [
        'merchant_id',
        'customer_id',
        'local_id',
        'bill_number',
        'payment_mode',
        'subtotal',
        'gst_amount',
        'total',
        'gst_enabled',
        'notes',
        'status',
    ];

    protected $casts = [
        'gst_enabled' => 'boolean',
        'subtotal'    => 'decimal:2',
        'gst_amount'  => 'decimal:2',
        'total'       => 'decimal:2',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function billItems()
    {
        return $this->hasMany(BillItem::class);
    }

    public function merchant()
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
