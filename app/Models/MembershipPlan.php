<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipPlan extends Model
{
    use HasFactory;

    protected $table = 'membership_plans';

    protected $fillable = [
        'user_id',
        'admin_id',
        'membership_type',
        'membership_code',
        'membership_name',
        'membership_fee',
        'gst_applicable',
        'gst_percentage',
        'total_fee',
        'validity',
        'validity_unit',
        'renewal_required',
        'renewal_fee',
        'renewal_period',
        'late_renewal_fee',
        'status',
        'effective_from',
        'effective_to',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'gst_applicable' => 'boolean',
        'renewal_required' => 'boolean',
        'membership_fee' => 'decimal:2',
        'gst_percentage' => 'decimal:2',
        'total_fee' => 'decimal:2',
        'renewal_fee' => 'decimal:2',
        'late_renewal_fee' => 'decimal:2',
        'effective_from' => 'date',
        'effective_to' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
