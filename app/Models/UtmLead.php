<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UtmLead extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'utm_leads';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'mid',
        'cat_id',
        'item_id',
        'name',
        'mobile',
        'email',
        'status',
        'amount',
        'payout_status',
        'remarks',
        'admin_id',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ========================================
    // RELATIONSHIPS
    // ========================================

    /**
     * Get the category associated with this lead.
     */
    public function category()
    {
        return $this->belongsTo(ServiceCategory::class, 'cat_id');
    }

    /**
     * Get the item associated with this lead.
     */
    public function item()
    {
        return $this->belongsTo(ServiceItem::class, 'item_id');
    }

    /**
     * Get the admin who processed this lead.
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the user (by mid) associated with this lead.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'mid', 'mid');
    }

    // ========================================
    // SCOPES
    // ========================================

    /**
     * Scope to filter by status.
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by payout status.
     */
    public function scopePayoutStatus($query, $payoutStatus)
    {
        return $query->where('payout_status', $payoutStatus);
    }

    /**
     * Scope to search by name, mobile, or email.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('mobile', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('mid', 'like', "%{$search}%");
        });
    }
}
