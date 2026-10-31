<?php

namespace App\Services;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Resources\MyPageOrderDeliveryTrackingListResource;
use App\Models\Inquiry;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\User;
use App\Services\MyPage\MyPageOrderService;
use App\Services\MyPage\MyPageQuickMenuService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MyPageDashboardService
{
    public function __construct(
        protected MyPageQuickMenuService $quickMenuService,
        protected PointBalanceService $pointBalanceService,
        protected MembershipService $membershipService,
        protected MyPageOrderService $myPageOrderService,
    ) {}

    public function getDashboardData(User $user): array
    {

        try {
            return [
                // 'quick_menu'        => $this->getQuickMenu($user),
                'member_summary'    => $this->getMemberSummary($user),
                'production_status' => $this->getProductionStatus($counts = $this->getOrderStatusCounts($user->id)),
                'design_status'     => $this->getDesignStatus($counts),
                'delivery_status'   => $this->getDeliveryStatus($user->id),
                'recent_orders'     => MyPageOrderDeliveryTrackingListResource::collection($this->myPageOrderService->getOrders($user, [])->items()),
                'inquiry_summary'   => $this->getInquirySummary($user->id),
                'review_summary'    => $this->getReviewSummary($user),
            ];
        } catch (\Exception $e) {
            Log::error('Get MyPage dashboard data failed', [
                'user_id' => $user->id,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    private function getQuickMenu(User $user): array
    {
        return $this->quickMenuService->getQuickMenu($user);
    }

    private function getMemberSummary(User $user): array
    {
        $user->loadMissing(['membershipTier', 'limit']);
        $pointBalance = $this->pointBalanceService->getBalance($user);
        $membershipSummary = $this->membershipService->getMembershipSummary($user);

        return [
            'name'                  => $user->name,
            'membership_tier'       => $user->membershipTier?->name ?? null,
            'accumulation_rate'     => $user->membershipTier?->accumulation_rate ?? 0,
            'point_balance'         => $pointBalance->balance ?? 0,
            'prepaid_balance'       => $user->limit?->remaining_amount ?? 0,
            'exclusive_account'     => null,
            'current_quarter_spent' => $membershipSummary['current_quarter_spent'],
            'next_tier'             => $membershipSummary['next'],
        ];
    }

    /**
     * 생산현황 — 9 stage production pipeline.
     * 디자인현황 — 5 stage design workflow.
     * Both share a single status count query.
     * ERP stages (파일 에러 ~ 후가공, 시안 전달 및 교정) are hardcoded 0 until ERP integration.
     */
    private function getOrderStatusCounts(int $userId): array
    {
        return Order::where('user_id', $userId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
    }

    private function getProductionStatus(array $counts): array
    {

        return [
            ['key' => 'awaiting_payment',  'label' => '결제 대기',  'count' => (int) ($counts[OrderStatus::AwaitingPayment->value] ?? 0)],
            ['key' => 'pending_reception', 'label' => '접수 대기',  'count' => (int) ($counts[OrderStatus::PendingReception->value] ?? 0)],
            ['key' => 'file_error',        'label' => '파일 에러',  'count' => (int) ($counts[OrderStatus::FileError->value] ?? 0)],
            ['key' => 'pending_correction','label' => '교정',       'count' => (int) ($counts[OrderStatus::PendingCorrection->value] ?? 0)],
            ['key' => 'typesetting',       'label' => '조판',       'count' => (int) ($counts[OrderStatus::Typesetting->value] ?? 0)],
            ['key' => 'output_of_power',   'label' => '출력',       'count' => (int) ($counts[OrderStatus::OutputOfPower->value] ?? 0)],
            ['key' => 'print',             'label' => '인쇄',       'count' => (int) ($counts[OrderStatus::Print->value] ?? 0)],
            ['key' => 'post_processing',   'label' => '후가공',     'count' => (int) ($counts[OrderStatus::PostProcessing->value] ?? 0)],
            ['key' => 'production_done',   'label' => '생산 완료',  'count' => (int) ($counts[OrderStatus::ProductionDone->value] ?? 0)],
        ];
    }

    private function getDesignStatus(array $counts): array
    {

        return [
            ['key' => 'awaiting_payment',  'label' => '결제 대기',         'count' => (int) ($counts[OrderStatus::AwaitingPayment->value] ?? 0)],
            ['key' => 'pending_reception', 'label' => '접수 대기',         'count' => 0],
            ['key' => 'designing',         'label' => '디자인 중',         'count' => 0],
            ['key' => 'draft_delivery',    'label' => '시안 전달 및 교정', 'count' => 0],
            ['key' => 'design_done',       'label' => '디자인 완료',       'count' => (int) ($counts[OrderStatus::DesignConfirmed->value] ?? 0) + (int) ($counts[OrderStatus::Confirmed->value] ?? 0)],
        ];
    }

    /**
     * 배송현황 — three order-lifecycle stages, independent of shipping method.
     * 출고 완료 (ready_to_ship) → 배송 중 (shipping) → 배송 완료.
     */
    private function getDeliveryStatus(int $userId): array
    {
        $counts = Order::where('user_id', $userId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            [
                'key' => 'ready_to_ship',
                'label' => '출고 완료',
                'count' => (int) ($counts[OrderStatus::ReadyToShip->value] ?? 0),
            ],
            [
                'key' => 'shipping',
                'label' => '배송 중',
                'count' => (int) ($counts[OrderStatus::Shipping->value] ?? 0),
            ],
            [
                'key' => 'delivered',
                'label' => '배송 완료',
                'count' => (int) ($counts[OrderStatus::Shipped->value] ?? 0)
                    + (int) ($counts[OrderStatus::DeliveryCompleted->value] ?? 0)
                    + (int) ($counts[OrderStatus::Completed->value] ?? 0),
            ],
        ];
    }

    private function getRecentOrders(int $userId, int $limit = 10): array
    {
        $orders = Order::where('user_id', $userId)
            ->with('review:id,order_id')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return $orders->map(function ($order) {
            $orderDate = $order->placed_at ?? $order->created_at;
            $status    = OrderStatus::tryFrom($order->status);

            return [
                'order_number'              => $order->order_number,
                'product_name'              => $order->product_name,
                'order_date'                => $orderDate->format('Y.m.d'),
                'estimated_production_days' => $order->estimated_production_days,
                'payment_amount'            => number_format((float) $order->total_amount, 0),
                'shipping_fee'              => $order->shipping_fee ? number_format((float) $order->shipping_fee, 0).'원' : '0원',
                'status'                    => $status?->label() ?? $this->formatOrderStatus($order->status),
                'status_value'              => $order->status,
                'review' => [
                    'has_review' => (bool) $order->review?->id,
                    'review_id'  => $order->review?->id,
                ],
            ];
        })->toArray();
    }

    /**
     * 최근 게시물 — inquiry counts per category, split by answered/pending.
     */
    private function getInquirySummary(int $userId): array
    {
        $rows = Inquiry::where('user_id', $userId)
            ->selectRaw('category, status, COUNT(*) as count')
            ->groupBy('category', 'status')
            ->get();

        $byCategory = [];
        foreach ($rows as $row) {
            $cat    = $row->category instanceof InquiryCategory ? $row->category->value : $row->category;
            $status = $row->status instanceof InquiryStatus ? $row->status->value : $row->status;
            $byCategory[$cat][$status] = (int) $row->count;
        }

        $categories = [
            InquiryCategory::PRODUCT->value  => '상품문의',
            InquiryCategory::QUOTE->value    => '견적문의',
            InquiryCategory::SHIPPING->value => '출고/배송문의',
            InquiryCategory::PAYMENT->value  => '결제/회계문의',
            InquiryCategory::REWORK->value   => '재작업신청',
            InquiryCategory::REFUND->value   => '환불신청',
        ];

        $result = [];
        foreach ($categories as $key => $label) {
            $data     = $byCategory[$key] ?? [];
            $answered = (int) ($data[InquiryStatus::RESPONDED->value] ?? 0);
            $pending  = (int) ($data[InquiryStatus::PENDING->value] ?? 0);

            $result[] = [
                'category' => $key,
                'label'    => $label,
                'answered' => $answered,
                'pending'  => $pending,
                'total'    => $answered + $pending,
            ];
        }

        return $result;
    }

    /**
     * 이용후기 요약 — reviewable count + reward points per review type.
     * Photo/normal review point values are not stored in DB yet (UI mockup shows 500P/100P).
     */
    private function getReviewSummary(User $user): array
    {
        $completedStatuses = [
            OrderStatus::DeliveryCompleted->value,
            OrderStatus::Completed->value,
        ];

        $subQuery = OrderItem::query()
            ->selectRaw('MAX(order_items.id) as id')
            ->whereNotExists(function ($query) use ($user) {
                $query->select(DB::raw(1))
                    ->from('reviews')
                    ->whereColumn('reviews.order_id', 'order_items.order_id')
                    ->whereColumn('reviews.product_id', 'order_items.product_id')
                    ->where('reviews.user_id', $user->id)
                    ->whereNull('reviews.deleted_at');
            })
            ->groupBy('order_items.order_id', 'order_items.product_id');

        $reviewableCount = OrderItem::query()
            ->joinSub($subQuery, 'filtered_items', fn ($join) => $join->on('order_items.id', '=', 'filtered_items.id'))
            ->whereHas('order', function ($query) use ($user, $completedStatuses) {
                $query->where('user_id', $user->id)
                    ->whereIn('status', $completedStatuses)
                    ->where('payment_status', PaymentStatus::PAID->value);
            })
            ->count();

        return [
            'reviewable_count'    => $reviewableCount,
            'photo_review_points' => 500, // TODO: load from PointSetting when review reward config is added to DB
            'normal_review_points' => 100,
        ];
    }

    private function formatOrderStatus(string $status): string
    {
        return OrderStatus::tryFrom($status)?->label() ?? '주문완료';
    }
}
