<?php

namespace App\Services;

use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;

class ReviewService
{
    public function getProductReviews(string $slug, $payload)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $query = Review::forProduct($product->id)
            ->published()
            ->with('user')
            ->recent();

        if ($payload->rating) {
            $query->byRating((int) $payload->rating);
        }

        $reviews = $query->paginate($payload->per_page ?? 10);

        $reviews->getCollection()->transform(
            fn ($item) => new ReviewResource($item)
        );

        return [
            'reviews' => $reviews->getCollection(),
            'pagination' => app(PaginationService::class)->format($reviews),
        ];
    }
}
