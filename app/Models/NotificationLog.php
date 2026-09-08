<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    use HasFactory;

    protected $table = 'notification_logs';

    protected $fillable = [
        'user_id',
        'sent_by',
        'title',
        'body',
        'type',
        'data',
        'status',
        'tokens_sent',
        'tokens_delivered',
        'tokens_failed',
        'fcm_response',
        'campaign_id',
        'scheduled_at',
        'sent_at',
    ];

    protected $casts = [
        'data' => 'array',
        'fcm_response' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    /**
     * Get the user who received the notification (null for campaigns)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the admin/user who sent the notification
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    /**
     * Scope to get logs by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get logs by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get campaign logs
     */
    public function scopeByCampaign($query, $campaignId)
    {
        return $query->where('campaign_id', $campaignId);
    }

    /**
     * Scope to get logs sent by specific user
     */
    public function scopeSentBy($query, $userId)
    {
        return $query->where('sent_by', $userId);
    }

    /**
     * Get success rate
     */
    public function getSuccessRateAttribute()
    {
        if ($this->tokens_sent == 0) return 0;
        return round(($this->tokens_delivered / $this->tokens_sent) * 100, 2);
    }

    /**
     * Check if notification is pending
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if notification is sent
     */
    public function isSent()
    {
        return $this->status === 'sent';
    }

    /**
     * Check if notification failed
     */
    public function isFailed()
    {
        return $this->status === 'failed';
    }

    /**
     * Check if notification was partially delivered
     */
    public function isPartial()
    {
        return $this->status === 'partial';
    }
}
