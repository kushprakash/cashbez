<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModulePermission extends Model
{
    protected $fillable = ['main_module_id','module_id','sub_module_id','name','endpoint','route','status','menu_show'];
}
