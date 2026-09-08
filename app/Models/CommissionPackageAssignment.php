<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionPackageAssignment extends Model
{
    use HasFactory;

    protected $table = 'commission_package_assignments';

    protected $fillable = [
        'package_id',
        'assign_type',
        'role_id',
        'user_id',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function package()
    {
        return $this->belongsTo(CommissionPackage::class, 'package_id');
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
