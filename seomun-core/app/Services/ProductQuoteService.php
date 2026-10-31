<?php

namespace App\Services;

use App\Enums\BookPrintingSizeType;
use App\Enums\BookPrintingType;
use App\Enums\CategoryEnum;
use App\Enums\ErpOptionGroupCode;
use App\Enums\ErpOptionGroupType;
use App\Enums\MachineType;
use App\Enums\PaperSizeDivisionCode;
use App\Enums\PriceType;
use App\Enums\PrintColorType;
use App\Enums\PrintSideType;
use App\Enums\UnitPriceCategory;
use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use App\Models\Paper;
use App\Models\PaperPrice;
use App\Models\PostProcessingPrice;
use App\Models\PrintingPrice;
use App\Models\Product;
use App\Models\SizeOption;
use App\Models\UnitPrice;
use App\Services\Pricing\PricingFormulaResolver;
use App\Services\Pricing\Formulas\PaperPrintPricingFormula;
use App\Services\Quote\BaseQuoteService;
use App\Services\Quote\ColorEnvelopeQuoteService;
use App\Services\Quote\DiecutTicketQuoteService;
use App\Services\Quote\GeneralBannerQuoteService;
use App\Services\Quote\LHolderQuoteService;
use App\Services\Quote\MasterEnvelopeQuoteService;
use App\Services\Quote\SquareTicketQuoteService;
use App\Services\Quote\StickyNoteQuoteService;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ProductQuoteService
{
    public function __construct(
        protected SquareTicketQuoteService $squareTicketQuoteService,
        protected DiecutTicketQuoteService $diecutTicketQuoteService,
        protected StickyNoteQuoteService $stickyNoteQuoteService,
        protected LHolderQuoteService $lHolderQuoteService,
        protected MasterEnvelopeQuoteService $masterEnvelopeQuoteService,
        protected ColorEnvelopeQuoteService $colorEnvelopeQuoteService,
        protected GeneralBannerQuoteService $generalBannerQuoteService,
        protected BaseQuoteService $baseQuoteService,
        protected ShippingFeeService $shippingFeeService,
        private readonly PricingFormulaResolver $formulaResolver,
    ) {
        $this->noCalculationFormula = array_merge(
            $this->bookCategory,
            $this->commonCategory,
            [CategoryEnum::DESK_CALENDAR]
        );
    }

    public array $bookCategory = [
        CategoryEnum::BOOK,
        CategoryEnum::HOT_DEAL_BOOKLET,
    ];

    public array $commonCategory = [
        CategoryEnum::BUSINESS_CARD,
        CategoryEnum::POSTCARD,
        CategoryEnum::TICKET,
        CategoryEnum::LEAFLET,
        CategoryEnum::FLYER,
    ];

    public array $POST_PROCESSING_CODES = [
        ErpOptionGroupCode::COATED,
        ErpOptionGroupCode::OSHI,
        ErpOptionGroupCode::ROUNDING,
        ErpOptionGroupCode::PERFORATION,
        ErpOptionGroupCode::GROUNDING,
        ErpOptionGroupCode::NUMBERING,
        ErpOptionGroupCode::DOMUSONG,
        ErpOptionGroupCode::FOUNDATION,
    ];

    public array $noCalculationFormula;

    public function quote(int $productId, array $selectedOptions, ?array $inputOptions, int $quantity = 1, int $case = 1, PriceType $priceType = PriceType::SUPPLY): array
    {
        $product = Product::with(['pricingProfile', 'specification', 'productSets'])->find($productId);
        if (! $product) {
            throw new \RuntimeException('제품을 찾을 수 없습니다.');
        }
        if (! $product->pricingProfile || ! $product->pricingProfile->is_active) {
            throw new \RuntimeException('상품의 Pricing Profile이 설정되어 있지 않습니다.');
        }
        $this->assertProductSetAllows($product, $quantity);

        // $isCustomSize = array_key_exists('width', $inputOptions) || array_key_exists('height', $inputOptions);
        $selectedOptions = $this->mergeOption($product, $selectedOptions, $inputOptions);
        // $this->assertCustomSizeIsAllowed($product, $selectedOptions, $isCustomSize);
        $weight = $this->calculateTotalPaperWeight($selectedOptions['width'] ?? 0, $selectedOptions['height'] ?? 0, $product, $selectedOptions, $quantity) * $case;

        $baseOneCase = $this->formulaResolver->resolve($product)->calculate($productId, $selectedOptions, $quantity, 1);
        if ($baseOneCase <= 0) {
            throw new \RuntimeException('선택한 옵션과 수량에 적용 가능한 가격 규칙이 없습니다.');
        }
        $postProcessingBreakdown = $this->getPostProcessingBreakdown($selectedOptions, $quantity, 1, $priceType);
        $postProcessingOneCase = array_sum(array_column($postProcessingBreakdown, 'price'));
        $foundationOneCase = array_sum(array_map(
            fn (array $item): float => ($item['group_code'] ?? $item['code'] ?? null) === strtolower(ErpOptionGroupCode::FOUNDATION->value) ? (float) $item['price'] : 0,
            $postProcessingBreakdown,
        ));
        $formula = $this->formulaResolver->resolve($product);
        $paperPrice = 0;
        $printingPrice = 0;
        if ($formula instanceof PaperPrintPricingFormula) {
            $components = $formula->calculateComponents($productId, $selectedOptions, $quantity);
            $paperPrice = $components['paper_price'] * $case;
            $printingPrice = $components['printing_price'] * $case;
        }
        $subTotal = ($baseOneCase + $postProcessingOneCase) * $case;
        $vat = $subTotal * 0.1;
        $total = $subTotal + $vat;

        return [
            'sub_total' => round($subTotal),
            'vat' => round($vat),
            'total' => round($total),
            'quantity' => $quantity,
            'case' => $case,
            'paper_price' => round($paperPrice),
            'printing_price' => round($printingPrice),
            'foundation_fee' => round($foundationOneCase * $case),
            'post_processing_price' => round(($postProcessingOneCase - $foundationOneCase) * $case),
            'component_price' => round($baseOneCase * $case),
            'breakdown' => collect($postProcessingBreakdown)->map(fn (array $item) => array_merge($item, ['price' => $item['price'] * $case])),
            'estimated_production_days' => $product->specification?->production_time_days ?? 0,
            'weight' => round($weight, 1),
            'box_count' => $case,
        ];
    }

    public function mergeOption(Product $product, array $selectedOptions, array $inputOptions): array
    {
        $mapSelectedOptions = $this->mapToErpOptionId($product, $selectedOptions);

        $width = $inputOptions['width'] ?? null;
        if ($width === null) {
            $erpOptionId = $mapSelectedOptions[ErpOptionGroupCode::SIZE->value] ?? null;

            $sizeOption = SizeOption::whereHas('erpOptions', function ($query) use ($erpOptionId) {
                $query->where('id', $erpOptionId);
            })->first();

            if ($sizeOption) {
                $inputOptions['width'] = $sizeOption->cutting_width;
                $inputOptions['height'] = $sizeOption->cutting_height;
            } else {
                $inputOptions['width'] = 0;
                $inputOptions['height'] = 0;
            }
        }

        $mapSelectedOptions = array_merge($mapSelectedOptions, $inputOptions);

        return $mapSelectedOptions;
    }

    /*
    private function assertCustomSizeIsAllowed(Product $product, array $selectedOptions, bool $isCustomSize): void
    {
        $custom = $product->pricingProfile?->settings['custom_size'] ?? [];
        if (! $isCustomSize) {
            return;
        }
        if (! ($custom['enabled'] ?? false)) {
            throw new \InvalidArgumentException('이 상품은 custom size를 지원하지 않습니다.');
        }
        $width = (int) ($selectedOptions['width'] ?? 0);
        $height = (int) ($selectedOptions['height'] ?? 0);
        if ($width < (int) $custom['min_width_mm'] || $width > (int) $custom['max_width_mm']
            || $height < (int) $custom['min_height_mm'] || $height > (int) $custom['max_height_mm']) {
            throw new \InvalidArgumentException('선택한 custom size는 이 상품의 허용 범위를 벗어났습니다.');
        }
    }
    */

    /** Product Sets define allowed quantities only; they never provide a price. */
    private function assertProductSetAllows(Product $product, int $quantity): void
    {
        $set = $product->productSets;
        if (! $set) {
            if ($quantity < max(1, (int) $product->min_quantity)
                || ($product->max_quantity && $quantity > (int) $product->max_quantity)) {
                throw new \InvalidArgumentException('선택한 수량은 이 상품의 허용 범위를 벗어났습니다.');
            }

            return;
        }
        if ($set->set_type === 'select') {
            $allowed = collect($set->select_options ?? [])->pluck('value')->map(fn ($value) => (int) $value)->all();
            if (! in_array($quantity, $allowed, true)) {
                throw new \InvalidArgumentException('선택한 수량은 이 상품의 Product Set에 없습니다.');
            }

            return;
        }
        $min = max(1, (int) ($set->min_set ?? $set->quantity ?? 1));
        $max = $set->max_set ? (int) $set->max_set : PHP_INT_MAX;
        $step = max(1, (int) ($set->step_set ?? 1));
        if ($quantity < $min || $quantity > $max || (($quantity - $min) % $step !== 0)) {
            throw new \InvalidArgumentException('선택한 수량은 이 상품의 Product Set 규칙에 맞지 않습니다.');
        }
    }

    public function getGsm(Product $product, array $selectedOptions): int
    {
        $paperOptionId = $selectedOptions[ErpOptionGroupCode::PAPER->value] ?? null;

        if (! $paperOptionId) {
            return 0;
        }

        $paper = Paper::whereHas('erpOptions', function ($query) use ($paperOptionId) {
            $query->where('id', $paperOptionId);
        })->first();

        return (int) ($paper?->paperWeightOption?->value ?? 0);
    }

    public function calculatePaperWeight(float $width, float $height, Product $product, array $selectedOptions, int $quantity, int $decimals = 1): float
    {
        $gsm = $this->getGsm($product, $selectedOptions);
        $areaInSquareMeters = ($width * $height) / 1000000;

        $weightInGrams = $areaInSquareMeters * $gsm;

        return round($weightInGrams * $quantity / 1000, $decimals);
    }

    public function calculateTotalPaperWeight(
        float $width,
        float $height,
        Product $product,
        array $selectedOptions,
        int $quantity,
        int $decimals = 1
    ): float {
        $paperTypes = [
            ErpOptionGroupCode::PAPER->value => $quantity,
            ErpOptionGroupCode::COVER_PAPER->value => ($selectedOptions['cover_page_count'] ?? 0) * $quantity,
            ErpOptionGroupCode::INNER_PAPER->value => ($selectedOptions['inner_page_count'] ?? 0) * $quantity,
            ErpOptionGroupCode::ADDITIONAL_PAPER->value => ($selectedOptions['additional_page_count'] ?? 0) * $quantity,
            ErpOptionGroupCode::COLORED_PAPER_1->value => ($selectedOptions['colored_page_count_1'] ?? 0) * $quantity,
            ErpOptionGroupCode::COLORED_PAPER_2->value => ($selectedOptions['colored_page_count_2'] ?? 0) * $quantity,
            ErpOptionGroupCode::FLYLEAF_PAPER->value => ($selectedOptions['flyleaf_count'] ?? 0) * $quantity,
        ];

        $areaInSquareMeters = ($width * $height) / 1_000_000;
        $totalWeight = 0;

        foreach ($paperTypes as $paperType => $paperQuantity) {
            if (! isset($selectedOptions[$paperType]) || $paperQuantity <= 0) {
                continue;
            }

            $options = [
                ErpOptionGroupCode::PAPER->value => $selectedOptions[$paperType],
            ];

            $gsm = $this->getGsm($product, $options);
            $totalWeight += ($areaInSquareMeters * $gsm * $paperQuantity) / 1000;
        }

        return round($totalWeight, $decimals);
    }

    protected function getPostProcessingBreakdown(array $selectedOptions, int $quantity, int $case, PriceType $priceType = PriceType::SUPPLY)
    {
        $postProcessingOptions = collect($this->POST_PROCESSING_CODES)
            ->map(function ($code) use ($selectedOptions) {
                $key = Str::lower($code->value);

                return [
                    'code' => $code->value,
                    'value' => $selectedOptions[$key] ?? null,
                    'attributes' => null,
                ];
            })
            ->filter(fn ($item) => $item['value'] !== null)
            ->values()
            ->all();

        return collect($postProcessingOptions)
            ->map(function ($option) use ($quantity, $case, $priceType) {

                $unitPrice = $this->buildPostProcessing($option);

                return $this->buildBreakdown(
                    $unitPrice,
                    $quantity,
                    $case,
                    $option['code'],
                    $priceType
                );
            })
            ->values()
            ->all();
    }

    /**
     * Partial-match a UnitPrice's combination_options against selectedOptions.
     * All keys inside combination_options must exist in selectedOptions with the same value.
     *
     * @param  array<string,int>|null  $combinationOptions
     */
    protected function matchCombinationOptions(?array $combinationOptions, ?array $selectedOptions): bool
    {

        if (empty($combinationOptions) || empty($selectedOptions)) {
            return true;
        }

        // if (empty($selectedOptions)) {
        //     return false;
        // }

        foreach ($combinationOptions as $groupCode => $optionId) {
            if (! isset($selectedOptions[$groupCode]) || (int) $selectedOptions[$groupCode] !== (int) $optionId) {
                return false;
            }
        }

        return true;
    }

    public function mapToErpOptionId(Product $product, array $selectedOptions): array
    {

        if (empty($selectedOptions)) {
            return [];
        }

        $selectedOptions = collect($selectedOptions)->map(function (array $selection) use ($product) {

            $group = $product->optionGroups->firstWhere('id', $selection['group_id'] ?? null);

            if (! $group) {
                throw new \InvalidArgumentException('선택한 옵션 그룹이 유효하지 않습니다.');
            }

            $option = $group->options->firstWhere('id', $selection['option_id'] ?? null);

            if (! $option) {
                throw new \InvalidArgumentException('선택한 옵션이 유효하지 않습니다.');
            }

            $erpSelection = [
                'group_id' => $group->erp_option_group_id,
                'option_id' => $option->erp_option_id,
            ];

            $this->checkERPOptionInProductOption($product, $erpSelection);

            return [$group->code => $option->erp_option_id];
        })->collapse()->all();

        return $selectedOptions;
    }

    private function checkERPOptionInProductOption(Product $product, array $selection): bool
    {
        $groupId = $selection['group_id'] ?? null;
        $optionId = $selection['option_id'] ?? null;

        if ($groupId == null || $optionId == null) {
            return true;
        }

        // Verify ERP option group exists
        $erpOptionGroup = ErpOptionGroup::find($groupId);
        if (! $erpOptionGroup) {
            throw new \InvalidArgumentException('선택한 ERP 옵션 그룹이 유효하지 않습니다.');
        }

        // Verify ERP option exists
        $erpOption = ErpOption::find($optionId);
        if (! $erpOption) {
            throw new \InvalidArgumentException('선택한 ERP 옵션이 유효하지 않습니다.');
        }

        // Verify option belongs to group
        if ($erpOption->erp_option_group_id !== $groupId) {
            throw new \InvalidArgumentException('ERP 옵션이 선택한 그룹에 속하지 않습니다.');
        }

        return true;
    }

    /**
     * Return matched unit-price item or null.
     *
     * @return array<string,mixed>|null
     */
    protected function buildBreakdown(
        ?PostProcessingPrice $unitPrice,
        int $quantity,
        int $case,
        ?string $groupCode = null,
        PriceType $priceType = PriceType::SUPPLY
    ): array {
        if (! $unitPrice) {
            return [
                'group_code' => $groupCode,
                'price' => 0,
            ];
        }

        $matchedItem = $unitPrice->postProcessingPriceItems
            ->where('quantity', '<=', $quantity)
            ->sortByDesc('quantity')
            ->first();

        if (! $matchedItem) {
            return [
                'group_code' => $unitPrice->code,
                'price' => 0,
            ];
        }

        $price = $priceType === PriceType::COST
            ? $matchedItem->cost
            : $matchedItem->supply_price;

        return [
            'group_code' => $unitPrice->code,
            'price' => $price * $case,
        ];
    }

    protected function paperPrice(int $quantity, int $case, array $selectedOptions, CategoryEnum $category, PriceType $priceType = PriceType::SUPPLY): ?int
    {
        $sizeEnum = null;
        $is_hot_deal = false;
        if (! in_array($category, $this->commonCategory)) {
            return 0;
        }
        $sizeEnum = PaperSizeDivisionCode::NATIONAL_4;
        $copyQuantity = $this->calculateRequiredPrintCopies($selectedOptions['width'], $selectedOptions['height'], $sizeEnum->width(), $sizeEnum->height(), $quantity);

        return $this->getPaperPrice($selectedOptions[ErpOptionGroupCode::PAPER->value], $sizeEnum, $is_hot_deal, $priceType) * $copyQuantity * $case;
    }

    public function paperPrice_v2(
        int $quantity,
        int $case,
        array $selectedOptions,
        PaperSizeDivisionCode $sizeEnum,
        bool $isHotDeal = false,
        ?int $copyNo = null,
        PriceType $priceType = PriceType::SUPPLY,
    ): ?int {
        $copyQuantity = $copyNo ?? $this->calculateRequiredPrintCopies(
            $selectedOptions['width'],
            $selectedOptions['height'],
            $sizeEnum->width(),
            $sizeEnum->height(),
            $quantity
        );

        return $this->getPaperPrice(
            $selectedOptions[ErpOptionGroupCode::PAPER->value],
            $sizeEnum,
            $isHotDeal,
            $priceType
        ) * $copyQuantity * $case;
    }

    private function getCoverSizeEnum(int $erpOptionId, CategoryEnum $category): array
    {
        $isSaddleStitched = in_array($category, [
            CategoryEnum::SADDLE_STITCHED_BOOKLET,
        ]);
        $coverSizeEnum = null;
        $innerSizeEnum = null;
        $additionalSizeEnum = null;
        $coloredSizeEnum1 = null;
        $coloredSizeEnum2 = null;
        $flyleafSizeEnum = null;

        $sizeOption = SizeOption::whereHas('erpOptions', function ($query) use ($erpOptionId) {
            $query->where('id', $erpOptionId);
        })->first();

        $sizeValue = $sizeOption?->name;

        switch ($sizeValue) {
            case BookPrintingSizeType::A5->value:
            case BookPrintingSizeType::B5->value:
                $coverSizeEnum = PaperSizeDivisionCode::NATIONAL_8;
                $innerSizeEnum = $isSaddleStitched
                    ? PaperSizeDivisionCode::NATIONAL_8
                    : PaperSizeDivisionCode::NATIONAL_16;
                $additionalSizeEnum = PaperSizeDivisionCode::NATIONAL_16;
                $coloredSizeEnum1 = PaperSizeDivisionCode::NATIONAL_16;
                $coloredSizeEnum2 = PaperSizeDivisionCode::NATIONAL_16;
                $flyleafSizeEnum = PaperSizeDivisionCode::SIZE_46_16;
                break;

            case BookPrintingSizeType::A4->value:
                $coverSizeEnum = PaperSizeDivisionCode::NATIONAL_4;
                $innerSizeEnum = $isSaddleStitched
                    ? PaperSizeDivisionCode::NATIONAL_4
                    : PaperSizeDivisionCode::NATIONAL_8;

                $additionalSizeEnum = PaperSizeDivisionCode::NATIONAL_8;
                $coloredSizeEnum1 = PaperSizeDivisionCode::NATIONAL_8;
                $coloredSizeEnum2 = PaperSizeDivisionCode::NATIONAL_8;
                $flyleafSizeEnum = PaperSizeDivisionCode::NATIONAL_8;
                break;

            default:
                return [null, null, null, null, null, null];
        }

        return [$coverSizeEnum, $innerSizeEnum, $additionalSizeEnum, $coloredSizeEnum1, $coloredSizeEnum2, $flyleafSizeEnum];
    }

    private function getCoverSizeEnumForPrinting(int $sizeId, CategoryEnum $category): array
    {
        $isSaddleStitched = $category === CategoryEnum::SADDLE_STITCHED_BOOKLET;

        $sizeOption = SizeOption::find($sizeId);
        $sizeValue = $sizeOption?->name;

        switch ($sizeValue) {
            case BookPrintingSizeType::A4->value:
            case BookPrintingSizeType::B5->value:
                $coverSizeEnum = BookPrintingSizeType::NATION4;
                $innerSizeEnum = $isSaddleStitched
                    ? BookPrintingSizeType::NATION4
                    : BookPrintingSizeType::NATION8;
                break;

            case BookPrintingSizeType::A5->value:
                $coverSizeEnum = BookPrintingSizeType::NATION8;
                $innerSizeEnum = $isSaddleStitched
                    ? BookPrintingSizeType::NATION8
                    : BookPrintingSizeType::NATION16;
                break;

            default:
                return [null, null];
        }

        return [$coverSizeEnum, $innerSizeEnum];
    }

    protected function paperPriceForBooklet(int $quantity, int $case, array $selectedOptions, CategoryEnum $category, bool $isHotDeal = false, PriceType $priceType = PriceType::SUPPLY): ?int
    {
        if (! in_array($category, $this->bookCategory, true)) {
            return 0;
        }

        $coverPageCount = $selectedOptions['cover_page_count'] ?? 0;
        $innerPageCount = $selectedOptions['inner_page_count'] ?? 0;
        $additionalPageCount = $selectedOptions['additional_page_count'] ?? 0;
        $coloredPageCount1 = $selectedOptions['colored_page_count_1'] ?? 0;
        $coloredPageCount2 = $selectedOptions['colored_page_count_2'] ?? 0;
        $flyleafCount = $selectedOptions['flyleaf_count'] ?? 0;
        [$coverSizeEnum, $innerSizeEnum, $additionalSizeEnum, $coloredSizeEnum1, $coloredSizeEnum2, $flyleafSizeEnum] = $this->getCoverSizeEnum($selectedOptions[ErpOptionGroupCode::SIZE->value] ?? null, $category);

        $coverPagePrice = $this->getPaperPrice($selectedOptions[ErpOptionGroupCode::COVER_PAPER->value] ?? null, $coverSizeEnum, $isHotDeal, $priceType);
        $innerPagePrice = $this->getPaperPrice($selectedOptions[ErpOptionGroupCode::INNER_PAPER->value] ?? null, $innerSizeEnum, $isHotDeal, $priceType);
        $additionalPagePrice = $this->getPaperPrice($selectedOptions[ErpOptionGroupCode::ADDITIONAL_PAPER->value] ?? null, $additionalSizeEnum, $isHotDeal, $priceType);
        $coloredPagePrice1 = $this->getPaperPrice($selectedOptions[ErpOptionGroupCode::COLORED_PAPER_1->value] ?? null, $coloredSizeEnum1, $isHotDeal, $priceType);
        $coloredPagePrice2 = $this->getPaperPrice($selectedOptions[ErpOptionGroupCode::COLORED_PAPER_2->value] ?? null, $coloredSizeEnum2, $isHotDeal, $priceType);
        $flyleafPagePrice = $this->getPaperPrice($selectedOptions[ErpOptionGroupCode::FLYLEAF_PAPER->value] ?? null, $flyleafSizeEnum, $isHotDeal, $priceType);

        if ($category === CategoryEnum::HOT_DEAL_SADDLE_STITCHED_BOOKLET) {
            return ($coverPagePrice * $coverPageCount + $innerPagePrice * $innerPageCount) * $quantity * $case;
        }

        $width = $selectedOptions['width'] ?? 0;
        $height = $selectedOptions['height'] ?? 0;

        $coverCopyQuantity = $this->calculateRequiredPrintCopies($width, $height, $coverSizeEnum->width(), $coverSizeEnum->height(), $coverPageCount);
        $innerCopyQuantity = $this->calculateRequiredPrintCopies($width, $height, $innerSizeEnum->width(), $innerSizeEnum->height(), $innerPageCount);
        $additionalCopyQuantity = $this->calculateRequiredPrintCopies($width, $height, $additionalSizeEnum->width(), $additionalSizeEnum->height(), $additionalPageCount);
        $coloredCopyQuantity1 = $this->calculateRequiredPrintCopies($width, $height, $coloredSizeEnum1->width(), $coloredSizeEnum1->height(), $coloredPageCount1);
        $coloredCopyQuantity2 = $this->calculateRequiredPrintCopies($width, $height, $coloredSizeEnum2->width(), $coloredSizeEnum2->height(), $coloredPageCount2);
        $flyleafCopyQuantity = $this->calculateRequiredPrintCopies($width, $height, $flyleafSizeEnum->width(), $flyleafSizeEnum->height(), $flyleafCount);

        $innerSideId = $selectedOptions[ErpOptionGroupCode::PRINTED_INNER_SIDE->value] ?? null;
        $innerSide = $innerSideId ? ErpOption::find($innerSideId) : null;
        $innerSideType = $innerSide?->value ? PrintSideType::fromValue($innerSide->value) : null;

        if ($innerSideType === PrintSideType::DOUBLE) {
            $innerPagePrice /= 2;
        }
        $additionalPagePrice /= 2;
        $coloredPagePrice1 /= 2;
        $coloredPagePrice2 /= 2;
        $flyleafPagePrice /= 2;

        $totalPaperPrice = ($coverPagePrice * $coverCopyQuantity)
            + ($innerPagePrice * $innerCopyQuantity)
            + ($additionalPagePrice * $additionalCopyQuantity)
            + ($coloredPagePrice1 * $coloredCopyQuantity1)
            + ($coloredPagePrice2 * $coloredCopyQuantity2)
            + ($flyleafPagePrice * $flyleafCopyQuantity);

        return (int) ($totalPaperPrice * $quantity * $case);
    }

    protected function printingPrice(int $quantity, int $case, array $selectedOptions, CategoryEnum $category, PriceType $priceType = PriceType::SUPPLY): ?int
    {
        $sizeEnum = PaperSizeDivisionCode::NATIONAL_4;
        $machineType = MachineType::P1350;
        $bookPrintingSizeType = BookPrintingSizeType::TYPE_A;

        $printSideType = PrintSideType::fromValue($this->getERPOptionValue($selectedOptions[ErpOptionGroupCode::PRINTED_SIDE->value]));
        $copyPaperNo = $this->calculateRequiredPrintCopies($selectedOptions['width'], $selectedOptions['height'], $sizeEnum->width(), $sizeEnum->height(), $quantity);
        $total_quality = $quantity;
        if (in_array($category, [CategoryEnum::BUSINESS_CARD])) {
            $bookPrintingSizeType = BookPrintingSizeType::TYPE_A;
            $total_quality = $copyPaperNo;
        } elseif (in_array($category, [CategoryEnum::POSTCARD, CategoryEnum::TICKET])) {
            $bookPrintingSizeType = BookPrintingSizeType::TYPE_B;
            $total_quality = $copyPaperNo;
        } elseif (in_array($category, [CategoryEnum::LEAFLET, CategoryEnum::FLYER, CategoryEnum::POSTER])) {
            $bookPrintingSizeType = BookPrintingSizeType::TYPE_C;
        }

        $price_value = $this->getPrintingPrice($machineType, $bookPrintingSizeType, $printSideType, null, false, $copyPaperNo, $priceType);

        return $price_value * $case;
    }

    public function printingPriceForDeskCalendar(int $quantity, int $case, array $selectedOptions, PriceType $priceType = PriceType::SUPPLY): ?int
    {
        $pageCount = $selectedOptions['page_count'] ?? 1;

        $machineType = MachineType::P1350;
        $bookPrintingSizeType = BookPrintingSizeType::NATION8;
        $bookPrintingType = BookPrintingType::BOOKLET_INNER;
        $printedSide = PrintSideType::fromValue($this->getERPOptionValue($selectedOptions[ErpOptionGroupCode::PRINTED_SIDE->value]));

        $coverSingleMulple = $printedSide == PrintSideType::DOUBLE ? 2 : 1;

        $printingPrice = $this->getPrintingPrice($machineType, $bookPrintingSizeType, null, $bookPrintingType, false, ceil($pageCount * $quantity / $coverSingleMulple), $priceType) * $coverSingleMulple;

        return $printingPrice * $case;
    }

    protected function printingPriceForBooklet(int $quantity, int $case, array $selectedOptions, CategoryEnum $category, bool $isHotDeal = false, PriceType $priceType = PriceType::SUPPLY): ?int
    {
        // $coverColorType = PrintColorType::from($this->getERPOptionValue($selectedOptions[ErpOptionGroupCode::PRINTED_COVER_SIDE->value]));
        // $innerColorType = PrintColorType::from($this->getERPOptionValue($selectedOptions[ErpOptionGroupCode::PRINTED_INNER_SIDE->value]));

        $coverPageCount = $selectedOptions['cover_page_count'] ?? 0;
        $innerPageCount = $selectedOptions['inner_page_count'] ?? 0;
        $coverColorType = PrintColorType::COLLAR;
        $innerColorType = PrintColorType::COLLAR;
        $coverPrintSideType = PrintSideType::fromValue($this->getERPOptionValue($selectedOptions[ErpOptionGroupCode::PRINTED_COVER_SIDE->value]));
        $innerPrintSideType = PrintSideType::fromValue($this->getERPOptionValue($selectedOptions[ErpOptionGroupCode::PRINTED_INNER_SIDE->value]));
        $bookPrintingSizeType = BookPrintingSizeType::from($this->getSizeOptionValue($selectedOptions[ErpOptionGroupCode::SIZE->value]));

        $coverMachineType = $this->getMachineType($coverColorType);
        $innerMachineType = $this->getMachineType($innerColorType);

        $sizeValue = $this->getERPOptionValue($selectedOptions[ErpOptionGroupCode::SIZE->value] ?? null);

        [$coverSizeEnum, $innerSizeEnum] = $this->getCoverSizeEnumForPrinting($sizeValue, $category);

        $coverSingleMulple = $coverPrintSideType == PrintSideType::DOUBLE ? 2 : 1;
        $innerSingleMulple = $innerPrintSideType == PrintSideType::DOUBLE ? 2 : 1;

        $coverPrintingPrice = ceil($coverPageCount / $coverSingleMulple) * $this->getPrintingPrice($coverMachineType, $coverSizeEnum, null, BookPrintingType::BOOKLET_COVER, $isHotDeal, $quantity, $priceType);
        $innerPrintingPrice = ceil($innerPageCount / $innerSingleMulple) * $this->getPrintingPrice($innerMachineType, $innerSizeEnum, null, BookPrintingType::BOOKLET_COVER, $isHotDeal, $quantity, $priceType);

        return ($coverPrintingPrice + $innerPrintingPrice) * $case;
    }

    protected function postProcessing(int $quantity, int $case, array $selectedOptions, CategoryEnum $category): ?int
    {
        $allPostProcessingCode = collect(ErpOptionGroupCode::getByType(ErpOptionGroupType::POST_PROCESSING))
            ->pluck('name')
            ->toArray();

        $postProcessingCodes = collect($selectedOptions)
            ->keys()
            ->intersect($allPostProcessingCode)
            ->values()
            ->toArray();

        $postProcessingBreakdown = collect($postProcessingCodes)->map(function ($item) {
            return strtoupper($item);
        })->toArray();

        return 0;
    }

    protected function getPaperPrice(?int $erp_paper_id, PaperSizeDivisionCode $coverSizeEnum, bool $is_hot_deal, PriceType $priceType = PriceType::SUPPLY)
    {
        if ($erp_paper_id == null) {
            return 0;
        }
        $erpOption = ErpOption::find($erp_paper_id);
        if (! $erpOption) {
            throw new \InvalidArgumentException('선택한 ERP 옵션이 유효하지 않습니다.');
        }
        $paperPrice = PaperPrice::query()
            ->where('paper_id', $erpOption->paper_id)
            ->where('paper_size_division_code', $coverSizeEnum)
            ->where('is_hot_deal', false)
            ->first();
        if (! $paperPrice) {
            return 0;
        }

        $price_value = $priceType === PriceType::COST
            ? $paperPrice->cost
            : $paperPrice->supply_price;

        return round($price_value * ($is_hot_deal ? 1 : 5 / 6));
    }

    protected function getPrintingPrice(MachineType $machineType, ?BookPrintingSizeType $bookPrintingSizeType, ?PrintSideType $printSideType, ?BookPrintingType $bookPrintingType, bool $is_hot_deal, int $quantity, PriceType $priceType = PriceType::SUPPLY): int
    {
        $printingPrice = PrintingPrice::query()
            ->where('machine_type', $machineType)
            ->where('book_printing_size_type', $bookPrintingSizeType)
            ->where('side_type', $printSideType)
            ->where('book_printing_type', $bookPrintingType)
            ->where('is_hot_deal', $is_hot_deal)
            ->first();
        if (! $printingPrice) {
            return 0;
        }

        $matchedItem = $printingPrice->printingPriceItems
            ->where('quantity', '<=', $quantity)
            ->sortByDesc('quantity')
            ->first();

        if (! $matchedItem) {
            return 0;
        }

        $priceValue = $priceType === PriceType::COST
            ? $matchedItem->cost
            : $matchedItem->supply_price;

        return $priceValue * ($quantity / $matchedItem->quantity); // Calculate price based on quantity tier
    }

    public function getERPOptionValue(int $id): ?string
    {
        $erpOption = ErpOption::find($id);

        if (! $erpOption) {
            throw new \InvalidArgumentException('선택한 ERP 옵션이 유효하지 않습니다.');
        }

        return $erpOption->value;
    }

    public function getSizeOptionValue(int $id): ?string
    {
        $erpOption = ErpOption::find($id);

        if (! $erpOption) {
            throw new \InvalidArgumentException('선택한 ERP Size Option 옵션이 유효하지 않습니다.');
        }

        return $erpOption?->size?->name;
    }

    public function getMachineType(PrintColorType $printSideType): MachineType
    {
        if ($printSideType == PrintColorType::COLLAR) {
            return MachineType::P1350;
        }

        if ($printSideType == PrintColorType::BLACK_AND_WHITE) {
            return MachineType::P140;
        }

        return MachineType::P1350;
    }

    protected function foundationPrice(?UnitPrice $unitPrice, int $quantity, int $case, array $selectedOptions): ?int
    {
        if (! $unitPrice) {
            return null;
        }

        $matchedItem = $unitPrice->items
            ->where('quantity_min', '<=', 1)
            ->sortByDesc('quantity_min')
            ->first();

        if (! $matchedItem) {
            return null;
        }

        $paperSize = $unitPrice->sizeOption()->size();
        $copyPaperNo = $this->calculateRequiredPrintCopies($selectedOptions['width'], $selectedOptions['height'], $paperSize->cutting_width, $paperSize->cutting_height, $quantity * $case);

        return round((int) $matchedItem->price_value, 2) * $copyPaperNo;
    }

    public function buildPostProcessing(array $postProcessingOption)
    {
        $postProcessingUnitPrices = PostProcessingPrice::query()
            ->where('code', $postProcessingOption['code'])
            ->where('erp_option_id', $postProcessingOption['value'])
            ->get();

        $matched = $postProcessingUnitPrices
            ->filter(function (PostProcessingPrice $up) use ($postProcessingOption) {
                return $this->matchCombinationOptions(
                    $up->attributes,
                    $postProcessingOption['attributes']
                );
            })
            ->values();

        if ($matched->isNotEmpty()) {
            return $matched->first();
        }

        return null;
    }

    protected function findOutsourceUnitPrice(Collection $unitPrices, array $selectedOptions): ?UnitPrice
    {
        foreach ($unitPrices as $unitPrice) {
            if ($this->matchCombinationOptions($unitPrice->combination_options, $selectedOptions)) {
                return $unitPrice;
            }
        }

        return null;
    }

    protected function buildOutsourceBreakdown(?UnitPrice $unitPrice, int $quantity, int $case): ?array
    {
        if (! $unitPrice) {
            return null;
        }

        $matchedItem = $unitPrice->items
            ->where('quantity_min', '<=', $quantity)
            ->sortByDesc('quantity_min')
            ->first();

        if (! $matchedItem) {
            return null;
        }

        return [
            'category' => $unitPrice->category,
            'group_code' => $unitPrice?->erpOption?->erpOptionGroup?->code,
            'erp_option_id' => $unitPrice->erp_option_id,
            'erp_option_label' => $unitPrice->erpOption?->label,
            'price' => round((float) $matchedItem->price_value, 2) * $case,
        ];
    }

    /**
     * @param  Collection<int,UnitPrice>  $postProcessingUnitPrices
     * @return array<string,array<int,mixed>>
     */
    protected function buildMissing(
        ?UnitPrice $printingUnitPrice,
        ?Collection $postProcessingUnitPrices,
        Collection $selectedErpOptions
    ): array {
        $missing = [];

        if (! $printingUnitPrice) {
            $printingOptions = $selectedErpOptions
                ->filter(fn (ErpOption $o) => $o->erpOptionGroup->type === ErpOptionGroupType::PRINTED_COLOR)
                ->pluck('id')
                ->all();
            $missing[] = [
                'category' => UnitPriceCategory::PRINTING->value,
                'message' => 'PRINTING 단가는 등록된 UnitPrice가 없습니다.',
                'erp_option_ids' => $printingOptions,
            ];
        }

        if (! $postProcessingUnitPrices || $postProcessingUnitPrices->isEmpty()) {
            $postProcessingOptions = $selectedErpOptions
                ->filter(fn (ErpOption $o) => $o->erpOptionGroup->type === ErpOptionGroupType::POST_PROCESSING)
                ->pluck('id')
                ->all();
            if (! empty($postProcessingOptions)) {
                $missing[] = [
                    'category' => UnitPriceCategory::POST_PROCESSING->value,
                    'message' => '선택한 옵션에 해당하는 POST_PROCESSING 단가가 없습니다.',
                    'erp_option_ids' => $postProcessingOptions,
                ];
            }
        }

        return $missing;
    }

    /** Return selectable quantities from Product Sets, never from price tiers. */
    public function getQuantityTiers(int $productId, array $selectedOptions): array
    {
        $product = Product::with('productSets')->findOrFail($productId);
        $set = $product->productSets;
        if (! $set) {
            return [max(1, (int) $product->min_quantity)];
        }
        if ($set->set_type === 'select') {
            return collect($set->select_options ?? [])
                ->pluck('value')
                ->map(fn ($value) => (int) $value)
                ->filter(fn ($value) => $value > 0)
                ->unique()
                ->sort()
                ->values()
                ->all();
        }
        $min = max(1, (int) ($set->min_set ?? $set->quantity ?? 1));

        // Input sets are ranges, not a materialised list of price tiers. The
        // client receives min/max/step from ProductResource.product_sets.
        return [$min];
    }

    public function calculateRequiredPrintCopies(
        float $customerW,
        float $customerH,
        float $printW,
        float $printH,
        int $totalNeeds,
        float $gutter = 3.0
    ): int {

        // -------------------------------------------------------------------------
        // Scenario 1: Standard Orientation (Portrait/As-is alignment)
        // -------------------------------------------------------------------------
        // Formula adds the gutter to the printable area boundary because the last item
        // on the edge doesn't strictly require an outer gutter constraint during division.
        $fitX1 = floor(($printW + $gutter) / ($customerW + $gutter));
        $fitY1 = floor(($printH + $gutter) / ($customerH + $gutter));

        // Prevent negative values in case product dimensions exceed the printable area
        $fitX1 = max(0, $fitX1);
        $fitY1 = max(0, $fitY1);
        $totalFit1 = $fitX1 * $fitY1;

        // -------------------------------------------------------------------------
        // Scenario 2: 90-Degree Rotated Orientation (Landscape alignment)
        // -------------------------------------------------------------------------
        $fitX2 = floor(($printW + $gutter) / ($customerH + $gutter));
        $fitY2 = floor(($printH + $gutter) / ($customerW + $gutter));

        $fitX2 = max(0, $fitX2);
        $fitY2 = max(0, $fitY2);
        $totalFit2 = $fitX2 * $fitY2;

        // -------------------------------------------------------------------------
        // Optimization Selection & Output Calculation
        // -------------------------------------------------------------------------
        // Select the maximum yield configuration (Typesetting Count)
        $typesettingCount = max($totalFit1, $totalFit2);

        // Guard clause: Return early if the requested item cannot fit onto the configured sheet size
        if ($typesettingCount <= 0) {
            // throw new Exception('The requested item dimensions exceed the available print equipment boundaries.');
            return 1;
        }

        // Determine total print runs needed.
        // Use ceil() to round up to the nearest whole sheet, since partial print sheets cannot be processed.
        $printCopies = ceil($totalNeeds / $typesettingCount);

        return $printCopies;
    }

    public function calculateCuttingLayout(
        float $customerW,
        float $customerH,
        float $printW,
        float $printH,
        float $gutter = 6.0
    ): string {

        // -------------------------------------------------------------------------
        // Scenario 1: Standard Orientation (Portrait/As-is alignment)
        // -------------------------------------------------------------------------
        $fitX1 = max(0, (int) floor(($printW + $gutter) / ($customerW + $gutter)));
        $fitY1 = max(0, (int) floor(($printH + $gutter) / ($customerH + $gutter)));
        $totalFit1 = $fitX1 * $fitY1;

        // -------------------------------------------------------------------------
        // Scenario 2: 90-Degree Rotated Orientation (Landscape alignment)
        // -------------------------------------------------------------------------
        $fitX2 = max(0, (int) floor(($printW + $gutter) / ($customerH + $gutter)));
        $fitY2 = max(0, (int) floor(($printH + $gutter) / ($customerW + $gutter)));
        $totalFit2 = $fitX2 * $fitY2;

        // Guard clause: Return early if the item cannot fit onto the sheet in any direction
        if ($totalFit1 <= 0 && $totalFit2 <= 0) {
            throw new Exception('The requested item dimensions exceed the available print equipment boundaries.');
        }

        // -------------------------------------------------------------------------
        // Optimization Selection & Layout Output Generation
        // -------------------------------------------------------------------------
        // Select the layout that yields the maximum number of pieces.
        // If standard orientation yields more or equal items, use its layout dimensions.
        if ($totalFit1 >= $totalFit2) {
            $rows = $fitY1; // Number of vertical rows (Y axis)
            $cols = $fitX1; // Number of horizontal columns (X axis)
        } else {
            // Otherwise, use the dimensions from the rotated layout setup
            $rows = $fitY2;
            $cols = $fitX2;
        }

        // Returns a structured key matching the Database matrix format (e.g., "3*2")
        return "{$rows}*{$cols}";
    }
}
