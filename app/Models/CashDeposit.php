<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashDeposit extends Model
{
    use HasFactory;

    protected $table = 'cash_deposits';

    protected $fillable = [
        'mid',
        'merchant_tran_id',
        'request_id',
        'customer_mobile',
        'aadhaar_number',
        'amount',
        'request',
        'response',
        'verify_request',
        'verify_response',
        'deposit_request',
        'deposit_response',
        'response_data',
        'encrypted_data',
        'status',
        'response_message',
        'device_imei',
        'device_type',
        'ip_address',
        'latitude',
        'longitude',
        'created_by',
        'admin_id',
    ];
}
