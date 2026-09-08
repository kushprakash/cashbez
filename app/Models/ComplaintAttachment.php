<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComplaintAttachment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'complaint_attachments';
    protected $primaryKey = 'attachment_id';

    protected $fillable = [
        'complaint_id',
        'attachment_type',
        'file_url',
        'original_filename',
        'mime_type',
        'file_size',
        'thumbnail_url',
        'width',
        'height',
        'duration_sec',
        'chat_message_id',
        'chat_attachment_id',
        'uploaded_by',
        'uploaded_at'
    ];

    protected $casts = [
        'file_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'duration_sec' => 'integer',
        'uploaded_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public $timestamps = false;

    // Relationships
    public function complaint()
    {
        return $this->belongsTo(Complaint::class, 'complaint_id', 'complaint_id');
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by', 'mid');
    }

    public function chatMessage()
    {
        return $this->belongsTo(ChatMessage::class, 'chat_message_id', 'message_id');
    }
}
