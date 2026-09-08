<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessageReceipt extends Model
{
    use HasFactory;

    protected $table = 'chat_message_receipts';
    
    // No auto-increment primary key, uses composite key (message_id, user_id)
    public $incrementing = false;
    protected $primaryKey = null;

    protected $fillable = [
        'message_id',
        'user_id',
        'status', // 'delivered', 'read'
        'delivered_at',
        'read_at'
    ];

    protected $casts = [
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    public $timestamps = false;

    // Relationships
    public function message()
    {
        return $this->belongsTo(ChatMessage::class, 'message_id', 'message_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
