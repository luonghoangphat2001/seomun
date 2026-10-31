<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EditorSize extends Model
{
    use HasFactory;

    protected $fillable = [
        'editor_size_type_id',
        'name',
        'width',
        'height',
        'unit',
        'thumbnail_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'width' => 'integer',
        'height' => 'integer',
    ];

    public function sizeType(): BelongsTo
    {
        return $this->belongsTo(EditorSizeType::class, 'editor_size_type_id');
    }

    public function templates(): BelongsToMany
    {
        return $this->belongsToMany(Template::class, 'editor_size_template')
            ->withTimestamps();
    }
}
