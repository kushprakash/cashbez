<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceItem extends Model
{
    protected $table = 'app_service_items';

    // Company DSA code constant
    public const DSA_COMPANY_CODE = 'L5VU3380';
    public const DSA_BASE_URL = 'https://indiasales.club';

    protected $fillable = [
        'category_id',
        'title',
        'icon',
        'icon_type',
        'link',
        'link_type', // url, path, dsa
        'other_url',
        'target_audience',
        'terms_conditions',
        'instructions',
        'display_order',
        'is_active',
        'android',
        'web',
    ];

    protected $casts = [
        'category_id' => 'integer',
        'display_order' => 'integer',
        'is_active' => 'boolean',
        'android' => 'boolean',
        'web' => 'boolean',
        'target_audience' => 'array',
        'terms_conditions' => 'array',
        'instructions' => 'array',
    ];

    /**
     * Check if this is a DSA link
     */
    public function isDsaLink(): bool
    {
        return $this->link_type === 'dsa';
    }

    /**
     * Build the full DSA URL for a user
     * Format: https://indiasales.club/{COMPANY_CODE}/{USER_DSA_CODE}/{link}
     */
    public function buildDsaUrl(?string $userDsaCode = null): string
    {
        if (!$this->isDsaLink()) {
            return $this->link;
        }

        $dsaCode = $userDsaCode ?: self::DSA_COMPANY_CODE;
        $path = ltrim($this->link, '/');
        
        return sprintf(
            '%s/%s/%s/%s',
            self::DSA_BASE_URL,
            self::DSA_COMPANY_CODE,
            $dsaCode,
            $path
        );
    }


    /**
     * Get the category for this item
     */
    public function category()
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    /**
     * Scope for active items
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for Android items
     */
    public function scopeForAndroid($query)
    {
        return $query->where('android', true);
    }

    /**
     * Scope for Web items
     */
    public function scopeForWeb($query)
    {
        return $query->where('web', true);
    }

    /**
     * Scope ordered by display_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }
}
