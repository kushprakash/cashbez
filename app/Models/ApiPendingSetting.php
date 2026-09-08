<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiPendingSetting extends Model
{
    protected $table = 'api_pending_settings';

    protected $fillable = [
        'api_id',
        'service_type',
        'operator_code',
        'time_frame',
        'max_pending_count',
    ];

    protected $casts = [
        'max_pending_count' => 'integer',
    ];

    public function api(): BelongsTo
    {
        return $this->belongsTo(ApiSetting::class, 'api_id');
    }
}
