<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class EmailAttachment extends Model
{
    protected $fillable = [
        'email_id',
        'original_name',
        'stored_name',
        'file_path',
        'mime_type',
        'file_size'
    ];

    public function email(): BelongsTo
    {
        return $this->belongsTo(Email::class);
    }

    public function getDownloadUrlAttribute()
    {
        return route('api.emails.attachments.download', $this->id);
    }

    public function getFileSizeHumanAttribute()
    {
        $size = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }
        
        return round($size, 2) . ' ' . $units[$i];
    }

    public function delete()
    {
        // Delete the physical file
        if (Storage::exists($this->file_path)) {
            Storage::delete($this->file_path);
        }
        
        return parent::delete();
    }
}
