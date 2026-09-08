<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TxnCategory extends Model
{
    use HasFactory;

    protected $table = 'txn_categories';

    public $timestamps = false;

    protected $fillable = [
        'code',
        'label'
    ];

    /**
     * Get all passbook entries for this category
     */
    public function passbookEntries()
    {
        return $this->hasMany(Passbook::class, 'category_id');
    }
}
