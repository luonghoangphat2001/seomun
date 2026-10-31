<?php

namespace App\Observers;

use App\Enums\RealtimeNotificationType;
use App\Events\MemberNotificationRequested;
use App\Models\Order;
use App\Services\Admin\AdminDashboardService;

class OrderObserve
{
    public function saved(Order $order)
    {
        if ($order->isDirty('status')) {
            \Log::info('OrderObserve triggered for Order ID: '.$order->id);
            app(AdminDashboardService::class)->broadcastOperationalMetrics();
        }
    }

    public function updated(Order $order): void
    {
        if (! $order->wasChanged('status') || $order->user_id === null) {
            return;
        }

        event(new MemberNotificationRequested(
            userId: (int) $order->user_id,
            type: RealtimeNotificationType::ORDER_STATUS_CHANGED,
            payload: [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'previous_status' => (string) $order->getOriginal('status'),
                'current_status' => (string) $order->status,
            ],
        ));
    }
}
