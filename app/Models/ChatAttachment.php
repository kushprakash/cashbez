<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatAttachment extends Model
{
    use HasFactory;

    protected $table = 'chat_attachments';
    protected $primaryKey = 'attachment_id';

    protected $fillable = [
        'message_id',
        'file_url',
        'file_name',
        'mime_type',
        'file_size',
        'thumbnail_url',
        'width',
        'height',
        'duration_sec',
        'uploaded_at'
    ];

    protected $casts = [
        'file_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'duration_sec' => 'integer',
        'uploaded_at' => 'datetime',
    ];

    public $timestamps = false;

    // Relationships
    public function message()
    {
        return $this->belongsTo(ChatMessage::class, 'message_id', 'message_id');
    }
}
