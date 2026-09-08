<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeadTransferLog extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'lead_id', 'from_user_id', 'to_user_id', 'reason', 'admin_id', 'created_by', 'deleted_by'
    ];

    protected $dates = ['deleted_at'];

    // Relationships
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }
}
