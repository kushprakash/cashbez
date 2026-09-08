<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoleSubscriptionMaster extends Model
{
    protected $fillable = [
        'role_id',
        'main_module_id',
        'module_id',
        'duration',
        'duration_type',
        'description',
        'price',
        'status'
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function mainModule()
    {
        return $this->belongsTo(MainModule::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}
