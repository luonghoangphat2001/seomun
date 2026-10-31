<?php

namespace App\Observers;

use App\Enums\PaymentStatus;
use App\Enums\RealtimeNotificationType;
use App\Events\MemberNotificationRequested;
use App\Models\PaymentTransaction;
use App\Services\Admin\AdminDashboardService;

class PaymentObserver
{
    public function created(PaymentTransaction $paymentTransaction): void
    {
        if ($paymentTransaction->status === PaymentStatus::PAID) {
            $this->broadcastPaymentSucceeded($paymentTransaction);
        }
    }

    public function updated(PaymentTransaction $paymentTransaction): void
    {
        if ($paymentTransaction->wasChanged('status')) {
            \Log::info('PaymentObserver triggered for PaymentTransaction ID: '.$paymentTransaction->id);
            app(AdminDashboardService::class)->broadcastOperationalMetrics();
        }

        if (! $paymentTransaction->wasChanged('status')
            || $paymentTransaction->status !== PaymentStatus::PAID) {
            return;
        }

        $this->broadcastPaymentSucceeded($paymentTransaction);
    }

    private function broadcastPaymentSucceeded(PaymentTransaction $paymentTransaction): void
    {
        $order = $paymentTransaction->relationLoaded('order')
            ? $paymentTransaction->getRelation('order')
            : $paymentTransaction->order()->first();

        if ($order?->user_id === null) {
            return;
        }

        event(new MemberNotificationRequested(
            userId: (int) $order->user_id,
            type: RealtimeNotificationType::PAYMENT_SUCCEEDED,
            payload: [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ],
        ));
    }
}
