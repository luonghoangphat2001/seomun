<?php

namespace App\Console\Commands;

use App\Jobs\RecalculateProductRatingJob;
use App\Models\Review;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Bus;

class UnpublishLowRatedReviews extends Command
{
    protected $signature = 'reviews:unpublish-low-rated';
    protected $description = 'Unpublish reviews with rating <= 3 daily';

    public function handle(): int
    {
        $this->info('Starting unpublishing low rated reviews...');

        $productIds = Review::where('rating', '<=', Review::LOW_RATING_THRESHOLD)
            ->where('is_published', true)
            ->pluck('product_id')
            ->unique()
            ->values();

        if ($productIds->isEmpty()) {
            $this->info('No affected products.');
            return Command::SUCCESS;
        }

        $count = Review::where('rating', '<=', Review::LOW_RATING_THRESHOLD)
            ->where('is_published', true)
            ->update(['is_published' => false]);

        $this->info("Unpublished {$count} reviews.");

        $jobs = $productIds->map(fn ($productId) =>
            new RecalculateProductRatingJob($productId)
        )->toArray();

        Bus::batch($jobs)
            ->name('Recalculate Product Ratings')
            ->dispatch();

        $this->info('Dispatched recalculation jobs.');

        return Command::SUCCESS;
    }
}
