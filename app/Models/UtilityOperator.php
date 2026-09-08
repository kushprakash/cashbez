<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UtilityOperator extends Model
{
    protected $table = 'utility_operators';
    
    protected $fillable = [
        'type',
        'state',
        'code',
        'name',
        'category',
        'label',
        'icon',
        'biller_icon',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}
