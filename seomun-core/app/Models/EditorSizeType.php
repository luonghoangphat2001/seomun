<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EditorSizeType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'parent_id',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    public function allChildren(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order');
    }

    public function sizes(): HasMany
    {
        return $this->hasMany(EditorSize::class, 'editor_size_type_id')
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    public function allSizes(): HasMany
    {
        return $this->hasMany(EditorSize::class, 'editor_size_type_id')->orderBy('sort_order');
    }
}
