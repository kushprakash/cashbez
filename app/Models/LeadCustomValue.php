<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeadCustomValue extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'lead_id', 'custom_field_id', 'value', 'admin_id', 'created_by', 'deleted_by'
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

    public function customField()
    {
        return $this->belongsTo(CustomField::class);
    }
}
