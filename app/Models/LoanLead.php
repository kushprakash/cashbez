<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class LoanLead extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'loan_leads';

    protected $fillable = [
        'user_id',
        'lead_id',
        'loan_type',
        'full_name',
        'mobile',
        'email',
        'dob',
        'pan',
        // Personal Loan Fields
        'employment_type',
        'monthly_income',
        'company_name',
        'job_title',
        'work_experience',
        // Business Loan Fields
        'business_name',
        'business_type',
        'business_category',
        'business_registration_number',
        'gst_number',
        'business_vintage',
        'annual_turnover',
        'monthly_profit',
        'business_address',
        'business_city',
        'business_state',
        'business_pincode',
        // Common Loan Fields
        'loan_amount',
        'loan_purpose',
        'loan_tenure',
        'existing_loans',
        'existing_loan_amount',
        'credit_score',
        // Personal/Residential Address
        'address',
        'city',
        'state',
        'pincode',
        // Additional Fields
        'bank_statements_months',
        'collateral_available',
        'collateral_type',
        'collateral_value',
        'lead_source',
        'preferred_contact_time',
        'consent',
        'consent_timestamp',
        'status',
        'assigned_to',
        'admin_id',
        'created_by',
        'notes',
        'admin_notes',
        'status_message',
        // Commission Fields
        'commission_amount',
        'commission_status',
        'commission_set_at',
        'commission_set_by',
        'commission_released_at',
        'commission_released_by',
        // Approval Fields
        'approved_amount',
        'approved_tenure',
        'approved_interest_rate',
        'rejection_reason',
        'documents_submitted',
        'verification_status',
        'disbursement_date',
    ];

    protected $casts = [
        'dob' => 'date',
        'monthly_income' => 'decimal:2',
        'annual_turnover' => 'decimal:2',
        'monthly_profit' => 'decimal:2',
        'loan_amount' => 'decimal:2',
        'existing_loan_amount' => 'decimal:2',
        'collateral_value' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'approved_interest_rate' => 'decimal:2',
        'existing_loans' => 'boolean',
        'collateral_available' => 'boolean',
        'consent' => 'boolean',
        'documents_submitted' => 'boolean',
        'consent_timestamp' => 'datetime',
        'commission_set_at' => 'datetime',
        'commission_released_at' => 'datetime',
        'disbursement_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    // Automatically generate lead_id on create
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->lead_id)) {
                $prefix = $model->loan_type === 'business' ? 'BL' : 'PL';
                $model->lead_id = $prefix . str_pad(static::max('id') + 1, 6, '0', STR_PAD_LEFT);
            }
        });
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function commissionReleasedBy()
    {
        return $this->belongsTo(User::class, 'commission_released_by');
    }

    public function commissionSetBy()
    {
        return $this->belongsTo(User::class, 'commission_set_by');
    }

    public function history()
    {
        return $this->hasMany(LoanLeadHistory::class, 'lead_id', 'lead_id')->orderBy('created_at', 'desc');
    }

    // Scopes
    public function scopePersonalLoans($query)
    {
        return $query->where('loan_type', 'personal');
    }

    public function scopeBusinessLoans($query)
    {
        return $query->where('loan_type', 'business');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeWithCommission($query)
    {
        return $query->whereNotNull('commission_amount');
    }

    public function scopeCommissionPending($query)
    {
        return $query->where('commission_status', 'pending');
    }

    public function scopeCommissionReleased($query)
    {
        return $query->where('commission_status', 'released');
    }

    // Accessors
    public function getFormattedLoanAmountAttribute()
    {
        return '₹' . number_format($this->loan_amount, 2);
    }

    public function getFormattedMonthlyIncomeAttribute()
    {
        return $this->monthly_income ? '₹' . number_format($this->monthly_income, 2) : null;
    }

    public function getFormattedAnnualTurnoverAttribute()
    {
        return $this->annual_turnover ? '₹' . number_format($this->annual_turnover, 2) : null;
    }

    public function getFormattedCommissionAmountAttribute()
    {
        return $this->commission_amount ? '₹' . number_format($this->commission_amount, 2) : null;
    }

    public function getStatusBadgeClassAttribute()
    {
        $statusClasses = [
            'new' => 'badge bg-primary',
            'contacted' => 'badge bg-info',
            'document_pending' => 'badge bg-warning',
            'under_review' => 'badge bg-secondary',
            'processing' => 'badge bg-info',
            'approved' => 'badge bg-success',
            'disbursed' => 'badge bg-success',
            'rejected' => 'badge bg-danger',
            'cancelled' => 'badge bg-dark'
        ];

        return $statusClasses[$this->status] ?? 'badge bg-secondary';
    }

    public function getFormattedStatusAttribute()
    {
        return ucwords(str_replace('_', ' ', $this->status));
    }

    public function getCommissionStatusBadgeAttribute()
    {
        if (!$this->commission_status) {
            return '<span class="badge bg-secondary">N/A</span>';
        }

        $badges = [
            'pending' => 'badge bg-warning',
            'approved' => 'badge bg-info',
            'released' => 'badge bg-success',
            'cancelled' => 'badge bg-danger'
        ];

        $class = $badges[$this->commission_status] ?? 'badge bg-secondary';
        $status = ucwords(str_replace('_', ' ', $this->commission_status));

        return "<span class=\"{$class}\">{$status}</span>";
    }

    // Static methods for statistics
    public static function getStatsByPeriod($period = 'today', $userId = null)
    {
        $query = static::query();

        if ($userId) {
            $query->where('user_id', $userId);
        }

        switch ($period) {
            case 'today':
                $query->whereDate('created_at', today());
                break;
            case 'month':
                $query->whereMonth('created_at', now()->month)
                      ->whereYear('created_at', now()->year);
                break;
            case 'year':
                $query->whereYear('created_at', now()->year);
                break;
        }

        $stats = [
            'total' => $query->count(),
            'personal' => $query->clone()->where('loan_type', 'personal')->count(),
            'business' => $query->clone()->where('loan_type', 'business')->count(),
            'new' => $query->clone()->where('status', 'new')->count(),
            'contacted' => $query->clone()->where('status', 'contacted')->count(),
            'document_pending' => $query->clone()->where('status', 'document_pending')->count(),
            'under_review' => $query->clone()->where('status', 'under_review')->count(),
            'processing' => $query->clone()->where('status', 'processing')->count(),
            'approved' => $query->clone()->where('status', 'approved')->count(),
            'disbursed' => $query->clone()->where('status', 'disbursed')->count(),
            'rejected' => $query->clone()->where('status', 'rejected')->count(),
            'cancelled' => $query->clone()->where('status', 'cancelled')->count(),
        ];

        // Commission stats
        $commissionQuery = $query->clone()->whereNotNull('commission_amount');
        $stats['commission'] = [
            'total' => $commissionQuery->sum('commission_amount'),
            'pending' => $commissionQuery->clone()->where('commission_status', 'pending')->sum('commission_amount'),
            'approved' => $commissionQuery->clone()->where('commission_status', 'approved')->sum('commission_amount'),
            'released' => $commissionQuery->clone()->where('commission_status', 'released')->sum('commission_amount'),
        ];

        return $stats;
    }

    // Method to log status changes
    public function logStatusChange($oldStatus, $newStatus, $changedBy = null, $remarks = null)
    {
        LoanLeadHistory::create([
            'lead_id' => $this->lead_id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => $changedBy,
            'changed_by_role' => $changedBy ? User::find($changedBy)?->role : null,
            'remarks' => $remarks,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    // Method to update status with history logging
    public function updateStatus($newStatus, $changedBy = null, $remarks = null)
    {
        $oldStatus = $this->status;
        
        if ($oldStatus !== $newStatus) {
            $this->update(['status' => $newStatus]);
            $this->logStatusChange($oldStatus, $newStatus, $changedBy, $remarks);
        }
    }
}