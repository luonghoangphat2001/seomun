<?php

namespace App\Services\Pricing;

use App\Enums\ErpOptionGroupCode;
use App\Enums\ErpOptionDependencyType;
use App\Models\ErpOptionDependency;
use App\Models\ErpOption;
use App\Models\PostProcessingPrice;
use App\Models\PrintingPrice;
use App\Models\Product;
use App\Services\Pricing\Formulas\AreaUnitPricingFormula;
use App\Services\Pricing\Formulas\GenneralBannerPricingFormula;
use App\Services\Pricing\Formulas\PaperPrintPricingFormula;
use App\Services\Pricing\Formulas\UnitTierPricingFormula;
use Illuminate\Validation\ValidationException;

/** Verifies that every customer-selectable configuration can be quoted. */
class PricingCoverageService
{
    public function validate(Product $product): void
    {
        $product->loadMissing(['pricingProfile', 'optionGroups.options.erpOption.size', 'productSets']);
        if (! $product->pricingProfile || ! $product->pricingProfile->is_active) {
            throw ValidationException::withMessages(['pricing_profile_id' => '활성 Pricing Profile을 선택해 주세요.']);
        }
        $this->validateProfileContract($product);

        $combinations = $this->combinations($product);
        if ($combinations === []) {
            throw ValidationException::withMessages(['option_groups' => '현재 ERP dependency 조건으로 고객이 선택 가능한 옵션 조합이 없습니다.']);
        }
        $quantities = $this->quantities($product);
        $missing = [];
        foreach ($combinations as $selection) {
            foreach ($quantities as $quantity) {
                $basePrice = $this->price($product, $selection, $quantity);
                $missingPostProcessing = $this->missingPostProcessing($selection, $quantity);

                if ($basePrice <= 0 || $missingPostProcessing !== []) {
                    $missing[] = [
                        'quantity' => $quantity,
                        'options' => $selection,
                        'missing' => array_values(array_filter([
                            $basePrice <= 0 ? 'base_price' : null,
                            $missingPostProcessing !== [] ? 'post_processing_price' : null,
                        ])),
                        'post_processing' => $missingPostProcessing,
                    ];
                    if (count($missing) >= 25) { break 2; }
                }
            }
        }
        if ($missing !== []) {
            $calculatorType = $product->pricingProfile->calculator_type->value;
            $message = $this->coverageMessage($calculatorType, $missing);

            throw ValidationException::withMessages([
                'pricing_coverage' => [$message, 'missing' => $missing],
            ]);
        }
    }

    private function validateProfileContract(Product $product): void
    {
        $settings = $product->pricingProfile->settings ?? [];
        $structure = $product->pricing_structure?->value ?? $product->pricing_structure;
        $supported = $settings['supported_structures'] ?? ['single', 'cover_inner'];
        if (! in_array($structure, $supported, true)) {
            throw ValidationException::withMessages(['pricing_structure' => 'Pricing Profile이 선택한 product structure를 지원하지 않습니다.']);
        }
        $codes = $product->optionGroups->pluck('code')->all();
        if (isset($settings['allowed_option_group_codes'])) {
            $unsupported = array_values(array_diff($codes, $settings['allowed_option_group_codes']));
            if ($unsupported !== []) {
                throw ValidationException::withMessages(['option_groups' => 'Pricing Profile이 지원하지 않는 옵션 그룹입니다: '.implode(', ', $unsupported)]);
            }
        }
        foreach ($settings['required_option_group_codes'] ?? [] as $code) {
            if (! in_array($code, $codes, true)) {
                throw ValidationException::withMessages(['option_groups' => "Pricing Profile에 필요한 옵션 그룹이 없습니다: {$code}"]);
            }
        }
        if ($structure === 'cover_inner') {
            foreach ([
                ErpOptionGroupCode::COVER_PAPER->value,
                ErpOptionGroupCode::INNER_PAPER->value,
                ErpOptionGroupCode::PRINTED_COVER_SIDE->value,
                ErpOptionGroupCode::PRINTED_INNER_SIDE->value,
            ] as $code) {
                if (! in_array($code, $codes, true)) {
                    throw ValidationException::withMessages(['option_groups' => "Cover/Inner 구조에는 {$code} 옵션 그룹이 필요합니다."]);
                }
            }
        }
        if ($product->pricingProfile->calculator_type->value === 'paper_print') {
            $this->validatePaperPrintSections($product, $structure, $settings);
        }
    }

