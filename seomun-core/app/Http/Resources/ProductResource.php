<?php

namespace App\Http\Resources;

use App\Models\Template;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    /**
     * Convert image path to full URL.
     */
    private static function toFullImageUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        return $disk->url($path);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $rawImages = $this->images ?? [];
        $images = is_array($rawImages)
            ? array_values(array_map(fn($path) => self::toFullImageUrl((string) $path), $rawImages))
            : [];

        $slug = (string) $this->slug;
        $supportsEditor = str_contains($slug, 'business-card');

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => [
                'ko' => $this->name,
                'en' => $this->name_en ?? $this->name,
                'ja' => $this->name_ja ?? $this->name,
            ],
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'pricing_profile_id' => $this->pricing_profile_id,
            'pricing_structure' => $this->pricing_structure?->value ?? $this->pricing_structure,
            'pricing_profile' => $this->whenLoaded('pricingProfile', fn () => $this->pricingProfile ? ['id' => $this->pricingProfile->id, 'code' => $this->pricingProfile->code, 'name' => $this->pricingProfile->name, 'calculator_type' => $this->pricingProfile->calculator_type?->value] : null),
            'requires_separate_shipping' => $this->requires_separate_shipping,
            'separate_shipping_fee' => $this->separate_shipping_fee,
            'sku' => $this->sku,
            'images' => $images,
            'is_popular' => (bool) $this->is_popular,
            'is_featured' => (bool) $this->is_featured,
            'stock_quantity' => $this->stock_quantity,
            'min_quantity' => $this->min_quantity,
            'max_quantity' => $this->max_quantity,
            'sort_order' => $this->sort_order,
            'is_active' => (bool) $this->is_active,
            'view_count' => $this->view_count,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'category' => $this->whenLoaded('category', fn() => new CategoryResource($this->category)),
            'specification' => $this->whenLoaded('specification', fn() => new ProductSpecificationResource($this->specification)),
            'option_groups' => ProductOptionGroupResource::collection($this->whenLoaded('optionGroups')),
            // Product sets (case/pack quantity options)
            'product_sets' => $this->whenLoaded('productSets', function () {
                if (! $this->productSets) {
                    return null;
                }

                return [
                    'id' => $this->productSets->id,
                    'quantity' => $this->productSets->quantity,
                    'set_type' => $this->productSets->set_type,
                    'min_set' => $this->productSets->min_set,
                    'max_set' => $this->productSets->max_set,
                    'step_set' => $this->productSets->step_set,
                    'set_unit' => $this->productSets->set_unit,
                    'select_options' => $this->productSets->select_options,
                ];
            }),
            // Quantity prices
            'quantity_prices' => ProductQuantityPriceResource::collection($this->whenLoaded('quantityPrices')),
            'first_image' => self::toFullImageUrl($this->first_image),
            'has_discount' => $this->has_discount,
            'discount_percentage' => $this->discount_percentage,
            'supports_editor' => $supportsEditor,
            'average_rating' => $this->average_rating,
            'total_reviews' => $this->total_reviews,
            'allow_file_upload' => $this->allow_file_upload,
            'allow_web_editor' => $this->allow_web_editor,
            'is_blank_canvas' => $this->is_blank_canvas,
            'info_icon' => [
                'size' => data_get($this->info_icon, 'size'),
                'paper' => data_get($this->info_icon, 'paper'),
                'printed_color' => data_get($this->info_icon, 'printed_color'),
                'quantity' => data_get($this->info_icon, 'quantity'),
                'post_processing' => data_get($this->info_icon, 'post_processing'),
                'design' => data_get($this->info_icon, 'design'),
            ],
            'web_editor' => $this->whenLoaded('webEditor', fn() => new WebEditorResource($this->webEditor)),
            'dieline_file' => $this->whenLoaded('dielineFile', fn() => $this->dielineFile ? [
                'id' => $this->dielineFile->id,
                'name' => $this->dielineFile->name,
                'url' => $this->dielineFile->url,
                'type' => $this->dielineFile->type,
                'mime_type' => $this->dielineFile->mime_type,
                'size' => $this->dielineFile->size,
            ] : null),
            'shopping_settings' => $this->whenLoaded('shoppingSettingItems', function () {
                return $this->shoppingSettingItems->map(fn($item) => [
                    'id' => $item->id,
                    'shopping_setting_id' => $item->shopping_setting_id,
                    'type' => $item->setting?->type?->value ?? $item->setting?->type,
                    'type_label' => $item->setting?->title,
                    'title' => $item->title,
                    'content' => $item->content,
                ]);
            }),
            'shopping_setting_item_ids' => $this->whenLoaded('shoppingSettingItems', function () {
                return $this->shoppingSettingItems->pluck('id')->values()->all();
            }),
        ];
    }
}
