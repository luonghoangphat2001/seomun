<?php

namespace App\Services\Admin;

use App\Models\UnitPriceChangeLog;
use App\Models\UnitPriceItem;
use App\Services\PaginationService;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminUnitPriceChangeLogService
{
    public function __construct(
        protected PaginationService $paginationService,
    ) {}

    public function getList(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = UnitPriceChangeLog::with(['unitPriceItem.unitPrice', 'admin'])
            ->orderBy('created_at', 'desc');

        if (! empty($filters['unit_price_item_id'])) {
            $query->where('unit_price_item_id', $filters['unit_price_item_id']);
        }

        if (! empty($filters['admin_id'])) {
            $query->where('admin_id', $filters['admin_id']);
        }

        if (! empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to'].' 23:59:59');
        }

        return $query->paginate($perPage);
    }

    public function logChange(UnitPriceItem $item, float $priceBefore, int $adminId): UnitPriceChangeLog
    {
        return UnitPriceChangeLog::create([
            'unit_price_item_id'   => $item->id,
            'unit_price_item_name' => $item->option?->name ?? (string) $item->id,
            'price_before'         => $priceBefore,
            'price_after'          => (float) $item->price_value,
            'admin_id'             => $adminId,
        ]);
    }
}
