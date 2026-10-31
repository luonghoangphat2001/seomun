<?php

namespace App\Services\Admin;

use App\Enums\DirectShippingStatus;
use App\Models\DirectShippingRequest;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class AdminDirectShippingService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get all direct shipping requests with filters and pagination.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getList(array $filters, int $perPage = 20): array
    {
        $query = DirectShippingRequest::query()
            ->with(['user'])
            ->orderBy('created_at', 'desc');

        // Status filter
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // User ID filter
        if (! empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        // Search term filter (shipping_name, recipient_name)
        if (! empty($filters['search_term'])) {
            $search = $filters['search_term'];
            $query->where(function ($q) use ($search) {
                $q->where('recipient_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Date range filter
        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $items = $query->paginate($perPage);

        return [
            'items' => $items->getCollection(),
            'pagination' => $this->paginationService->format($items),
        ];
    }

    /**
     * Get a single direct shipping request by ID.
     */
    public function getOne(int $id): DirectShippingRequest
    {
        return DirectShippingRequest::with(['user'])->findOrFail($id);
    }

    /**
     * Update the status of a direct shipping request.
     */
    public function updateStatus(int $id, DirectShippingStatus $status): DirectShippingRequest
    {
        $item = DirectShippingRequest::findOrFail($id);
        $item->status = $status;
        $item->save();


        return $item->fresh(['user']);
    }

    /**
     * Get status options for dropdown.
     */
    public function getStatusOptions(): array
    {
        return DirectShippingStatus::options();
    }
}