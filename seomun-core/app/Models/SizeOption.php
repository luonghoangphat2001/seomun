<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SizeOption extends Model
{
    use HasFactory;

    protected $table = 'erp_size_options';

    protected $fillable = [
        'name',
        'cutting_width',
        'cutting_height',
        'working_width',
        'working_height',
        'created_by',
    ];

    protected $casts = [
        'cutting_width' => 'integer',
        'cutting_height' => 'integer',
        'working_width' => 'integer',
        'working_height' => 'integer',
    ];

    public function erpOptions(): HasMany
    {
        return $this->hasMany(ErpOption::class, 'size_option_id');
    }

    /**
     * Get the user who created the size option.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    protected static function booted(): void
    {
        static::deleting(function (SizeOption $sizeOption) {
            $sizeOption->erpOptions->each->delete();
        });
    }
}
