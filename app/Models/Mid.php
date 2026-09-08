<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mid extends Model
{
    protected $fillable = [
        'mid',
        'status'
    ];

    protected $casts = [
        'status' => 'integer'
    ];

    /**
     * Check if the MID is used
     */
    public function isUsed()
    {
        return $this->status === 1;
    }

    /**
     * Check if the MID is not used
     */
    public function isNotUsed()
    {
        return $this->status === 0;
    }

    /**
     * Mark MID as used
     */
    public function markAsUsed()
    {
        $this->update(['status' => 1]);
    }

    /**
     * Mark MID as not used
     */
    public function markAsNotUsed()
    {
        $this->update(['status' => 0]);
    }

    /**
     * Scope to get only used MIDs
     */
    public function scopeUsed($query)
    {
        return $query->where('status', 1);
    }

    /**
     * Scope to get only not used MIDs
     */
    public function scopeNotUsed($query)
    {
        return $query->where('status', 0);
    }
}
