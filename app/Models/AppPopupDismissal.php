<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppPopupDismissal extends Model
{
    protected $table = 'app_popup_dismissals';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'popup_id',
        'dismissed_at',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'popup_id' => 'integer',
        'dismissed_at' => 'datetime',
    ];

    /**
     * Get the popup that was dismissed
     */
    public function popup()
    {
        return $this->belongsTo(AppPopup::class, 'popup_id');
    }

    /**
     * Get the user who dismissed the popup
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
