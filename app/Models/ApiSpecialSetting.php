<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiSpecialSetting extends Model
{
    protected $table = 'api_special_settings';

    protected $fillable = [
        'api_id',
        'circle',
        'operator_code',
        'amount',
        'is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function api(): BelongsTo
    {
        return $this->belongsTo(ApiSetting::class, 'api_id');
    }
}
