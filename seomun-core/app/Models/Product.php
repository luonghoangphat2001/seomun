<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Product extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'category_id',
        'pricing_profile_id',
        'pricing_structure',
        'name',
        'name_en',
        'name_ja',
        'slug',
        'description',
        'short_description',
        'price',
        'compare_price',
        'sku',
        'images',
        'is_popular',
        'is_featured',
        'stock_quantity',
        'min_quantity',
        'max_quantity',
        'sort_order',
        'is_active',
        'view_count',
        'exposure_count',
        'average_rating',
        'total_reviews',
        'total_rating',
        'branch_name',
        'client_name',
        'requires_separate_shipping',
        'separate_shipping_fee',
        'allow_file_upload',
        'allow_web_editor',
        'is_blank_canvas',
        'web_editor_id',
        'info_icon',
        'dieline_file_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'pricing_structure' => \App\Enums\PricingStructure::class,
        'price' => 'integer',
        'compare_price' => 'integer',
        'images' => 'array',
        'is_popular' => 'boolean',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'stock_quantity' => 'integer',
        'min_quantity' => 'integer',
        'max_quantity' => 'integer',
        'sort_order' => 'integer',
        'view_count' => 'integer',
        'exposure_count' => 'integer',
        'average_rating' => 'decimal:2',
        'total_reviews' => 'integer',
        'total_rating' => 'integer',
        'branch_name' => 'string',
        'client_name' => 'string',
        'requires_separate_shipping' => 'boolean',
        'separate_shipping_fee' => 'integer',
        'allow_file_upload' => 'boolean',
        'allow_web_editor' => 'boolean',
        'is_blank_canvas' => 'boolean',
        'info_icon' => 'array',
    ];

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function specification(): HasOne
    {
        return $this->hasOne(ProductSpecification::class);
    }

    public function dielineFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'dieline_file_id');
    }

    public function pricingProfile(): BelongsTo
    {
        return $this->belongsTo(PricingProfile::class);
    }


    public function optionGroups(): HasMany
    {
        return $this->hasMany(ProductOptionGroup::class)->orderBy('sort_order');
    }

    /**
     * Scope a query to only include active products.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->whereHas('category', fn ($q) => $q->where('is_active', true));
    }

    /**
     * Scope a query to only include popular products.
     */
    public function scopePopular($query)
    {
        return $query->where('is_popular', true)->where('is_active', true);
    }

    /**
     * Scope a query to only include featured products.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->where('is_active', true);
    }

    /**
     * Scope a query to search products by keyword.
     */
    public function scopeSearch($query, $keyword)
    {
        return $query->where(function ($q) use ($keyword) {
            $q->where('name', 'like', "%{$keyword}%")
                ->orWhere('name_en', 'like', "%{$keyword}%")
                ->orWhere('name_ja', 'like', "%{$keyword}%");
        });
    }

    /**
     * Increment the view count.
     */
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    /**
     * Increment the exposure count.
     */
    public function incrementExposureCount(): void
    {
        $this->increment('exposure_count');
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get the first image URL.
     */
    public function getFirstImageAttribute(): ?string
    {
        return $this->images[0] ?? null;
    }

    /**
     * Check if product has discount.
     */
    public function getHasDiscountAttribute(): bool
    {
        return $this->compare_price && $this->compare_price > $this->price;
    }

    /**
     * Get discount percentage.
     */
    public function getDiscountPercentageAttribute(): ?int
    {
        if (! $this->has_discount) {
            return null;
        }

        return (int) round((($this->compare_price - $this->price) / $this->compare_price) * 100);
    }

    /**
     * Configure activity log options for Product model.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'category_id',
                'name',
                'name_en',
                'name_ja',
                'slug',
                'description',
                'short_description',
                'price',
                'compare_price',
                'sku',
                'images',
                'is_popular',
                'is_featured',
                'stock_quantity',
                'min_quantity',
                'max_quantity',
                'sort_order',
                'is_active',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "Product has been {$eventName}");
    }

    /**
     * Get product with stock quantity < 0
     */
    public function scopeIsOutOfStock($query)
    {
        return $query->where('stock_quantity', '<=', 0);
    }

    /**
     * Get the customers that have this product as promotional.
     */
    public function promotionalCustomers(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class, 'customer_promotional_products')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    public function unitPrices(): HasMany
    {
        return $this->hasMany(UnitPrice::class, 'product_id');
    }

    public function productSets(): HasOne
    {
        return $this->hasOne(ProductSet::class);
    }

    public function quantityPrices(): HasMany
    {
        return $this->hasMany(ProductQuantityPrice::class);
    }

    /**
     * Get the web editor linked to this product.
     */
    public function webEditor(): BelongsTo
    {
        return $this->belongsTo(WebEditor::class);
    }

    /**
     * Get the shopping setting items selected for this product.
     */
    public function shoppingSettingItems(): BelongsToMany
    {
        return $this->belongsToMany(
            ShoppingSettingItem::class,
            'product_shopping_setting_items',
            'product_id',
            'shopping_setting_item_id'
        )->withPivot('shopping_setting_id')->withTimestamps();
    }
}
