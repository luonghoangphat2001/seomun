<?php

namespace App\Services;

use App\Enums\ErpOptionDependencyType;
use App\Models\ErpOption;
use App\Models\ErpOptionDependency;
use App\Models\ErpOptionGroup;
use App\Models\Product;
use Illuminate\Support\Collection;

class ProductConfiguratorService
{
    protected array $groupIdByCode = [];

    protected array $groupCodeById = [];

    protected array $allGroups = [];

    public function initialize(int $productId, array $selectedOptions = []): array
    {
        $product = Product::find($productId);
        if (! $product) {
            throw new \RuntimeException('제품을 찾을 수 없습니다.');
        }

        $this->loadGroupMappings($product);

        if (empty($selectedOptions)) {
            $selectedOptions = $this->getDefaultSelectedOptions($product);
        }

        $erpOptionGroups = $this->getErpOptionGroups($product);
        $processedGroups = $this->processGroups($erpOptionGroups, $selectedOptions);

        $selectedOptions = $this->resolveSelectedOptionsFromProcessedGroups($processedGroups, $selectedOptions);

        $resultSelectedOptions = $this->formatSelectedOptionsByCode($selectedOptions);

        return [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'selected_options' => $resultSelectedOptions,
            'erp_option_groups' => $processedGroups,
        ];
    }

    protected function resolveSelectedOptionsFromProcessedGroups(array $processedGroups, array $selectedOptions): array
    {
        $resolved = $selectedOptions;

        foreach ($processedGroups as $group) {
            $groupCode = $group['code'];
            $options = $group['options'];

            if (! empty($options) && isset($resolved[$groupCode])) {
                $currentOptionId = $resolved[$groupCode];
                $optionIds = array_column($options, 'id');

                if (! in_array($currentOptionId, $optionIds)) {
                    $resolved[$groupCode] = $options[0]['id'];
                }
            }
        }

        return $resolved;
    }

    public function resolve(int $productId, string $changedGroupCode, array $selectedOptions): array
    {
        $product = Product::find($productId);
        if (! $product) {
            throw new \RuntimeException('제품을 찾을 수 없습니다.');
        }

        $this->loadGroupMappings($product);

        $changedGroupId = $this->groupIdByCode[$changedGroupCode] ?? null;
        if (! $changedGroupId) {
            throw new \RuntimeException('변경된 그룹을 찾을 수 없습니다.');
        }

        $changedOptionId = $selectedOptions[$changedGroupCode] ?? null;
        if (! $changedOptionId) {
            throw new \RuntimeException('선택된 옵션을 찾을 수 없습니다.');
        }
        $affectedGroupIds = $this->getAffectedGroupIds($changedGroupId, (int) $changedOptionId);
        $affectedGroupIds = array_unique($affectedGroupIds);

        $resolvedOptions = $selectedOptions;
        $affectedGroups = [];
        $alreadyAffected = [];

        foreach ($affectedGroupIds as $groupId) {
            $groupCode = $this->groupCodeById[$groupId] ?? null;
            if (! $groupCode || isset($alreadyAffected[$groupId])) {
                continue;
            }

            $group = $this->allGroups[$groupId] ?? null;
            if (! $group) {
                continue;
            }

            $alreadyAffected[$groupId] = true;

            $isHidden = ErpOptionDependency::isGroupHidden($changedGroupId, (int) $changedOptionId, $groupId);

            $dependency = ErpOptionDependency::where('trigger_option_group_id', $changedGroupId)
                ->where('trigger_option_id', (int) $changedOptionId)
                ->where('affected_option_group_id', $groupId)
                ->where('dependency_type', ErpOptionDependencyType::FILTER_OPTIONS)
                ->first();

            $previousValue = $resolvedOptions[$groupCode] ?? null;

            $allOptions = $group->erpOptions;
            $filteredOptions = $allOptions;

            if ($dependency && ! empty($dependency->allowed_options)) {
                $allowedIds = $dependency->allowed_options;
                $filteredOptions = $allOptions->filter(fn ($opt) => in_array($opt->id, $allowedIds))->values();
            }

            $firstOption = $filteredOptions->first();

            if ($firstOption && ! $isHidden) {
                $resolvedOptions[$groupCode] = $firstOption->id;
            }

            $optionsToReturn = $dependency && ! empty($dependency->allowed_options)
                ? $filteredOptions
                : $allOptions;

            $affectedGroups[] = [
                'id' => $group->id,
                'code' => $group->code,
                'label' => $group->label,
                'type' => $group->type,
                'display_type' => $group->display_type,
                'is_required' => $group->is_required,
                'sort_order' => $group->sort_order,
                'is_hidden' => $isHidden,
                'previous_value' => $previousValue,
                'new_value' => $firstOption?->id,
                'options' => $optionsToReturn->map(fn ($opt) => [
                    'id' => $opt->id,
                    'code' => $opt->code,
                    'label' => $opt->label,
                    'value' => $opt->value,
                    'additional_price' => (float) $opt->additional_price,
                    'sort_order' => $opt->sort_order,
                    'is_active' => $opt->is_active,
                ])->toArray(),
            ];
        }

        $resultSelectedOptions = $this->formatSelectedOptionsByCode($resolvedOptions);

        return [
            'product_id' => $product->id,
            'changed_group' => [
                'code' => $changedGroupCode,
                'id' => $changedGroupId,
                'selected_option_id' => $changedOptionId,
            ],
            'selected_options' => $resultSelectedOptions,
            'affected_groups' => $affectedGroups,
        ];
    }

