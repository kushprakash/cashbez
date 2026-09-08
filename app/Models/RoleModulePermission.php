<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoleModulePermission extends Model
{
    protected $fillable = ['user_id','role_id','main_module_id','module_id','sub_module_id','permission_id','status'];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function sub_module()
    {
        return $this->belongsTo(SubModule::class, 'sub_module_id');
    }

    public function permission()
    {
        return $this->belongsTo(ModulePermission::class, 'permission_id');
    }

    public function main_module()
    {
        return $this->belongsTo(MainModule::class, 'main_module_id');
    }
}
