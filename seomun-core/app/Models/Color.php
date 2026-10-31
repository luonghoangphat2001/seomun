<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Color extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'r_value',
        'g_value',
        'b_value',
        'c_value',
        'm_value',
        'y_value',
        'k_value',
    ];

    protected $casts = [
        'r_value' => 'string',
        'g_value' => 'string',
        'b_value' => 'string',
        'c_value' => 'integer',
        'm_value' => 'integer',
        'y_value' => 'integer',
        'k_value' => 'integer',
    ];
}
