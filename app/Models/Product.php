<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'bill_products';

    protected $fillable = [
        'merchant_id',
        'name',
        'selling_price',
        'purchase_price',
        'gst_rate',
        'unit',
        'stock_qty',
        'low_stock_threshold',
        'barcode',
        'description',
    ];

    protected $casts = [
        'selling_price'      => 'decimal:2',
        'purchase_price'     => 'decimal:2',
        'gst_rate'           => 'decimal:2',
        'stock_qty'          => 'decimal:3',
        'low_stock_threshold'=> 'decimal:3',
    ];
}
