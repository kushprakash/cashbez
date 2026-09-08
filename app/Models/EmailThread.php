<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailThread extends Model
{
    protected $fillable = [
        'subject',
        'participants',
        'last_email_id',
        'last_activity_at'
    ];

    protected $casts = [
        'participants' => 'array',
        'last_activity_at' => 'datetime',
    ];

    public function emails(): HasMany
    {
        return $this->hasMany(Email::class, 'thread_id')->orderBy('created_at');
    }

    public function lastEmail(): BelongsTo
    {
        return $this->belongsTo(Email::class, 'last_email_id');
    }

    public function getParticipantUsers()
    {
        return User::whereIn('id', $this->participants)->get();
    }

    public function addParticipant($userId)
    {
        $participants = $this->participants ?? [];
        if (!in_array($userId, $participants)) {
            $participants[] = $userId;
            $this->update(['participants' => $participants]);
        }
    }

    public function updateLastActivity($emailId)
    {
        $this->update([
            'last_email_id' => $emailId,
            'last_activity_at' => now()
        ]);
    }
}
