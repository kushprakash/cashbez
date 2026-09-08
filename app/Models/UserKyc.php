<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserKyc extends Model
{
    use HasFactory;

    protected $table = 'user_kyc';

    protected $fillable = [
        'user_id',
        'created_by',
        'admin_id',
        'aadhar_number',
        'country',
        'dist',
        'house',
        'landmark',
        'pincode',
        'po',
        'state',
        'street',
        'subdist',
        'vtc',
        'dob',
        'gender',
        'mobile',
        'email',
        'name',
        'photo',
        'pan_number',
        'account_number',
        'ifsc_code',
        'bank_name',
        'branch',
        'response_aadhar',
        'response_pan',
        'response_account',
        'authorized_signatory',
        'bank_details',
        'business_details',
        'aadhar_verified',
        'pan_verified',
        'account_verified',
        'kyc_completed',
        'verified_at',
        // DigiLocker fields
        'digilocker_id',
        'digilocker_access_token',
        'digilocker_refresh_token',
        'digilocker_token_expires_at',
        'digilocker_verified',
        'digilocker_response',
        'code_verifier',
    ];

    protected $casts = [
        'dob' => 'date',
        'aadhar_verified' => 'boolean',
        'pan_verified' => 'boolean',
        'account_verified' => 'boolean',
        'kyc_completed' => 'boolean',
        'digilocker_verified' => 'boolean',
        'verified_at' => 'datetime',
        'digilocker_token_expires_at' => 'datetime',
        'authorized_signatory' => 'array',
        'bank_details' => 'array',
        'business_details' => 'array'
    ];

    /**
     * Get the user that owns the KYC.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who created this KYC record
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the admin for this KYC record
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Check if basic KYC is completed (Aadhaar + PAN)
     */
    public function isBasicKycComplete()
    {
        return $this->aadhar_verified && $this->pan_verified;
    }

    /**
     * Check if full KYC is completed (including bank account)
     */
    public function isFullKycComplete()
    {
        return $this->aadhar_verified && $this->pan_verified && $this->account_verified;
    }

    /**
     * Check if corporate KYC is completed
     */
    public function isCorporateKycComplete()
    {
        return $this->isFullKycComplete() && 
               !empty($this->authorized_signatory) && 
               !empty($this->bank_details) && 
               !empty($this->business_details);
    }
}
