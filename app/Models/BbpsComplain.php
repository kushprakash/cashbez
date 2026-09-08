<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BbpsComplain extends Model
{
    protected $table = 'bbps_complain';

    protected $fillable = [
        'bbps_transaction_id',
        'user_id',
        'mobile',
        'customer_remark',
        'admin_remark',
        'status',
        'creation_date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
 