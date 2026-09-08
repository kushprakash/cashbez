<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryPayment extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id', 'created_by', 'admin_id', 'month', 'year', 'total_days', 'payable_days', 'gross', 'deductions', 'net', 'status',
        'company_bank', 'transaction_mode', 'cheque_no', 'utr', 'paid_leaves', 'present_days'
    ];
    public function user() { return $this->belongsTo(User::class); }
    public function payslip() { return $this->hasOne(Payslip::class); }
    
    /**
     * Get the user who created this salary payment
     */
    public function createdBy() { return $this->belongsTo(User::class, 'created_by'); }
    
    /**
     * Get the admin for this salary payment
     */
    public function admin() { return $this->belongsTo(User::class, 'admin_id'); }
}
