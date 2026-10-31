<?php

namespace App\Services\Admin;

use App\Models\OrderExtraEntry;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AdminOrderExtraEntryService
{
    /**
     * Get OrderExtraEntry with filters & pagination
     */
    public function getOrderExtraEntries(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = OrderExtraEntry::query()->with('products');

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    public function getOrderExtraEntry(string $id): OrderExtraEntry
    {
        $query = OrderExtraEntry::query()->with('products');

        $data = $query->where('id', $id)->first();

        if (! $data) {
            throw new ModelNotFoundException('data not found.');
        }

        return $data;
    }
}
