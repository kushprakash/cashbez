<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RechargeOperator extends Model
{
    use SoftDeletes;

    protected $table = 'recharge_operators';

    protected $fillable = [
        'name',
        'operator_code',
        'service_type',
        'margin_mode',
        'fetch_bill',
        'logo',
        'min_amount',
        'max_amount',
        'stop_amount',
        'number_length',
        'status',
        'api_status',
        'bill_parameters'
    ];

    protected $casts = [
        'fetch_bill' => 'boolean',
        'status' => 'boolean',
        'api_status' => 'boolean',
        'bill_parameters' => 'array',
        'min_amount' => 'float',
        'max_amount' => 'float',
        'stop_amount' => 'float',
    ];
}
