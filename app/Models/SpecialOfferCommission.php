<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpecialOfferCommission extends Model
{
    use HasFactory;

    protected $table = 'special_offer_commissions';

    protected $fillable = [
        'title',
        'api_id',
        'operator_code',
        'circle',
        'amount',
        'commission_type',
        'commission_val',
        'assign_type',
        'role_id',
        'user_id',
        'is_active'
    ];

    protected $casts = [
        'amount' => 'float',
        'commission_val' => 'float',
        'is_active' => 'boolean'
    ];

    public function api()
    {
        return $this->belongsTo(ApiSetting::class, 'api_id');
    }

    public function roleInfo()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function userInfo()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
