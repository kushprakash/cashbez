<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailRecipient extends Model
{
    protected $fillable = [
        'email_id',
        'user_id',
        'recipient_type',
        'folder_type',
        'is_read',
        'is_starred',
        'is_deleted',
        'read_at',
        'deleted_at'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'is_starred' => 'boolean',
        'is_deleted' => 'boolean',
        'read_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function email(): BelongsTo
    {
        return $this->belongsTo(Email::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
