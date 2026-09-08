<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubModule extends Model
{
    use HasFactory;

    protected $fillable = [
        'main_module_id',
        'module_id',
        'name',
        'status',
    ];

    public function permissions() {
        return $this->hasMany(\App\Models\ModulePermission::class, 'sub_module_id');
    }

    public function commissions() {
        return $this->hasMany(\App\Models\ModuleCommission::class, 'sub_module_id');
    }
}
