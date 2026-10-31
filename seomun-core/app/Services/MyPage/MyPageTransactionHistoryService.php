<?php

namespace App\Services\MyPage;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class MyPageTransactionHistoryService
{
    /**
     * UI columns: 월, 일, 주문원가, 배송비, 할인금액, 합계금액, 공급가액, 부가세, 입금액, 입금정산, 잔고, 미납액, 환불
     */
    public function getList(User $user, array $filters = []): array
    {
        $query = Order::where('user_id', $user->id)
            ->whereNotIn('status', ['cancelled'])
            ->select([
                DB::raw('YEAR(placed_at) as year'),
                DB::raw('MONTH(placed_at) as month'),
                DB::raw('DAY(placed_at) as day'),
                DB::raw('SUM(subtotal_amount) as order_amount'),
                DB::raw('SUM(shipping_fee) as shipping_fee'),
                DB::raw('SUM(discount_amount) as discount_amount'),
                DB::raw('SUM(total_amount) as total_amount'),
                DB::raw('SUM(point_discount) as point_used'),
                DB::raw('SUM(total_amount - point_discount) as billed_amount'),
                DB::raw('SUM(CASE WHEN payment_status = "paid" THEN total_amount - point_discount ELSE 0 END) as paid_amount'),
                DB::raw('0 as prepaid'),
                DB::raw('SUM(CASE WHEN payment_status != "paid" AND payment_status != "cancelled" THEN total_amount - point_discount ELSE 0 END) as unpaid_amount'),
                DB::raw('SUM(CASE WHEN payment_status = "refunded" THEN total_amount ELSE 0 END) as refund_amount'),
            ])
            ->groupBy('year', 'month', 'day')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->orderBy('day', 'asc');

        if (! empty($filters['months'])) {
            $query->where('placed_at', '>=', now()->subMonths((int) $filters['months']));
        }

        if (! empty($filters['start_date'])) {
            $query->whereDate('placed_at', '>=', $filters['start_date']);
        }

        if (! empty($filters['end_date'])) {
            $query->whereDate('placed_at', '<=', $filters['end_date']);
        }

        if (! empty($filters['search'])) {
            $query->where('order_number', 'like', '%' . $filters['search'] . '%');
        }

        $rows = $query->get();

        $grouped = $rows->groupBy('month')->map(function ($days, $month) {
            return [
                'month'  => $month,
                'days'   => $days->map(fn($row) => $this->formatRow($row))->values(),
                'totals' => $this->sumGroup($days),
            ];
        })->values();

        return [
            'items'  => $grouped,
            'totals' => $this->sumGroup($rows),
        ];
    }

    private function formatRow(object $row): array
    {
        $total       = round((float) $row->total_amount);
        $supplyPrice = round($total / 1.1);
        $vat         = round($total - $supplyPrice);
        $paidAmount  = round((float) $row->paid_amount);

        return [
            'month'              => (int) $row->month,
            'day'                => (int) $row->day,
            'order_amount'       => round($row->order_amount),
            'shipping_fee'       => round($row->shipping_fee),
            'discount_amount'    => round($row->discount_amount),
            'total_amount'       => $total,
            'supply_price'       => $supplyPrice,
            'vat'                => $vat,
            'paid_amount'        => $paidAmount,
            'payment_settlement' => $paidAmount,
            'prepaid'            => 0,
            'unpaid_amount'      => round($row->unpaid_amount),
            'refund_amount'      => round($row->refund_amount),
        ];
    }

    private function sumGroup(Collection $rows): array
    {
        $totalSum       = round((float) $rows->sum('total_amount'));
        $supplyPriceSum = round($totalSum / 1.1);
        $vatSum         = round($totalSum - $supplyPriceSum);
        $paidSum        = round((float) $rows->sum('paid_amount'));
        // dd(round($rows->sum('refund_amount')));
        return [
            'order_amount'       => round($rows->sum('order_amount')),
            'shipping_fee'       => round($rows->sum('shipping_fee')),
            'discount_amount'    => round($rows->sum('discount_amount')),
            'total_amount'       => $totalSum,
            'supply_price'       => $supplyPriceSum,
            'vat'                => $vatSum,
            'paid_amount'        => $paidSum,
            'payment_settlement' => $paidSum,
            'prepaid'            => 0,
            'unpaid_amount'      => round($rows->sum('unpaid_amount')),
            'refund_amount'      => round($rows->sum('refund_amount')),
        ];
    }
}
