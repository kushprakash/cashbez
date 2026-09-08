<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $table = 'subscriptions';
    protected $fillable = [
        'user_id',
        'main_module_id',
        'module_id',
        'plan_id',
        'start_at',
        'end_at',
        'status',
    ];
}
