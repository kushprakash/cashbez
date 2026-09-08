<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MsmeApplication extends Model
{
    use HasFactory;

    protected $table = 'msme_applications';

    protected $fillable = [
        'user_id',
        'admin_id',
        'owner_name',
        'shop_name',
        'shop_address',
        'mobile_number',
        'email_id',
        'pancard_number',
        'pancard_file',
        'aadharcard_number',
        'aadharcard_front',
        'aadharcard_back',
        'account_number',
        'ifsc_code',
        'bank_passbook',
        'aplication_reciept',
        'message',
        'status',
        'updated_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function getStatusAttribute($value)
    {
        $statuses = [0 => 'pending', 1 => 'approved', 2 => 'rejected', 3 => 'error'];
        return $statuses[$value] ?? $value;
    }
}
