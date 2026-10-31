<?php

namespace App\Http\Resources;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductListResource extends JsonResource
{
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

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => [
                'ko' => $this->name,
                'en' => $this->name_en ?? $this->name,
                'ja' => $this->name_ja ?? $this->name,
            ],
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'price' => $this->price,
            'compare_price' => $this->compare_price,
            'first_image' => self::toFullImageUrl($this->first_image),
            'is_popular' => (bool) $this->is_popular,
            'is_featured' => (bool) $this->is_featured,
            'is_active' => (bool) $this->is_active,
            'sort_order' => $this->sort_order,
            'has_discount' => $this->has_discount,
            'discount_percentage' => $this->discount_percentage,
            'average_rating' => $this->average_rating,
            'total_reviews' => $this->total_reviews,
            'view_count' => $this->view_count,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => [
                    'ko' => $this->category->name,
                    'en' => $this->category->name_en ?? $this->category->name,
                ],
                'slug' => $this->category->slug,
                'is_active' => (bool) $this->category->is_active,
            ]),
        ];
    }
}
