<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplaintChatLink extends Model
{
    use HasFactory;

    protected $table = 'complaint_chat_links';
    protected $primaryKey = 'link_id';

    protected $fillable = [
        'complaint_id',
        'message_id',
        'link_type', // 'TRIGGER', 'CONTEXT', 'RESOLUTION', 'UPDATE'
        'linked_by',
        'notes',
        'linked_at'
    ];

    protected $casts = [
        'linked_at' => 'datetime',
    ];

    public $timestamps = false;

    // Relationships
    public function complaint()
    {
        return $this->belongsTo(Complaint::class, 'complaint_id', 'complaint_id');
    }

    public function message()
    {
        return $this->belongsTo(ChatMessage::class, 'message_id', 'message_id');
    }

    public function linkedBy()
    {
        return $this->belongsTo(User::class, 'linked_by', 'mid');
    }
}
