<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardDownload extends Model
{
    protected $table = 'card_downloads';

    protected $fillable = [
        'user_id',
        'card_type',
        'doc_number',
        'dob',
        'refid',
        'otp',
        'status',
        'api_response',
        'transaction_id',
        'customer_name',
        'amount',
        'commission',
    ];

    protected $casts = [
        'dob' => 'date',
        'amount' => 'decimal:2',
        'commission' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get parsed API response as array
     */
    public function getParsedResponseAttribute()
    {
        return $this->api_response ? json_decode($this->api_response, true) : null;
    }

    /**
     * Scope to get successful downloads
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 1);
    }

    /**
     * Scope to filter by card type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('card_type', $type);
    }
}
