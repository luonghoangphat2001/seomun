<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class UnitPrice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'erp_size_option_id',
        'erp_paper_option_id',
        'product_id',
        'combination_options',
        'is_active',
        'erp_subject_master_option_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'combination_options' => 'array',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(UnitPriceItem::class, 'unit_price_id')
            ->where('is_active', true);
    }

    public function allItems(): HasMany
    {
        return $this->hasMany(UnitPriceItem::class, 'unit_price_id');
    }

    public function erpSizeOption(): BelongsTo
    {
        return $this->belongsTo(ErpOption::class, 'erp_size_option_id');
    }

    public function erpPaperOption(): BelongsTo
    {
        return $this->belongsTo(ErpOption::class, 'erp_paper_option_id');
    }

    public function subjectMasterOption(): BelongsTo
    {
        return $this->belongsTo(ErpOption::class, 'erp_subject_master_option_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }


    protected static function booted(): void
    {
        static::deleting(function (UnitPrice $unitPrice) {
            $unitPrice->items()->delete();
        });
    }
}
