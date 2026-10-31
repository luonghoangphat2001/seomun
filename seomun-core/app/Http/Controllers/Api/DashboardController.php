<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    /**
     * Get dashboard overview data
     * 대시보드 개요 데이터 조회
     */
    public function overview(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => '인증이 필요합니다.',
                ], 401);
            }

            // Get order counts by status
            $orderCounts = $this->getOrderCountsByStatus($user->id);

            // Get recent orders (last 5)
            $recentOrders = Order::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'order_counts' => $orderCounts,
                    'recent_orders' => OrderResource::collection($recentOrders),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '대시보드 데이터를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get order counts grouped into the 6 spec buckets for the dashboard order status card.
     * Spec buckets: 장바구니 / 결제완료 / 주문확인 / 제작중 / 배송중 / 배송완료
     */
    private function getOrderCountsByStatus(int $userId): array
    {
        $counts = Order::where('user_id', $userId)
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $get = fn (string ...$statuses) => array_sum(array_map(fn ($s) => (int) ($counts[$s] ?? 0), $statuses));

        $buckets = [
            [
                'key'      => 'cart',
                'label'    => '장바구니',
                'label_en' => 'Shopping Cart',
                'count'    => $get(OrderStatus::Draft->value, OrderStatus::Pending->value),
            ],
            [
                'key'      => 'payment_completed',
                'label'    => '결제완료',
                'label_en' => 'Payment Completed',
                'count'    => $get(OrderStatus::AwaitingPayment->value),
            ],
            [
                'key'      => 'order_confirmed',
                'label'    => '주문확인',
                'label_en' => 'Order Confirmed',
                'count'    => $get(OrderStatus::Confirmed->value, OrderStatus::PurchaseConfirmed->value),
            ],
            [
                'key'      => 'in_production',
                'label'    => '제작중',
                'label_en' => 'In Production',
                'count' => $get(...array_merge(OrderStatus::getInProduction(), [OrderStatus::ReadyToShip->value])),
            ],
            [
                'key'      => 'in_delivery',
                'label'    => '배송중',
                'label_en' => 'In Delivery',
                'count'    => $get(OrderStatus::Shipping->value),
            ],
            [
                'key'      => 'delivery_completed',
                'label'    => '배송완료',
                'label_en' => 'Delivery Completed',
                'count'    => $get(OrderStatus::Shipped->value, OrderStatus::DeliveryCompleted->value, OrderStatus::Completed->value),
            ],
        ];

        $total = array_sum(array_column($buckets, 'count'));

        return [
            'total'   => $total,
            'buckets' => $buckets,
        ];
    }
}
