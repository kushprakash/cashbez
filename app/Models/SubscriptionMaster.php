<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionMaster extends Model
{
    use HasFactory;
    protected $table = 'subscription_masters';
    protected $fillable = [
        'user_id',
        'role_id',
        'main_module_id',
        'module_id',
        'duration',
        'duration_type',
        'description',
        'price',
        'status',
    ];

    public function mainModule()
    {
        return $this->belongsTo(MainModule::class, 'main_module_id');
    }

    public function module()
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    public function subModule()
    {
        return $this->belongsTo(SubModule::class, 'sub_module_id');
    }
}
