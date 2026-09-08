<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Email extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sender_id',
        'subject',
        'body',
        'is_draft',
        'sent_at',
        'reply_to_id',
        'thread_id',
        'priority',
        'has_attachments',
        'cc',
        'bcc',
        'email_type',
        'created_by',
        'admin_id',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'is_draft' => 'boolean',
        'has_attachments' => 'boolean',
        'cc' => 'array',
        'bcc' => 'array',
    ];

    // Relationships
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(EmailRecipient::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(EmailAttachment::class);
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(Email::class, 'reply_to_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Email::class, 'reply_to_id');
    }

    public function thread(): BelongsTo
    {
        return $this->belongsTo(EmailThread::class);
    }

    // Scopes
    public function scopeInbox($query, $userId)
    {
        return $query->whereHas('recipients', function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->where('folder_type', 'inbox')
              ->where('is_deleted', false);
        });
    }

    public function scopeSent($query, $userId)
    {
        return $query->where('sender_id', $userId)
                    ->where('is_draft', false)
                    ->whereNotNull('sent_at');
    }

    public function scopeDrafts($query, $userId)
    {
        return $query->where('sender_id', $userId)
                    ->where('is_draft', true);
    }

    public function scopeTrash($query, $userId)
    {
        return $query->whereHas('recipients', function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->where('is_deleted', true);
        });
    }

    public function scopeSentTrash($query, $userId)
    {
        return $query->onlyTrashed()
                    ->where('sender_id', $userId)
                    ->where('is_draft', false);
    }

    // Helper methods
    public function isRead($userId)
    {
        return $this->recipients()
                   ->where('user_id', $userId)
                   ->value('is_read') ?? false;
    }

    public function isStarred($userId)
    {
        return $this->recipients()
                   ->where('user_id', $userId)
                   ->value('is_starred') ?? false;
    }

    public function markAsRead($userId)
    {
        $this->recipients()
             ->where('user_id', $userId)
             ->update(['is_read' => true, 'read_at' => now()]);
    }

    public function markAsUnread($userId)
    {
        $this->recipients()
             ->where('user_id', $userId)
             ->update(['is_read' => false, 'read_at' => null]);
    }

    public function toggleStar($userId)
    {
        $recipient = $this->recipients()->where('user_id', $userId)->first();
        if ($recipient) {
            $recipient->update(['is_starred' => !$recipient->is_starred]);
        }
    }
}
