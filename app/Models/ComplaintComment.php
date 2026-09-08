<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplaintComment extends Model
{
    use HasFactory;

    protected $table = 'complaint_comments';
    protected $primaryKey = 'comment_id';

    protected $fillable = [
        'complaint_id',
        'comment_text',
        'commented_by',
        'is_internal',
        'created_at'
    ];

    protected $casts = [
        'is_internal' => 'boolean',
        'created_at' => 'datetime',
    ];

    public $timestamps = false;

    // Relationships
    public function complaint()
    {
        return $this->belongsTo(Complaint::class, 'complaint_id', 'complaint_id');
    }

    public function commentedBy()
    {
        return $this->belongsTo(User::class, 'commented_by', 'id');
    }
}
