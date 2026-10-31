<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UploadArtwork extends Model
{
    use HasFactory;

    protected $table = 'upload_art_works';

    protected $fillable = [
        'design_group_id',
        'url',
        'name',
        'size',
        'mime',
        'metadata',
        'print_as_is',
        'print_without_proof',
    ];

    protected $casts = [
        'metadata' => 'array',
        'print_as_is' => 'boolean',
        'print_without_proof' => 'boolean',
    ];

    public function designGroup(): BelongsTo
    {
        return $this->belongsTo(DesignGroup::class);
    }
}