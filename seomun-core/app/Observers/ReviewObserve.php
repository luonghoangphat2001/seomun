<?php

namespace App\Observers;

use App\Jobs\UpdateProductRatingJob;
use App\Models\Review;
use Illuminate\Support\Facades\Log;

class ReviewObserve
{
    public function created(Review $review): void
    {
        if (! $review->is_published) {
            return;
        }

        UpdateProductRatingJob::dispatch(
            $review->product_id,
            'created',
            null,
            $review->rating
        );
    }

    public function updated(Review $review): void
    {
        $wasPublished = $review->getOriginal('is_published');
        $oldRating = $review->getOriginal('rating');
        if ($wasPublished && $review->is_published) {
            UpdateProductRatingJob::dispatch(
                $review->product_id,
                'updated',
                $oldRating,
                $review->rating
            );
        } elseif ($wasPublished && ! $review->is_published) {
            UpdateProductRatingJob::dispatch(
                $review->product_id,
                'deleted',
                $oldRating,
                null
            );
        } elseif (! $wasPublished && $review->is_published) {
            UpdateProductRatingJob::dispatch(
                $review->product_id,
                'created',
                null,
                $review->rating
            );
        }
    }

    public function deleted(Review $review): void
    {
        if (! $review->is_published) {
            return;
        }

        UpdateProductRatingJob::dispatch(
            $review->product_id,
            'deleted',
            $review->rating,
            null
        );
    }
}
