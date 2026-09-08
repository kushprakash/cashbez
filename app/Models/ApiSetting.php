<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApiSetting extends Model
{
    use SoftDeletes;

    protected $table = 'api_settings';

    protected $fillable = [
        'api_name',
        'api_short_name',
        'ip_address',
        'only_fetch_bill',
        'services',
        'circle',
        'first_low_balance_alert',
        'second_low_balance_alert',
        'third_low_balance_alert',
        'recharge_config',
        'status_check_config',
        'balance_config',
        'callback_config',
        'is_active'
    ];

    protected $casts = [
        'only_fetch_bill' => 'boolean',
        'is_active' => 'boolean',
        'services' => 'array',
        'recharge_config' => 'array',
        'status_check_config' => 'array',
        'balance_config' => 'array',
        'callback_config' => 'array',
        'first_low_balance_alert' => 'float',
        'second_low_balance_alert' => 'float',
        'third_low_balance_alert' => 'float',
    ];

    public function pendingSettings()
    {
        return $this->hasMany(ApiPendingSetting::class, 'api_id');
    }

    public function specialSettings()
    {
        return $this->hasMany(ApiSpecialSetting::class, 'api_id');
    }
}

