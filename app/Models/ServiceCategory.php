<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCategory extends Model
{
    protected $table = 'app_service_categories';

    protected $fillable = [
        'name',
        'icon',
        'icon_type',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the items for this category
     */
    public function items()
    {
        return $this->hasMany(ServiceItem::class, 'category_id')
            ->orderBy('display_order');
    }

    /**
     * Get active items only
     */
    public function activeItems()
    {
        return $this->hasMany(ServiceItem::class, 'category_id')
            ->where('is_active', true)
            ->orderBy('display_order');
    }

    /**
     * Scope for active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope ordered by display_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }
}
