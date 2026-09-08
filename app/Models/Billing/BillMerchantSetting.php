<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillMerchantSetting extends Model
{
    protected $table = 'bill_merchant_settings';

    protected $fillable = [
        'user_id',
        'shop_name',
        'address',
        'phone',
        'gst_number',
        'logo_path',
        'units',
    ];

    protected $casts = [
        'units' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
