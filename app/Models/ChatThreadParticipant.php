<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatThreadParticipant extends Model
{
    use HasFactory;

    protected $table = 'chat_thread_participants';
    protected $primaryKey = 'participant_id';

    protected $fillable = [
        'thread_id',
        'user_id',
        'role', // 'owner', 'admin', 'moderator', 'member', 'support'
        'invited_by',
        'invited_at',
        'joined_at',
        'left_at',
        'removed_by'
    ];

    protected $casts = [
        'invited_at' => 'datetime',
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
    ];

    public $timestamps = false;

    // Relationships
    public function thread()
    {
        return $this->belongsTo(ChatThread::class, 'thread_id', 'thread_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function invitedBy()
    {
        return $this->belongsTo(User::class, 'invited_by', 'id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereNull('left_at');
    }
}