    /** Ensure each Product section has one complete, reusable production rate. */
    private function validatePaperPrintSections(Product $product, string $structure, array $settings): void
    {
        $sections = $settings['sections'] ?? [];
        $sectionNames = $structure === 'cover_inner' ? ['cover', 'inner'] : ['single'];
        $groups = $product->optionGroups->keyBy('code');
        foreach ($sectionNames as $name) {
            $section = $sections[$name] ?? null;
            if (! is_array($section)) {
                throw ValidationException::withMessages(['pricing_profile_id' => "Paper/Print Profile에는 {$name} section 설정이 필요합니다."]);
            }
            foreach (['paper_option_group', 'printing_price_id'] as $field) {
                if (empty($section[$field])) {
                    throw ValidationException::withMessages(['pricing_profile_id' => "Paper/Print {$name} section의 {$field} 설정이 필요합니다."]);
                }
            }
            if (! $groups->has($section['paper_option_group'])) {
                throw ValidationException::withMessages(['option_groups' => "{$name} section의 paper option group이 Product에 없습니다."]);
            }
            if (! empty($section['side_option_group']) && ! $groups->has($section['side_option_group'])) {
                throw ValidationException::withMessages(['option_groups' => "{$name} section의 printed-side option group이 Product에 없습니다."]);
            }
            $printing = PrintingPrice::query()
                ->whereKey($section['printing_price_id'])
                ->where('is_hot_deal', false)
                ->first();
            if (! $printing?->paper_size_division_code) {
                throw ValidationException::withMessages(['pricing_profile_id' => "Paper/Print {$name} section의 Printing Price에는 paper_size_division_code가 필요합니다."]);
            }
        }
    }

    private function price(Product $product, array $options, int $quantity): int
    {
        $formula = match ($product->pricingProfile->calculator_type->value) {
            'unit_tier' => app(UnitTierPricingFormula::class),
            'area_unit' => app(AreaUnitPricingFormula::class),
            'matrix' => app(GenneralBannerPricingFormula::class),
            'paper_print' => app(PaperPrintPricingFormula::class),
        };
        return $formula->calculate($product->id, $options, $quantity, 1);
    }

    private function missingPostProcessing(array $selection, int $quantity): array
    {
        $missing = [];
        foreach ([
            ErpOptionGroupCode::COATED,
            ErpOptionGroupCode::OSHI,
            ErpOptionGroupCode::ROUNDING,
            ErpOptionGroupCode::PERFORATION,
            ErpOptionGroupCode::GROUNDING,
            ErpOptionGroupCode::NUMBERING,
            ErpOptionGroupCode::DOMUSONG,
            ErpOptionGroupCode::FOUNDATION,
        ] as $code) {
            $key = strtolower($code->value);
            $optionId = $selection[$key] ?? null;
            if (! $optionId) { continue; }
            if ($this->isNoOpPostProcessing((int) $optionId)) { continue; }
            $rule = PostProcessingPrice::with('postProcessingPriceItems')
                ->where('code', $code->value)
                ->where('erp_option_id', $optionId)
                ->where('is_active', true)
                ->first();
            if (! $rule || ! $rule->postProcessingPriceItems->where('quantity', '<=', $quantity)->isNotEmpty()) {
                $missing[] = [
                    'code' => $code->value,
                    'erp_option_id' => (int) $optionId,
                    'quantity' => $quantity,
                ];
            }
        }

        return $missing;
    }

    private function coverageMessage(string $calculatorType, array $missing): string
    {
        if ($calculatorType !== 'paper_print') {
            return in_array($calculatorType, ['unit_tier', 'area_unit'], true)
                ? '선택한 옵션 조합에 적용 가능한 Unit Price Settings가 없습니다.'
                : '선택한 옵션 조합에 적용 가능한 가격 설정이 없습니다.';
        }

        $baseMissing = collect($missing)
            ->filter(fn (array $item): bool => in_array('base_price', $item['missing'] ?? [], true))
            ->pluck('options')
            ->map(fn (array $options): string => collect([
                isset($options['paper']) ? 'paper='.$options['paper'] : null,
                isset($options['size']) ? 'size='.$options['size'] : null,
                isset($options['printed_side']) ? 'printed_side='.$options['printed_side'] : null,
            ])->filter()->join(', '))
            ->filter()
            ->unique()
            ->take(5)
            ->values()
            ->join('; ');

        $postProcessingMissing = collect($missing)
            ->pluck('post_processing')
            ->flatten(1)
            ->map(fn (array $item): string => $item['code'].'='.$item['erp_option_id'].' (quantity '.$item['quantity'].')')
            ->unique()
            ->take(5)
            ->values()
            ->join('; ');

        $messages = [];
        if ($baseMissing !== '') {
            $messages[] = "기본 인쇄 단가가 없습니다. Paper Price/Printing Price를 확인해 주세요: {$baseMissing}";
        }
        if ($postProcessingMissing !== '') {
            $messages[] = "후가공 단가가 없습니다. Post-processing Price를 확인해 주세요: {$postProcessingMissing}";
        }

        return implode(' ', $messages) ?: '선택한 용지/인쇄 조합에 적용 가능한 단가가 없습니다.';
    }

