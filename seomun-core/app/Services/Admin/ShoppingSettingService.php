<?php

namespace App\Services\Admin;

use App\Enums\ShoppingSettingType;
use App\Models\ShoppingSetting;
use App\Models\ShoppingSettingItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class ShoppingSettingService
{
    public function getAllShoppingSettings(): Collection
    {
        return ShoppingSetting::with(['items', 'defaultItem'])->get();
    }

    public function getShoppingSettingById(int $id): ?ShoppingSetting
    {
        return ShoppingSetting::with(['items', 'defaultItem'])->find($id);
    }

    /**
     * Resolve shopping settings for a product.
     * Returns all settings with title & content replaced by the item selected for this product (or default item).
     *
     * @return \Illuminate\Support\Collection
     */
    public function getSettingsForProduct(\App\Models\Product $product): \Illuminate\Support\Collection
    {
        $orderMap = [
            ShoppingSettingType::GENERAL_PRODUCTION_GUIDE->value => 1,
            ShoppingSettingType::GENERAL_PRECAUTIONS->value => 2,
            ShoppingSettingType::SHIPMENT_DELIVERY_INFORMATION->value => 3,
            ShoppingSettingType::USER_GUIDE->value => 4,
        ];

        $settings = ShoppingSetting::with('defaultItem')->get()->sortBy(function ($setting) use ($orderMap) {
            $typeVal = $setting->type?->value ?? (string) $setting->type;
            return $orderMap[$typeVal] ?? 99;
        })->values();

        $selectedItems = $product->relationLoaded('shoppingSettingItems')
            ? $product->shoppingSettingItems
            : $product->shoppingSettingItems()->get();

        return $settings->map(function ($setting) use ($selectedItems) {
            $typeVal = $setting->type?->value ?? (string) $setting->type;

            /** @var \App\Models\ShoppingSettingItem|null $selectedItem */
            $selectedItem = $selectedItems->firstWhere('shopping_setting_id', $setting->id);

            $activeItem = $selectedItem ?? $setting->defaultItem;

            return [
                'id' => $setting->id,
                'type' => $typeVal,
                'type_label' => $setting->title,
                'title' => $setting->title,
                'content' => $activeItem?->content ?? null,
                'item_id' => $selectedItem?->id ?? $activeItem?->id,
                'item_title' => $selectedItem?->title,
                'is_custom' => $selectedItem !== null,
                'has_selected_item' => $selectedItem !== null,
            ];
        });
    }

    /**
     * Get public shopping settings (only active items).
     */
    public function getPublicShoppingSettings(?string $type = null): Collection
    {
        $query = ShoppingSetting::with(['activeItems', 'defaultItem']);

        if (!empty($type)) {
            $query->where('type', $type);
        }

        return $query->get();
    }

    /**
     * Get single public shopping setting by ID.
     */
    public function getPublicShoppingSettingById(int $id): ?ShoppingSetting
    {
        return ShoppingSetting::with(['activeItems', 'defaultItem'])->find($id);
    }

    /**
     * Get single public shopping setting by Type string.
     */
    public function getPublicShoppingSettingByType(string $type): ?ShoppingSetting
    {
        return ShoppingSetting::with(['activeItems', 'defaultItem'])
            ->where('type', $type)
            ->first();
    }

    /**
     * Get public items of a shopping setting.
     */
    public function getPublicItemsBySettingId(int $settingId): Collection
    {
        return ShoppingSettingItem::query()
            ->where('shopping_setting_id', $settingId)
            ->where('is_active', true)
            ->with('setting')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();
    }

    /**
     * Get single public item by ID.
     */
    public function getPublicItemById(int $itemId): ?ShoppingSettingItem
    {
        return ShoppingSettingItem::query()
            ->where('id', $itemId)
            ->where('is_active', true)
            ->with('setting')
            ->first();
    }

    public function createShoppingSetting(array $data): ShoppingSetting
    {
        if (ShoppingSetting::where('type', $data['type'])->exists()) {
            throw new \Exception('A shopping setting with this type already exists.', 422);
        }

        try {
            return ShoppingSetting::create($data);
        } catch (QueryException $e) {
            if ($e->getCode() === 23000) {
                throw new \Exception('A shopping setting with this type already exists.', 422);
            }
            throw $e;
        }
    }

    public function updateShoppingSetting(int $id, array $data): ?ShoppingSetting
    {
        $setting = ShoppingSetting::find($id);
        if (! $setting) {
            return null;
        }

        if (isset($data['type']) && $data['type'] !== $setting->type->value) {
            if (ShoppingSetting::where('type', $data['type'])->where('id', '<>', $id)->exists()) {
                throw new \Exception('A shopping setting with this type already exists.', 422);
            }
        }

        try {
            $setting->update($data);
        } catch (QueryException $e) {
            if ($e->getCode() === 23000) {
                throw new \Exception('A shopping setting with this type already exists.', 422);
            }
            throw $e;
        }

        return $setting->fresh();
    }

    public function deleteShoppingSetting(int $id): bool
    {
        return ShoppingSetting::destroy($id) > 0;
    }
}
