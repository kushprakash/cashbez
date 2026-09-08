<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiOperatorMapping extends Model
{
    use HasFactory;

    protected $table = 'api_operator_mappings';

    protected $fillable = [
        'api_id',
        'utility_operator_id',
        'category',
        'operator_code',
        'api_operator_code',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function apiSetting()
    {
        return $this->belongsTo(ApiSetting::class, 'api_id');
    }

    public function utilityOperator()
    {
        return $this->belongsTo(UtilityOperator::class, 'utility_operator_id');
    }
}
