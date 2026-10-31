<?php

namespace App\Services\Admin;

use App\Enums\PostProcessingSizeType;
use App\Models\PostProcessingPrice;
use App\Models\PostProcessingPriceItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;

class AdminPostProcessingPriceService
{
    public function getPostProcessingPrices(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = PostProcessingPrice::query()
            ->with(['erpOption', 'postProcessingPriceItems'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('code', 'like', "%{$search}%");
            })
            ->when(isset($filters['code']), function ($query) use ($filters) {
                $query->where('code', $filters['code']);
            })
            ->when($filters['erp_option_id'] ?? null, function ($query, $erpOptionId) {
                $query->where('erp_option_id', $erpOptionId);
            })
            ->when($filters['post_processing_size_type'] ?? null, function ($query, $sizeType) {
                $query->where('post_processing_size_type', $sizeType);
            })
            ->when(isset($filters['is_active']), function ($query) use ($filters) {
                $query->where('is_active', (bool) $filters['is_active']);
            })
            ->orderByDesc('id');

        $currentPage = Arr::get(
            $filters,
            'page',
            Arr::get($filters, 'current_page', 1)
        );

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    public function getPostProcessingPrice(int $id): PostProcessingPrice
    {
        $price = PostProcessingPrice::with(['erpOption', 'postProcessingPriceItems'])->findOrFail($id);

        return $price;
    }

    public function createPostProcessingPrice(array $data): PostProcessingPrice
    {
        $price = PostProcessingPrice::create($data);

        if (!empty($data['items'])) {
            $this->syncItems($price, $data['items']);
        }

        return $price->load(['erpOption', 'postProcessingPriceItems']);
    }

    public function updatePostProcessingPrice(int $id, array $data): PostProcessingPrice
    {
        $price = PostProcessingPrice::findOrFail($id);

        $price->update($data);

        if (array_key_exists('items', $data)) {
            $this->syncItems($price, $data['items']);
        }

        return $price->load(['erpOption', 'postProcessingPriceItems']);
    }

    public function deletePostProcessingPrice(int $id): void
    {
        $price = PostProcessingPrice::findOrFail($id);
        $price->delete();
    }

    public function toggleStatus(int $id): PostProcessingPrice
    {
        $price = PostProcessingPrice::findOrFail($id);
        $price->update(['is_active' => !$price->is_active]);

        return $price->fresh(['erpOption', 'postProcessingPriceItems']);
    }

    public function getItemsByPostProcessingPrice(int $postProcessingPriceId): array
    {
        $items = PostProcessingPriceItem::query()
            ->where('post_processing_price_id', $postProcessingPriceId)
            ->orderBy('quantity')
            ->get();

        return $items->toArray();
    }

    public function createItem(int $postProcessingPriceId, array $data): PostProcessingPriceItem
    {
        $price = PostProcessingPrice::findOrFail($postProcessingPriceId);

        $item = $price->postProcessingPriceItems()->create($data);

        return $item;
    }

    public function updateItem(int $id, array $data): PostProcessingPriceItem
    {
        $item = PostProcessingPriceItem::findOrFail($id);
        $item->update($data);

        return $item;
    }

    public function deleteItem(int $id): void
    {
        $item = PostProcessingPriceItem::findOrFail($id);
        $item->delete();
    }

    protected function syncItems(PostProcessingPrice $price, array $items): void
    {
        $price->postProcessingPriceItems()->delete();

        foreach ($items as $item) {
            $price->postProcessingPriceItems()->create($item);
        }
    }
}
