<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UtiPsaAgent extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'uti_psa_agents';

    protected $fillable = [
        'user_id',
        'admin_id',
        'agent_id',
        'name',
        'contact_person',
        'email',
        'mobile_no',
        'pin',
        'location',
        'state',
        'district',
        'pan_no',
        'address_1',
        'address_2',
        'address_3',
        'address_4',
        'status',
        'admin_remark',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'status' => 'integer',
        'approved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
