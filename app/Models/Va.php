<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Va extends Model
{
    use HasFactory;

    protected $table = 'va';

    protected $fillable = [
        'id',
        'mid',
        'mobile',
        'username',
        'account_number',
        'account_ifsc',
        'virtual_account_id',
        'virtual_account_number',
        'virtual_ifsc',
        'virtual_upi_handle',
        'qrcode_image',
        'qrcode_pdf',
        'status'
    ];

    protected $casts = [
        'status' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];
}
