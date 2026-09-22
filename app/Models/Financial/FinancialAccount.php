<?php

namespace App\Models\Financial;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialAccount extends Model
{
    use HasFactory;

    protected $table = 'financial_accounts';

    protected $fillable = [
        'account_number',
        'member_id',
        'user_id',
        'admin_id',
        'created_by',
        'service_type',
        'plan_id',
        'current_balance',
        'available_balance',
        'opening_amount',
        'interest_rate',
        'duration_months',
        'status',
        'nominee_name',
        'nominee_relation',
        'virtual_account_id',
        'virtual_account_number',
        'virtual_ifsc',
        'virtual_upi_handle',
        'qrcode_image',
        'qrcode_pdf',
    ];

    public function member()
    {
        return $this->belongsTo(FinancialMember::class, 'member_id', 'id');
    }

    public function transactions()
    {
        return $this->hasMany(FinancialTransaction::class, 'account_id', 'id');
    }
}
