<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AepsDraft extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'mid',
        'latitude',
        'longitude',
        'shop_city',
        'shop_address',
        'state_id',
        'shop_district',
        'shop_pin_code',
        'shop_name',
        'shop_inner',
        'shop_outer',
        'video_url',
        'pan_no',
        'aadhaar_number',
        'full_name',
        'phone',
        'email',
        'account_number',
        'ifsc_code',
        'bank_name',
        'bank_branch',
        'phone_verified_at',
        'email_verified_at',
        'aadhaar_verified_at',
        'pan_verified_at',
        'bank_verified_at',
        'status',
        'remarks',
        'created_by',
        'admin_id',
        'request_data',
        'response_data',
        'aeps_status',
        'ap_status',
        'generated_hash',
        'user_name',
        'password',
        'ip_address', 
        'deviceIMEI',
        'deviceName',
        'primaryKeyId',
        'encodeFPTxnId',
        'aadharData',
        'panData',
        'accountData',
        'video_kyc_status',
        'mposSerialNumber'
    ];

 
    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'request_data' => 'array',
        'response_data' => 'array',
        'video_kyc_status' => 'integer',
    ];

    // Relationships
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    // Scopes
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
