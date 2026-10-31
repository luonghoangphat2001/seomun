<?php

namespace App\Support;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;

/**
 * Snapshot of MyPage "배송정보" block for history modal (변경 이력 확인).
 */
final class OrderShippingPanelPayload
{
    /**
     * @return array<string, mixed>
     */
    public static function fromOrder(Order $order): array
    {
        $order->loadMissing([
            'deliveryTracking',
        ]);

        $request = Request::create('/');
        $data = (new OrderResource($order))->toArray($request);

        return [
            'shipping' => $data['shipping'] ?? [],
            'shipping_fee' => $data['shipping_fee'] ?? null,
            'shipping_branch_name' => $data['shipping_branch_name'] ?? null,
            'shipping_time' => $data['shipping_time'] ?? null,
            'metadata' => [
                'customer_note' => $data['metadata']['customer_note'] ?? null,
            ],
        ];
    }
}
