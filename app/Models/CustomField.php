<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomField extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'lead_type_id', 'field_name', 'field_type', 'options', 'required', 'admin_id', 'created_by', 'deleted_by'
    ];
    
    protected $casts = [
        'options' => 'array',
        'required' => 'boolean',
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
}
