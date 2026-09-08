<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeadSource extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'name', 'lead_type_id', 'admin_id', 'created_by', 'deleted_by'
    ];

    protected $dates = ['deleted_at'];

    // Relationships
    public function leadType()
    {
        return $this->belongsTo(LeadType::class, 'lead_type_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}

