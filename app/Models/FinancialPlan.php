<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialPlan extends Model
{
    use HasFactory;

    protected $table = 'financial_plans';

    protected $fillable = [
        'user_id',
        'admin_id',
        'service_type',
        'plan_code',
        'plan_name',
        'description',
        'status',
        'effective_from',
        'effective_to',
        'minimum_opening_amount',
        'maximum_opening_amount',
        'minimum_balance',
        'maximum_total_balance',
        'maximum_daily_deposit',
        'maximum_monthly_deposit',
        'minimum_daily_deposit',
        'minimum_installment',
        'maximum_installment',
        'installment_frequency',
        'minimum_installments',
        'minimum_investment',
        'maximum_investment',
        'maximum_total_investment',
        'minimum_duration',
        'maximum_duration',
        'duration_unit',
        'interest_rate',
        'interest_type',
        'interest_calculation_method',
        'interest_calculation_frequency',
        'interest_credit_frequency',
        'compounding_frequency',
        'interest_payout',
        'payout_frequency',
        'payout_day',
        'grace_period',
        'late_payment_allowed',
        'late_payment_charge',
        'late_fee',
        'missed_installment_charge',
        'maximum_missed_deposits',
        'maximum_missed_installments',
        'withdrawal_allowed',
        'minimum_withdrawal',
        'maximum_withdrawal',
        'daily_withdrawal_limit',
        'monthly_withdrawal_limit',
        'withdrawal_charge',
        'account_opening_charge',
        'account_closure_charge',
        'premature_closure_allowed',
        'premature_closure_charge',
        'premature_closure_penalty',
        'minimum_lockin_period',
        'lockin_period',
        'premature_penalty',
        'reduced_interest_rate',
        'auto_renewal',
        'renewal_type',
        'nominee_required',
        'joint_account_allowed',
        'minor_account_allowed',
        'dormant_period',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'late_payment_allowed' => 'boolean',
        'withdrawal_allowed' => 'boolean',
        'premature_closure_allowed' => 'boolean',
        'auto_renewal' => 'boolean',
        'nominee_required' => 'boolean',
        'joint_account_allowed' => 'boolean',
        'minor_account_allowed' => 'boolean',
        'minimum_opening_amount' => 'decimal:2',
        'maximum_opening_amount' => 'decimal:2',
        'minimum_balance' => 'decimal:2',
        'maximum_total_balance' => 'decimal:2',
        'maximum_daily_deposit' => 'decimal:2',
        'maximum_monthly_deposit' => 'decimal:2',
        'minimum_daily_deposit' => 'decimal:2',
        'minimum_installment' => 'decimal:2',
        'maximum_installment' => 'decimal:2',
        'minimum_investment' => 'decimal:2',
        'maximum_investment' => 'decimal:2',
        'maximum_total_investment' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'late_payment_charge' => 'decimal:2',
        'late_fee' => 'decimal:2',
        'missed_installment_charge' => 'decimal:2',
        'minimum_withdrawal' => 'decimal:2',
        'maximum_withdrawal' => 'decimal:2',
        'daily_withdrawal_limit' => 'decimal:2',
        'monthly_withdrawal_limit' => 'decimal:2',
        'withdrawal_charge' => 'decimal:2',
        'account_opening_charge' => 'decimal:2',
        'account_closure_charge' => 'decimal:2',
        'premature_closure_charge' => 'decimal:2',
        'premature_closure_penalty' => 'decimal:2',
        'premature_penalty' => 'decimal:2',
        'reduced_interest_rate' => 'decimal:2',
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
