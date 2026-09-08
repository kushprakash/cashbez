<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncomeTaxApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'application_type',
        'bussiness_name',
        'bussiness_type',
        'nature_of_business',
        'pan_number',
        'aadhar_number',
        'mobile_number',
        'email_id',
        'bank_account_no',
        'ifsc_code',
        'account_type',
        'form_16_file',
        'salary_slip_file',
        'pan_file',
        'aadhar_front_file',
        'aadhar_back_file',
        'bank_statement_file',
        'itr_password',
        'deduction_lic_tuition',
        'deduction_fd_nsc',
        'deduction_home_loan',
        'deduction_health_insurance',
        'deduction_savings_interest',
        'total_sales',
        'profit_margin',
        'business_expenses',
        'status',
        'admin_id',
        'updated_by',
        'message',
        'application_reciept',
        'id_proof_file'
    ];

    // Status Mutator if needed (similar to GST)
    public function getStatusAttribute($value)
    {
        $statuses = [
            0 => 'pending',
            1 => 'approved',
            2 => 'rejected',
            3 => 'error'
        ];
        return $statuses[$value] ?? 'pending';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
