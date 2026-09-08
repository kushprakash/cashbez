<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MainModule extends Model
{
    protected $fillable = ['name','status'];

    // Add relationships for module tree
    public function modules() {
        return $this->hasMany(\App\Models\Module::class, 'main_module_id');
    }
}
