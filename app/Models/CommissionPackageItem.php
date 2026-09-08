<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionPackageItem extends Model
{
    use HasFactory;

    protected $table = 'commission_package_items';

    protected $fillable = [
        'package_id',
        'api_id',
        'category',
        'operator_code',
        'commission_type',
        'commission_val'
    ];

    protected $casts = [
        'commission_val' => 'float'
    ];

    public function package()
    {
        return $this->belongsTo(CommissionPackage::class, 'package_id');
    }

    public function api()
    {
        return $this->belongsTo(ApiSetting::class, 'api_id');
    }
}
