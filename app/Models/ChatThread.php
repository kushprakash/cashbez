<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChatThread extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'chat_threads';
    protected $primaryKey = 'thread_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'thread_id',
        'thread_type', // 'direct', 'group', 'support'
        'title',
        'topic',
        'description',
        'avatar_url',
        'owner_id',
        'last_message_id',
        'assigned_to',
        'status',
        'escalated_at',
        'ticket_id',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id', 'id');
    }

    public function participants()
    {
        return $this->hasMany(ChatThreadParticipant::class, 'thread_id', 'thread_id');
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'thread_id', 'thread_id')
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'asc');
    }

    public function lastMessage()
    {
        return $this->belongsTo(ChatMessage::class, 'last_message_id', 'message_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        });
    }

    public function scopeDirect($query)
    {
        return $query->where('thread_type', 'direct');
    }

    public function scopeGroup($query)
    {
        return $query->where('thread_type', 'group');
    }

    public function scopeSupport($query)
    {
        return $query->where('thread_type', 'support');
    }
}
