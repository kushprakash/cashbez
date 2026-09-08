<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChatMessage extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'chat_messages';
    protected $primaryKey = 'message_id';

    protected $fillable = [
        'thread_id',
        'sender_id',
        'reply_to_message_id',
        'admin_id',
        'message_type', // 'text', 'image', 'video', 'audio', 'file', 'location', 'system', 'payment_request', 'payment'
        'content',
        'metadata',
        'status', // 'sent', 'delivered', 'read'
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function thread()
    {
        return $this->belongsTo(ChatThread::class, 'thread_id', 'thread_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id', 'id');
    }

    public function replyTo()
    {
        return $this->belongsTo(ChatMessage::class, 'reply_to_message_id', 'message_id');
    }

    public function attachments()
    {
        return $this->hasMany(ChatAttachment::class, 'message_id', 'message_id');
    }

    public function receipts()
    {
        return $this->hasMany(ChatMessageReceipt::class, 'message_id', 'message_id');
    }

    public function linkedComplaints()
    {
        return $this->belongsToMany(
            Complaint::class,
            'complaint_chat_links',
            'message_id',
            'complaint_id'
        )->withPivot(['link_type', 'linked_by', 'notes', 'linked_at']);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeByThread($query, $threadId)
    {
        return $query->where('thread_id', $threadId);
    }

    public function scopeUnread($query, $userId)
    {
        return $query->whereDoesntHave('receipts', function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->where('status', 'read');
        });
    }
}
