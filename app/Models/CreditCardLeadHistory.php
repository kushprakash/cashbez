<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditCardLeadHistory extends Model
{
    use HasFactory;

    protected $table = 'credit_card_lead_history';
    protected $primaryKey = 'id';
    public $timestamps = false; // Only uses created_at

    protected $fillable = [
        'lead_id',
        'old_status',
        'new_status',
        'changed_by',
        'changed_by_role',
        'remarks',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // Relationships
    public function lead()
    {
        return $this->belongsTo(CreditCardLead::class, 'lead_id', 'lead_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by', 'id');
    }
}
