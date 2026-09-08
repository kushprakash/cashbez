<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionPackage extends Model
{
    use HasFactory;

    protected $table = 'commission_packages';

    protected $fillable = [
        'name',
        'api_id',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function items()
    {
        return $this->hasMany(CommissionPackageItem::class, 'package_id');
    }

    public function assignments()
    {
        return $this->hasMany(CommissionPackageAssignment::class, 'package_id');
    }

    public function api()
    {
        return $this->belongsTo(ApiSetting::class, 'api_id');
    }
}
