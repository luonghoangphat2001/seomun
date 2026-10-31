<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OutsourcingCompany extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'work_details',
        'representative_name',
        'registration_number',
        'registration_certificate',
        'email',
        'contact',
        'address',
        'memo',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
