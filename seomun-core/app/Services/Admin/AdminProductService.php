<?php

namespace App\Services\Admin;

use App\Enums\DesignModeCode;
use App\Enums\ErpOptionGroupCode;
use App\Enums\ProductSpecificationOption;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\ErpOption;
use App\Models\Product;
use App\Models\ProductDesignMode;
use App\Models\ProductOption;
use App\Models\ProductOptionGroup;
use App\Models\ProductSet;
use App\Models\ProductSpecification;
use App\Models\ShoppingSettingItem;
use App\Services\Pricing\PricingCoverageService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminProductService
{
    public function __construct(private readonly PricingCoverageService $pricingCoverage) {}

    /**
     * Default relationships to load with products
     *
     * @var array<string>
     */
    protected const DEFAULT_RELATIONSHIPS = [
        'category',
        'pricingProfile',
        'specification',
        'optionGroups.options.erpOption',
        'productSets',
        'quantityPrices',
        'webEditor',
        'dielineFile',
        'shoppingSettingItems.setting',
    ];

    /**
     * Get search filter options for products.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        return [
            'status_options' => [
                ['value' => 'sold', 'label' => 'Sold'],
                ['value' => 'hidden', 'label' => 'Hidden'],
            ],
            'promotional_options' => [
                ['value' => true, 'label' => 'Promotional'],
                ['value' => false, 'label' => 'Non-Promotional'],
            ],
            'category_options' => Category::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(function ($category) {
                    return [
                        'value' => $category->id,
                        'label' => $category->name,
                        'slug' => $category->slug,
                        'code' => $category->code,
                    ];
                })
                ->toArray(),
            'sort_options' => [
                ['value' => 'created_at', 'label' => 'Registration Date'],
                ['value' => 'status', 'label' => 'Status'],
                ['value' => 'category', 'label' => 'Category'],
                ['value' => 'name', 'label' => 'Product Name'],
            ],
        ];
    }

    /**
     * Get products for admin with filters
     *
     * @param  array<string, mixed>  $filters
     */
    public function getProductsForAdmin(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);

        // Apply sorting
        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * Build query with filters
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $relationships = ['category:id,name,slug'] + array_diff(self::DEFAULT_RELATIONSHIPS, ['category']);
        $query = Product::with($relationships);

        // Filter by product name
        if ($productName = Arr::get($filters, 'product_name')) {
            $query->where(function ($q) use ($productName) {
                $q->where('name', 'like', "%{$productName}%")
                    ->orWhere('name_en', 'like', "%{$productName}%")
                    ->orWhere('name_ja', 'like', "%{$productName}%");
            });
        }

        // Filter by product code (SKU)
        if ($productCode = Arr::get($filters, 'product_code')) {
            $query->where('sku', 'like', "%{$productCode}%");
        }

        // Filter by status (sold/hidden)
        if ($status = Arr::get($filters, 'status')) {
            if ($status === 'sold') {
                $query->where('is_active', true);
            } elseif ($status === 'hidden') {
                $query->where('is_active', false);
            }
        }

        // Filter by promotional use
        if (Arr::has($filters, 'is_promotional')) {
            $isPromotional = Arr::get($filters, 'is_promotional', false);
            // TODO: Add is_promotional field to products table if needed
            // For now, this might be determined by category or metadata
            // $query->where('is_promotional', $isPromotional);
        }

        // Category filter - by ID
        if ($categoryId = Arr::get($filters, 'category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Category filter - by name
        if ($categoryName = Arr::get($filters, 'category_name')) {
            $query->whereHas('category', function ($categoryQuery) use ($categoryName) {
                $categoryQuery->where('name', 'like', "%{$categoryName}%")
                    ->orWhere('name_en', 'like', "%{$categoryName}%")
                    ->orWhere('name_ja', 'like', "%{$categoryName}%");
            });
        }

        // Branch name filter (지점명)
        if ($branchName = Arr::get($filters, 'branch')) {
            $query->where('branch_name', 'like', "%{$branchName}%");
        }

        // Client name filter (고객사명)
        if ($clientName = Arr::get($filters, 'client_name')) {
            $query->where('client_name', 'like', "%{$clientName}%");
        }

        // Whether to disclose (공개여부) - maps to is_active
        if (Arr::has($filters, 'is_public')) {
            $isPublic = filter_var(Arr::get($filters, 'is_public'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($isPublic !== null) {
                $query->where('is_active', $isPublic);
            }
        }

        // Whether or not to quote (견적 여부) - based on a complete pricing setup.
        // Support both 'quotation' and 'has_quotation' parameter names
        $quotationParam = Arr::get($filters, 'has_quotation') ?? Arr::get($filters, 'quotation');
        if ($quotationParam !== null) {
            // Convert string "true"/"false" to boolean, or use boolean directly
            $hasQuotation = filter_var($quotationParam, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($hasQuotation === true) {
                $query->whereNotNull('pricing_profile_id');
            } elseif ($hasQuotation === false) {
                $query->whereNull('pricing_profile_id');
            }
        }

        // Availability (재고 상태): in_stock / out_of_stock
        if ($availability = Arr::get($filters, 'availability')) {
            if ($availability === 'in_stock') {
                $query->where('stock_quantity', '>', 0);
            } elseif ($availability === 'out_of_stock') {
                $query->where('stock_quantity', '<=', 0);
            }
        }

        // Search term (검색어) - product name, product code, description
        if ($searchTerm = Arr::get($filters, 'search_term')) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('name_en', 'like', "%{$searchTerm}%")
                    ->orWhere('name_ja', 'like', "%{$searchTerm}%")
                    ->orWhere('sku', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        return $query;
    }

    /**
     * Get product relationships array
     *
     * @return array<string>
     */
    protected function getProductRelationships(): array
    {
        return self::DEFAULT_RELATIONSHIPS;
    }

    /**
     * Get a single product for admin by ID or slug
     *
     * @throws ModelNotFoundException
     */
    public function getProductForAdmin(int|string $identifier, bool $includeDeleted = false): Product
    {
        $query = Product::with($this->getProductRelationships());

        if ($includeDeleted) {
            $query->withTrashed();
        }

        if (is_numeric($identifier)) {
            $product = $query->find($identifier);
        } else {
            $product = $query->where('slug', $identifier)->first();
        }

        if (! $product) {
            throw new ModelNotFoundException('Product not found');
        }

        return $product;
    }

    /**
     * Create a new product with all relationships
     *
     * @param  array<string, mixed>  $data
     */
    public function createProduct(array $data): Product
    {
        return DB::transaction(function () use ($data) {

            $this->validateProductionMethod(Arr::get($data, 'allow_file_upload', false), Arr::get($data, 'allow_web_editor', false));
            // Generate slug if not provided
            $slug = Arr::get($data, 'slug');
            if (! $slug) {
                $slug = Str::slug($data['name']);
            }

            // Ensure unique slug
            $baseSlug = $slug;
            $counter = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $baseSlug.'-'.$counter;
                $counter++;
            }

            // Create product
            $product = Product::create([
                'category_id' => $data['category_id'],
                'pricing_profile_id' => $data['pricing_profile_id'],
                'pricing_structure' => Arr::get($data, 'pricing_structure', 'single'),
                'name' => $data['name'],
                'name_en' => Arr::get($data, 'name_en'),
                'name_ja' => Arr::get($data, 'name_ja'),
                'slug' => $slug,
                'description' => Arr::get($data, 'description'),
                'short_description' => Arr::get($data, 'short_description'),
                // Legacy columns are retained for audit/backward compatibility,
                // but are no longer a source of quote pricing.
                'price' => 0,
                'compare_price' => null,
                'sku' => Arr::get($data, 'sku'),
                'requires_separate_shipping' => Arr::get($data, 'requires_separate_shipping'),
                'separate_shipping_fee' => Arr::get($data, 'separate_shipping_fee'),
                'images' => Arr::get($data, 'images', []), // Representative image(s) – URLs set via CRUD (no upload)
                'is_popular' => Arr::get($data, 'is_popular', false),
                'is_featured' => Arr::get($data, 'is_featured', false),
                'allow_file_upload' => Arr::get($data, 'allow_file_upload', false),
                'allow_web_editor' => Arr::get($data, 'allow_web_editor', false),
                'is_blank_canvas' => Arr::get($data, 'is_blank_canvas', false),
                'stock_quantity' => Arr::get($data, 'stock_quantity', 0),
                'min_quantity' => Arr::get($data, 'min_quantity', 1),
                'max_quantity' => Arr::get($data, 'max_quantity'),
                'sort_order' => Arr::get($data, 'sort_order', 0),
                'is_active' => Arr::get($data, 'is_active', true),
                'info_icon' => Arr::get($data, 'info_icon'),
                'dieline_file_id' => Arr::get($data, 'dieline_file_id'),
            ]);

            // Create specification
            if (Arr::has($data, 'specification')) {
                $this->syncSpecification($product, $data['specification']);
            }

            // Create option groups
            // if (!Arr::has($data, 'option_groups')) {
            //     $data['option_groups'] = $this->getDefaultData()['option_groups'];
            // }
            if (Arr::has($data, 'option_groups')) {
                $this->syncOptionGroups($product, $data['option_groups']);
            }

            // Create design modes
            // if (!Arr::has($data, 'design_modes')) {
            //     $data['design_modes'] = $this->getDefaultData()['design_modes'];
            // }
            // $this->syncDesignModes($product, $data['design_modes']);

            // Sync ERP options if provided
            // if (Arr::has($data, 'erp_option_groups')) {
            //     $this->syncErpOptions($product, $data['erp_option_groups']);
            // }

            // Sync product sets
            if (Arr::has($data, 'product_sets')) {
                $this->syncProductSets($product, $data['product_sets']);
            }

            // Coverage validation is intentionally skipped during product CRUD.
            // $this->pricingCoverage->validate($product);

            // Sync web editor
            if (Arr::has($data, 'web_editor_id')) {
                $product->web_editor_id = $data['web_editor_id'];
                $product->save();
            }

            // Sync shopping setting items
            if (Arr::has($data, 'shopping_setting_item_ids')) {
                $this->syncShoppingSettingItems($product, $data['shopping_setting_item_ids'] ?? []);
            }

            return $product->load($this->getProductRelationships());
        });
    }

    /**
     * Update a product
     *
     * @param  array<string, mixed>  $data
     *
     * @throws ModelNotFoundException
     */
    public function updateProduct(int|string $identifier, array $data): Product
    {
        return DB::transaction(function () use ($identifier, $data) {
            $this->validateProductionMethod(Arr::get($data, 'allow_file_upload', false), Arr::get($data, 'allow_web_editor', false));
            $product = $this->getProductForAdmin($identifier);

            // Update slug if provided and different
            if (Arr::has($data, 'slug') && $data['slug'] !== $product->slug) {
                $slug = $data['slug'];
                // Ensure unique slug
                $baseSlug = $slug;
                $counter = 1;
                while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                    $slug = $baseSlug.'-'.$counter;
                    $counter++;
                }
                $data['slug'] = $slug;
            }

            // Update product basic fields (representative image: images array of URLs via CRUD)
            $product->update(Arr::only($data, [
                'category_id',
                'pricing_profile_id',
                'pricing_structure',
                'name',
                'name_en',
                'name_ja',
                'slug',
                'description',
                'short_description',
                'requires_separate_shipping',
                'separate_shipping_fee',
                'sku',
                'images',
                'is_popular',
                'is_featured',
                'allow_file_upload',
                'allow_web_editor',
                'is_blank_canvas',
                'stock_quantity',
                'min_quantity',
                'max_quantity',
                'sort_order',
                'is_active',
                'info_icon',
                'dieline_file_id',
            ]));

            // Update specification
            if (Arr::has($data, 'specification')) {
                $this->syncSpecification($product, $data['specification']);
            }

            // Update option groups
            if (Arr::has($data, 'option_groups')) {
                $this->syncOptionGroups($product, $data['option_groups']);
            } else {
                // $this->ensurePaperStockFromSpecification($product);
            }

            // Update design modes
            // if (Arr::has($data, 'design_modes')) {
            //     $this->syncDesignModes($product, $data['design_modes']);
            // }

            // Sync product sets
            if (Arr::has($data, 'product_sets')) {
                $this->syncProductSets($product, $data['product_sets']);
            }

            // Coverage validation is intentionally skipped during product CRUD.
            // $this->pricingCoverage->validate($product);

            // Sync web editor
            if (Arr::has($data, 'web_editor_id')) {
                $product->web_editor_id = $data['web_editor_id'];
                $product->save();
            }

            // Sync shopping setting items
            if (Arr::has($data, 'shopping_setting_item_ids')) {
                $this->syncShoppingSettingItems($product, $data['shopping_setting_item_ids'] ?? []);
            }

            $this->removeCartItemsByProduct($product);

            return $product->fresh($this->getProductRelationships());
        });
    }

    /**
     * Delete a product (soft delete)
     *
     * @throws ModelNotFoundException
     */
    public function deleteProduct(int|string $identifier): void
    {
        $product = $this->getProductForAdmin($identifier);
        $product->delete();
    }

    public function getProductCopyPreview(int|string $identifier): array
    {
        $product = $this->getProductForAdmin($identifier);

        $title = trim((string) $product->name);
        $defaultCopyTitle = $title === ''
            ? '복사('.$product->id.')'
            : $title.' 복사('.$product->id.')';

        return [
            'product_id' => (int) $product->id,
            'title' => $title,
            'default_copy_title' => $defaultCopyTitle,
        ];
    }

    public function copyProduct(int|string $identifier, string $copyTitle): Product
    {
        return DB::transaction(function () use ($identifier, $copyTitle) {
            $source = $this->getProductForAdmin($identifier);
            $source->loadMissing(['templates', 'promotionalCustomers', 'erpOptions', 'shoppingSettingItems']);

            $baseSlug = Str::slug($copyTitle);
            if ($baseSlug === '') {
                $baseSlug = 'product-copy-'.$source->id;
            }
            $slug = $this->ensureUniqueProductSlug($baseSlug);

            $clone = $source->replicate();
            $clone->name = trim($copyTitle);
            $clone->slug = $slug;
            $clone->sku = null;
            $clone->save();

            $customerSync = [];
            foreach ($source->promotionalCustomers as $customer) {
                $customerSync[(int) $customer->id] = [
                    'sort_order' => (int) ($customer->pivot->sort_order ?? 0),
                ];
            }
            $clone->promotionalCustomers()->sync($customerSync);
            $clone->erpOptions()->sync($source->erpOptions->pluck('id')->all());

            $shoppingSync = [];
            foreach ($source->shoppingSettingItems as $item) {
                $shoppingSync[(int) $item->id] = [
                    'shopping_setting_id' => $item->shopping_setting_id,
                ];
            }
            if (! empty($shoppingSync)) {
                $clone->shoppingSettingItems()->sync($shoppingSync);
            }

            foreach ($source->templates as $template) {
                $replica = $template->replicate();
                $replica->product_id = $clone->id;
                $replica->save();
            }

            return $clone->fresh($this->getProductRelationships());
        });
    }

    private function ensureUniqueProductSlug(string $base): string
    {
        $slug = $base;
        $counter = 1;

        while (Product::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Toggle product status field
     *
     * @throws ModelNotFoundException
     */
    public function toggleProductStatus(int|string $identifier, string $field, ?bool $value = null): Product
    {
        $product = $this->getProductForAdmin($identifier);

        $allowedFields = ['is_active', 'is_popular', 'is_featured'];
        if (! in_array($field, $allowedFields)) {
            throw new \InvalidArgumentException("Field '{$field}' is not allowed for toggling");
        }

        $product->update([
            $field => $value ?? ! $product->$field,
        ]);

        return $product->fresh($this->getProductRelationships());
    }

    /**
     * Bulk update product status
     *
     * @param  array<int>  $productIds
     * @return array<string, mixed>
     */
    public function bulkUpdateStatus(array $productIds, string $field, bool $value): array
    {
        $allowedFields = ['is_active', 'is_popular', 'is_featured'];
        if (! in_array($field, $allowedFields)) {
            throw new \InvalidArgumentException("Field '{$field}' is not allowed for bulk update");
        }

        $updated = Product::whereIn('id', $productIds)->update([$field => $value]);

        return [
            'updated_count' => $updated,
            'total_count' => count($productIds),
        ];
    }

    /**
     * Bulk delete products (soft delete)
     *
     * @param  array<int>  $productIds
     * @return array<string, mixed>
     */
    public function bulkDelete(array $productIds): array
    {
        $deleted = Product::whereIn('id', $productIds)->delete();

        return [
            'deleted_count' => $deleted,
            'total_count' => count($productIds),
        ];
    }

    /**
     * Sync product specification
     *
     * @param  array<string, mixed>  $specData
     */
    protected function syncSpecification(Product $product, array $specData): void
    {
        ProductSpecification::updateOrCreate(
            ['product_id' => $product->id],
            array_merge($specData, ['product_id' => $product->id])
        );
    }

    /**
     * Sync product option groups
     *
     * @param  array<int, array<string, mixed>>  $optionGroupsData
     */
    protected function syncOptionGroups(Product $product, array $optionGroupsData): void
    {
        $this->validatedOptionData($optionGroupsData);
        // Delete existing option groups
        ProductOptionGroup::where('product_id', $product->id)->delete();

        foreach ($optionGroupsData as $groupData) {
            $options = Arr::get($groupData, 'options', []);
            // Extract and remove ERP group id if present
            $erpOptionGroupId = Arr::pull($groupData, 'erp_option_group_id');
            unset($groupData['options']);

            $group = ProductOptionGroup::create(array_merge($groupData, [
                'product_id' => $product->id,
                // Set foreign key to ERP option group when provided
                'erp_option_group_id' => $erpOptionGroupId,
            ]));

            foreach ($options as $optionData) {
                // Extract ERP option id if present
                $erpOptionId = Arr::pull($optionData, 'erp_option_id');
                ProductOption::create(array_merge($optionData, [
                    'option_group_id' => $group->id,
                    // Set foreign key to ERP option when provided
                    'erp_option_id' => $erpOptionId,
                ]));
            }
        }
    }

    public function addOptionGroupsExistByCodeAndLabel(Product $product, array $optionGroupsData): void
    {
        $this->validatedOptionData($optionGroupsData);

        foreach ($optionGroupsData as $groupData) {
            $options = Arr::pull($groupData, 'options', []);

            $code = Arr::pull($groupData, 'code');
            $erpOptionGroupId = Arr::pull($groupData, 'erp_option_group_id');

            // Find existing group by product_id + code
            $group = ProductOptionGroup::query()
                ->where('product_id', $product->id)
                ->where('code', $code)
                ->first();

            // Create group if not exists
            if (! $group) {
                $group = ProductOptionGroup::create(array_merge($groupData, [
                    'product_id' => $product->id,
                    'code' => $code,
                    'erp_option_group_id' => $erpOptionGroupId,
                ]));
            }

            // Add options
            foreach ($options as $optionData) {
                $label = Arr::get($optionData, 'label');

                // Check option by option_group_id + label
                $exists = ProductOption::query()
                    ->where('option_group_id', $group->id)
                    ->where('label', $label)
                    ->where('erp_option_id', Arr::get($optionData, 'erp_option_id'))
                    ->exists();

                if (! $exists) {
                    $erpOptionId = Arr::pull($optionData, 'erp_option_id');

                    ProductOption::create(array_merge($optionData, [
                        'option_group_id' => $group->id,
                        'erp_option_id' => $erpOptionId,
                    ]));
                }
            }
        }
    }

    private function validatedOptionData(array $optionGroupsData): void
    {
        $erpOptionIds = collect($optionGroupsData)
            ->pluck('options')
            ->flatten(1)
            ->pluck('erp_option_id')
            ->filter()
            ->unique()
            ->values();

        $erpOptions = ErpOption::query()
            ->whereIn('id', $erpOptionIds)
            ->get()
            ->keyBy('id');

        foreach ($optionGroupsData as $groupData) {
            $groupCode = Arr::get($groupData, 'code');
            $erpOptionGroupId = Arr::get($groupData, 'erp_option_group_id');
            $options = Arr::get($groupData, 'options', []);

            if (empty($erpOptionGroupId)) {
                throw new \InvalidArgumentException("erp_option_group_id is required for option group [{$groupCode}].");
            }

            foreach ($options as $optionData) {
                $erpOptionId = Arr::get($optionData, 'erp_option_id');

                if (empty($erpOptionId)) {
                    throw new \InvalidArgumentException(
                        sprintf(
                            'erp_option_id is required for option [%s] in group [%s].',
                            Arr::get($optionData, 'name', 'unknown'),
                            $groupCode
                        )
                    );
                }

                $erpOption = $erpOptions->get($erpOptionId);

                if (! $erpOption) {
                    throw new \InvalidArgumentException("ERP option [{$erpOptionId}] not found.");
                }

                if ($erpOption->erp_option_group_id !== $erpOptionGroupId) {
                    throw new \InvalidArgumentException(
                        "ERP option [{$erpOptionId}] does not belong to ERP option group [{$erpOptionGroupId}]."
                    );
                }

                if ($groupCode === ErpOptionGroupCode::SIZE->value && empty($erpOption->size_option_id)) {
                    throw new \InvalidArgumentException("ERP option [{$erpOptionId}] must be linked to a size option.");
                }

                if (in_array($groupCode, [
                    ErpOptionGroupCode::PAPER->value,
                    ErpOptionGroupCode::COVER_PAPER->value,
                    ErpOptionGroupCode::INNER_PAPER->value,
                ], true) && empty($erpOption->paper_id)) {
                    throw new \InvalidArgumentException("ERP option [{$erpOptionId}] must be linked to a paper.");
                }
            }
        }
    }

    /**
     * Sync product design modes
     *
     * @param  array<int, array<string, mixed>>  $designModesData
     */
    protected function syncDesignModes(Product $product, array $designModesData): void
    {
        // Delete existing design modes
        ProductDesignMode::where('product_id', $product->id)->delete();

        foreach ($designModesData as $modeData) {
            ProductDesignMode::create(array_merge($modeData, [
                'product_id' => $product->id,
            ]));
        }
    }

    private function getDefaultData(): array
    {
        return [
            'option_groups' => [
                [
                    'code' => 'paper_stock',
                    'name' => '용지',
                    'display_type' => 'select',
                    'is_required' => true,
                    'sort_order' => 1,
                    'options' => [
                        [
                            'label' => '랑데뷰 내츄럴',
                            'value' => 'rendezvous_natural',
                            'additional_price' => 0,
                            'metadata' => [
                                'preview_image' => '/images/options/rendezvous_natural.jpg',
                            ],
                        ],
                        [
                            'label' => '아르떼 울트라화이트',
                            'value' => 'arte_ultra_white',
                            'additional_price' => 0,
                            'metadata' => [
                                'preview_image' => '/images/options/arte_ultra_white.jpg',
                            ],
                        ],
                        [
                            'label' => '그레이스 화이트',
                            'value' => 'grace_white',
                            'additional_price' => 0,
                            'metadata' => [
                                'preview_image' => '/images/options/grace_white.jpg',
                            ],
                        ],
                        [
                            'label' => '마쉬멜로우 화이트',
                            'value' => 'marshmallow_white',
                            'additional_price' => 0,
                            'metadata' => [
                                'preview_image' => '/images/options/marshmallow_white.jpg',
                            ],
                        ],
                        [
                            'label' => '마쉬멜로우 미색',
                            'value' => 'marshmallow_ivory',
                            'additional_price' => 0,
                            'metadata' => [
                                'preview_image' => '/images/options/marshmallow_ivory.jpg',
                            ],
                        ],
                    ],
                ],
                [
                    'code' => 'paper_color',
                    'name' => '용지색상',
                    'display_type' => 'select',
                    'is_required' => true,
                    'sort_order' => 2,
                    'options' => [
                        [
                            'label' => '내츄럴',
                            'value' => 'natural',
                            'additional_price' => 0,
                        ],
                        [
                            'label' => '울트라화이트',
                            'value' => 'ultra_white',
                            'additional_price' => 0,
                        ],
                        [
                            'label' => '화이트',
                            'value' => 'white',
                            'additional_price' => 0,
                        ],
                        [
                            'label' => '미색',
                            'value' => 'ivory',
                            'additional_price' => 0,
                        ],
                    ],
                ],
                [
                    'code' => 'paper_weight',
                    'name' => '용지평량',
                    'display_type' => 'select',
                    'is_required' => true,
                    'sort_order' => 3,
                    'options' => [
                        [
                            'label' => '210g/m²',
                            'value' => '210g',
                            'additional_price' => 0,
                        ],
                        [
                            'label' => '240g/m²',
                            'value' => '240g',
                            'additional_price' => 0,
                        ],
                        [
                            'label' => '300g/m²',
                            'value' => '300g',
                            'additional_price' => 0,
                        ],
                    ],
                ],
                [
                    'code' => 'print_method',
                    'name' => '인쇄도수',
                    'display_type' => 'select',
                    'is_required' => true,
                    'sort_order' => 4,
                    'options' => [
                        [
                            'label' => '양면칼라 8도',
                            'value' => 'double_8c',
                            'additional_price' => 0,
                        ],
                        [
                            'label' => '단면칼라 4도',
                            'value' => 'single_4c',
                            'additional_price' => 0,
                        ],
                    ],
                ],
                [
                    'code' => 'print_front',
                    'name' => '전면별색',
                    'display_type' => 'select',
                    'is_required' => true,
                    'sort_order' => 5,
                    'options' => [
                        ['label' => '해당없음', 'value' => 'none', 'additional_price' => 0],
                        ['label' => '금색', 'value' => 'gold', 'additional_price' => 0],
                        ['label' => '은색', 'value' => 'silver', 'additional_price' => 0],
                    ],
                ],
                [
                    'code' => 'print_back',
                    'name' => '후면별색',
                    'display_type' => 'select',
                    'is_required' => true,
                    'sort_order' => 6,
                    'options' => [
                        ['label' => '해당없음', 'value' => 'none', 'additional_price' => 0],
                        ['label' => '금색', 'value' => 'gold', 'additional_price' => 0],
                        ['label' => '은색', 'value' => 'silver', 'additional_price' => 0],
                    ],
                ],
                // Group 3
                [
                    'code' => 'post_coating',
                    'name' => '코팅',
                    'display_type' => 'select',
                    'is_required' => false,
                    'sort_order' => 7,
                    'options' => [
                        [
                            'label' => '무광코팅',
                            'value' => 'matte',
                            'additional_price' => 0,
                        ],
                    ],
                ],
                [
                    'code' => 'post_scoring',
                    'name' => '오시',
                    'display_type' => 'select',
                    'is_required' => false,
                    'sort_order' => 8,
                    'options' => [
                        [
                            'label' => '1줄 (중앙)',
                            'value' => 'scoring_1',
                            'additional_price' => 0,
                            'metadata' => [
                                'images' => ['/images/options/scoring_1.jpg'],
                                'description' => '오시는 인쇄물을 잘 접을 수 있도록 접는 위치에 누름 자국을 내는 가공입니다.데이터 기준으로 가로/세로 방향을 선택할 수 있으며 사이즈가 100x70 미만일 경우 가로형은 가로오시 불가.',
                                'url' => '#',
                            ],
                        ],
                        [
                            'label' => '2줄',
                            'value' => 'scoring_2',
                            'additional_price' => 0,
                            'metadata' => [
                                'images' => ['/images/options/scoring_2.jpg'],
                                'description' => '오시는 인쇄물을 잘 접을 수 있도록 접는 위치에 누름 자국을 내는 가공입니다.데이터 기준으로 가로/세로 방향을 선택할 수 있으며 사이즈가 100x70 미만일 경우 가로형은 가로오시 불가.',
                                'url' => '#',
                            ],
                        ],
                    ],
                ],
                [
                    'code' => 'post_rounding',
                    'name' => '라운딩',
                    'display_type' => 'select',
                    'is_required' => false,
                    'sort_order' => 9,
                    'options' => [
                        ['label' => '4모서리', 'value' => 'rounding_4', 'additional_price' => 0],
                        ['label' => '2모서리', 'value' => 'rounding_2', 'additional_price' => 0],
                    ],
                ],
                [
                    'code' => 'post_foiling',
                    'name' => '박',
                    'display_type' => 'select',
                    'is_required' => false,
                    'sort_order' => 10,
                    'options' => [
                        ['label' => '금박', 'value' => 'gold_foil', 'additional_price' => 0],
                        ['label' => '은박', 'value' => 'silver_foil', 'additional_price' => 0],
                    ],
                ],
                [
                    'code' => 'post_embossing',
                    'name' => '형압',
                    'display_type' => 'select',
                    'is_required' => false,
                    'sort_order' => 11,
                    'options' => [
                        ['label' => '형압', 'value' => 'emboss', 'additional_price' => 0],
                        ['label' => '압인', 'value' => 'deboss', 'additional_price' => 0],
                    ],
                ],
                [
                    'code' => 'post_epoxy',
                    'name' => '에폭시',
                    'display_type' => 'select',
                    'is_required' => false,
                    'sort_order' => 12,
                    'options' => [
                        ['label' => '에폭시', 'value' => 'epoxy', 'additional_price' => 0],
                    ],
                ],
                [
                    'code' => 'post_uv',
                    'name' => '투명엠보싱',
                    'display_type' => 'select',
                    'is_required' => false,
                    'sort_order' => 13,
                    'options' => [
                        ['label' => '부분', 'value' => 'uv_clear', 'additional_price' => 0],
                    ],
                ],
                [
                    'code' => 'post_perforation',
                    'name' => '미싱',
                    'display_type' => 'select',
                    'is_required' => false,
                    'sort_order' => 14,
                    'options' => [
                        ['label' => '미싱', 'value' => 'perforation', 'additional_price' => 0],
                    ],
                ],
            ],
            // list price = tier smallest price for 1 default paper (paper option additional_price = 0).
            // change paper = add option paper_stock.additional_price; coating/corner add corresponding.
            // unit_price = quantity_prices[selected].price + Σ(option_groups[].options[selected].additional_price).
            'quantity_prices' => [
                // FE 요구: just need price for 200 sheets and 500 sheets.
                // Backend will use multiplier from request (number of sheets) to multiply when calculating quote.
                [
                    'quantity' => 200,
                    'unit' => 'sheets',
                    'multiplier' => 1,
                    'price' => 15000,
                    'production_days' => 3,
                ],
                [
                    'quantity' => 500,
                    'unit' => 'sheets',
                    'multiplier' => 1,
                    'price' => 20000,
                    'production_days' => 4,
                ],
            ],
            'design_modes' => [
                [
                    'code' => DesignModeCode::WEB_EDITOR,
                    'name' => '웹 에디터',
                    'description' => '브라우저에서 직접 디자인 편집',
                    'sort_order' => 1,
                ],
                [
                    'code' => DesignModeCode::UPLOAD_FILE,
                    'name' => '파일 업로드',
                    'description' => '완성된 디자인 파일을 업로드해주세요.',
                    'sort_order' => 2,
                ],
            ],
        ];
    }

    /**
     * Ensure paper_stock group + a single paper option exists for the product.
     *
     * Approach A:
     * - Admin FE currently may not send option_groups (paper_stock) yet.
     * - We generate paper_stock from ProductSpecification (paper_type + paper_weight_gsm)
     *   so the user FE can render "용지 보기 / paper preview" modal.
     */
    private function ensurePaperStockFromSpecification(Product $product): void
    {
        $spec = ProductSpecification::where('product_id', $product->id)->first();
        if (! $spec || empty($spec->paper_type)) {
            return;
        }

        $paperTypeRaw = (string) $spec->paper_type;
        $paperTypeNormalized = $this->normalizePaperTypeToOptionValue($paperTypeRaw);

        // Replace existing paper_stock group to guarantee consistent single-paper flow.
        ProductOptionGroup::where('product_id', $product->id)
            ->where('code', 'paper_stock')
            ->delete();

        $group = ProductOptionGroup::create([
            'product_id' => $product->id,
            'code' => 'paper_stock',
            // Keep Korean group name so FE/admin uses same label.
            'name' => '용지',
            'display_type' => 'select',
            'is_required' => true,
            'sort_order' => 1,
        ]);

        $weightGsm = $spec->paper_weight_gsm;
        $weightPart = $weightGsm !== null && $weightGsm !== ''
            ? ' '.(int) $weightGsm.'gsm'
            : '';

        // Use original spec string as label base when it is already a human-readable value.
        $labelBase = trim($paperTypeRaw);
        if ($labelBase === '') {
            $labelBase = $paperTypeNormalized;
        }

        $label = $labelBase.$weightPart;

        $englishTypeName = match ($paperTypeNormalized) {
            'holo-white' => 'Holo White',
            'white-paper' => 'White Paper',
            'imitation' => 'Imitation',
            default => ucfirst($paperTypeNormalized),
        };

        $description = match ($paperTypeNormalized) {
            'holo-white' => $englishTypeName.' paper with a premium reflective look.',
            'white-paper' => $englishTypeName.' paper for a clean, crisp printing result.',
            'imitation' => $englishTypeName.' paper as a cost-effective alternative.',
            default => $englishTypeName.' paper option.',
        };

        $characteristics = [
            // Resource expects an object; keep shape stable.
            'thickness' => $weightGsm !== null && $weightGsm !== '' ? (string) ((int) $weightGsm).'gsm' : null,
            'texture' => 'smooth',
        ];

        ProductOption::create([
            'option_group_id' => $group->id,
            'label' => $label,
            'value' => $paperTypeNormalized,
            'additional_price' => 0,
            'metadata' => [
                'preview_image' => '/images/papers/'.$paperTypeNormalized.'.jpg',
                'description' => $description,
                'characteristics' => $characteristics,
            ],
            'sort_order' => 0,
            'is_active' => true,
        ]);
    }

    private function normalizePaperTypeToOptionValue(string $paperTypeRaw): string
    {
        $v = strtolower(trim($paperTypeRaw));

        // Handle common Korean admin values (e.g. "반누보 (홀로화이트)")
        if (str_contains($v, 'holo') || str_contains($v, '홀로')) {
            return ProductSpecificationOption::PAPER_HOLO_WHITE->value;
        }
        if (str_contains($v, 'white') || str_contains($v, '화이트') || str_contains($v, '반누보')) {
            return ProductSpecificationOption::PAPER_WHITE_PAPER->value;
        }
        if (str_contains($v, 'imitation') || str_contains($v, '모조') || str_contains($v, '이밋')) {
            return ProductSpecificationOption::PAPER_IMITATION->value;
        }

        // Fallback to enum normalizer (will default to holo-white if unknown).
        return ProductSpecificationOption::normalizePaperType($paperTypeRaw);
    }

    /**
     * Sync product sets (input / select quantity packs for this product).
     *
     * @param  array<int, array<string, mixed>>  $setsData
     */
    protected function syncProductSets(Product $product, array $setData): void
    {
        // Delete existing product set
        ProductSet::where('product_id', $product->id)->delete();

        // Create or update a single product set
        if (! empty($setData)) {
            ProductSet::create([
                'product_id' => $product->id,
                'quantity' => $setData['quantity'],
                'set_type' => $setData['set_type'],
                'min_set' => Arr::get($setData, 'min_set'),
                'max_set' => Arr::get($setData, 'max_set'),
                'step_set' => Arr::get($setData, 'step_set'),
                'set_unit' => Arr::get($setData, 'set_unit'),
                'select_options' => Arr::get($setData, 'select_options'),
            ]);
        }
    }

    /**
     * Sync ERP options for a product from nested groups data.
     * Expects: [{ group_id: int, option_ids: int[] }].
     * Only active options belonging to the correct group are synced.
     */
    protected function syncErpOptions(Product $product, array $erpOptionGroupsData): void
    {
        if (empty($erpOptionGroupsData)) {
            $product->erpOptions()->detach();

            return;
        }

        $optionIds = [];
        foreach ($erpOptionGroupsData as $groupData) {
            $groupId = $groupData['group_id'] ?? null;
            $ids = $groupData['option_ids'] ?? [];

            if (! $groupId || empty($ids)) {
                continue;
            }

            $valid = ErpOption::whereIn('id', $ids)
                ->where('erp_option_group_id', $groupId)
                ->where('is_active', true)
                ->pluck('id')
                ->toArray();

            $optionIds = array_merge($optionIds, $valid);
        }

        $optionIds = array_unique($optionIds);
        $product->erpOptions()->sync($optionIds);
    }

    /**
     * Remove all CartItems associated with a product.
     */
    private function removeCartItemsByProduct(Product $product): void
    {
        CartItem::where('product_id', $product->id)->delete();
    }

    private function validateProductionMethod(
        bool $allowFileUpload,
        bool $allowWebEditor
    ): void {
        if (! $allowFileUpload && ! $allowWebEditor) {
            throw new \InvalidArgumentException(
                'Product must allow at least one production method: file upload or web editor.'
            );
        }
    }

    /**
     * Sync shopping setting items for a product.
     *
     * @param  array<int>  $itemIds
     */
    protected function syncShoppingSettingItems(Product $product, array $itemIds): void
    {
        if (empty($itemIds)) {
            $product->shoppingSettingItems()->detach();

            return;
        }

        $items = ShoppingSettingItem::whereIn('id', $itemIds)->get();
        $syncData = [];
        foreach ($items as $item) {
            $syncData[$item->id] = [
                'shopping_setting_id' => $item->shopping_setting_id,
            ];
        }

        $product->shoppingSettingItems()->sync($syncData);
    }
}
