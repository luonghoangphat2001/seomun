<?php

namespace App\Models;

use App\Enums\StorePermissionScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StorePermission extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'permission_scope',
        'permission_type',
        'notes',
    ];

    protected $casts = [
        'permission_scope' => StorePermissionScope::class,
        'permission_type' => 'array',
    ];
}
