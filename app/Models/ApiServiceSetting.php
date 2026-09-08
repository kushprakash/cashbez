<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiServiceSetting extends Model
{
    protected $table = 'api_service_settings';

    protected $fillable = [
        'service_type',
        'profit_only',
        'api_1',
        'api_2',
        'api_3',
        'api_4',
        'pending_api_1',
        'pending_api_2',
    ];

    protected $casts = [
        'profit_only' => 'boolean',
        'api_1' => 'integer',
        'api_2' => 'integer',
        'api_3' => 'integer',
        'api_4' => 'integer',
        'pending_api_1' => 'integer',
        'pending_api_2' => 'integer',
    ];

    public function api1(): BelongsTo
    {
        return $this->belongsTo(ApiSetting::class, 'api_1');
    }

    public function api2(): BelongsTo
    {
        return $this->belongsTo(ApiSetting::class, 'api_2');
    }

    public function api3(): BelongsTo
    {
        return $this->belongsTo(ApiSetting::class, 'api_3');
    }

    public function api4(): BelongsTo
    {
        return $this->belongsTo(ApiSetting::class, 'api_4');
    }

    public function pendingApi1(): BelongsTo
    {
        return $this->belongsTo(ApiSetting::class, 'pending_api_1');
    }

    public function pendingApi2(): BelongsTo
    {
        return $this->belongsTo(ApiSetting::class, 'pending_api_2');
    }
}
