<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BbpsCategory extends Model
{
    use HasFactory;

    protected $table = 'bbps_category';

    protected $fillable = [
        'name',
        'category',
        'label',
        'image',
        'user_id',
        'popular',
        'mobile_required',
        'is_mobile_required',
        'show_mobile',
        'has_mobile'
    ];
}
