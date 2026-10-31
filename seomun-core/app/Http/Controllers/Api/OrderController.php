<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentMethod;
use App\Enums\ShippingMethod;
use App\Http\Requests\Order\ApplyPointRequest;
use App\Http\Requests\Order\CalculateOrderQuoteRequest;
use App\Http\Requests\Order\CreateReOrderRequest;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderShippingInfoRequest;
use App\Http\Requests\Order\ValidateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\OrderArtwork;
use App\Services\LimitManagementService;
use App\Services\MyPage\MyPageCouponService;
use App\Services\OrderService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends BaseController
{
    public function __construct(
        protected OrderService $orderService,
        protected PaginationService $paginationService,
        protected LimitManagementService $limitManagementService,
        protected MyPageCouponService $couponService,
    ) {}

    /**
     * Get applicable coupons for current checkout amount (after tax).
     * GET /api/orders/checkout/applicable-coupons
     */
    public function applicableCoupons(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => '인증이 필요합니다.',
                ], 401);
            }

            $validated = $request->validate([
                'amount' => ['required', 'numeric', 'min:0'],
            ]);

            $result = $this->couponService->getApplicableCoupons($user, (float) $validated['amount']);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function quote(CalculateOrderQuoteRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $quote = $this->orderService->calculateQuote($data, $request->user(), ShippingMethod::tryFrom($data['shipping_method'] ?? null));

            return response()->json([
                'success' => true,
                'data' => [
                    'quote' => $quote,
                ],
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Validate order payload before submit (주문 유효성 검사)
     * POST /api/orders/validate
     */
    public function validate(ValidateOrderRequest $request): JsonResponse
    {
        $request->validated();

        return response()->json([
            'success' => true,
            'data' => [
                'valid' => true,
                'warnings' => [],
                'errors' => [],
            ],
        ]);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $request->validated();

            $order = $this->orderService->createOrder(
                $data,
                $user
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => new OrderResource($order->load('items', 'items.designGroup', 'items.designGroup.orderArtworks', 'paymentTransaction')),
                ],
            ], 201);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => '인증이 필요합니다.',
            ], 401);
        }

        $perPage = (int) $request->input('per_page', 10);

        $orders = $this->orderService->getOrdersForUser($user, $perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => OrderResource::collection($orders->items()),
            ],
            'pagination' => $this->paginationService->format($orders),
        ]);
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => '인증이 필요합니다.',
                ], 401);
            }

            $order = $this->orderService
                ->getOrderForUser($orderNumber, $user);

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => new OrderResource($order),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Update contact & shipping information for an existing order.
     */
    public function updateShippingInfo(UpdateOrderShippingInfoRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => '인증이 필요합니다.',
                ], 401);
            }

            $order = $this->orderService->updateShippingInfo(
                $orderNumber,
                $user,
                $request->validated()
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => new OrderResource($order),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Attach existing designs (order_artworks) to an order after it has been created.
     * UX: user creates designs first, then creates order, then links designs to the order.
     */
    public function attachDesigns(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => '인증이 필요합니다.',
                ], 401);
            }

            $validated = $request->validate([
                'design_ids' => ['required', 'array', 'min:1'],
                'design_ids.*' => ['integer'],
            ]);

            $designIds = $validated['design_ids'];

            $order = $this->orderService->getOrderForUser($orderNumber, $user);

            // Link designs (OrderArtwork) to this order
            // NOTE: For now we only set order_id; PDF uses order->artworks.
            $updatedCount = OrderArtwork::whereIn('id', $designIds)
                ->where('user_id', $user->id)
                ->update([
                    'order_id' => $order->id,
                ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'order_number' => $order->order_number,
                    'linked_design_count' => $updatedCount,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Create a new reorder from an existing completed order.
     * Validates: product availability, quantity validity, pricing, user limit.
     * POST /api/orders/{orderNumber}/reorder
     */
    public function createReOrder(CreateReOrderRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => '인증이 필요합니다.',
                ], 401);
            }

            // Create reorder via service layer
            $order = $this->orderService->createReOrderFromOrder(
                $orderNumber,
                $user
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => new OrderResource($order->load('items')),
                ],
            ], 201);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '주문을 찾을 수 없습니다.',
            ], 404);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function applyPoint(ApplyPointRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $user = $request->user();
            $request->validated();
            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => '인증이 필요합니다.',
                ], 401);
            }

            $order = $this->orderService->applyPoint(
                $orderNumber,
                $user,
                $request->integer('point_use', 0)
            );

            return response()->json([
                'success' => true,
                'data' => $order,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    protected function resolveStatusCode(\Throwable $e): int
    {
        return $e->getCode() >= 400 && $e->getCode() < 600 ? (int) $e->getCode() : 422;
    }
}
