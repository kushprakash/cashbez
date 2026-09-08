<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CreditCardLead extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'credit_card_leads';
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'lead_id',
        'full_name',
        'mobile',
        'email',
        'dob',
        'pan',
        'monthly_income',
        'desired_card',
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
        'commission_amount',
        'commission_status',
        'commission_released_at',
        'commission_released_by',
    ];

    protected $casts = [
        'dob' => 'date',
        'consent' => 'boolean',
        'consent_timestamp' => 'datetime',
        'monthly_income' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'commission_released_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $dates = [
        'deleted_at',
        'consent_timestamp',
        'commission_released_at',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to', 'id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id', 'id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function commissionReleasedBy()
    {
        return $this->belongsTo(User::class, 'commission_released_by', 'id');
    }

    public function history()
    {
        return $this->hasMany(CreditCardLeadHistory::class, 'lead_id', 'lead_id')
            ->orderBy('created_at', 'desc');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByUserId($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByCreatedBy($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeByAdminId($query, $adminId)
    {
        return $query->where('admin_id', $adminId);
    }

    public function scopeCommissionPending($query)
    {
        return $query->where('commission_status', 'pending');
    }

    public function scopeCommissionApproved($query)
    {
        return $query->where('commission_status', 'approved');
    }

    public function scopeCommissionReleased($query)
    {
        return $query->where('commission_status', 'released');
    }

    // Accessor for formatted lead ID
    public function getFormattedLeadIdAttribute()
    {
        return $this->lead_id;
    }

    // Accessor for formatted monthly income
    public function getFormattedMonthlyIncomeAttribute()
    {
        return '₹' . number_format($this->monthly_income, 2);
    }

    // Accessor for formatted commission
    public function getFormattedCommissionAttribute()
    {
        return $this->commission_amount ? '₹' . number_format($this->commission_amount, 2) : 'N/A';
    }

    // Static method to generate unique lead ID
    public static function generateLeadId()
    {
        $prefix = 'L';
        $date = date('Ymd');
        
        // Get the last lead ID for today
        $lastLead = self::where('lead_id', 'LIKE', "{$prefix}{$date}%")
            ->orderBy('lead_id', 'DESC')
            ->first();

        if ($lastLead) {
            $lastNumber = (int) substr($lastLead->lead_id, -3);
            $newNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '001';
        }

        return "{$prefix}{$date}{$newNumber}";
    }

    // Method to check if lead can be edited
    public function canBeEdited()
    {
        return !in_array($this->status, ['approved', 'rejected', 'cancelled']);
    }

    // Method to check if commission can be released
    public function canReleaseCommission()
    {
        return $this->status === 'approved' && 
               $this->commission_status === 'approved' && 
               !empty($this->commission_amount);
    }
}
