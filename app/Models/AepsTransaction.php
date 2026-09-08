<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AepsTransaction extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'aeps_transactions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */

    protected $fillable = [
        'mid',
        'machine_json_data',
        'customer_mobile',
        'aadhaar_number',
        'longitude',
        'latitude',
        'bank_id',
        'bank_name',
        'device_type',
        'aeps_type',
        'amount',
        'auth3way',
        'merchant_txn_id',
        'request',
        'response',
        'response_status',
        'response_message',
        'response_status_code',
        'response_3way',
        'response_3way_status',
        'response_3way_status_code',
        'response_3way_message',
        'mposSerialNumber',
        'admin_id',
        'created_by',
    ];



    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'longitude' => 'decimal:8',
        'latitude' => 'decimal:8',
        'amount' => 'decimal:2',
        'auth3way' => 'boolean',
        'request' => 'array',
        'response' => 'array',
        'response_status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the transaction.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'mid', 'mid');
    }

    /**
     * Get the admin who created this transaction.
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id', 'mid');
    }

    /**
     * Get the user who created this transaction.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'mid');
    }

    /**
     * Scope a query to only include transactions of a given type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('aeps_type', $type);
    }

    /**
     * Scope a query to only include successful transactions.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('response_status', true);
    }

    /**
     * Scope a query to only include failed transactions.
     */
    public function scopeFailed($query)
    {
        return $query->where('response_status', false);
    }
}
