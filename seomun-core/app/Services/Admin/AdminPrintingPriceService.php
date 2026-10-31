<?php

namespace App\Services\Admin;

use App\Models\PrintingPrice;
use App\Models\PrintingPriceItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminPrintingPriceService
{
    /**
     * Get printing prices with filters.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPrintingPrices(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = PrintingPrice::query()->with('printingPriceItems');

        if (isset($filters['name']) && ! empty($filters['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }

        if (isset($filters['machine_type']) && ! empty($filters['machine_type'])) {
            $query->where('machine_type', $filters['machine_type']);
        }

        if (isset($filters['book_printing_size_type']) && ! empty($filters['book_printing_size_type'])) {
            $query->where('book_printing_size_type', $filters['book_printing_size_type']);
        }

        if (isset($filters['side_type']) && ! empty($filters['side_type'])) {
            $query->where('side_type', $filters['side_type']);
        }

        if (isset($filters['book_printing_type']) && ! empty($filters['book_printing_type'])) {
            $query->where('book_printing_type', $filters['book_printing_type']);
        }

        if (isset($filters['is_hot_deal'])) {
            $query->where('is_hot_deal', (bool) $filters['is_hot_deal']);
        }


        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $sortColumn = match ($sortBy) {
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

    public function getPrintingPrice(int $id): PrintingPrice
    {
        return PrintingPrice::with('printingPriceItems')->findOrFail($id);
    }

    public function createPrintingPrice(array $data): PrintingPrice
    {
        return DB::transaction(function () use ($data) {
            $itemsData = $data['items'] ?? [];
            unset($data['items']);

            $printingPrice = PrintingPrice::create($data);

            foreach ($itemsData as $itemData) {
                $printingPrice->printingPriceItems()->create($itemData);
            }

            return $printingPrice->load('printingPriceItems');
        });
    }

    public function updatePrintingPrice(int $id, array $data): PrintingPrice
    {
        $printingPrice = $this->getPrintingPrice($id);

        return DB::transaction(function () use ($printingPrice, $data) {
            $itemsData = $data['items'] ?? null;
            unset($data['items']);

            $printingPrice->update($data);

            if ($itemsData !== null) {
                $printingPrice->printingPriceItems()->delete();
                foreach ($itemsData as $itemData) {
                    $printingPrice->printingPriceItems()->create($itemData);
                }
            }

            return $printingPrice->load('printingPriceItems');
        });
    }

    public function deletePrintingPrice(int $id): void
    {
        $printingPrice = $this->getPrintingPrice($id);
        $printingPrice->delete();
    }

    public function getPrintingPriceItem(int $id): PrintingPriceItem
    {
        return PrintingPriceItem::findOrFail($id);
    }

    public function createPrintingPriceItem(int $printingPriceId, array $data): PrintingPriceItem
    {
        $printingPrice = $this->getPrintingPrice($printingPriceId);

        return $printingPrice->printingPriceItems()->create($data);
    }

    public function updatePrintingPriceItem(int $id, array $data): PrintingPriceItem
    {
        $item = $this->getPrintingPriceItem($id);
        $item->update($data);

        return $item;
    }

    public function getPrintingPriceItems(int $printingPriceId): Collection
    {
        $printingPrice = $this->getPrintingPrice($printingPriceId);
        return $printingPrice->printingPriceItems;
    }

    public function deletePrintingPriceItem(int $id): void
    {
        $item = $this->getPrintingPriceItem($id);
        $item->delete();
    }
}
