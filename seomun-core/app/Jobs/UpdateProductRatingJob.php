<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateProductRatingJob implements ShouldQueue
{
    use Queueable;

    public int $productId;

    public string $action;

    public ?int $oldRating;

    public ?int $newRating;

    public int $tries = 3;

    public int $timeout = 10;

    public function __construct(
        int $productId,
        string $action,
        ?int $oldRating = null,
        ?int $newRating = null
    ) {
        $this->productId = $productId;
        $this->action = $action;
        $this->oldRating = $oldRating;
        $this->newRating = $newRating;
    }

    public function handle(): void
    {
        match ($this->action) {
            'created' => $this->handleCreated(),
            'updated' => $this->handleUpdated(),
            'deleted' => $this->handleDeleted(),
            default => null,
        };
    }

    /**
     * Handle review created
     */
    private function handleCreated(): void
    {
        if ($this->newRating === null) {
            return;
        }

        DB::update('
            UPDATE products
            SET 
                total_reviews = total_reviews + 1,
                total_rating = total_rating + ?,
                average_rating = (total_rating + ?) / (total_reviews + 1)
            WHERE id = ?
        ', [$this->newRating, $this->newRating, $this->productId]);
    }

    /**
     * Handle review updated
     */
    private function handleUpdated(): void
    {
        if ($this->oldRating === null || $this->newRating === null) {
            return;
        }

        DB::update('
            UPDATE products
            SET 
                total_rating = total_rating + (? - ?),
                average_rating = 
                    CASE 
                        WHEN total_reviews = 0 THEN 0
                        ELSE (total_rating + (? - ?)) / total_reviews
                    END
            WHERE id = ?
        ', [
            $this->newRating,
            $this->oldRating,
            $this->newRating,
            $this->oldRating,
            $this->productId
        ]);
    }

    /**
     * Handle review deleted
     */
    private function handleDeleted(): void
    {
        if ($this->oldRating === null) {
            return;
        }

        DB::update('
            UPDATE products
            SET 
                total_reviews = GREATEST(total_reviews - 1, 0),
                total_rating = GREATEST(total_rating - ?, 0),
                average_rating = 
                    CASE 
                        WHEN total_reviews <= 1 THEN 0
                        ELSE (total_rating - ?) / (total_reviews - 1)
                    END
            WHERE id = ?
        ', [
            $this->oldRating,
            $this->oldRating,
            $this->productId
        ]);
    }
}