    /** An explicit “none” option is selectable but intentionally has no charge. */
    private function isNoOpPostProcessing(int $optionId): bool
    {
        $option = ErpOption::find($optionId);
        if (! $option) { return false; }
        return in_array(mb_strtolower(trim((string) ($option->value ?: $option->label))), ['none', 'no', '없음', '해당없음'], true);
    }

    private function quantities(Product $product): array
    {
        $set = $product->productSets;
        if (! $set) { return [max(1, (int) $product->min_quantity)]; }
        if ($set->set_type === 'select') {
            return collect($set->select_options ?? [])->pluck('value')->map(fn ($v) => (int) $v)->filter(fn ($v) => $v > 0)->unique()->values()->all() ?: [1];
        }
        // Tier-based calculators scale from the minimum supported quantity.  The
        // lower bound is therefore sufficient for a continuous input range.
        return [max(1, (int) ($set->min_set ?? $set->quantity ?? 1))];
    }

    private function combinations(Product $product): array
    {
        $groups = $product->optionGroups->filter(fn ($group) => $group->options->isNotEmpty())->values();
        $result = [[]];
        foreach ($groups as $group) {
            $next = [];
            foreach ($result as $prefix) {
                foreach ($group->options as $option) {
                    if (! $option->erp_option_id) { continue; }
                    $value = $prefix;
                    $value[$group->code] = $option->erp_option_id;
                    if ($group->code === ErpOptionGroupCode::SIZE->value && $option->erpOption?->size) {
                        $value['width'] = $option->erpOption->size->cutting_width;
                        $value['height'] = $option->erpOption->size->cutting_height;
                    }
                    $next[] = $value;
                    if (count($next) > 10000) {
                        throw ValidationException::withMessages(['option_groups' => '가격 검증 조합이 10,000개를 초과합니다. 옵션 dependency 또는 profile 허용 그룹을 좁혀 주세요.']);
                    }
                }
            }
            $result = $next ?: $result;
        }
        return collect($result ?: [[]])
            ->filter(fn (array $selection) => $this->isSelectableCombination($product, $selection))
            ->flatMap(fn (array $selection) => $this->withCustomSizeSamples($product, $selection))
            ->values()
            ->all();
    }

    /** Include each allowed custom-size boundary in the same coverage validation. */
    private function withCustomSizeSamples(Product $product, array $selection): array
    {
        $custom = $product->pricingProfile->settings['custom_size'] ?? [];
        if (! ($custom['enabled'] ?? false)) {
            return [$selection];
        }
        $widths = array_filter([(int) ($custom['min_width_mm'] ?? 0), (int) ($custom['max_width_mm'] ?? 0)]);
        $heights = array_filter([(int) ($custom['min_height_mm'] ?? 0), (int) ($custom['max_height_mm'] ?? 0)]);
        if ($widths === [] || $heights === []) {
            throw ValidationException::withMessages(['pricing_profile_id' => 'Custom size profile에는 최소/최대 너비와 높이가 필요합니다.']);
        }
        $samples = [$selection];
        foreach (array_unique($widths) as $width) {
            foreach (array_unique($heights) as $height) {
                $samples[] = array_merge($selection, ['width' => $width, 'height' => $height]);
            }
        }
        return $samples;
    }

    /** Apply the same ERP dependency constraints that the configurator exposes. */
    private function isSelectableCombination(Product $product, array $selection): bool
    {
        $groupIdsByCode = $product->optionGroups->pluck('erp_option_group_id', 'code')->filter()->all();
        foreach ($selection as $triggerCode => $triggerOptionId) {
            $triggerGroupId = $groupIdsByCode[$triggerCode] ?? null;
            if (! $triggerGroupId || ! is_int($triggerOptionId)) { continue; }
            $dependencies = ErpOptionDependency::query()
                ->where('trigger_option_group_id', $triggerGroupId)
                ->where('trigger_option_id', $triggerOptionId)
                ->get();
            foreach ($dependencies as $dependency) {
                $affectedCode = array_search($dependency->affected_option_group_id, $groupIdsByCode, true);
                if ($affectedCode === false || ! array_key_exists($affectedCode, $selection)) { continue; }
                if ($dependency->dependency_type === ErpOptionDependencyType::HIDE_GROUP) { return false; }
                if ($dependency->dependency_type === ErpOptionDependencyType::FILTER_OPTIONS
                    && ! in_array((int) $selection[$affectedCode], array_map('intval', $dependency->allowed_options ?? []), true)) {
                    return false;
                }
            }
        }
        return true;
    }
}
