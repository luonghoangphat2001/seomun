<?php

namespace App\Http\Controllers\Api;

use App\Constants\WebhookErrorCode;
use App\Enums\OrderStatus;
use App\Exceptions\WebhookOrderException;
use App\Http\Requests\WebhookCreateOrderRequest;
use App\Http\Requests\WebhookGetAvailableOptionsRequest;
use App\Http\Requests\WebhookGetPriceRequest;
use App\Http\Requests\WebhookOrderIndexRequest;
use App\Http\Requests\WebhookUpdateDesignFilesRequest;
use App\Http\Requests\WebhookUpdateOrderRequest;
use App\Http\Resources\Webhook\WebhookPartnerOrderGroupResource;
use App\Http\Resources\Webhook\WebhookPartnerOrderResource;
use App\Jobs\DownloadDesignFileJob;
use App\Models\ErpOptionDependency;
use App\Models\OrderCodeOptionMapping;
use App\Models\PartnerOrder;
use App\Models\PartnerOrderGroup;
use App\Models\SizeOption;
use App\Services\PaginationService;
use App\Services\Price\PriceCalculator;
use App\Services\WebhookOrder\WebhookOrderService;
use App\Services\WebhookOrder\WebhookProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class WebhookOrderController extends BaseController
{
    public function __construct(
        protected WebhookOrderService $webhookOrderService,
        protected WebhookProductService $webhookProductService,
        protected PaginationService $paginationService,
        protected PriceCalculator $priceCalculator,
    ) {}

    /**
     * POST /api/webhook/orders
     * Receive orders from partner — middleware: verify.webhook (injects $customer)
     */
    public function receiveOrders(WebhookCreateOrderRequest $request): JsonResponse
    {
        try {
            $ordersData = $request->validated()['orders'];
            $customer = $request->get('customer');

            $results = $this->webhookOrderService->receiveOrders($ordersData, $customer);

            $data = [
                'total' => count($results),
                'success' => count(array_filter($results, fn ($r) => $r['status'] === 'success')),
                'failed' => count(array_filter($results, fn ($r) => $r['status'] === 'error')),
                'results' => $results,
            ];

            return $this->responseSuccess(201, '주문이 성공적으로 접수되었습니다.', $data);
        } catch (ValidationException $e) {
            return $this->responseError(422, '유효성 검사에 실패했습니다.', $e->errors(), WebhookErrorCode::VAL001);
        } catch (\Exception $e) {
            return $this->responseError(500, $e->getMessage(), [], WebhookErrorCode::SYS001);
        }
    }

    /**
     * POST /api/webhook/orders/approval
     * Update contact/shipping info and set status = confirmed — middleware: verify.webhook
     */
    public function updateApprovalStatus(WebhookUpdateOrderRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $externalOrderIds = $data['external_order_ids'];
            $shippingData = $this->webhookOrderService->mapApprovalData($data);
            $customer = $request->attributes->get('customer');

            $group = $this->webhookOrderService->approveOrderGroup(
                $externalOrderIds,
                $shippingData,
                $customer
            );

            return $this->responseSuccess(200, '주문이 성공적으로 승인되었습니다.', [
                'group_order_number' => $group->group_order_number,
                'order_count' => $group->orders->count(),
                'order_numbers' => $group->orders->pluck('order_number'),
            ]);
        } catch (WebhookOrderException $e) {
            return $this->responseError($e->httpStatus(), $e->getMessage(), [], $e->errorCode());
        } catch (\Exception $e) {
            return $this->responseError(500, $e->getMessage(), [], WebhookErrorCode::SYS001);
        }
    }

    /**
     * POST /api/webhook/orders/{externalOrderId}/design-files
     * Save the file URL immediately, then dispatch a background job to download + convert to PDF.
     * Responds immediately — download happens asynchronously.
     */
    public function updateDesignFiles(WebhookUpdateDesignFilesRequest $request, string $externalOrderId): JsonResponse
    {
        try {
            $order = PartnerOrder::where('order_external_number', $externalOrderId)->first();

            if (! $order) {
                return $this->responseError(404, '주문을 찾을 수 없습니다.', [], WebhookErrorCode::ORD001);
            }

            $allowedStatuses = [OrderStatus::Pending->value, OrderStatus::Draft->value];
            if (! in_array($order->status, $allowedStatuses)) {
                return $this->responseError(422, "디자인 파일을 수정할 수 없습니다. 현재 주문 상태: {$order->status}", [], WebhookErrorCode::DES001);
            }

            $fileUrl = $request->validated()['file_url'];

            // Persist the original URL immediately so it's available right away
            $order->design_file_url = $fileUrl;
            $order->save();

            // Download + PDF conversion happens in the background
            DownloadDesignFileJob::dispatch($fileUrl, $externalOrderId);

            return $this->responseSuccess(200, '디자인 파일 처리가 대기열에 등록되었습니다.', [
                'external_order_id' => $externalOrderId,
                'file_url' => $fileUrl,
            ]);
        } catch (\Exception $e) {
            return $this->responseError(500, $e->getMessage(), [], WebhookErrorCode::SYS001);
        }
    }

    /**
     * GET /api/webhook/orders
     * List partner orders — no middleware, optional ?status= filter, paginated
     */
    public function index(WebhookOrderIndexRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $perPage = (int) ($validated['per_page'] ?? 15);

            $query = PartnerOrderGroup::with(['customer', 'orders.items'])
                ->orderByDesc('created_at');

            if (! empty($validated['status'])) {
                $query->where('status', $validated['status']);
            }

            if (! empty($validated['group_order_number'])) {
                $query->where('group_order_number', $validated['group_order_number']);
            }

            if (! empty($validated['date_from'])) {
                $query->whereDate('created_at', '>=', $validated['date_from']);
            }

            if (! empty($validated['date_to'])) {
                $query->whereDate('created_at', '<=', $validated['date_to']);
            }

            if (! empty($validated['search'])) {
                $search = $validated['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('group_order_number', 'like', "%{$search}%")
                        ->orWhereHas('orders', fn ($q2) => $q2->where('order_number', 'like', "%{$search}%")
                            ->orWhere('order_external_number', 'like', "%{$search}%")
                        );
                });
            }

            $paginator = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => '주문 그룹 목록이 성공적으로 조회되었습니다.',
                'data' => [
                    'groups' => WebhookPartnerOrderGroupResource::collection($paginator->items()),
                ],
                'pagination' => $this->paginationService->format($paginator),
            ], 200);
        } catch (\Exception $e) {
            return $this->responseError(500, $e->getMessage(), [], WebhookErrorCode::SYS001);
        }
    }

    /**
     * GET /api/webhook/orders/ungrouped
     * List PartnerOrders that have not been assigned to a group yet (pre-approval).
     * Only returns orders in pending status.
     * Supports ?search=, ?date_from=, ?date_to=, ?per_page=
     */
    public function ungroupedOrders(WebhookOrderIndexRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $perPage = (int) ($validated['per_page'] ?? 15);

            $query = PartnerOrder::with(['customer', 'items'])
                ->whereNull('order_group_id')
                ->where('status', OrderStatus::Pending->value)
                ->orderByDesc('created_at');

            if (! empty($validated['date_from'])) {
                $query->whereDate('created_at', '>=', $validated['date_from']);
            }

            if (! empty($validated['date_to'])) {
                $query->whereDate('created_at', '<=', $validated['date_to']);
            }

            if (! empty($validated['search'])) {
                $search = $validated['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhere('order_external_number', 'like', "%{$search}%");
                });
            }

            $paginator = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => '대기 중인 주문 목록이 성공적으로 조회되었습니다.',
                'data' => [
                    'orders' => WebhookPartnerOrderResource::collection($paginator->items()),
                ],
                'pagination' => $this->paginationService->format($paginator),
            ], 200);
        } catch (\Exception $e) {
            return $this->responseError(500, $e->getMessage(), [], WebhookErrorCode::SYS001);
        }
    }

    /**
     * POST /api/webhook/orders/{externalOrderId}/reject
     * Reject a partner order (must be in draft or pending state).
     */
    public function rejectOrder(string $externalOrderId): JsonResponse
    {
        try {
            $order = PartnerOrder::where('order_external_number', $externalOrderId)->first();

            if (! $order) {
                return $this->responseError(404, '주문을 찾을 수 없습니다.', [], WebhookErrorCode::ORD001);
            }

            $rejectableStatuses = [
                OrderStatus::Draft->value,
                OrderStatus::Pending->value,
            ];

            if (! in_array($order->status, $rejectableStatuses)) {
                return $this->responseError(422, '현재 주문 상태에서는 취소할 수 없습니다: '.$order->status, [], WebhookErrorCode::ORD006);
            }

            $order->status = OrderStatus::Cancelled->value;
            $order->save();

            return $this->responseSuccess(200, '주문이 성공적으로 취소되었습니다.', [
                'external_order_id' => $externalOrderId,
                'order_number' => $order->order_number,
                'status' => $order->status,
            ]);
        } catch (\Exception $e) {
            return $this->responseError(500, $e->getMessage(), [], WebhookErrorCode::SYS001);
        }
    }

    // ─── Existing read-only endpoints (unchanged) ────────────────────────────────

    /**
     * GET /api/webhook/order-codes/{orderCode}/options
     */
    public function getOptionsByOrderCode(string $orderCode): JsonResponse
    {
        try {
            $optionMapping = OrderCodeOptionMapping::where('order_code', $orderCode)->first();

            if (! $optionMapping) {
                return $this->responseError(404, '주문 코드를 찾을 수 없습니다.', [], WebhookErrorCode::VAL002);
            }

            $erpOptionGroups = $optionMapping->erpOptionGroups()->get();

            $data = [
                'order_code' => $orderCode,
                'name' => $optionMapping->name,
                'path_images' => $optionMapping->path_images,
                'option_groups' => $erpOptionGroups->map(function ($group) use ($optionMapping) {
                    $options = $optionMapping->erpOptions()
                        ->where('erp_option_group_id', $group->id)
                        ->get();

                    return [
                        'id' => $group->id,
                        'code' => $group->code,
                        'label' => $group->label,
                        'display_type' => $group->display_type,
                        'is_required' => $group->is_required,
                        'options' => $options->map(function ($option) {
                            $previewImage = $option->preview_image;
                            if ($previewImage && ! filter_var($previewImage, FILTER_VALIDATE_URL)) {
                                $previewImage = asset($previewImage);
                            }

                            return [
                                'id' => $option->id,
                                'code' => $option->code,
                                'label' => $option->label,
                                'value' => $option->value,
                                'additional_price' => $option->additional_price,
                                'preview_image' => $previewImage,
                            ];
                        })->values(),
                    ];
                }),
            ];

            return $this->responseSuccess(200, '옵션 목록이 성공적으로 조회되었습니다.', $data);
        } catch (\Exception $e) {
            return $this->responseError(500, $e->getMessage(), [], WebhookErrorCode::SYS001);
        }
    }

    /**
     * POST /api/webhook/order-codes/available-options
     */
    public function getAvailableOptions(WebhookGetAvailableOptionsRequest $request): JsonResponse
    {
        try {
            $orderCode = $request->validated()['order_code'];
            $selectedOptions = $request->validated()['selected_options'] ?? [];
            $selectedSizeOptionId = $request->validated()['size_option_id'] ?? null;

            $optionMapping = OrderCodeOptionMapping::where('order_code', $orderCode)->first();

            if (! $optionMapping) {
                return $this->responseError(404, '주문 코드를 찾을 수 없습니다.', [], WebhookErrorCode::VAL002);
            }

            $erpOptionGroups = $optionMapping->erpOptionGroups()->get();

            $sizeOptions = SizeOption::where('order_code', $orderCode)
                ->orderBy('id')
                ->get()
                ->map(fn ($size) => $this->webhookProductService->buildSizeData($size, $orderCode));

            if (! $selectedSizeOptionId && $sizeOptions->isNotEmpty()) {
                $defaultSize = $sizeOptions->firstWhere('is_default', true);
                $selectedSizeOptionId = $defaultSize ? $defaultSize['id'] : $sizeOptions->first()['id'];
            }

            $selectedSize = $selectedSizeOptionId ? SizeOption::find($selectedSizeOptionId) : null;
            $selectedSizeData = $selectedSize ? $this->webhookProductService->buildSizeData($selectedSize, $orderCode) : null;

            if (empty($selectedOptions) && $erpOptionGroups->isNotEmpty()) {
                $firstGroup = $erpOptionGroups->first();
                $firstOptionInGroup = $optionMapping->erpOptions()
                    ->where('erp_option_group_id', $firstGroup->id)
                    ->orderBy('sort_order')
                    ->orderBy('id')
                    ->first();

                if ($firstOptionInGroup) {
                    $selectedOptions = [(string) $firstGroup->id => (string) $firstOptionInGroup->id];
                }
            }

            $data = [
                'order_code' => $orderCode,
                'name' => $optionMapping->name,
                'path_images' => $optionMapping->url_image ? asset($optionMapping->url_image) : null,
                'popup_images' => $this->webhookProductService->getPopupImages($orderCode),
                'size_selection' => $sizeOptions,
                'selected_size' => $selectedSizeData ? array_merge($selectedSizeData, [
                    'size_limits' => $this->webhookProductService->getSizeLimits($orderCode, $selectedSize),
                ]) : null,
                'product_rules' => $this->webhookProductService->getProductRules(
                    $orderCode,
                    $erpOptionGroups->pluck('code')->all()
                ),
                'option_groups' => $erpOptionGroups->map(function ($group) use ($optionMapping, $orderCode, $selectedOptions, $selectedSizeOptionId) {
                    if ($group->code === 'OP906') {
                        $coatingOptions = $optionMapping->erpOptions()
                            ->where('erp_option_group_id', $group->id)
                            ->get();

                        if ($coatingOptions->isEmpty()) {
                            return [
                                'id' => $group->id,
                                'code' => $group->code,
                                'label' => $group->label,
                                'display_type' => $group->display_type,
                                'is_required' => $group->is_required,
                                'default_option_id' => null,
                                'default_is_none' => true,
                                'options' => collect([]),
                            ];
                        }
                    }

                    $optionsQuery = $optionMapping->erpOptions()
                        ->where('erp_option_group_id', $group->id);

                    if ($group->code === 'OP910' && $selectedSizeOptionId) {
                        $sizeOption = SizeOption::find($selectedSizeOptionId);
                        $linkedErpOptionId = $sizeOption?->erp_option_id;

                        if ($linkedErpOptionId) {
                            // Size has erp_option_id → filter to show only that option + 선택안함
                            $optionsQuery->where(function ($q) use ($linkedErpOptionId) {
                                $q->where('erp_options.id', $linkedErpOptionId)
                                    ->orWhere('erp_options.code', '91069');
                            });
                        } else {
                            // erp_option_id is NULL → check if size-specific dependency exists
                            // If dependency has empty allowed_options, show only 선택안함
                            $hasSizeDependency = ErpOptionDependency::where('order_code', $orderCode)
                                ->where('affected_option_group_id', $group->id)
                                ->where('size_option_id', (int) $selectedSizeOptionId)
                                ->exists();

                            if ($hasSizeDependency) {
                                $optionsQuery->where('erp_options.code', '91069');
                            }
                        }
                    }

                    $options = $optionsQuery->get()
                        ->filter(function ($option) use ($group, $orderCode, $selectedOptions, $selectedSizeOptionId) {
                            if ($option->code === '91069') {
                                return true;
                            }

                            $groupHasAnyDependency = ErpOptionDependency::where('order_code', $orderCode)
                                ->where('affected_option_group_id', $group->id)
                                ->exists();

                            if (! $groupHasAnyDependency) {
                                return true;
                            }

                            $isAllowed = false;

                            foreach ($selectedOptions as $selectedGroupId => $selectedOptionId) {
                                $affectedOptions = ErpOptionDependency::getAffectedOptions(
                                    $orderCode,
                                    (int) $selectedGroupId,
                                    (int) $selectedOptionId,
                                    $group->id,
                                    $selectedSizeOptionId ? (int) $selectedSizeOptionId : null
                                );

                                if ($affectedOptions === null) {
                                    continue;
                                }

                                if (empty($affectedOptions)) {
                                    return false;
                                }

                                if (in_array($option->id, $affectedOptions)) {
                                    $isAllowed = true;
                                    break;
                                }
                            }

                            return $isAllowed;
                        });

                    $pivotDefaultOptionId = $group->pivot->default_option_id ?? null;
                    $pivotDefaultIsNone = (bool) ($group->pivot->default_is_none ?? false);

                    return [
                        'id' => $group->id,
                        'code' => $group->code,
                        'label' => $group->label,
                        'display_type' => $group->display_type,
                        'is_required' => $group->is_required,
                        'default_option_id' => $pivotDefaultIsNone ? null : $pivotDefaultOptionId,
                        'default_is_none' => $pivotDefaultIsNone,
                        'options' => $options->map(function ($option) {
                            $previewImage = $option->preview_image;
                            if ($previewImage && ! filter_var($previewImage, FILTER_VALIDATE_URL)) {
                                $previewImage = asset($previewImage);
                            }

                            return [
                                'id' => $option->id,
                                'code' => $option->code,
                                'label' => $option->label,
                                'value' => $option->value,
                                'additional_price' => $option->additional_price,
                                'preview_image' => $previewImage,
                            ];
                        })->values(),
                    ];
                }),
            ];

            return $this->responseSuccess(200, '사용 가능한 옵션 목록이 성공적으로 조회되었습니다.', $data);
        } catch (\Exception $e) {
            return $this->responseError(500, $e->getMessage(), [], WebhookErrorCode::SYS001);
        }
    }

    /**
     * POST /api/webhook/order-codes/get-price
     */
    public function getPrice(WebhookGetPriceRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $itemCode3 = $validated['item_code3'];
            $size1 = (float) $validated['size1'];
            $size2 = (float) $validated['size2'];
            $qnt = (int) $validated['qnt'];
            $apiRatioCom = (float) ($validated['api_ratio_com'] ?? 180);
            $sizeRatio = (float) ($validated['size_ratio'] ?? 100);

            $options = [];
            for ($i = 1; $i <= 8; $i++) {
                $optValue = $validated["opt{$i}"] ?? null;
                if (! empty($optValue)) {
                    // Pass raw opt value — PriceCalculator uses OptParser internally
                    // to handle all formats: "label/qty개", "label/position", comma-merged, etc.
                    $options["opt{$i}"] = trim($optValue);
                }
            }

            $itemData = array_merge([
                'item_code' => $itemCode3,
                'item_code3' => $itemCode3,
                'size1' => $size1,
                'size2' => $size2,
                'qnt' => $qnt,
                'size_ratio' => $sizeRatio,
            ], $options);

            $calculator = $this->priceCalculator;
            $result = $calculator->calculate($itemData, $apiRatioCom, $sizeRatio);

            $paperWidth = $result['debug']['paper_width'] ?? 0;
            $priceCost = round($result['base']['price_cost']);
            $priceSale = $result['sale']['price'];
            $tax = $result['sale']['tax'];
            $pricePrd = $result['sale']['price_prd'];
            $area = $result['debug']['area'] ?? 0;

            $printWidth = $size1 + 10;
            $printHeight = $size2 + 10;

            $txtDesc1 = sprintf(
                '사이즈 : %d * %d ( %d * %d ) / 고객사요율 %.2f',
                $size1, $size2, $printWidth, $printHeight, $apiRatioCom / 100
            );
            $txtDesc2 = sprintf('출력 : %d * %d, 폭 %d', $printHeight, $printWidth, $paperWidth);
            $txtDesc3 = sprintf(
                '원단 %d/%d, 잉크단가:%d, 헤베(면적):%.4f 원단원가:%d 잉크원가:%d / 코딩단가:%d->%d, 재단:%d->%d / 추가물품 %d',
                $result['base']['material_price'] ?? 0,
                $result['base']['ink_price'] ?? 0,
                $result['base']['ink_price'] ?? 0,
                $area,
                (int) ($result['base']['material_cost'] ?? 0),
                (int) ($result['base']['ink_cost'] ?? 0),
                (int) ($result['base']['coating_price'] ?? 0),
                (int) ($result['base']['coating_cost'] ?? 0),
                (int) ($result['base']['cutting_price'] ?? 0),
                (int) ($result['base']['cutting_cost'] ?? 0),
                (int) ($result['base']['additional_price'] ?? 0)
            );

            return $this->responseSuccess(200, '가격이 성공적으로 계산되었습니다.', [
                'item_code3' => $itemCode3,
                'paper_width' => (string) $paperWidth,
                'price_cost' => (string) round($priceCost),
                'price_prn' => (string) $result['sale']['price_prn'],
                'price_opt1' => (string) $result['sale']['price_opt1'],
                'price_opt2' => (string) $result['sale']['price_opt2'],
                'price_sale' => '0',
                'price' => (string) round($priceSale),
                'tax' => (string) round($tax),
                'price_prd' => (string) round($pricePrd),
                'size_part' => '',
                'm_top' => '0',
                'm_bottom' => '0',
                'm_left' => '0',
                'm_right' => '0',
                'txt_desc1' => $txtDesc1,
                'txt_desc2' => $txtDesc2,
                'txt_desc3' => $txtDesc3,
            ]);
        } catch (\Exception $e) {
            return $this->responseError(500, $e->getMessage(), [], WebhookErrorCode::SYS001);
        }
    }
}
