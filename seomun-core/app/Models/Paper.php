<?php

namespace App\Models;

use App\Enums\PaperCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Paper extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category',
        'manufacturer',
        'name',
        'specification',
        'pattern',
        'paper_type_option_value_id',
        'paper_color_option_value_id',
        'paper_weight_option_value_id',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'specification' => 'array',
        'category' => PaperCategory::class,
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function erpOptions(): HasMany
    {
        return $this->hasMany(ErpOption::class, 'paper_id');
    }

    public function paperTypeOption(): BelongsTo
    {
        return $this->belongsTo(ErpOption::class, 'paper_type_option_value_id');
    }

    public function paperColorOption(): BelongsTo
    {
        return $this->belongsTo(ErpOption::class, 'paper_color_option_value_id');
    }

    public function paperWeightOption(): BelongsTo
    {
        return $this->belongsTo(ErpOption::class, 'paper_weight_option_value_id');
    }

    public function paperPrices(): HasMany
    {
        return $this->hasMany(PaperPrice::class, 'paper_id');
    }

    protected static function booted(): void
    {
        static::deleting(function (Paper $paper) {
            $paper->paperPrices()->delete();

            foreach ($paper->erpOptions as $erpOption) {
                $erpOption->delete();
            }
        });
    }
}
