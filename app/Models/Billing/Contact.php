<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $table = 'contacts';

    protected $fillable = ['user_id', 'contacts'];

    /**
     * The `contacts` column is a JSON array of
     * [{name: string, phones: [{number: string, label: string}]}]
     */
    protected $casts = [
        'contacts' => 'array',
    ];
}
