<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRolePermission extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'role_id',
        'main_module_id',
        'module_id',
        'sub_module_id',
        'permission_id',
        'status',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
    public function role() {
        return $this->belongsTo(Role::class);
    }
    public function module() {
        return $this->belongsTo(Module::class);
    }
    public function subModule() {
        return $this->belongsTo(SubModule::class, 'sub_module_id');
    }
    public function permission() {
        return $this->belongsTo(ModulePermission::class, 'permission_id');
    }
}
