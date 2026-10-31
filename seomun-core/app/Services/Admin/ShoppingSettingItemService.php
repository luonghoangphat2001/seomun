<?php

namespace App\Services\Admin;

use App\Models\ShoppingSettingItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ShoppingSettingItemService
{
    /**
     * Get items for a given shopping setting.
     */
    public function getItemsBySetting(int $settingId, ?bool $onlyActive = null): Collection
    {
        $query = ShoppingSettingItem::query()
            ->where('shopping_setting_id', $settingId)
            ->with('setting')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc');

        if ($onlyActive !== null) {
            $query->where('is_active', $onlyActive);
        }

        return $query->get();
    }

    /**
     * Get single item by ID.
     */
    public function getItemById(int $id): ?ShoppingSettingItem
    {
        return ShoppingSettingItem::with('setting')->find($id);
    }

    /**
     * Create a new shopping setting item.
     */
    public function createItem(array $data): ShoppingSettingItem
    {
        return DB::transaction(function () use ($data) {
            if (!empty($data['is_default'])) {
                ShoppingSettingItem::where('shopping_setting_id', $data['shopping_setting_id'])
                    ->update(['is_default' => false]);
            }

            return ShoppingSettingItem::create($data);
        });
    }

    /**
     * Update an existing shopping setting item.
     */
    public function updateItem(int $id, array $data): ?ShoppingSettingItem
    {
        $item = ShoppingSettingItem::find($id);
        if (!$item) {
            return null;
        }

        return DB::transaction(function () use ($item, $data) {
            if (!empty($data['is_default'])) {
                ShoppingSettingItem::where('shopping_setting_id', $item->shopping_setting_id)
                    ->where('id', '!=', $item->id)
                    ->update(['is_default' => false]);
            }

            $item->update($data);
            return $item->fresh(['setting']);
        });
    }

    /**
     * Delete a shopping setting item.
     */
    public function deleteItem(int $id): bool
    {
        return ShoppingSettingItem::destroy($id) > 0;
    }

    /**
     * Set an item as default for its shopping setting.
     */
    public function setDefault(int $id): ?ShoppingSettingItem
    {
        $item = ShoppingSettingItem::find($id);
        if (!$item) {
            return null;
        }

        return DB::transaction(function () use ($item) {
            ShoppingSettingItem::where('shopping_setting_id', $item->shopping_setting_id)
                ->where('id', '!=', $item->id)
                ->update(['is_default' => false]);

            $item->update(['is_default' => true]);
            return $item->fresh(['setting']);
        });
    }
}
