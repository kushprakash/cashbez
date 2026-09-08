<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = ['main_module_id','name','icon','status'];

    // Add relationships for module tree
    public function subModules() {
        return $this->hasMany(\App\Models\SubModule::class, 'module_id');
    }

    public function mainModule() {
        return $this->belongsTo(MainModule::class, 'main_module_id');
    }
}
