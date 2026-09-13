<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialSetting extends Model
{
    use HasFactory;

    protected $table = 'financial_settings';

    protected $fillable = [
        'user_id',
        'admin_id',
        'financial_service_name',
        'financial_service_code',
        'currency',
        'financial_year',
        'member_id_prefix',
        'account_number_prefix',
        'transaction_id_prefix',
        'receipt_prefix',
        'minimum_member_age',
        'maximum_member_age',
        'kyc_required_at_account_opening',
        'kyc_required_at_withdrawal',
        'aadhaar_verification_required',
        'pan_verification_required',
        'bank_verification_required',
        'withdrawal_approval_required',
        'account_opening_approval_required',
        'account_closure_approval_required',
        'transaction_approval_required',
        'minimum_withdrawal',
        'maximum_withdrawal',
        'daily_withdrawal_limit',
        'monthly_withdrawal_limit',
        'cash_withdrawal_limit',
        'bank_transfer_limit',
        'maturity_notification_days',
        'prematurity_notification_days',
        'maturity_payment_approval_required',
        'maturity_kyc_required',
        'maturity_bank_verification_required',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'kyc_required_at_account_opening' => 'boolean',
        'kyc_required_at_withdrawal' => 'boolean',
        'aadhaar_verification_required' => 'boolean',
        'pan_verification_required' => 'boolean',
        'bank_verification_required' => 'boolean',
        'withdrawal_approval_required' => 'boolean',
        'account_opening_approval_required' => 'boolean',
        'account_closure_approval_required' => 'boolean',
        'transaction_approval_required' => 'boolean',
        'maturity_payment_approval_required' => 'boolean',
        'maturity_kyc_required' => 'boolean',
        'maturity_bank_verification_required' => 'boolean',
        'minimum_withdrawal' => 'decimal:2',
        'maximum_withdrawal' => 'decimal:2',
        'daily_withdrawal_limit' => 'decimal:2',
        'monthly_withdrawal_limit' => 'decimal:2',
        'cash_withdrawal_limit' => 'decimal:2',
        'bank_transfer_limit' => 'decimal:2',
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
