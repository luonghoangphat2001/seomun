<?php

namespace App\Services\MyPage;

use App\Enums\DesignModeCode;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ShippingFeeType;
use App\Enums\ShippingMethod;
use App\Http\Resources\CartItemResource;
use App\Http\Resources\CartResource;
use App\Http\Resources\OrderResource;
use App\Models\BulkOrderBatch;
use App\Models\Cart;
use App\Models\CartItem;
use App\Enums\OrderShipmentStatus;
use App\Enums\OrderShipmentType;
use App\Helpers\StoreURLHelper;
use App\Http\Requests\MyPage\CheckoutCartRequest;
use App\Models\DesignGroup;
use App\Models\OrderShipment;
use App\Models\Order;
use App\Models\OrderArtwork;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\UserCoupon;
use App\Services\BulkOrderService;
use App\Services\DesignService;
use App\Services\OrderService;
use App\Services\PointService;
use App\Services\PointTransactionService;
use App\Services\ProductQuoteService;
use App\Services\ProxyLoginService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Services\MyPage\MyPageShippingAddressService;
use App\Services\ShippingFeeService;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MyPageCartService
{
    public function __construct(
        protected BulkOrderService $bulkOrderService,
        protected DesignService $designService,
        protected PointService $pointService,
        protected PointTransactionService $pointTransactionService,
        protected ProductQuoteService $productQuoteService,
        protected OrderService $orderService,
        protected MyPageWorkerService $myPageWorkerService,
        protected MyPageShippingAddressService $myPageShippingAddressService,
        protected ShippingFeeService $shippingFeeService,
        protected MyPageCouponService $couponService,
        protected ProxyLoginService $proxyLoginService,
    ) {}

    /**
     * Cart item by id, scoped to carts owned by the user.
     *
     * Avoids Cart::where('user_id')->first() picking the wrong row when duplicate carts exist.
     */
    private function cartItemOwnedByUser(User $user, int $itemId): CartItem
    {
        return CartItem::query()
            ->whereKey($itemId)
            ->whereHas('cart', fn($q) => $q->where('user_id', $user->id))
            ->firstOrFail();
    }

    /**
     * Get or create cart for user
     *
     * @param  string|null  $search  Optional filter: product name, notes, options JSON text, artwork title/file name (client display list).
     */
    public function getCart(User $user, ?string $search = null): CartResource
    {
        try {
            $cart = Cart::getOrCreateForUser($user->id);
            $items = $cart->items()
                ->with([
                    'product',
                    'product.specification',
                    'product.productSets',
                    'designGroup'
                ])
                ->orderBy('created_at')
                ->get();

            if ($search !== null && trim($search) !== '') {
                $items = $this->filterCartItemsForSearch($user, $items, trim($search));
            }

            // $this->attachResolvedArtworks($user, $items);

            $cart->setRelation('items', $items);

            return new CartResource($cart);
        } catch (\Exception $e) {
            Log::error('Get MyPage cart failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Subtotals for checked rows (장바구니 화면 — 선택 상품 합계).
     *
     * @param  list<int>  $itemIds
     * @return array{item_count: int, line_quantity_total: float, subtotal: float, currency: string}
     */
    public function selectionSummary(User $user, array $itemIds): array
    {
        $itemIds = array_values(array_unique(array_map('intval', $itemIds)));
        if ($itemIds === []) {
            throw new \InvalidArgumentException('item_ids is required.');
        }

        $items = CartItem::query()
            ->whereIn('id', $itemIds)
            ->whereHas('cart', fn($q) => $q->where('user_id', $user->id))
            ->with(['product'])
            ->get();

        if ($items->count() !== count($itemIds)) {
            throw new ModelNotFoundException('One or more cart items were not found.');
        }

        $lineQuantity = (int) $items->sum(fn(CartItem $i) => $i->total_quantity);
        $subtotal = (int) $items->sum(fn(CartItem $i) => (int) $i->subtotal);

        return [
            'item_count' => $items->count(),
            'line_quantity_total' => $lineQuantity,
            'subtotal' => round($subtotal),
            'currency' => 'KRW',
        ];
    }

    /**
     * @param  Collection<int, CartItem>  $items
     * @return Collection<int, CartItem>
     */
    private function filterCartItemsForSearch(User $user, Collection $items, string $search): Collection
    {
        $needle = mb_strtolower($search, 'UTF-8');
        return $items->filter(function (CartItem $item) use ($needle) {
            $name = mb_strtolower((string) ($item->product->name ?? ''), 'UTF-8');
            if ($name !== '' && str_contains($name, $needle)) {
                return true;
            }
            return false;
        })->values();
    }

    /**
     * @param  Collection<int, CartItem>  $items
     */
    private function attachResolvedArtworks(User $user, Collection $items): void
    {
        $allIds = $items->flatMap(fn(CartItem $i) => $i->collectArtworkIds())->unique()->filter()->values()->all();
        $artworks = $allIds === []
            ? collect()
            : OrderArtwork::query()->where('user_id', $user->id)->whereIn('id', $allIds)->get()->keyBy('id');

        foreach ($items as $item) {
            $resolved = collect($item->collectArtworkIds())
                ->map(fn(int $id) => $artworks->get($id))
                ->filter()
                ->values();
            $item->setRelation('resolvedArtworks', $resolved);
        }
    }

    /**
     * Add item to cart
     */
    public function addItem(User $user, array $data): CartItemResource
    {
        try {
            DB::beginTransaction();

            //check design_group_id
            $exists = CartItem::query()
                ->join('carts', 'carts.id', '=', 'cart_items.cart_id')
                ->where('carts.user_id', $user->id)
                ->where('cart_items.design_group_id', $data['design_group_id'])
                ->exists();

            if ($exists) {
                throw new \InvalidArgumentException('Group design id exist.');
            }

            $this->getAndCheckDesginGroupEmptyOrderItem($user, $data['design_group_id']);

            // Get or create cart
            $cart = Cart::getOrCreateForUser($user->id);

            // Verify product exists and is active
            $product = Product::active()->findOrFail($data['product_id']);

            $requestQuantity = (int) $data['quantity'];
            $requestBundleValue = $data['number_of_cases'];
            $this->assertProductSetAllows($product, $requestQuantity);

            $quote = $this->productQuoteService->quote($product->id, $data['selected_options'], $data['input_options'], $data['quantity'], $data['number_of_cases']);
            // CartItem::subtotal applies number_of_cases, so persist a per-case
            // amount rather than the already-multiplied quote subtotal.
            $price = (int) round($quote['sub_total'] / max(1, $requestBundleValue));

            // Create new cart item with number of cases and initial storage date (보관일 = now + 7 days)
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $data['product_id'],
                'design_group_id' => $data['design_group_id'],
                'quantity' => $requestQuantity,
                'number_of_cases' => $requestBundleValue,
                'price' => $price,
                'options' => $data['selected_options'] ?? null,
                'input_options' => $data['input_options'] ?? null,
                'notes' => $data['notes'] ?? null,
                'storage_date' => now()->addDays(7),
            ]);

            $cartItem->load([
                'product',
                'product.specification',
            ]);
            DB::commit();

            return new CartItemResource($cartItem);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Add cart item failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Add a validated bulk batch as a single cart line (one row, N designs in batch.entries).
     * Pricing: unit price for 1 case (bundle_value = 1) at the batch sheet tier × number of valid entries.
     */
    public function addBulkBatchToCart(User $user, BulkOrderBatch $batch): CartItemResource
    {
        if ($batch->user_id !== $user->id) {
            throw new ModelNotFoundException('Batch not found.');
        }

        if ($batch->status !== 'validated') {
            throw new \InvalidArgumentException('Batch must be validated before adding to cart.');
        }

        $validEntries = $batch->entries()->where('status', 'valid')->orderBy('row_number')->get();
        if ($validEntries->isEmpty()) {
            throw new \InvalidArgumentException('No valid entries in this batch.');
        }

        $designCount = $validEntries->count();
        if ($designCount > BulkOrderService::MAX_ENTRIES_PER_BATCH) {
            throw new \InvalidArgumentException('Batch exceeds maximum entry count.');
        }

        try {
            $product = Product::active()->findOrFail($batch->product_id);
        } catch (ModelNotFoundException $e) {
            throw new \InvalidArgumentException('Product not found or inactive for this batch.');
        }
        $configuration = is_array($batch->configuration) ? $batch->configuration : [];
        $requestQty = (int) ($configuration['quantity'] ?? 0);
        $selectedOptions = $configuration['selected_options'] ?? $configuration['options'] ?? [];
        $inputOptions = $configuration['input_options'] ?? [];
        if ($requestQty < 1 || ! is_array($selectedOptions) || ! is_array($inputOptions)) {
            throw new \InvalidArgumentException('Bulk order configuration must include quantity, selected_options, and input_options.');
        }
        $this->assertProductSetAllows($product, $requestQty);
        $quote = $this->productQuoteService->quote($product->id, $selectedOptions, $inputOptions, $requestQty, $designCount);
        $unitPrice = (int) round($quote['sub_total'] / $designCount);

        try {
            DB::beginTransaction();

            $cart = Cart::getOrCreateForUser($user->id);

            CartItem::query()
                ->where('cart_id', $cart->id)
                ->where('bulk_order_batch_id', $batch->id)
                ->delete();

            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'bulk_order_batch_id' => $batch->id,
                'product_id' => $product->id,
                'product_quantity_price_id' => null,
                'design_id' => null,
                'design_ids' => null,
                'quantity' => $requestQty,
                'number_of_cases' => (int) $designCount,
                'price' => $unitPrice,
                'options' => $selectedOptions,
                'input_options' => $inputOptions,
                'notes' => null,
                'storage_date' => now()->addDays(7),
            ]);

            $cartItem->load([
                'product',
                'product.specification',
                'bulkOrderBatch.entries',
            ]);

            DB::commit();

            return new CartItemResource($cartItem);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Add bulk batch to cart failed', [
                'user_id' => $user->id,
                'batch_id' => $batch->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Normalize design inputs from request into canonical pair for DB.
     *
     * @param  array<string, mixed>  $data
     * @return array{0:int|null,1:array{front:int|null,back:int|null}|null}
     */
    private function normalizeDesignSelection(array $data): array
    {
        $designIds = null;

        if (isset($data['design_ids']) && is_array($data['design_ids'])) {
            $front = $this->normalizeOptionalInt($data['design_ids']['front'] ?? null);
            $back = $this->normalizeOptionalInt($data['design_ids']['back'] ?? null);

            if ($front !== null || $back !== null) {
                $designIds = [
                    'front' => $front,
                    'back' => $back,
                ];
            }
        }

        if ($designIds !== null) {
            // Keep representative legacy column for indexing/backward compatibility.
            return [$designIds['front'] ?? $designIds['back'] ?? null, $designIds];
        }

        return [$this->normalizeOptionalInt($data['design_id'] ?? null), null];
    }

    /**
     * Normalize optional integer-like input where 0/"0"/empty means null.
     */
    private function normalizeOptionalInt(mixed $value): ?int
    {
        if ($value === null || $value === '' || $value === 0 || $value === '0') {
            return null;
        }

        return (int) $value;
    }

    /** Update a cart item through the same quote pipeline as product checkout. */
    public function updateItem(User $user, int $itemId, array $data): CartItemResource
    {
        try {
            $cartItem = $this->cartItemOwnedByUser($user, $itemId);

            if ($cartItem->bulk_order_batch_id !== null) {
                throw new \Exception('단체 주문 상품은 장바구니에서 옵션을 변경할 수 없습니다. 단체 주문에서 다시 설정해 주세요.');
            }

            $product = Product::active()->findOrFail($cartItem->product_id);
            $this->assertProductSetAllows($product, (int) $data['quantity']);
            $selectedOptions = $data['options'] ?? $cartItem->options ?? [];
            $inputOptions = $data['input_options'] ?? $cartItem->input_options ?? [];
            $quote = $this->productQuoteService->quote($product->id, $selectedOptions, $inputOptions, (int) $data['quantity'], (int) $data['number_of_cases']);
            $cartItem->product_quantity_price_id = null;
            $cartItem->quantity = (int) $data['quantity'];
            $cartItem->number_of_cases = (int) $data['number_of_cases'];
            $cartItem->price = (int) round($quote['sub_total'] / $cartItem->number_of_cases);

            if (array_key_exists('options', $data)) {
                $cartItem->options = $data['options'];
            }
            if (array_key_exists('input_options', $data)) {
                $cartItem->input_options = $data['input_options'];
            }

            $cartItem->notes = $data['notes'] ?? $cartItem->notes;
            $cartItem->save();

            $cartItem->load([
                'product',
                'product.specification',
            ]);

            return new CartItemResource($cartItem);
        } catch (\Exception $e) {
            Log::error('Update cart item failed', [
                'user_id' => $user->id,
                'item_id' => $itemId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /** Product Sets governs permitted quantities only; it never carries price. */
    private function assertProductSetAllows(Product $product, int $quantity): void
    {
        $set = $product->productSets;
        if (! $set) {
            return;
        }
        if ($set->set_type === 'select') {
            $allowed = collect($set->select_options ?? [])->pluck('value')->map(fn ($value) => (int) $value)->all();
            if (! in_array($quantity, $allowed, true)) {
                throw new \InvalidArgumentException('선택한 수량은 이 상품의 Product Set에 없습니다.');
            }
            return;
        }
        $minimum = (int) ($set->min_set ?? 1);
        $maximum = $set->max_set !== null ? (int) $set->max_set : null;
        $step = max(1, (int) ($set->step_set ?? 1));
        if ($quantity < $minimum || ($maximum !== null && $quantity > $maximum) || (($quantity - $minimum) % $step !== 0)) {
            throw new \InvalidArgumentException('선택한 수량이 Product Set 범위를 벗어났습니다.');
        }
    }

    /**
     * Delete cart item
     */
    public function deleteItem(User $user, int $itemId): void
    {
        try {
            $cartItem = $this->cartItemOwnedByUser($user, $itemId);

            $cartItem->delete();
        } catch (\Exception $e) {
            Log::error('Delete cart item failed', [
                'user_id' => $user->id,
                'item_id' => $itemId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Batch delete cart items
     */
    public function batchDeleteItems(User $user, array $itemIds): void
    {
        try {
            DB::beginTransaction();

            // Get or create cart for user (avoid exception if cart doesn't exist)
            $cart = Cart::getOrCreateForUser($user->id);

            // Verify all items belong to user's cart
            $itemsCount = CartItem::where('cart_id', $cart->id)
                ->whereIn('id', $itemIds)
                ->count();

            if ($itemsCount !== count($itemIds)) {
                throw new \Exception('일부 항목을 찾을 수 없거나 권한이 없습니다.');
            }

            // Delete items
            CartItem::where('cart_id', $cart->id)
                ->whereIn('id', $itemIds)
                ->delete();

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Batch delete cart items failed', [
                'user_id' => $user->id,
                'item_ids' => $itemIds,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Extend storage date (보관일 연장) for a cart item by 7 days.
     */
    public function extendStorage(User $user, int $itemId): CartItemResource
    {
        try {
            /** @var CartItem $cartItem */
            $cartItem = $this->cartItemOwnedByUser($user, $itemId);

            $current = $cartItem->storage_date ?? now()->addDays(7);
            $cartItem->storage_date = $current->copy()->addDays(7);
            $cartItem->save();

            $cartItem->load([
                'product',
                'product.specification',
                'product.specification',
                'bulkOrderBatch.entries',
            ]);

            return new CartItemResource($cartItem);
        } catch (\Exception $e) {
            Log::error('Extend cart item storage failed', [
                'user_id' => $user->id,
                'item_id' => $itemId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Calculate checkout quote from cart items without creating an order.
     */
    public function checkoutQuote(User $user, array $data = []): array
    {
        $cart = Cart::getOrCreateForUser($user->id);
        $cart->load(['items.product.specification', 'items.product.category']);

        $items = $this->resolveCartItems($cart, $data);

        if ($items->isEmpty()) {
            throw new \Exception('장바구니가 비어있습니다.');
        }

        $subtotal = $items->sum(fn($item) => (int) $item->subtotal);
        $taxAmount = round($subtotal * 0.1);
        $baseAmount = $subtotal + $taxAmount;

        $couponSummary = null;
        if (! empty($data['user_coupon_id'])) {
            $couponResult = $this->couponService->validateAndCalculateDiscount($user, (int) $data['user_coupon_id'], $baseAmount);
            $discount = $couponResult['discount'];
            $couponSummary = $couponResult['summary'];
        } else {
            $discount = max(0, (float) ($data['discount_amount'] ?? 0));
        }

        $shippingMethod = ShippingMethod::tryFrom($data['shipping_method'] ?? '');
        $shippingFee = 0;
        $shippingFeeType = ShippingFeeType::PREPAID;
        $boxCount = 0;
        $weightKg = 0.0;
        foreach ($items as $item) {
            $shippingData = [
                'width' => $item->input_options['width'] ?? 0,
                'height' => $item->input_options['height'] ?? 0,
                'quantity' => $item->quantity,
                'case' => $item->number_of_cases,
                'postcode' => $data['shipping']['postcode'] ?? $data['shipping_postcode'] ?? null,
                'size' => $item->input_options['size'] ?? null,
            ];

            $selectedOptions = $this->productQuoteService->mergeOption($item->product, $item->options, $item->input_options);
            $weight = $this->productQuoteService->calculateTotalPaperWeight($shippingData['width'], $shippingData['height'],  $item->product, $selectedOptions, $item->quantity);

            $weightKg += $weight ?? 0;

            $boxCount += $item->number_of_cases;
            $result = $this->shippingFeeService->resolveShippingFeeWithMethod(
                $user,
                (float) $item->subtotal,
                $item->product,
                $shippingMethod,
                $shippingData,
                $weight
            );

            if ($result) {
                $shippingFee += $result['shipping_fee'] ?? 0;

                $shippingFeeType = ShippingFeeType::tryFrom(
                    $result['shipping_fee_type']
                ) ?? $shippingFeeType;
            }
        }

        $pointsToUse = (int) ($data['point_used'] ?? 0);

        $pointCalc = $this->pointService->calculateWithPoint([
            'subtotal_amount' => round($subtotal),
            'discount_amount' => round($discount),
            'shipping_fee' => round($shippingFee),
            'tax_amount' => round($taxAmount),
        ], $pointsToUse, $user);

        $totalAmount = (int) $pointCalc['summary']['total'];
        $pointUsed = (int) $pointCalc['summary']['point_used'];
        $pointDiscount = (int) $pointCalc['summary']['point_discount'];

        $maxProdDays = max(
            1,
            (int) $items->max(
                fn($item) => (int) ($item->product?->specification?->production_time_days ?? 5)
            )
        );

        $estimatedShipDate = now()->startOfDay()->addDays($maxProdDays);

        return [
            'items' => $items->map(function ($item) {
                $product = $item->product;

                return [
                    'cart_item_id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $product?->name ?? '',
                    'product_slug' => $product?->slug ?? '',
                    'quantity' => $item->quantity,
                    'number_of_cases' => (int) ($item->number_of_cases ?? 1),
                    'unit_price' => round((int) ($item->price ?? 0)),
                    'subtotal' => round((int) $item->subtotal),
                    'options' => $item->options,
                    'notes' => $item->notes,
                    'production_days' => $product?->specification?->production_time_days ?? 5,
                ];
            })->values()->all(),

            'shipping_breakdown' => [
                'total_shipping_fee' => round($shippingFee),
                'shipping_fee_type' => $shippingFeeType->label(),
            ],

            'checkout_summary' => [
                'amount_supply' => round($subtotal),
                'amount_vat' => round($taxAmount),
                'amount_discount' => round($discount),
                'coupon' => $couponSummary,
                'point_discount' => $pointDiscount,
                'point_used' => $pointUsed,
                'shipping_fee' => round($shippingFee),
                'total_payment' => round($totalAmount),
                'estimated_production_days' => $maxProdDays,
                'estimated_ship_date' => $estimatedShipDate->toDateString(),
                'package_estimate' => [
                    'box_count' => $boxCount,
                    'shipping_weight' => round($weightKg, 1),
                ],
            ],
        ];
    }

    /**
     * Checkout cart (move to order)
     * Creates an actual order from cart items for demo purposes
     *
     * @param  array  $data  Optional checkout data (shipping_address_id, payment_method, etc.)
     */
    public function checkout(User $user, array $data = []): array
    {
        try {
            DB::beginTransaction();

            $cart = Cart::getOrCreateForUser($user->id);
            $cart->load([
                'items.product.specification',
                'items.designGroup',
                'items.designGroup.orderArtworks',
                'items.designGroup.uploadArtworks',
            ]);
            $items = $cart->items;

            if (! empty($data['item_ids']) && is_array($data['item_ids'])) {
                $itemIds = array_values(array_unique(array_map('intval', $data['item_ids'])));
                $items = $items->whereIn('id', $itemIds)->values();
                if ($items->isEmpty()) {
                    throw new \Exception('선택한 항목을 찾을 수 없습니다.');
                }
                if ($items->count() !== count($itemIds)) {
                    throw new \Exception('선택한 항목 중 일부를 찾을 수 없거나 장바구니에 없습니다.');
                }
            }

            if ($items->isEmpty()) {
                throw new \Exception('장바구니가 비어있습니다.');
            }
            $quote = $this->checkoutQuote($user, $data);

            $subtotal = $quote['checkout_summary']['amount_supply'];
            $taxAmount = $quote['checkout_summary']['amount_vat'];
            $shippingFee = $quote['checkout_summary']['shipping_fee'];
            $pointUsed = $quote['checkout_summary']['point_used'];
            $pointDiscount = $quote['checkout_summary']['point_discount'];
            $totalAmount = $quote['checkout_summary']['total_payment'];
            $discount = $quote['checkout_summary']['amount_discount'];

            $shippingFeeType = $quote['shipping_breakdown']['shipping_fee_type'];
            // $combinedShippingFee = $quote['shipping_breakdown']['combined_shipping_fee'];
            // $separateShippingFee = $quote['shipping_breakdown']['separate_shipping_fee'];
            $combinedShippingFee = 0;
            $separateShippingFee = $shippingFee;

            $paymentMethodEnum = PaymentMethod::forCheckoutString(
                is_string($data['payment_method'] ?? null) ? $data['payment_method'] : null
            );
            $paymentMethod = $paymentMethodEnum->value;

            $contact = $this->resolveContactFromCheckout($user, $data);
            $shippingRow = $this->resolveShippingFromCheckout($user, $data, $contact);

            if (! empty($data['contact']['save_for_worker']) && is_array($data['contact'] ?? null)) {
                $o = $data['contact'];
                $this->myPageWorkerService->createWorker($user, [
                    'name' => $o['name'] ?? $user->name,
                    'mobile' => $o['phone'] ?? $user->phone,
                ]);
            }

            if (! empty($data['shipping']['save_for_shipping_address']) && is_array($data['shipping'] ?? null)) {
                $s = $data['shipping'];
                $this->myPageShippingAddressService->createAddress($user, [
                    'recipient' => $s['name'],
                    'phone' => $s['phone'],
                    'postcode' => $s['postcode'],
                    'address' => $s['address'],
                    'detailed_address' => $s['address_detail'] ?? '',
                    'email' => $s['email'] ?? '',
                    'is_default' => false,
                    'delivery_message_preset' => $s['message_preset'] ?? null,
                    'delivery_message_custom' => $s['message_custom'] ?? null,
                ]);
            }

            $customerNote = $this->mergeCheckoutCustomerNotes($data);

            // Generate unique order number (format: PYYYYMMDD-XXXXXX)
            do {
                $orderNumber = 'PRINTLY' . now()->format('Ymd') . '-' . str_pad((string) random_int(0, 99999), 5, '0', STR_PAD_LEFT);
            } while (Order::where('order_number', $orderNumber)->exists());

            // Get first item's product for order header
            $firstItem = $items->first();
            $product = $firstItem->product;

            // Create order (design_mode_id is FK to product_design_modes; cart's design_id is designs.id — do not use it here)
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
                'proxy_admin_user_id' => $this->proxyLoginService->currentSession($user)?->admin_user_id,
                'product_id' => $product->id,
                'design_mode_code' => $firstItem->designGroup->source_type,
                'product_name' => $product->name,
                'design_mode_name' => null,
                'status' => OrderStatus::Pending->value,
                'payment_status' => PaymentStatus::PENDING->value,
                'payment_method' => $paymentMethod,
                'currency' => 'KRW',
                'subtotal_amount' => round($subtotal),
                'discount_amount' => round($discount),
                'tax_amount' => round($taxAmount),
                'shipping_fee' => round($shippingFee),
                'total_amount' => round($totalAmount),
                'point_used' => $pointUsed,
                'point_discount' => $pointDiscount,
                'estimated_production_days' => max(1, (int) $items->max(fn($item) => (int) ($item->product?->specification?->production_time_days ?? 5))),
                'requested_delivery_date' => $data['requested_delivery_date'] ?? null,
                'placed_at' => now(),
                'contact_name' => $contact['contact_name'],
                'contact_phone' => $contact['contact_phone'],
                'contact_phone2' => $contact['contact_phone2'],
                'contact_tel' => $contact['contact_tel'],
                'contact_email' => $contact['contact_email'],
                'company_name' => $contact['company_name'],
                'contact_postcode' => $contact['contact_postcode'],
                'contact_address' => $contact['contact_address'],
                'contact_address_detail' => $contact['contact_address_detail'],
                'shipping_name' => $shippingRow['shipping_name'],
                'shipping_phone' => $shippingRow['shipping_phone'],
                'shipping_phone2' => '',
                'shipping_postcode' => $shippingRow['shipping_postcode'],
                'shipping_address' => $shippingRow['shipping_address'],
                'shipping_address_detail' => $shippingRow['shipping_address_detail'],
                'shipping_email' => $shippingRow['shipping_email'],
                'shipping_method' => $shippingRow['shipping_method'],
                'shipping_fee_type' => $shippingFeeType instanceof ShippingFeeType ? $shippingFeeType : ShippingFeeType::PAYMENT,
                'shipping_time' => $shippingRow['shipping_time'],
                'customer_note' => $customerNote,
                'shipping_message_preset' => $shippingRow['message_preset'] ?? null,
                'shipping_message_custom' => $shippingRow['message_custom'] ?? null,
                'selected_options' => [],

                'sender_name' => Arr::get($data, 'sender.name') ?? '',
                'sender_phone' => $this->normalizePhoneDigits(Arr::get($data, 'sender.phone')) ?? '',
                'sender_zipcode' => Arr::get($data, 'sender.zipcode') ?? '',
                'sender_address' => Arr::get($data, 'sender.address') ?? '',
                'sender_address2' => Arr::get($data, 'sender.address2') ?? '',
                'metadata' => [
                    'created_from_cart' => true,
                    'cart_id' => $cart->id,
                    'coupon' => data_get($quote, 'checkout_summary.coupon'),
                    'shipping_breakdown' => [
                        'combined_shipping_fee' => round($combinedShippingFee),
                        'separate_shipping_fee' => round($separateShippingFee),
                    ],
                    'checkout' => [
                        'orderer_saved_next' => (bool) ($data['contact']['save_for_worker'] ?? false),
                    ],
                    'estimated_points_earned' => $this->pointTransactionService->calcOrderPoints($user, round($subtotal), round($discount), round($pointDiscount)),
                    'shipping_weight' => data_get($quote, 'checkout_summary.package_estimate.shipping_weight', 0),
                    'box_count' => data_get($quote, 'checkout_summary.package_estimate.box_count', 0),
                ],
            ]);

            // Mark coupon as used if applied
            if (! empty($quote['checkout_summary']['coupon']['user_coupon_id'])) {
                $userCoupon = UserCoupon::find($quote['checkout_summary']['coupon']['user_coupon_id']);
                $userCoupon?->markAsUsed($order->id);
            }

            // Create order items from cart items (all or selected) and attach per-item designs.
            foreach ($items as $cartItem) {
                $itemSubtotal = (int) $cartItem->subtotal;
                $product = $cartItem->product;
                $spec = $product?->specification;
                // Build configuration similar to OrderService::calculateQuote so FE gets rich info.
                $configuration = [
                    'jobs' => '', // not tracked per cart item yet
                    'production_time_days' => $spec->production_time_days ?? '',
                    'sheets' => '', // unknown per tier from cart, keep empty for now
                    'attachment' => '',
                    'product_name' => $product?->name ?? '',
                    'product_name_en' => $product?->name_en ?? $product?->name ?? '',
                    'product_name_ja' => $product?->name_ja ?? $product?->name ?? '',
                    'product_slug' => $product?->slug ?? '',
                    'product_sku' => $product?->sku ?? '',
                    'design_preview' => '',
                    'product_category' => $product?->category?->name ?? '',
                    'product_category_en' => $product?->category?->name_en ?? ($product?->category?->name ?? ''),
                    'product_category_ja' => $product?->category?->name_ja ?? ($product?->category?->name ?? ''),
                    // Extra metadata (ignored by OrderItemResource mapping but kept for debugging)
                    'product_id' => $cartItem->product_id,
                    'design' => $this->getDesignData($cartItem->designGroup),
                    'options' => $this->mapSelectedOptionsValue($product, $cartItem->options ??  []),
                    'input_options' => $cartItem->input_options ??  [],
                    'cart_item_id' => $cartItem->id,
                    'product_snapshot' => $cartItem->product->toArray(),
                ];

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'title' => $product->name,
                    'quantity' => $cartItem->quantity,
                    'multiplier' => (int) ($cartItem->number_of_cases ?? 1),
                    'unit' => 'ea',
                    'production_days' => 5,
                    'unit_price' => round($cartItem->price ?? 0),
                    'total_price' => round($itemSubtotal),
                    'configuration' => $configuration,
                    'notes' => $cartItem->notes,
                ]);

                $designGroup = $this->getAndCheckDesginGroupEmptyOrderItem($user, $cartItem->design_group_id);

                $designGroup->update([
                    'order_id' => $order->id,
                    'order_item_id' => $orderItem->id,
                ]);
            }

            // Backward-compat: if request provides design_ids (not tied to cart items), link them to order header only.
            // Note: per-item linking should come from cart_item.design_ids above.
            $designGroupId = Arr::get($data, 'design_group_id');

            if (! empty($designGroupId) && $user) {
                DesignGroup::where('id', $designGroupId)
                    ->where('user_id', $user->id)
                    ->update(['order_id' => $order->id]);
            }

            if ($pointUsed > 0) {
                $orderAmountForPoints = (int) max(0, round($subtotal + $taxAmount));
                $this->pointTransactionService->use($user, $pointUsed, $orderAmountForPoints, $order);
            }

            // Remove ordered items from cart (only the items that were in this order)
            $orderedItemIds = $items->pluck('id')->toArray();
            CartItem::whereIn('id', $orderedItemIds)->delete();

            // Create order shipments: 1 combined shipment for normal items, 1 separate shipment per bulky item.
            $this->orderService->createOrderShipments($order, $combinedShippingFee);

            DB::commit();

            // Load order with items and product for response (product description, etc.)
            $order->load(['product', 'orderShipments.items', 'items', 'items.designGroup']);

            $maxProdDays = max(1, (int) $items->max(fn($item) => (int) ($item->product?->specification?->production_time_days ?? 5)));
            $estimatedShipDate = now()->startOfDay()->addDays($maxProdDays);

            return [
                'order' => new OrderResource($order),
                'message' => '주문이 생성되었습니다.',
                'shipping_breakdown' => [
                    'combined_shipping_fee' => round($combinedShippingFee),
                    'separate_shipping_fee' => round($separateShippingFee),
                    'total_shipping_fee' => round($shippingFee),
                ],
                'checkout_summary' => [
                    'amount_supply' => round($subtotal),
                    'amount_vat' => round($taxAmount),
                    'amount_discount' => round($discount),
                    'coupon' => data_get($quote, 'checkout_summary.coupon'),
                    'point_discount' => $pointDiscount,
                    'shipping_fee' => round($shippingFee),
                    'total_payment' => round($totalAmount),
                    'estimated_ship_date' => $estimatedShipDate->toDateString(),
                    'shipping_weight' => data_get($quote, 'checkout_summary.package_estimate.shipping_weight', 0),
                    'box_count' => data_get($quote, 'checkout_summary.package_estimate.box_count', 0),
                ],
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkout cart failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    protected function getDesignData(?DesignGroup $designGroup): array
    {
        if (!$designGroup) {
            return [
                'file_design' => null,
                'editor_design' => [
                    'front' => null,
                    'back' => null,
                ],
            ];
        }
        $fileDesign = null;
        $editorDesign = [
            'front' => null,
            'back' => null,
        ];
        if ($designGroup) {
            if ($designGroup->source_type === DesignModeCode::UPLOAD_FILE) {
                $fileDesign = $designGroup->uploadArtworks()->first();
            } else {
                $editorDesigns = $designGroup->orderArtworks()->get();

                $editorDesign = [
                    'front' => $editorDesigns->firstWhere('side', 'front'),
                    'back'  => $editorDesigns->firstWhere('side', 'back'),
                ];
            }
        }

        return [
            'file_design' => $fileDesign,
            'editor_design' => $editorDesign,
            'design_group' => $designGroup ? [...$designGroup->toArray(), 'preview_pdf_url' => StoreURLHelper::storeDesignPDF($designGroup->preview_pdf_url)] : null,
        ];
    }

    private function getAndCheckDesginGroupEmptyOrderItem(User $user, int $design_group_id): DesignGroup
    {
        $designGroup = DesignGroup::where('id', $design_group_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$designGroup) {
            throw new \RuntimeException(
                "Design group [{$design_group_id}] not found."
            );
        } else if ($designGroup->order_item_id != null) {
            throw new \RuntimeException(
                "Design group [{$design_group_id}] exist other order."
            );
        }

        return $designGroup;
    }
    private function resolveShippingFromCustomer(?User $user, float $subtotal, Collection $items): ?array
    {

        $shippingFeeType = $data['shipping_fee_type'] ?? ShippingFeeType::PAYMENT->value;
        if (is_string($shippingFeeType)) {
            $shippingFeeType = ShippingFeeType::tryFrom($shippingFeeType) ?? ShippingFeeType::PAYMENT;
        }
        if ($user->customer_id !== null && ! $user->relationLoaded('customer')) {
            $user->load('customer');
        }

        // Combined shipping fee (one-time, for normal items)
        $combinedShippingFee = 0;
        $hasNormalItems = $items->contains(fn($item) => ! ($item->product?->requires_separate_shipping ?? false));
        if ($hasNormalItems && $user->customer_id !== null && $user->customer !== null) {
            $customer = $user->customer;
            $fee = (float) ($customer->shipping_fee ?? 0);
            $minForFree = $customer->free_shipping_min_order_amount !== null && $customer->free_shipping_min_order_amount !== ''
                ? (float) $customer->free_shipping_min_order_amount
                : null;
            if ($minForFree !== null && $subtotal >= $minForFree) {
                $fee = 0;
            }
            $combinedShippingFee = max(0, $fee);
            $customerType = $customer->shipping_fee_type;
            if ($customerType instanceof ShippingFeeType) {
                $shippingFeeType = $customerType;
            } elseif (is_string($customerType)) {
                $shippingFeeType = ShippingFeeType::tryFrom($customerType) ?? $shippingFeeType;
            }
        }


        // Separate shipping fee (per item, for bulky/oversized items)
        $separateShippingFee = $items
            ->filter(fn($item) => $item->product?->requires_separate_shipping ?? false)
            ->sum(fn($item) => (float) ($item->product->separate_shipping_fee ?? 0));


        $shippingFee = $combinedShippingFee + $separateShippingFee;
        return [
            'combined_shipping_fee' => $combinedShippingFee,
            'separate_shipping_fee' => $separateShippingFee,
            'shipping_fee' => max(0, $shippingFee),
            'shipping_fee_type' => $shippingFeeType->value,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $selectedOptions
     * @return array<int, array<string, mixed>>
     */
    private function mapSelectedOptionsValue(Product $product, array $selectedOptions): array
    {
        if (empty($selectedOptions)) {
            return [];
        }

        return collect($selectedOptions)->map(function (array $selection) use ($product) {
            $group = $product->optionGroups->firstWhere('id', $selection['group_id'] ?? null);

            if (! $group) {
                throw new \InvalidArgumentException('선택한 옵션 그룹이 유효하지 않습니다.');
            }

            $option = $group->options->firstWhere('id', $selection['option_id'] ?? null);

            if (! $option) {
                throw new \InvalidArgumentException('선택한 옵션이 유효하지 않습니다.');
            }

            return [
                'group' => [
                    'id' => $group->id,
                    'code' => $group->code,
                    'name' => $group->name,
                ],
                'option' => [
                    'id' => $option->id,
                    'label' => $option->label,
                    'value' => $option->value,
                    'additional_price' => $option->additional_price,
                ],
            ];
        })->values()->all();
    }

    /**
     * @param Cart $cart
     * @param array $data
     * @return Collection<int, CartItem>
     * @throws \Exception
     */
    private function resolveCartItems(Cart $cart, array $data): Collection
    {
        $items = $cart->items;
        if (! empty($data['item_ids']) && is_array($data['item_ids'])) {
            $itemIds = array_values(array_unique(array_map('intval', $data['item_ids'])));
            $items = $items->whereIn('id', $itemIds)->values();
            if ($items->isEmpty()) {
                throw new \Exception('선택한 항목을 찾을 수 없습니다.');
            }
            if ($items->count() !== count($itemIds)) {
                throw new \Exception('선택한 항목 중 일부를 찾을 수 없거나 장바구니에 없습니다.');
            }
        }
        return $items;
    }

    private function normalizePhoneDigits(?string $phone): string
    {
        if ($phone === null || $phone === '') {
            return '';
        }

        return preg_replace('/\D/', '', $phone) ?? '';
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{
     *     contact_name: string,
     *     contact_phone: string,
     *     contact_phone2: string,
     *     contact_tel: string,
     *     contact_email: string|null,
     *     company_name: string|null,
     *     contact_postcode: string|null,
     *     contact_address: string|null,
     *     contact_address_detail: string|null
     * }
     */
    private function resolveContactFromCheckout(User $user, array $data): array
    {
        $o = $data['contact'] ?? null;
        if (is_array($o)) {
            $phone = $this->normalizePhoneDigits($o['phone'] ?? '') ?: $this->normalizePhoneDigits($user->phone ?? $user->mobile ?? '');

            return [
                'contact_name' => ($o['name'] ?? $user->name),
                'contact_phone' => $o['phone'] ?? $phone,
                'contact_phone2' => Arr::get($o, 'phone2', ''),
                'contact_tel' => $this->normalizePhoneDigits($o['tel'] ?? '') ?: '',
                'contact_email' => $o['email'] ?? $user->email,
                'company_name' => $user->headquarters,
                'contact_postcode' => $o['postcode'] ?? $user->postcode,
                'contact_address' => $o['address'] ?? $user->address,
                'contact_address_detail' => $o['address_detail'] ?? $user->detailed_address,
            ];
        }

        $fallbackPhone = $this->normalizePhoneDigits($user->phone ?? '') ?: $this->normalizePhoneDigits($user->mobile ?? '');

        return [
            'contact_name' => $user->name,
            'contact_phone' => $fallbackPhone,
            'contact_phone2' => '',
            'contact_tel' => '',
            'contact_email' => $user->email,
            'company_name' => $user->headquarters,
            'contact_postcode' => $user->postcode,
            'contact_address' => $user->address,
            'contact_address_detail' => $user->detailed_address,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $contact
     * @return array{
     *     shipping_name: string,
     *     shipping_phone: string,
     *     shipping_postcode: string|null,
     *     shipping_address: string|null,
     *     shipping_address_detail: string|null,
     *     shipping_email: string|null,
     *     shipping_method: ShippingMethod,
     *     shipping_time: string|null
     * }
     */
    private function resolveShippingFromCheckout(User $user, array $data, array $contact): array
    {
        $shipping = $this->extractShippingData($data);
        $method = ShippingMethod::tryFrom((string) ($data['shipping_method'] ?? ShippingMethod::COURIER->value))
            ?? ShippingMethod::COURIER;

        $name = (string) ($shipping['name'] ?? $contact['contact_name']);
        $phone = $this->normalizePhoneDigits($shipping['phone'] ?? '') ?: (string) $contact['contact_phone'];
        $postcode = $shipping['postcode'] ?? $contact['contact_postcode'];
        $address = $shipping['address'] ?? $contact['contact_address'];
        $detail = $shipping['address_detail'] ?? $contact['contact_address_detail'];
        $email = $shipping['email'] ?? $contact['contact_email'];

        $needsAddress = $method->requiresAddress();
        $shippingTime = in_array($method, [ShippingMethod::COURIER, ShippingMethod::QUICK, ShippingMethod::DIRECT], true)
            ? '17'
            : null;

        if (! $needsAddress) {
            $postcode = $postcode ?: null;
            $address = $address ?: null;
            $detail = $detail ?: null;
        }

        return [
            'shipping_name' => $name,
            'shipping_phone' => $phone,
            'shipping_postcode' => $postcode,
            'shipping_address' => $address,
            'shipping_address_detail' => $detail,
            'shipping_email' => $email,
            'shipping_method' => $method,
            'shipping_time' => $shippingTime,
            'message_preset' => $shipping['message_preset'] ?? null,
            'message_custom' => $shipping['message_custom'] ?? null,
        ];
    }

    private function extractShippingData(array $data): array
    {
        $shipping = [];

        // 기본값 설정
        $shipping['name'] = null;
        $shipping['phone'] = null;
        $shipping['postcode'] = null;
        $shipping['address'] = null;
        $shipping['address_detail'] = null;
        $shipping['email'] = null;
        $shipping['method'] = ShippingMethod::COURIER->value;
        $shipping['time'] = '17'; // 타입이 string? 확인 필요

        // 요청 데이터 처리 (예시 기본값 할당)
        if (isset($data['shipping']['name'])) {
            $shipping['name'] = Arr::get($data['shipping'], 'name');
            $shipping['phone'] = Arr::get($data['shipping'], 'phone');
            $shipping['phone2'] = Arr::get($data['shipping'], 'phone2', '');
            $shipping['postcode'] = Arr::get($data['shipping'], 'postcode');
            $shipping['address'] = Arr::get($data['shipping'], 'address');
            $shipping['address_detail'] = Arr::get($data['shipping'], 'address_detail');
            $shipping['email'] = Arr::get($data['shipping'], 'email');
            $shipping['message_preset'] = Arr::get($data['shipping'], 'message_preset');
            $shipping['message_custom'] = Arr::get($data['shipping'], 'message_custom');
        }
        // 추가 필드 동일 처리...

        return $shipping;
    }

    public static function resolvedShipping(array $data): array
    {
        $shipping = is_array(Arr::get($data, 'shipping')) ? $data['shipping'] : [];
        $orderer = is_array(Arr::get($data, 'contact')) ? $data['contact'] : [];

        if (! empty($shipping['same_as_orderer'])) {
            return array_merge($shipping, [
                'name' => $orderer['name'] ?? $shipping['name'] ?? null,
                'phone' => $orderer['phone'] ?? $shipping['phone'] ?? null,
                'postcode' => $orderer['postcode'] ?? $shipping['postcode'] ?? null,
                'address' => $orderer['address'] ?? $shipping['address'] ?? null,
                'address_detail' => $orderer['address_detail'] ?? $shipping['address_detail'] ?? null,
                'email' => $shipping['email'] ?? null,
            ]);
        }

        return $shipping;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function mergeCheckoutCustomerNotes(array $data): ?string
    {
        $parts = array_filter([
            isset($data['customer_note']) && $data['customer_note'] !== '' ? (string) $data['customer_note'] : null,
            isset($data['delivery_message_custom']) && $data['delivery_message_custom'] !== ''
                ? trim((string) $data['delivery_message_custom'])
                : null,
            isset($data['delivery_message_preset']) && $data['delivery_message_preset'] !== ''
                ? '[배송] ' . trim((string) $data['delivery_message_preset'])
                : null,
        ]);

        if ($parts === []) {
            return null;
        }

        return implode("\n", $parts);
    }
}
