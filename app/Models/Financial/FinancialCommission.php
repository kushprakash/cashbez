<?php

namespace App\Models\Financial;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Role;
use App\Models\User;

class FinancialCommission extends Model
{
    use HasFactory;

    protected $table = 'financial_commissions';

    protected $fillable = [
        'admin_id',
        'user_id',
        'role_id',
        'service_type',
        'name',
        'is_slab',
        'from_amount',
        'to_amount',
        'commission_type',
        'commission_value',
        'distributor_commission_type',
        'distributor_commission_value',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_slab' => 'boolean',
        'from_amount' => 'float',
        'to_amount' => 'float',
        'commission_value' => 'float',
        'distributor_commission_value' => 'float',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
