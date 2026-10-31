<?php

namespace App\Services\Admin;

use App\Enums\PaperSizeDivisionCode;
use App\Models\PaperPrice;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class PaperPriceService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for paper prices.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        $divisionCodes = PaperPrice::query()
            ->select('paper_size_division_code')
            ->distinct()
            ->orderBy('paper_size_division_code')
            ->pluck('paper_size_division_code')
            ->filter()
            ->values()
            ->map(fn(PaperSizeDivisionCode $code) => [
                'value' => $code->value,
                'label' => $code->label(),
            ])
            ->all();

        return [
            'paper_size_division_code_options' => $divisionCodes,
        ];
    }

    /**
     * Get paper prices with filters for Admin.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPaperPrices(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = PaperPrice::query();

        $paperId = Arr::get($filters, 'paper_id');
        if ($paperId) {
            $query->where('paper_id', $paperId);
        }

        $supplyPriceMin = Arr::get($filters, 'supply_price_min');
        if ($supplyPriceMin !== null) {
            $query->where('supply_price', '>=', $supplyPriceMin);
        }

        $supplyPriceMax = Arr::get($filters, 'supply_price_max');
        if ($supplyPriceMax !== null) {
            $query->where('supply_price', '<=', $supplyPriceMax);
        }

        $costMin = Arr::get($filters, 'cost_min');
        if ($costMin !== null) {
            $query->where('cost', '>=', $costMin);
        }

        $costMax = Arr::get($filters, 'cost_max');
        if ($costMax !== null) {
            $query->where('cost', '<=', $costMax);
        }

        $divisionCode = Arr::get($filters, 'paper_size_division_code');
        if ($divisionCode) {
            $query->where('paper_size_division_code', $divisionCode);
        }

        $hotDeal = Arr::get($filters, 'is_hot_deal');
        if ($hotDeal !== null) {
            $query->where('is_hot_deal', $hotDeal);
        }

        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $sortColumn = match ($sortBy) {
            'paper_id' => 'paper_id',
            'supply_price' => 'supply_price',
            'cost' => 'cost',
            'created_at' => 'created_at',
            default => 'created_at',
        };

        $query->orderBy($sortColumn, $sortOrder);

        $currentPage = Arr::get(
            $filters,
            'page',
            Arr::get($filters, 'current_page', 1)
        );

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    public function getPaperPrice(int $id): PaperPrice
    {
        return PaperPrice::findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createPaperPrice(User $adminUser, array $data): PaperPrice
    {
        return DB::transaction(function () use ($data) {
            $exists = PaperPrice::where('paper_id', Arr::get($data, 'paper_id'))
                ->where('paper_size_division_code', Arr::get($data, 'paper_size_division_code'))
                ->exists();

            if ($exists) {
                throw new \InvalidArgumentException('이미 동일한 종이와 용지 크기 구분 코�로 구성된 용지 가격이 존재합니다.');
            }

            return PaperPrice::create(Arr::only($data, [
                'paper_id',
                'paper_size_division_code',
                'supply_price',
                'cost',
                'is_hot_deal',
            ]));
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updatePaperPrice(int $id, array $data): PaperPrice
    {
        return DB::transaction(function () use ($id, $data) {
            $paperPrice = PaperPrice::findOrFail($id);

            $exists = PaperPrice::where('paper_id', Arr::get($data, 'paper_id', $paperPrice->paper_id))
                ->where('paper_size_division_code', Arr::get($data, 'paper_size_division_code', $paperPrice->paper_size_division_code->value))
                ->where('id', '!=', $id)
                ->exists();

            if ($exists) {
                throw new \InvalidArgumentException('이미 동일한 종이와 용지 크기 구분 코드로 구성된 용지 가격이 존재합니다.');
            }

            $paperPrice->update(Arr::only($data, [
                'paper_id',
                'paper_size_division_code',
                'supply_price',
                'cost',
                'is_hot_deal',
            ]));

            return $paperPrice;
        });
    }

    public function deletePaperPrice(int $id): void
    {
        DB::transaction(function () use ($id) {
            $paperPrice = PaperPrice::findOrFail($id);
            $paperPrice->delete();
        });
    }
}
