<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PanFundRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pan_fund_requests';

    protected $fillable = [
        'user_id',
        'admin_id',
        'account_id',
        'agent_id',
        'txn_id',
        'coupon_qty',
        'amount',
        'status',
        'remark',
        'admin_remark',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'status' => 'integer',
        'coupon_qty' => 'integer',
        'amount' => 'decimal:2',
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

    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
