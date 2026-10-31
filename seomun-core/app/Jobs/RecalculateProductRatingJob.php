<?php

namespace App\Jobs;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class RecalculateProductRatingJob implements ShouldQueue
{
    use Dispatchable, Queueable, Batchable;

    public int $productId;

    public int $tries = 3;
    public int $timeout = 10;

    public function __construct(int $productId)
    {
        $this->productId = $productId;
    }

    public function handle(): void
    {
        $data = Review::where('product_id', $this->productId)
            ->where('is_published', true)
            ->selectRaw('COUNT(*) as total, COALESCE(SUM(rating), 0) as sum')
            ->first();

        $total = (int) $data->total;
        $sum = (int) $data->sum;

        $avg = $total > 0 ? round($sum / $total, 2) : 0;

        Product::where('id', $this->productId)->update([
            'total_reviews' => $total,
            'total_rating' => $sum,
            'average_rating' => $avg,
        ]);
    }
}
