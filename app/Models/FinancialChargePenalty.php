<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialChargePenalty extends Model
{
    use HasFactory;

    protected $table = 'financial_charges_penalties';

    protected $fillable = [
        'user_id',
        'admin_id',
        'service_type',
        'category',
        'charge_type',
        'penalty_type',
        'name',
        'amount',
        'percentage',
        'gst_applicable',
        'gst_percentage',
        'effective_from',
        'effective_to',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'gst_applicable' => 'boolean',
        'amount' => 'decimal:2',
        'percentage' => 'decimal:2',
        'gst_percentage' => 'decimal:2',
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
