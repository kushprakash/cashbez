<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'mid',
        'mkey',
        'admin_mid',
        'name',
        'email',
        'email_verified_at',
        'aadhar_verify_at',
        'pan_number',
        'aadhar_number',
        'mobile',
        'password',
        'mpin',
        'remember_token',
        'role',
        'role_id',
        'root',
        'refer_by',
        'aadhar_data',
        'status',
        'is_api_partner',
        'dsa_code'
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_api_partner' => 'boolean',
        ];
    }

    // JWT Interface Implementation
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    // Relationship: Get admin user by admin_mid
    public function admin()
    {
        return $this->hasOne(User::class, 'mid', 'admin_mid');
    }

    // Relationship: Get user role permissions
    public function userRolePermissions()
    {
        return $this->hasMany(UserRolePermission::class, 'user_id');
    }

    // Relationship: Get user KYC data
    public function kyc()
    {
        return $this->hasOne(UserKyc::class, 'user_id');
    }

    // Relationship: Get employee data
    public function employee()
    {
        return $this->hasOne(Employee::class, 'user_id');
    }

    // Relationship: Get user account
    public function account()
    {
        return $this->hasOne(Account::class, 'user_id');
    }

    // Relationship: Get AEPS draft
    public function aepsDraft()
    {
        return $this->hasOne(AepsDraft::class, 'mid', 'mid');
    }

    // Relationship: Get role info
    public function role_info()
    {
        return $this->belongsTo(Role::class, 'role');
    }

    // Relationship: Get FCM tokens
    public function fcmTokens()
    {
        return $this->hasMany(\App\Models\FcmToken::class);
    }

    // Relationship: Get user settings
    public function setting()
    {
        return $this->hasOne(\App\Models\Setting::class, 'user_id');
    }

    public function aepsTransactions()
    {
        return $this->hasMany(AepsTransaction::class, 'mid', 'mid');
    }
}
