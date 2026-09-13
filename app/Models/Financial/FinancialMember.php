<?php

namespace App\Models\Financial;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialMember extends Model
{
    use HasFactory;

    protected $table = 'financial_members';

    protected $fillable = [
        'member_id',
        'user_id',
        'admin_id',
        'created_by',
        'updated_by',
        'name',
        'father_name',
        'husband_name',
        'dob',
        'gender',
        'mobile',
        'email',
        'address',
        'state',
        'district',
        'pincode',
        'occupation',
        'photo',
        'signature',
        'membership_plan_id',
        'membership_fee',
        'nominee_name',
        'nominee_relation',
        'nominee_mobile',
        'status',
        'kyc_status',
        'aadhar_number',
    ];

    public function accounts()
    {
        return $this->hasMany(FinancialAccount::class, 'member_id', 'id');
    }

    public function transactions()
    {
        return $this->hasMany(FinancialTransaction::class, 'member_id', 'id');
    }
}
