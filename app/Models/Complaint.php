<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Complaint extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'complaints';
    protected $primaryKey = 'complaint_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'complaint_id',
        'user_id',
        'title',
        'description',
        'category',
        'priority',
        'status',
        'assigned_to',
        'created_by',
        'chat_thread_id',
        'resolved_at',
        'closed_at',
        'resolution_notes',
        'created_on',
        'updated_on'
    ];

    protected $casts = [
        'created_on' => 'datetime',
        'updated_on' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $dates = [
        'deleted_at',
        'resolved_at',
        'closed_at'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to', 'id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function comments()
    {
        return $this->hasMany(ComplaintComment::class, 'complaint_id', 'complaint_id')
            ->orderBy('created_at', 'asc');
    }

    public function attachments()
    {
        return $this->hasMany(ComplaintAttachment::class, 'complaint_id', 'complaint_id')
            ->whereNull('deleted_at');
    }

    public function actions()
    {
        return $this->hasMany(ComplaintAction::class, 'complaint_id', 'complaint_id')
            ->orderBy('created_at', 'desc');
    }

    public function chatThread()
    {
        return $this->belongsTo(ChatThread::class, 'chat_thread_id', 'thread_id');
    }

    public function linkedChatMessages()
    {
        return $this->belongsToMany(
            ChatMessage::class,
            'complaint_chat_links',
            'complaint_id',
            'message_id'
        )->withPivot(['link_type', 'linked_by', 'notes', 'linked_at']);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeCreatedBy($query, $userId)
    {
        return $query->where('created_by', $userId);
    }
}
