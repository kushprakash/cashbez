<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payslip extends Model
{
    use HasFactory;
    protected $fillable = [
        'salary_payment_id', 'user_id', 'created_by', 'admin_id', 'month', 'year', 'earnings', 'deductions', 'net', 'pdf_path'
    ];
    protected $casts = [
        'earnings' => 'array',
        'deductions' => 'array',
    ];
    public function salaryPayment() { return $this->belongsTo(SalaryPayment::class); }
    public function user() { return $this->belongsTo(User::class); }
    
    /**
     * Get the user who created this payslip
     */
    public function createdBy() { return $this->belongsTo(User::class, 'created_by'); }
    
    /**
     * Get the admin for this payslip
     */
    public function admin() { return $this->belongsTo(User::class, 'admin_id'); }
}
