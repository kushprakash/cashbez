<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppPopup extends Model
{
    protected $table = 'app_popups';

    protected $fillable = [
        'title',
        'message',
        'image_url',
        'image_position',
        'button_text',
        'button_link',
        'target_users',
        'target_roles',
        'popup_type',
        'show_on_screen',
        'custom_routes',
        'display_start',
        'display_end',
        'show_after_seconds',
        'auto_close_seconds',
        'is_repeatable',
        'priority',
        'display_frequency',
        'is_dismissible',
        'status',
        'created_by',
    ];

    protected $casts = [
        'display_start' => 'datetime',
        'display_end' => 'datetime',
        'show_after_seconds' => 'integer',
        'auto_close_seconds' => 'integer',
        'is_repeatable' => 'boolean',
        'priority' => 'integer',
        'is_dismissible' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get dismissals for this popup
     */
    public function dismissals()
    {
        return $this->hasMany(AppPopupDismissal::class, 'popup_id');
    }

    /**
     * Scope for active popups
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for popups on a specific screen
     */
    public function scopeForScreen($query, $screen)
    {
        return $query->where(function ($q) use ($screen) {
            $q->where('show_on_screen', $screen)
              ->orWhere('show_on_screen', 'both');
        });
    }

    /**
     * Scope for popups within valid date range
     */
    public function scopeWithinDateRange($query)
    {
        $now = now();
        return $query->where(function ($q) use ($now) {
            $q->whereNull('display_start')
              ->orWhere('display_start', '<=', $now);
        })->where(function ($q) use ($now) {
            $q->whereNull('display_end')
              ->orWhere('display_end', '>=', $now);
        });
    }

    /**
     * Check if popup targets a specific user
     */
    public function targetsUser($userId, $userRoleId = null)
    {
        // If no targeting specified, show to all
        if (empty($this->target_users) && empty($this->target_roles)) {
            return true;
        }

        // Check user targeting
        if (!empty($this->target_users)) {
            $targetUserIds = array_map('trim', explode(',', $this->target_users));
            if (in_array($userId, $targetUserIds)) {
                return true;
            }
        }

        // Check role targeting
        if (!empty($this->target_roles) && $userRoleId) {
            $targetRoleIds = array_map('trim', explode(',', $this->target_roles));
            if (in_array($userRoleId, $targetRoleIds)) {
                return true;
            }
        }

        // If targeting is specified but user not matched
        if (!empty($this->target_users) || !empty($this->target_roles)) {
            return false;
        }

        return true;
    }

    /**
     * Check if popup should be shown based on display frequency and dismissals
     */
    public function shouldShowToUser($userId, $dismissal = null)
    {
        // For 'always' frequency, always show
        if ($this->display_frequency === 'always') {
            return true;
        }

        // If no dismissal record, show the popup
        if (!$dismissal) {
            return true;
        }

        // For 'once' frequency, don't show if already dismissed
        if ($this->display_frequency === 'once') {
            return false;
        }

        // For 'once_per_day' frequency, check if dismissed today
        if ($this->display_frequency === 'once_per_day') {
            $dismissedAt = $dismissal->dismissed_at;
            if (!$dismissedAt) {
                return true;
            }
            $date = \Carbon\Carbon::parse($dismissedAt);
            return !$date->isToday();
        }

        // Fallback for non-repeatable popups
        if (!$this->is_repeatable && $dismissal) {
            return false;
        }

        return true;
    }
}