    protected function loadGroupMappings(Product $product): void
    {
        $this->groupIdByCode = [];
        $this->groupCodeById = [];
        $this->allGroups = [];

        $product->erpOptions()
            ->with('erpOptionGroup')
            ->get()
            ->groupBy('erp_option_group_id')
            ->each(function ($options) {
                $group = $options->first()->erpOptionGroup;
                $this->groupIdByCode[$group->code] = (int) $group->id;
                $this->groupCodeById[(int) $group->id] = $group->code;
                $this->allGroups[(int) $group->id] = $group;
            });
    }

    protected function getDefaultSelectedOptions(Product $product): array
    {
        $defaults = [];

        $product->erpOptions()
            ->with('erpOptionGroup')
            ->get()
            ->groupBy('erp_option_group_id')
            ->each(function ($options) use (&$defaults) {
                $group = $options->first()->erpOptionGroup;
                $firstOption = $group->erpOptions->first();
                if ($firstOption) {
                    $defaults[$group->code] = $firstOption->id;
                }
            });

        return $defaults;
    }

    protected function getErpOptionGroups(Product $product): Collection
    {
        return $product->erpOptions()
            ->with('erpOptionGroup')
            ->get()
            ->groupBy('erp_option_group_id')
            ->map(fn ($options) => $options->first()->erpOptionGroup)
            ->values();
    }

    protected function processGroups(Collection $erpOptionGroups, array $selectedOptions): array
    {
        return $erpOptionGroups->map(function ($group) use ($selectedOptions) {
            $options = $group->erpOptions;

            $filteredOptions = $this->filterOptionsByDependencies($group->id, $selectedOptions, $options);
            $isHidden = $this->isGroupHidden($group->id, $selectedOptions);

            return [
                'id' => $group->id,
                'code' => $group->code,
                'label' => $group->label,
                'type' => $group->type,
                'display_type' => $group->display_type,
                'is_required' => $group->is_required,
                'sort_order' => $group->sort_order,
                'is_hidden' => $isHidden,
                'options' => $filteredOptions->map(fn ($opt) => [
                    'id' => $opt->id,
                    'code' => $opt->code,
                    'label' => $opt->label,
                    'value' => $opt->value,
                    'additional_price' => (float) $opt->additional_price,
                    'sort_order' => $opt->sort_order,
                    'is_active' => $opt->is_active,
                ])->toArray(),
            ];
        })->filter(fn ($group) => ! $group['is_hidden'])->values()->toArray();
    }

    protected function filterOptionsByDependencies(int $groupId, array $selectedOptions, Collection $allOptions): Collection
    {
        $allowedOptionIds = null;

        foreach ($selectedOptions as $groupCode => $optionId) {
            $triggerGroupId = $this->groupIdByCode[$groupCode] ?? null;
            if (! $triggerGroupId) {
                continue;
            }

            $dependency = ErpOptionDependency::where('trigger_option_group_id', $triggerGroupId)
                ->where('trigger_option_id', (int) $optionId)
                ->where('affected_option_group_id', $groupId)
                ->where('dependency_type', ErpOptionDependencyType::FILTER_OPTIONS)
                ->first();

            if ($dependency) {
                $allowedOptionIds = $dependency->allowed_options;
                break;
            }
        }

        if ($allowedOptionIds !== null) {
            return $allOptions->filter(fn ($opt) => in_array($opt->id, $allowedOptionIds))->values();
        }

        return $allOptions;
    }

    protected function isGroupHidden(int $groupId, array $selectedOptions): bool
    {
        foreach ($selectedOptions as $groupCode => $optionId) {
            $triggerGroupId = $this->groupIdByCode[$groupCode] ?? null;
            if (! $triggerGroupId) {
                continue;
            }

            $isHidden = ErpOptionDependency::isGroupHidden($triggerGroupId, (int) $optionId, $groupId);
            if ($isHidden) {
                return true;
            }
        }

        return false;
    }

    protected function formatSelectedOptionsByCode(array $selectedOptions): array
    {
        $optionIds = array_values($selectedOptions);

        return ErpOption::with('erpOptionGroup')
            ->whereIn('id', $optionIds)
            ->get()
            ->mapWithKeys(function ($option) {
                return [$option->erpOptionGroup->code => $option->id];
            })
            ->toArray();
    }

    protected function getAffectedGroupIds(int $changedGroupId, int $changedOptionId): array
    {
        return ErpOptionDependency::where('trigger_option_group_id', $changedGroupId)
            ->where('trigger_option_id', $changedOptionId)
            ->pluck('affected_option_group_id')
            ->toArray();
    }
}