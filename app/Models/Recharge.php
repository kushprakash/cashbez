<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recharge extends Model
{
    protected $fillable = [
        'api_id',
        'user_id',
        'number',
        'oprator',
        'amount',
        'status',
        'rrmarks',
        'validity',
        'plan',
        'type',
        'txnid',
        'oid',
        'call_back_url',
        'admin_id',
        'created_by',
        'request_data',
        'response_data'
    ];

    protected $casts = [

        
        'amount' => 'decimal:2',
        'type' => 'integer',
    ];

    /**
     * Get the user that owns the recharge.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin that processed the recharge.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the user who created the recharge record.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the API setting used for the recharge.
     */
    public function api(): BelongsTo
    {
        return $this->belongsTo(ApiSetting::class, 'api_id');
    }
}

