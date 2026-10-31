<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'product_id' => $this->product_id,
            'order_id' => $this->order_id,
            'rating' => $this->rating,
            'title' => $this->title,
            'content' => $this->content,
            'images' => $this->images ?? [],
            'is_approved' => (bool) $this->is_approved,
            'is_published' => (bool) $this->is_published,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        // Include product if loaded
        if ($this->relationLoaded('product') && $this->product) {
            $product = $this->product;
            $productData = [
                'id' => $product->id,
                'name' => $product->name,
                'name_en' => $product->name_en,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'images' => $product->images ?? [],
                'first_image' => $product->first_image ?? null,
            ];

            // Include category if loaded
            if ($product->relationLoaded('category') && $product->category) {
                $category = $product->category;
                $productData['category'] = [
                    'id' => $category->id,
                    'name' => [
                        'ko' => $category->name,
                        'en' => $category->name_en ?? $category->name,
                    ],
                    'slug' => $category->slug,
                ];
            }

            $data['product'] = $productData;
        }

        // Include user if loaded (for admin views)
        if ($this->relationLoaded('user') && $this->user) {
            $data['user'] = [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ];
        }

        // Include order if loaded
        if ($this->relationLoaded('order') && $this->order) {
            $data['order'] = [
                'id' => $this->order->id,
                'order_number' => $this->order->order_number,
            ];
        }

        return $data;
    }
}
