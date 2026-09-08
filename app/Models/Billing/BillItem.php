<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Model;

class BillItem extends Model
{
    protected $table = 'bill_items';

    protected $fillable = [
        'bill_id',
        'product_id',
        'name',
        'qty',
        'unit_price',
        'gst_rate',
        'line_total',
    ];

    protected $casts = [
        'qty'        => 'decimal:2',
        'unit_price' => 'decimal:2',
        'gst_rate'   => 'decimal:2',
        'line_total' => 'decimal:2',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function bill()
    {
        return $this->belongsTo(Bill::class);
    }

    public function product()
    {
        return $this->belongsTo(\App\Models\Product::class);
    }
}
