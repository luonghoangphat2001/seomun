<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ErpOptionCondition extends Model
{
    use HasFactory;

    protected $table = 'erp_option_conditions';

    protected $fillable = [
        'option_group_id',
        'option_id',
        'condition_type',
        'condition_expression',
    ];

    public function optionGroup(): BelongsTo
    {
        return $this->belongsTo(ErpOptionGroup::class, 'option_group_id');
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(ErpOption::class, 'option_id');
    }

    public static function shouldHide(string $orderCode, int $optionGroupId, int $optionId): bool
    {
        $condition = self::where(function ($query) use ($orderCode) {
            $query->where('order_code', $orderCode)
                ->orWhereNull('order_code');
        })
            ->where('option_group_id', $optionGroupId)
            ->where('option_id', $optionId)
            ->where('condition_type', 'hide')
            ->orderBy('order_code', 'desc')
            ->first();

        if ($condition) {
            return self::evaluateCondition($orderCode, $condition->condition_expression);
        }

        return false;
    }

    protected static function evaluateCondition(string $orderCode, string $expression): bool
    {
        // Implement logic to evaluate the condition (e.g. check range, contains value, ...)
        // Can be extended to support different types of conditions
        if (str_starts_with($expression, 'order_code_range:')) {
            $range = str_replace('order_code_range:', '', $expression);
            [$min, $max] = explode('-', $range);

            return $orderCode >= $min && $orderCode <= $max;
        }

        if (str_starts_with($expression, 'option_value_contains:')) {
            $value = str_replace('option_value_contains:', '', $expression);

            return str_contains($orderCode, $value);
        }

        return false;
    }
}
