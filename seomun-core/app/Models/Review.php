<?php

namespace App\Models;

use App\Http\Filters\Admin\ReviewFilter;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Filterable;

class Review extends Model
{
    use HasFactory, SoftDeletes, Filterable;

    public const LOW_RATING_THRESHOLD = 3;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'product_id',
        'order_id',
        'rating',
        'title',
        'content',
        'images',
        'is_approved',
        'is_published',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rating' => 'integer',
        'images' => 'array',
        'is_approved' => 'boolean',
        'is_published' => 'boolean',
    ];

    /**
     * Get the user that wrote the review.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product being reviewed.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the order associated with the review (if any).
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Scope a query to filter by user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to filter by product.
     */
    public function scopeForProduct($query, int $productId)
    {
        return $query->where('product_id', $productId);
    }

    /**
     * Scope a query to only include published reviews.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope a query to filter by rating.
     */
    public function scopeByRating($query, ?int $rating)
    {
        if ($rating) {
            return $query->where('rating', $rating);
        }

        return $query;
    }

    /**
     * Scope a query to order by most recent first.
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    protected function getFiltersClass(): string
    {
        return ReviewFilter::class;
    }

    /**
     * Check if review can be edited by user.
     */
    public function canBeEditedBy(User $user): bool
    {
        return $this->user_id === $user->id && ! $this->is_published;
    }

    /**
     * Check if review can be deleted by user.
     */
    public function canBeDeletedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }
}
