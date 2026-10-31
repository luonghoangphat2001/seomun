<?php

namespace App\Models;

use App\Models\ErpOptionGroup;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductOptionGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'erp_option_group_id',
        'code',
        'name',
        'display_type',
        'is_required',
        'info_icon_enabled',
        'info_content',
        'product_option_group_tab',
        'sort_order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'info_icon_enabled' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function erpOptionGroup(): BelongsTo
    {
        return $this->belongsTo(ErpOptionGroup::class, 'erp_option_group_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(ProductOption::class, 'option_group_id')
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    public function allOptions(): HasMany
    {
        return $this->hasMany(ProductOption::class, 'option_group_id')
            ->orderBy('sort_order');
    }

    public static function updateErpOptionGroupIdByMatchingCode(): void
    {
        $groups = self::all();

        foreach ($groups as $group) {
            $erpOptionGroup = ErpOptionGroup::where('code', $group->code)->first();

            if ($erpOptionGroup && $group->erp_option_group_id !== $erpOptionGroup->id) {
                $group->erp_option_group_id = $erpOptionGroup->id;
                $group->save();
            }
        }
    }
}
