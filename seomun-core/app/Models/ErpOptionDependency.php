<?php

namespace App\Models;

use App\Enums\ErpOptionDependencyType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ErpOptionDependency extends Model
{
    use HasFactory;

    protected $table = 'erp_option_dependencies';

    protected $fillable = [
        'trigger_option_group_id',
        'trigger_option_id',
        'affected_option_group_id',
        'dependency_type',
        'allowed_options',
        'size_option_id',
    ];

    protected $casts = [
        'allowed_options' => 'array',
        'dependency_type' => ErpOptionDependencyType::class,
    ];

    public function triggerOptionGroup(): BelongsTo
    {
        return $this->belongsTo(ErpOptionGroup::class, 'trigger_option_group_id');
    }

    public function triggerOption(): BelongsTo
    {
        return $this->belongsTo(ErpOption::class, 'trigger_option_id');
    }

    public function affectedOptionGroup(): BelongsTo
    {
        return $this->belongsTo(ErpOptionGroup::class, 'affected_option_group_id');
    }

    public static function getAffectedOptions(int $triggerGroupId, int $triggerOptionId, int $affectedGroupId, ?int $sizeOptionId = null): ?array
    {
        $query = self::where('trigger_option_group_id', $triggerGroupId)
            ->where('trigger_option_id', $triggerOptionId)
            ->where('affected_option_group_id', $affectedGroupId);

        if ($sizeOptionId !== null) {
            $sizeSpecific = (clone $query)
                ->where('size_option_id', $sizeOptionId)
                ->first();

            if ($sizeSpecific) {
                return $sizeSpecific->allowed_options;
            }

            $generic = (clone $query)
                ->whereNull('size_option_id')
                ->first();

            return $generic ? $generic->allowed_options : null;
        }

        $dependency = $query
            ->whereNull('size_option_id')
            ->first();

        return $dependency ? $dependency->allowed_options : null;
    }

    public static function isGroupHidden(int $triggerGroupId, int $triggerOptionId, int $affectedGroupId, ?int $sizeOptionId = null): bool
    {
        $query = self::where('trigger_option_group_id', $triggerGroupId)
            ->where('trigger_option_id', $triggerOptionId)
            ->where('affected_option_group_id', $affectedGroupId)
            ->where('dependency_type', ErpOptionDependencyType::HIDE_GROUP);

        if ($sizeOptionId !== null) {
            $sizeSpecific = (clone $query)
                ->where('size_option_id', $sizeOptionId)
                ->first();

            if ($sizeSpecific) {
                return true;
            }

            $generic = (clone $query)
                ->whereNull('size_option_id')
                ->first();

            return $generic !== null;
        }

        return $query->whereNull('size_option_id')->exists();
    }
}