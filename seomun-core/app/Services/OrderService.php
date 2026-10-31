<?php

namespace App\Services;

use App\Enums\DesignModeCode;
use App\Enums\ErpOptionGroupCode;
use App\Enums\OrderShipmentStatus;
use App\Enums\OrderShipmentType;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\ShippingFeeType;
use App\Enums\ShippingMethod;
use App\Helpers\StoreURLHelper;
use App\Models\AddressBook;
use App\Models\DesignGroup;
use App\Services\MyPage\MyPageShippingAddressService;
use App\Services\MyPage\MyPageWorkerService;
use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemDesignWorkflow;
use App\Models\OrderArtwork;
use App\Models\OrderShipment;
use App\Models\OrderShippingAddressHistory;
use App\Models\Paper;
use App\Models\Product;
use App\Models\ProductDesignMode;
use App\Models\ProductOptionGroup;
use App\Models\User;
use App\Models\UserCoupon;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Services\MyPage\MyPageCouponService;
use App\Support\OrderShippingPanelPayload;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        protected OrderRepositoryInterface $orderRepository,
        protected PointTransactionService $pointTransactionService,
        protected PointService $pointService,
        protected ProductQuoteService $productQuoteService,
        protected MyPageWorkerService $myPageWorkerService,
        protected MyPageShippingAddressService $myPageShippingAddressService,
        protected ShippingFeeService $shippingFeeService,
        protected MyPageCouponService $couponService,
        protected ProxyLoginService $proxyLoginService,
    ) {}

    /**
     * Calculate quote and price breakdown.
     *
     * Design: Each user belongs to a company (customer); the shipping fee is applied based on the
     * company the user is associated with. When $user has a customer, fee and type come from that
     * customer (with free_shipping_min_order_amount applied); otherwise from payload.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function calculateQuote(array $payload, ?User $user = null, ?ShippingMethod $shippingMethod = null): array
    {
        $product = Product::with([
            'optionGroups.options',
            'specification',
        ])->active()->find($payload['product_id']);

        if (! $product) {
            throw new ModelNotFoundException('선택한 상품을 찾을 수 없습니다.');
        }

        $quantity = $payload['quantity_sets']['quantity'];
        $case = $payload['quantity_sets']['multiplier'];

        $itemSummary = $this->createItemSummary($product, $payload['selected_options'] ?? [], $payload['input_options'], $quantity, $case, Arr::get($payload, 'design_group_id'));
        $rawSelectOptions = $payload['selected_options'];
        $selectedOptions = $this->mapSelectedOptions($product, $payload['selected_options'] ?? []);

        // $optionsTotal = collect($selectedOptions)->sum(
        //     fn(array $option) => (float) ($option['option']['additional_price'] ?? 0)
        // );
        $optionsTotal = 0;

        $subtotal = ($itemSummary['line_items_total'] + $optionsTotal) ?? 0;
        $discount = max(0, (float) ($payload['discount_amount'] ?? 0));
        // Design: Each user belongs to a company (customer); shipping fee is applied based on the company the user is associated with.

        $shippingData = [
            'width' => $payload['input_options']['width'] ?? 0,
            'height' => $payload['input_options']['height'] ?? 0,
            'quantity' => $quantity,
            'case' => $case,
            'postcode' => Arr::get($payload, 'shipping.postcode') ?? Arr::get($payload, 'shipping_postcode'),
            'size' => Arr::get($payload, 'input_options.size') ?? Arr::get($payload, 'size'),
        ];

        $productWeight = array_sum(array_column($itemSummary['items'], 'weight'));

        $shippingResolved = $this->shippingFeeService->resolveShippingFeeWithMethod($user, $subtotal, $product, $shippingMethod, $shippingData, $productWeight);

        if ($shippingResolved !== null) {
            $shippingFee = $shippingResolved['shipping_fee'];
            $shippingFeeType = $shippingResolved['shipping_fee_type'];
        } else {
            $shippingFee = max(0, (float) ($payload['shipping_fee'] ?? 0));
            $shippingFeeType = Arr::get($payload, 'shipping_fee_type');
        }

        // Tax: if FE explicitly sends tax_amount, respect it; otherwise default to 10% of subtotal
        // to keep behavior consistent with MyPage cart checkout logic.
        if (array_key_exists('tax_amount', $payload)) {
            $taxAmount = max(0, (float) $payload['tax_amount']);
        } else {
            $taxAmount = round($subtotal * 0.1, 2);
        }

        $baseAmount = $subtotal + $taxAmount;
        $couponSummary = null;
        if (! empty($payload['user_coupon_id'])) {
            $couponResult = $this->couponService->validateAndCalculateDiscount($user, (int) $payload['user_coupon_id'], $baseAmount);
            $discount = $couponResult['discount'];
            $couponSummary = $couponResult['summary'];
        } else {
            $discount = max(0, (float) ($payload['discount_amount'] ?? 0));
        }

        $point_used = max(0, ($payload['point_used'] ?? 0));
        $point_discount = $point_used;
        if ($point_used > 0) {
            $calc = $this->pointService->calculateWithPoint([
                'subtotal_amount' => $subtotal,
                'discount_amount' => $discount,
                'shipping_fee' => $shippingFee,
                'tax_amount' => $taxAmount,
            ], $point_used, $user);
            $point_used = $calc['summary']['point_used'];
            $point_discount = $calc['summary']['point_discount'];
        }

        $total = max(0, $subtotal - $discount + $shippingFee + $taxAmount - $point_discount);

        return [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
            ],
            'items' => $itemSummary['items'],
            'selected_options' => $selectedOptions,
            'summary' => [
                'currency' => 'KRW',
                'line_items_total' => round($itemSummary['line_items_total']),
                'options_total' => round($optionsTotal),
                'subtotal' => round($subtotal),
                'discount' => round($discount),
                'coupon' => $couponSummary,
                'point_used' => $point_used,
                'point_discount' => $point_discount,
                'tax' => round($taxAmount),
                'shipping_fee' => round($shippingFee),
                'shipping_fee_type' => $shippingFeeType,
                'shipping_weight' => round($productWeight * $case, 1),
                'box_count' => $case,
                'total' => round($total),
                'estimated_production_days' => $product->specification?->production_time_days ?? 0,
            ],
        ];
    }

    private function createItemSummary(Product $product, array $selectedOptions, array $inputOptions, int $quantity, int $multiplier, ?int $designGroupId): array
    {
        $designGroup = null;
        if ($designGroupId) {
            $designGroup = DesignGroup::with([
                'orderArtworks',
                'uploadArtworks',
            ])->find($designGroupId);
        }

        $items = [];
        $estimatedProductionDays = $product->specification?->production_time_days ?? 0;
        $unit = '원';
        $unitPrice = 0;
        $quote = $this->productQuoteService->quote($product->id, $selectedOptions, $inputOptions, $quantity, $multiplier);
        // Build product configuration from product specification and selected options

        // Add product specification if available
        if ($product->specification) {
            $configuration['production_days'] = $product->specification->production_time_days;
        }

        // Add product name + localized fields + category
        $configuration['product_name'] = $product->name;
        $configuration['product_name_en'] = $product->name_en ?? $product->name;
        $configuration['product_name_ja'] = $product->name_ja ?? $product->name;
        $configuration['product_slug'] = $product->slug;
        $configuration['product_sku'] = $product->sku;

        $category = $product->category;
        $configuration['product_category'] = $category?->name ?? '';
        $configuration['product_category_en'] = $category?->name_en ?? ($category?->name ?? '');
        $configuration['product_category_ja'] = $category?->name_ja ?? ($category?->name ?? '');

        // Persist product id so OrderItemResource can render `product_snapshot.id`
        // (checkout flow already includes this, so we keep post-order consistent).
        $configuration['product_id'] = $product->id;

        // Keep full selected options for FE (OrderItemResource exposes it as `item.options`).
        $configuration['options'] = $this->mapSelectedOptionsValue($product, $selectedOptions ??  []);
        $configuration['input_options'] = $inputOptions;

        // Add selected options from payload
        $configuration['jobs'] = ''; // Default value, could be derived from options
        $configuration['sheets'] = $quantity;
        $configuration['attachment'] = ''; // Default value
        $configuration['design_preview'] = ''; // Default value
        $configuration['design'] = $this->getDesignData($designGroup);
        $configuration['product_snapshot'] = $product->toArray();

        $items[] = [
            'product_id' => $product->id,
            'title' => $product->name,
            'quantity' => $quantity,
            'multiplier' => $multiplier,
            'unit' => $unit,
            'unit_price' => round($unitPrice, 2),
            'total_price' => $quote['sub_total'],
            'production_days' => $estimatedProductionDays,
            'configuration' => $configuration,
            'weight' => round($quote['weight'], 1),
        ];

        return [
            'line_items_total' => $quote['sub_total'],
            'items' => $items
        ];
    }

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

    public function createOrder(array $payload, ?User $user = null): Order
    {
        $quote = $this->calculateQuote($payload, $user, ShippingMethod::tryFrom($payload['shipping_method']));

        $group = DesignGroup::findOrFail(Arr::get($payload, 'design_group_id'));

        $orderData = [
            'order_number' => $this->generateOrderNumber(),
            'order_external_number' => Arr::get($payload, 'order_external_number'),
            'payment_method' => Arr::get($payload, 'payment_method'),
            'user_id' => $user?->id,
            'proxy_admin_user_id' => $user ? $this->proxyLoginService->currentSession($user)?->admin_user_id : null,
            'product_id' => $quote['product']['id'],
            'design_mode_code' => $group->source_type ?? Arr::get($payload, 'design_mode_code'),
            'product_name' => $quote['product']['name'],
            'design_mode_name' => Arr::get($quote, 'design_mode.name'),
            'status' => OrderStatus::Pending->value,
            'payment_status' => 'pending',
            'currency' => $quote['summary']['currency'],
            'subtotal_amount' => $quote['summary']['subtotal'],
            'discount_amount' => $quote['summary']['discount'],
            'tax_amount' => $quote['summary']['tax'],
            'shipping_fee' => $quote['summary']['shipping_fee'],
            'point_used' => $quote['summary']['point_used'],
            'point_discount' => $quote['summary']['point_discount'],
            'total_amount' => $quote['summary']['total'],
            'estimated_production_days' => $quote['summary']['estimated_production_days'],
            'requested_delivery_date' => Arr::get($payload, 'requested_delivery_date'),
            'placed_at' => now(),
            'contact_name' => Arr::get($payload, 'contact.name'),
            'contact_phone' => $this->normalizePhone(Arr::get($payload, 'contact.phone')),
            'contact_phone2' => $this->normalizePhone(Arr::get($payload, 'contact.phone2')) ?? '',
            'contact_tel' => $this->normalizePhone(Arr::get($payload, 'contact.tel')) ?? '',
            'contact_email' => Arr::get($payload, 'contact.email'),
            'company_name' => Arr::get($payload, 'company_name'),
            'contact_postcode' => Arr::get($payload, 'contact.postcode'),
            'contact_address' => Arr::get($payload, 'contact.address'),
            'contact_address_detail' => Arr::get($payload, 'contact.address_detail'),
            'shipping_name' => Arr::get($payload, 'shipping.name') ?? Arr::get($payload, 'contact.name'),
            'shipping_phone' => $this->normalizePhone(Arr::get($payload, 'shipping.phone') ?? Arr::get($payload, 'contact.phone')) ?? '',
            'shipping_phone2' => $this->normalizePhone(Arr::get($payload, 'shipping.phone2')) ?? '',
            'shipping_postcode' => Arr::get($payload, 'shipping.postcode'),
            'shipping_address' => Arr::get($payload, 'shipping.address'),
            'shipping_address_detail' => Arr::get($payload, 'shipping.address_detail'),
            'shipping_email' => Arr::get($payload, 'shipping.email') ?? Arr::get($payload, 'contact.email'),
            'shipping_message_preset' => Arr::get($payload, 'shipping.message_preset'),
            'shipping_message_custom' => Arr::get($payload, 'shipping.message_custom'),
            'shipping_branch_name' => Arr::get($payload, 'shipping_branch_name') ?? '',
            'shipping_time' => $this->getShippingTime(Arr::get($payload, 'shipping_time'), Arr::get($payload, 'shipping_method')),
            'amount_shipping' => Arr::get($payload, 'amount_shipping') ?? 0,
            'sender_name' => Arr::get($payload, 'sender.name') ?? '',
            'sender_phone' => $this->normalizePhone(Arr::get($payload, 'sender.phone')) ?? '',
            'sender_zipcode' => Arr::get($payload, 'sender.zipcode') ?? '',
            'sender_address' => Arr::get($payload, 'sender.address') ?? '',
            'sender_address2' => Arr::get($payload, 'sender.address2') ?? '',
            'shipping_method' => Arr::get($payload, 'shipping_method'),
            'shipping_fee_type' => $quote['summary']['shipping_fee_type'] ?? Arr::get($payload, 'shipping_fee_type'),
            'customer_note' => Arr::get($payload, 'customer_note'),
            'selected_options' => $quote['selected_options'],
            'metadata' => [
                'quantity_sets' => $payload['quantity_sets'],
                'quote_summary' => $quote['summary'],
                'coupon' => $quote['summary']['coupon'] ?? null,
                'estimated_points_earned' => $this->pointTransactionService->calcOrderPoints($user, $quote['summary']['subtotal'], $quote['summary']['discount'], $quote['summary']['point_discount']),
                'shipping_weight' => round($quote['summary']['shipping_weight'], 1),
                'box_count' => $quote['summary']['box_count'],
            ],
        ];

        $itemsData = array_map(function (array $item) {
            return [
                'product_id' => $item['product_id'],
                'title' => $item['title'],
                'quantity' => $item['quantity'],
                'multiplier' => $item['multiplier'],
                'unit' => $item['unit'],
                'production_days' => $item['production_days'],
                'unit_price' => $item['unit_price'],
                'total_price' => $item['total_price'],
                'configuration' => $item['configuration'],
            ];
        }, $quote['items']);

        $order = $this->orderRepository->create($orderData, $itemsData);

        // Mark coupon as used if applied
        if (! empty($quote['summary']['coupon']['user_coupon_id'])) {
            $userCoupon = UserCoupon::find($quote['summary']['coupon']['user_coupon_id']);
            $userCoupon?->markAsUsed($order->id);
        }

        // Save contact as worker when requested (same behavior as cart checkout).
        if (! empty($payload['contact']['save_for_worker']) && is_array($payload['contact'] ?? null)) {
            $o = $payload['contact'];
            $this->myPageWorkerService->createWorker($user, [
                'name' => $o['name'] ?? $user?->name,
                'mobile' => $o['phone'] ?? $user?->phone,
            ]);
        }

        // Save shipping address to address book when requested (same behavior as cart checkout).
        if (! empty($payload['shipping']['save_for_shipping_address']) && is_array($payload['shipping'] ?? null)) {
            $s = $payload['shipping'];
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

        // Attach designs to order when design_ids provided (e.g. FE creates design first then passes IDs on order)
        // design_ids can be:
        // - associative object: { front: 254, back: 255 }
        // - or an array of integers: [254, 255] (legacy/advanced use)
        $designGroupId = Arr::get($payload, 'design_group_id');
        if (! empty($designGroupId) && $user) {
            DesignGroup::where('id', $designGroupId)
                ->where('user_id', $user->id)
                ->update([
                    'order_id' => $order->id,
                    'order_item_id' => $order->items->first()->id ?? null,
                ]);
        }

        if ($order->point_used > 0) {
            $this->pointTransactionService->use($order->user, $order->point_used, $order->total_amount, $order);
        }

        $this->createOrderShipments($order, 0);

        return $order;
    }

    public function getOrdersForUser(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return $this->orderRepository->paginateForUser($user->id, $perPage);
    }

    public function getOrderForUser(string $orderNumber, User $user): Order
    {
        $order = $this->orderRepository->findForUser($orderNumber, $user->id);

        if (! $order) {
            throw new ModelNotFoundException('주문을 찾을 수 없습니다.');
        }

        return $order;
    }

    /**
     * Update contact and shipping information for an existing order.
     *
     * @param  array<string, mixed>  $payload
     */
    public function updateShippingInfo(string $orderNumber, User $user, array $payload): Order
    {
        $order = $this->getOrderForUser($orderNumber, $user);

        // Cannot edit if already paid
        if ($order->is_paid) {
            throw new \RuntimeException('이미 결제가 완료된 주문의 배송 정보를 수정할 수 없습니다.', 400);
        }

        $order->update([
            'contact_name' => Arr::get($payload, 'contact.name'),
            'contact_phone' => $this->normalizePhone(Arr::get($payload, 'contact.phone')),
            'contact_phone2' => $this->normalizePhone(Arr::get($payload, 'contact.phone2')),
            'contact_tel' => $this->normalizePhone(Arr::get($payload, 'contact.tel')),
            'contact_email' => Arr::get($payload, 'contact.email'),
            'company_name' => Arr::get($payload, 'company_name'),
            'contact_postcode' => Arr::get($payload, 'contact.postcode'),
            'contact_address' => Arr::get($payload, 'contact.address'),
            'contact_address_detail' => Arr::get($payload, 'contact.address_detail'),
            'shipping_name' => Arr::get($payload, 'shipping.name'),
            'shipping_phone' => $this->normalizePhone(Arr::get($payload, 'shipping.phone')),
            'shipping_phone2' => $this->normalizePhone(Arr::get($payload, 'shipping.phone2')),
            'shipping_postcode' => Arr::get($payload, 'shipping.postcode'),
            'shipping_address' => Arr::get($payload, 'shipping.address'),
            'shipping_address_detail' => Arr::get($payload, 'shipping.address_detail'),
            'shipping_email' => Arr::get($payload, 'shipping.email'),
            'shipping_method' => Arr::get($payload, 'shipping_method'),
            'customer_note' => Arr::get($payload, 'customer_note'),
            'requested_delivery_date' => Arr::get($payload, 'requested_delivery_date'),
        ]);

        return $order->fresh(['items']);
    }

    /**
     * Apply a saved address book entry to the order's shipping fields only (배송지 변경).
     * Stores {@see AddressBook} id in order metadata for picker pre-selection.
     *
     * @throws ModelNotFoundException When the address book row is missing for this user.
     */
    public function updateShippingFromAddressBook(string $orderNumber, User $user, int $addressBookId): Order
    {
        $order = $this->getOrderForUser($orderNumber, $user);

        if (! in_array($order->status, OrderStatus::getStatusEditFileUpload())) {
            throw new \RuntimeException('제작 후에는 주소를 변경할 수 없습니다.', 400);
        }

        $address = AddressBook::where('user_id', $user->id)->whereKey($addressBookId)->first();
        if (! $address) {
            throw new ModelNotFoundException('배송지를 찾을 수 없습니다.');
        }

        $this->eagerLoadOrderForShippingPanel($order);
        $payload = $this->buildShippingUpdatePayloadFromAddressBook($order, $address);

        if ($this->orderAlreadyMatchesShippingPayload($order, $address, $payload)) {

            return $this->hydrateOrderForMyPageDeliveryDetail($order->fresh([
                'user.customer',
                'items.artworks',
                'paymentTransaction',
                'deliveryTracking',
                'artworks',
                'orderShipments',
                'orderShipments.items'
            ]));
        }

        DB::transaction(function () use ($order, $address, $payload): void {
            $existingHistoryCount = OrderShippingAddressHistory::where('order_id', $order->id)->count();

            if ($existingHistoryCount === 0) {
                OrderShippingAddressHistory::create([
                    'order_id' => $order->id,
                    'address_book_id' => null,
                    'changed_at' => $order->placed_at ?? $order->created_at ?? now(),
                    'payload' => OrderShippingPanelPayload::fromOrder($order),
                ]);
            }

            $order->update($payload);
            $order->refresh();
            $this->eagerLoadOrderForShippingPanel($order);

            OrderShippingAddressHistory::create([
                'order_id' => $order->id,
                'address_book_id' => $address->id,
                'changed_at' => now(),
                'payload' => OrderShippingPanelPayload::fromOrder($order),
            ]);
        });

        return $this->hydrateOrderForMyPageDeliveryDetail($order->fresh([
            'user.customer',
            'items.artworks',
            'paymentTransaction',
            'deliveryTracking',
            'artworks',
            'orderShipments',
            'orderShipments.items'
        ]));
    }

    /**
     * Versions for "변경 이력 확인" modal (newest first).
     *
     * @return Collection<int, array{revision: int, changed_at: string, address_book_id: int|null, snapshot: array<string, mixed>}>
     */
    public function getShippingAddressHistoryVersions(string $orderNumber, User $user): Collection
    {
        $order = $this->getOrderForUser($orderNumber, $user);

        $rows = OrderShippingAddressHistory::query()
            ->where('order_id', $order->id)
            ->orderByDesc('changed_at')
            ->orderByDesc('id')
            ->get();

        $total = $rows->count();

        return $rows->values()->map(function (OrderShippingAddressHistory $row, int $index) use ($total) {
            return [
                'revision' => $total - $index,
                'changed_at' => $row->changed_at->toIso8601String(),
                'address_book_id' => $row->address_book_id,
                'snapshot' => $row->payload ?? [],
            ];
        });
    }

    public function requestProofRevision(
        string $orderNumber,
        User $user,
        string $requestMessage,
        int $orderItemId,
        ?UploadedFile $attachment = null,
    ): Order {
        $order = $this->getOrderForUser($orderNumber, $user);
        // $this->assertNotManagedByDesignService($order, $orderItemId);
        $this->assertProofNotYetConfirmed($order);

        $orderItem = OrderItem::findOrFail($orderItemId);
        $itemMetadata = is_array($orderItem->metadata) ? $orderItem->metadata : [];
        $corrections = is_array($itemMetadata['corrections'] ?? null) ? $itemMetadata['corrections'] : [];

        $row = [
            'requested_at' => now()->toIso8601String(),
            'message' => $requestMessage,
            'attachment_url' => $attachment ? $this->storeProofFile($order, $attachment, 'corrections') : null,
        ];

        $corrections[] = $row;
        $itemMetadata['corrections'] = $corrections;
        $itemMetadata['proof_status'] = 'revision_requested';
        $itemMetadata['proof_confirmed_at'] = null;

        $orderItem->update(['metadata' => $itemMetadata]);

        return $this->hydrateOrderForMyPageDeliveryDetail($order->fresh([
            'user.customer',
            'items.artworks',
            'paymentTransaction',
            'deliveryTracking',
            'artworks',
            'orderShipments',
            'orderShipments.items'
        ]));
    }

    public function resubmitProofFile(
        string $orderNumber,
        User $user,
        UploadedFile $file,
        int $orderItemId,
        ?string $note = null,
    ): Order {
        $order = $this->getOrderForUser($orderNumber, $user);
        // $this->assertNotManagedByDesignService($order, $orderItemId);

        $status = OrderStatus::tryFrom($order->status);

        if (! in_array($order->status, OrderStatus::getStatusEditFileUpload(), true)) {
            throw new \RuntimeException(
                sprintf(
                    '현재 주문 상태(%s)에서는 파일 업로드가 허용되지 않습니다.',
                    $status?->label() ?? $order->status
                ),
                400
            );
        }

        $this->assertProofNotYetConfirmed($order);

        $orderItem = OrderItem::findOrFail($orderItemId);
        $itemMetadata = is_array($orderItem->metadata) ? $orderItem->metadata : [];
        $resubmissions = is_array($itemMetadata['file_resubmissions'] ?? null) ? $itemMetadata['file_resubmissions'] : [];

        $row = [
            'submitted_at' => now()->toIso8601String(),
            'file_url' => $this->storeProofFile($order, $file, 'resubmissions'),
            'file_name' => $file->getClientOriginalName(),
            'note' => $note,
        ];

        $resubmissions[] = $row;
        $itemMetadata['file_resubmissions'] = $resubmissions;
        $itemMetadata['proof_status'] = 'file_resubmitted';
        $itemMetadata['proof_confirmed_at'] = null;

        $orderItem->update(['metadata' => $itemMetadata]);

        return $this->hydrateOrderForMyPageDeliveryDetail($order->fresh([
            'user.customer',
            'items.artworks',
            'paymentTransaction',
            'deliveryTracking',
            'artworks',
            'orderShipments',
            'orderShipments.items'
        ]));
    }

    public function confirmProof(string $orderNumber, User $user, bool $confirm, int $orderItemId): Order
    {
        if (! $confirm) {
            throw new \InvalidArgumentException('confirm must be true', 422);
        }

        $order = $this->getOrderForUser($orderNumber, $user);
        // $this->assertNotManagedByDesignService($order, $orderItemId);

        if (! in_array($order->status, OrderStatus::getStatusEditFileUpload(), true)) {
            $statusLabel = OrderStatus::tryFrom($order->status)?->label() ?? $order->status;

            throw new \RuntimeException(
                "현재 주문 상태({$statusLabel})에서는 확인이 허용되지 않습니다.",
                400
            );
        }

        $orderItem = OrderItem::findOrFail($orderItemId);

        if ($orderItem->order_id !== $order->id) {
            throw new \RuntimeException('주문 항목이 해당 주문에 속하지 않습니다.', 400);
        }

        $itemMetadata = is_array($orderItem->metadata) ? $orderItem->metadata : [];

        if (! empty($itemMetadata['proof_confirmed_at'])) {
            throw new \RuntimeException('이미 교정 확인이 완료된 주문 항목입니다.', 400);
        }

        $itemMetadata['proof_status'] = 'confirmed';
        $itemMetadata['proof_confirmed_at'] = now()->toIso8601String();
        $itemMetadata['order_item_id'] = $orderItemId;

        $orderItem->update(['metadata' => $itemMetadata]);

        $this->checkAndUpdateOrderProofStatus($order);

        return $this->hydrateOrderForMyPageDeliveryDetail($order->fresh([
            'user.customer',
            'items.artworks',
            'paymentTransaction',
            'deliveryTracking',
            'artworks',
            'orderShipments',
            'orderShipments.items'
        ]));
    }

    private function checkAndUpdateOrderProofStatus(Order $order): void
    {
        $order->load('items');
        $orderItems = $order->items;

        $allConfirmed = true;
        foreach ($orderItems as $item) {
            $itemMetadata = is_array($item->metadata) ? $item->metadata : [];
            if (empty($itemMetadata['proof_confirmed_at']) && data_get($item->configuration, 'design.file_design') !== null) {
                $allConfirmed = false;
                break;
            }
        }

        if ($allConfirmed) {
            $order->update([
                'status' => OrderStatus::Typesetting->value,
            ]);
        }
    }

    private function eagerLoadOrderForShippingPanel(Order $order): void
    {
        $order->loadMissing([
            'deliveryTracking',
            'orderShipments'
        ]);
    }

    private function hydrateOrderForMyPageDeliveryDetail(Order $order): Order
    {
        $order->loadCount('shippingAddressHistories');
        $order->loadMissing('latestShippingAddressHistory');

        return $order;
    }

    private function assertProofNotYetConfirmed(Order $order): void
    {
        if (! empty($order->metadata['proof_confirmed_at'])) {
            throw new \RuntimeException('이미 교정 확인이 완료되어 수정/재접수를 할 수 없습니다.', 400);
        }
    }

    /**
     * Upload-file design-service items are reviewed version-by-version through
     * the design workflow. The legacy proof endpoints must not bypass its
     * customer and administrator approval gates.
     */
    private function assertNotManagedByDesignService(Order $order, int $orderItemId): void
    {
        $isDesignServiceItem = OrderItemDesignWorkflow::query()
            ->where('order_id', $order->id)
            ->where('order_item_id', $orderItemId)
            ->exists();

        if ($isDesignServiceItem) {
            throw new \RuntimeException(
                '디자인 서비스 주문은 디자인 검토 API를 사용해야 합니다.',
                422
            );
        }
    }

    private function storeProofFile(Order $order, UploadedFile $file, string $folder): string
    {
        $path = $file->storeAs(
            'orders/proof/' . $order->id . '/' . $folder,
            now()->format('YmdHis') . '-' . Str::random(8) . '.' . $file->getClientOriginalExtension(),
            'public'
        );

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        return $disk->url($path);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildShippingUpdatePayloadFromAddressBook(Order $order, AddressBook $address): array
    {
        $mobile = trim((string) ($address->mobile ?? ''));
        $phone = trim((string) ($address->phone ?? ''));

        if ($mobile !== '') {
            $primarySource = $mobile;
            $secondarySource = ($phone !== '' && $this->normalizePhone($phone) !== $this->normalizePhone($mobile))
                ? $phone
                : null;
        } else {
            $primarySource = $phone !== '' ? $phone : null;
            $secondarySource = null;
        }

        $metadata = is_array($order->metadata) ? $order->metadata : [];
        $metadata['shipping_address_book_id'] = $address->id;

        $payload = [
            'shipping_name' => $address->recipient,
            'shipping_phone' => $this->normalizePhone($primarySource),
            'shipping_phone2' => $secondarySource ? $this->normalizePhone($secondarySource) : null,
            'shipping_postcode' => $address->postcode,
            'shipping_address' => $address->address,
            'shipping_address_detail' => $address->detailed_address,
            'metadata' => $metadata,
        ];

        if (filled($address->email)) {
            $payload['shipping_email'] = $address->email;
        }

        $deliveryMessage = $address->delivery_message_custom
            ?: $address->delivery_message_preset
            ?: $address->delivery_message;

        if (filled($deliveryMessage)) {
            $payload['customer_note'] = $deliveryMessage;
        }

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function orderAlreadyMatchesShippingPayload(Order $order, AddressBook $address, array $payload): bool
    {
        $expectedEmail = array_key_exists('shipping_email', $payload)
            ? $payload['shipping_email']
            : $order->shipping_email;

        $expectedNote = array_key_exists('customer_note', $payload)
            ? $payload['customer_note']
            : $order->customer_note;

        return trim((string) ($order->shipping_name ?? '')) === trim((string) ($payload['shipping_name'] ?? ''))
            && $this->normalizePhone($order->shipping_phone) === $this->normalizePhone($payload['shipping_phone'] ?? null)
            && $this->normalizePhone($order->shipping_phone2) === $this->normalizePhone($payload['shipping_phone2'] ?? null)
            && trim((string) ($order->shipping_postcode ?? '')) === trim((string) ($payload['shipping_postcode'] ?? ''))
            && trim((string) ($order->shipping_address ?? '')) === trim((string) ($payload['shipping_address'] ?? ''))
            && trim((string) ($order->shipping_address_detail ?? '')) === trim((string) ($payload['shipping_address_detail'] ?? ''))
            && trim((string) ($order->shipping_email ?? '')) === trim((string) ($expectedEmail ?? ''))
            && trim((string) ($order->customer_note ?? '')) === trim((string) ($expectedNote ?? ''))
            && (int) data_get($order->metadata, 'shipping_address_book_id') === $address->id;
    }

    private function resolveDesignMode(string $design_mode_code): DesignModeCode
    {
        if (! $design_mode_code) {
            throw new \InvalidArgumentException('선택한 제작 방식이 유효하지 않습니다.');
        }

        return DesignModeCode::tryFrom($design_mode_code);
    }

    /**
     * @param  array<int, array<string, mixed>>  $selectedOptions
     * @return array<int, array<string, mixed>>
     */
    private function mapSelectedOptions(Product $product, array $selectedOptions): array
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

            $erpSelection = [
                'group_id' => $group->erp_option_group_id,
                'option_id' => $option->erp_option_id
            ];

            $this->checkERPOptionInProductOption($product, $erpSelection);

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


    private function checkERPOptionInProductOption(Product $product, array $selection): bool
    {
        $groupId = $selection['group_id'] ?? null;
        $optionId = $selection['option_id'] ?? null;

        if ($groupId == null || $optionId == null) {
            return true;
        }

        // Verify ERP option group exists
        $erpOptionGroup = ErpOptionGroup::find($groupId);
        if (! $erpOptionGroup) {
            throw new \InvalidArgumentException('선택한 ERP 옵션 그룹이 유효하지 않습니다.');
        }

        // Verify ERP option exists
        $erpOption = ErpOption::find($optionId);
        if (! $erpOption) {
            throw new \InvalidArgumentException('선택한 ERP 옵션이 유효하지 않습니다.');
        }

        // Verify option belongs to group
        if ($erpOption->erp_option_group_id !== $groupId) {
            throw new \InvalidArgumentException('ERP 옵션이 선택한 그룹에 속하지 않습니다.');
        }

        return true;
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'PRINTLY' . now()->format('Ymd') . '-' . str_pad((string) random_int(0, 99999), 5, '0', STR_PAD_LEFT);
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    /**
     * Normalize phone number by removing non-digit characters
     */
    private function normalizePhone(?string $phone): ?string
    {
        if (! $phone) {
            return null;
        }

        return preg_replace('/[^0-9]/', '', $phone) ?: null;
    }

    /**
     * Get shipping time based on shipping method
     * 택배,화물은 17고정, 나머지는 9~18 중 숫자 값
     */
    private function getShippingTime(?string $shippingTime, string $shippingMethod): ?string
    {
        // get enum values from ShippingMethod
        if (in_array($shippingMethod, [ShippingMethod::COURIER->value, ShippingMethod::QUICK->value])) {
            return '17';
        }

        // get shipping time 9~18
        if ($shippingTime && is_numeric($shippingTime) && $shippingTime >= 9 && $shippingTime <= 18) {
            return $shippingTime;
        }

        return null;
    }

    /**
     * Create a new reorder from an existing completed order.
     */
    public function createReOrderFromOrder(string $orderNumber, User $user): Order
    {
        // Step 1: Get source order and verify ownership
        $sourceOrder = $this->orderRepository->findForUser($orderNumber, $user->id);

        if (! $sourceOrder) {
            throw new ModelNotFoundException('Order not found.');
        }

        // Step 1.5: Only completed orders are eligible for reorder
        if ($sourceOrder->status !== OrderStatus::Completed->value) {
            throw new \InvalidArgumentException('Only completed orders can be reordered.');
        }

        // Step 2: Validate product availability
        $product = $sourceOrder->product;

        if (! $product || ! $product->is_active) {
            throw new \RuntimeException('Product is no longer available.');
        }

        // Step 3: Validate quantity prices for all items
        // foreach ($sourceOrder->items as $item) {
        //     $quantityPrice = $item->quantityPrice;

        //     if (! $quantityPrice || ! $quantityPrice->exists) {
        //         throw new \RuntimeException('Product quantity option is no longer available.');
        //     }
        // }

        // Step 4: Build order data from source order
        $orderData = $this->buildReOrderData($sourceOrder);

        // Step 5: Calculate quote for pricing validation
        $quote = $this->calculateQuote($orderData['payload'], $user);
        $totalAmount = $quote['summary']['total'] ?? 0;

        // Apply calculated totals to the new order header.
        // Without this, reorder orders are created with 0 amounts from the initial template.
        $orderData['data']['currency'] = $quote['summary']['currency'] ?? $orderData['data']['currency'];
        $orderData['data']['subtotal_amount'] = $quote['summary']['subtotal'] ?? 0;
        $orderData['data']['discount_amount'] = $quote['summary']['discount'] ?? 0;
        $orderData['data']['tax_amount'] = $quote['summary']['tax'] ?? 0;
        $orderData['data']['shipping_fee'] = $quote['summary']['shipping_fee'] ?? 0;
        $orderData['data']['total_amount'] = $quote['summary']['total'] ?? 0;
        $orderData['data']['estimated_production_days'] = $quote['summary']['estimated_production_days'] ?? 0;
        $orderData['data']['shipping_fee_type'] = $quote['summary']['shipping_fee_type']
            ?? $orderData['data']['shipping_fee_type'];
        $orderData['data']['metadata']['quote_summary'] = $quote['summary'] ?? [];

        // Step 6: Check user limit for paylater payment
        if ($sourceOrder->payment_method === PaymentMethod::PAY_LATER->value) {
            $limitService = app(LimitManagementService::class);

            if (! $limitService->checkLimit($user, $totalAmount)) {
                throw new \RuntimeException('Insufficient limit balance. Please contact support or make a payment.');
            }
        }

        // Step 7: Create new order with items
        $itemsData = array_map(function (array $item) {
            return [
                'product_id' => $item['product_id'],
                'title' => $item['title'],
                'quantity' => $item['quantity'],
                'multiplier' => $item['multiplier'],
                'unit' => $item['unit'],
                'production_days' => $item['production_days'],
                'unit_price' => $item['unit_price'],
                'total_price' => $item['total_price'],
                'configuration' => $item['configuration'],
            ];
        }, $quote['items']);

        $newOrder = $this->orderRepository->create($orderData['data'], $itemsData);

        return $newOrder;
    }

    /**
     * Build order data for reorder from source order.
     */
    private function buildReOrderData(Order $sourceOrder): array
    {
        // Generate new order number
        $newOrderNumber = $this->generateOrderNumber();

        // Build order data - copy relevant fields but reset status
        $orderData = [
            'order_number' => $newOrderNumber,
            'order_external_number' => $sourceOrder->order_external_number,
            'payment_method' => $sourceOrder->payment_method,
            'user_id' => $sourceOrder->user_id,
            'product_id' => $sourceOrder->product_id,
            'design_mode_code' => $sourceOrder->design_mode_code,
            'product_name' => $sourceOrder->product_name,
            'design_mode_name' => $sourceOrder->design_mode_name,
            'status' => OrderStatus::Pending->value,
            'payment_status' => 'pending',
            'currency' => $sourceOrder->currency,
            'subtotal_amount' => 0, // Will be updated after quote calculation
            'discount_amount' => 0,
            'tax_amount' => 0,
            'shipping_fee' => 0,
            'total_amount' => 0,
            'estimated_production_days' => 0,
            'requested_delivery_date' => null, // Reset for new order
            'placed_at' => now(),
            // Contact info
            'contact_name' => $sourceOrder->contact_name,
            'contact_tel' => $sourceOrder->contact_tel,
            'contact_phone' => $sourceOrder->contact_phone,
            'contact_phone2' => $sourceOrder->contact_phone2,
            'contact_email' => $sourceOrder->contact_email,
            'company_name' => $sourceOrder->company_name,
            'contact_postcode' => $sourceOrder->contact_postcode,
            'contact_address' => $sourceOrder->contact_address,
            'contact_address_detail' => $sourceOrder->contact_address_detail,
            // Shipping info
            'shipping_name' => $sourceOrder->shipping_name,
            'shipping_phone' => $sourceOrder->shipping_phone,
            'shipping_phone2' => $sourceOrder->shipping_phone2,
            'shipping_postcode' => $sourceOrder->shipping_postcode,
            'shipping_address' => $sourceOrder->shipping_address,
            'shipping_address_detail' => $sourceOrder->shipping_address_detail,
            'shipping_email' => $sourceOrder->shipping_email,
            'shipping_method' => $sourceOrder->shipping_method,
            'shipping_fee_type' => $sourceOrder->shipping_fee_type,
            'shipping_branch_name' => $sourceOrder->shipping_branch_name,
            'shipping_time' => $sourceOrder->shipping_time,
            'amount_shipping' => $sourceOrder->amount_shipping,
            // Sender info
            'sender_name' => $sourceOrder->sender_name,
            'sender_phone' => $sourceOrder->sender_phone,
            'sender_zipcode' => $sourceOrder->sender_zipcode,
            'sender_address' => $sourceOrder->sender_address,
            'sender_address2' => $sourceOrder->sender_address2,
            // Additional
            'customer_note' => $sourceOrder->customer_note,
            'selected_options' => $sourceOrder->selected_options,
            // Reset ERP sync fields
            'metadata' => [
                'original_order_number' => $sourceOrder->order_number,
                'original_order_id' => $sourceOrder->id,
                'created_via' => 'reorder',
                'quantity_sets' => $sourceOrder->metadata['quantity_sets'] ?? [],
            ],
        ];

        // Build payload for quote calculation - includes quantity sets from source
        $quantitySets = [];

        foreach ($sourceOrder->items as $item) {
            $quantitySets[] = [
                'quantity' => $item->quantity,
                'multiplier' => $item->multiplier,
            ];
        }

        $payload = [
            'product_id' => $sourceOrder->product_id,
            'design_mode_code' => $sourceOrder->design_mode_code,
            'quantity_sets' => $quantitySets,
            'selected_options' => $sourceOrder->selected_options ?? [],
            'shipping_method' => $sourceOrder->shipping_method instanceof ShippingMethod
                ? $sourceOrder->shipping_method->value
                : $sourceOrder->shipping_method,
            'shipping_fee_type' => $sourceOrder->shipping_fee_type instanceof ShippingFeeType
                ? $sourceOrder->shipping_fee_type->value
                : $sourceOrder->shipping_fee_type,
        ];

        return [
            'data' => $orderData,
            'payload' => $payload,
        ];
    }

    public function applyPoint(string $orderNumber, User $user, int $pointsToUse): Order
    {
        $order = $this->orderRepository->findForUser($orderNumber, $user->id);

        if ($order->status !== OrderStatus::Pending->value || $order->point_used > 0) {
            throw new \Exception('해당 주문에는 포인트를 적용할 수 없습니다.');
        }

        $calc = $this->pointService->calculateWithPoint([
            'subtotal_amount' => $order->subtotal_amount,
            'discount_amount' => $order->discount_amount,
            'shipping_fee' => $order->shipping_fee,
            'tax_amount' => $order->tax_amount,
        ], $pointsToUse, $order->user);

        $order->update([
            'point_used' => $calc['summary']['point_used'],
            'point_discount' => $calc['summary']['point_discount'],
            'total_amount' => $calc['summary']['total'],
        ]);

        return $order;
    }

    public function createOrderShipments(Order $order, float $combinedShippingFee): void
    {
        $shippingInfo = [
            'shipping_name'           => $order->shipping_name,
            'shipping_phone'          => $order->shipping_phone,
            'shipping_postcode'       => $order->shipping_postcode,
            'shipping_address'        => $order->shipping_address,
            'shipping_address_detail' => $order->shipping_address_detail,
        ];

        $order->load('items.product');

        $normalItems   = $order->items->filter(fn($i) => ! ($i->product?->requires_separate_shipping ?? false));
        $bulkyItems    = $order->items->filter(fn($i) => $i->product?->requires_separate_shipping ?? false);

        // Combined shipment for all normal items (합배송)
        if ($normalItems->isNotEmpty()) {
            $shipment = OrderShipment::create(array_merge($shippingInfo, [
                'order_id'     => $order->id,
                'type'         => OrderShipmentType::COMBINED,
                'status'       => OrderShipmentStatus::PENDING,
                'shipping_fee' => round($combinedShippingFee, 2),
            ]));
            $shipment->items()->attach($normalItems->pluck('id')->toArray());
        }

        // One separate shipment per bulky item (따로 배송)
        foreach ($bulkyItems as $item) {
            $itemShippingFee = (float) ($item->product?->separate_shipping_fee ?? 0);
            $shipment = OrderShipment::create(array_merge($shippingInfo, [
                'order_id'     => $order->id,
                'type'         => OrderShipmentType::SEPARATE,
                'status'       => OrderShipmentStatus::PENDING,
                'shipping_fee' => round($itemShippingFee, 2),
            ]));
            $shipment->items()->attach([$item->id]);
        }
    }
}
