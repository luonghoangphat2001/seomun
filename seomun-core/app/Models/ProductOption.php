<?php

namespace App\Models;

use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use App\Enums\ErpOptionGroupType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductOption extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'option_group_id',
        'erp_option_id',
        'option_code',
        'field_name',
        'category',
        'label',
        'value',
        'additional_price',
        'metadata',
        'sort_order',
        'is_active',
        'deleted_by',
    ];

    protected $casts = [
        'additional_price' => 'integer',
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(ProductOptionGroup::class, 'option_group_id');
    }

    public function erpOption(): BelongsTo
    {
        return $this->belongsTo(ErpOption::class, 'erp_option_id');
    }

    public function deletedByUser()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    protected static function booted()
    {
        static::deleting(function ($model) {
            if (! $model->isForceDeleting()) {
                $userId = auth()->user()?->id;

                if (is_numeric($userId)) {
                    $model->deleted_by = $userId;
                    $model->saveQuietly();
                }
            }
        });
    }

    public static function updateErpOptionIdForPostProcessing(): void
    {
        $postProcessingGroupIds = ErpOptionGroup::where('type', ErpOptionGroupType::POST_PROCESSING)
            ->pluck('id')
            ->toArray();

        $productOptionGroupIds = ProductOptionGroup::whereIn('erp_option_group_id', $postProcessingGroupIds)
            ->pluck('id')
            ->toArray();

        $productOptions = static::whereIn('option_group_id', $productOptionGroupIds)->get();

        foreach ($productOptions as $productOption) {
            $erpOption = ErpOption::where('label', $productOption->label)
                ->where('value', $productOption->value)
                ->first();

            if ($erpOption && $productOption->erp_option_id !== $erpOption->id) {
                $productOption->erp_option_id = $erpOption->id;
                $productOption->saveQuietly();
            }
        }
    }
}
