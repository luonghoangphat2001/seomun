<?php

namespace App\Services\Notifications;

use App\Enums\NotificationChannel;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

class OrderNotificationService extends BaseNotificationService
{
    private const TEMPLATE_DESIGN_CONFIRM = 'TEMPLATE_DESIGN_CONFIRM';

    public function sendDesignConfirmationNotification(Order $order): void
    {
        $phone = $order->contact_phone ?? $order->user?->phone ?? $order->user?->mobile;

        if (! $phone) {
            Log::warning('Design confirmation: no phone for order', ['order_number' => $order->order_number]);

            return;
        }

        try {
            $this->sendFromTemplate(self::TEMPLATE_DESIGN_CONFIRM, $order, $order);
        } catch (\Throwable $e) {
            Log::error('Design confirmation SMS failed', [
                'order_number' => $order->order_number,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /** Send the design-confirmation template through SMS only. */
    public function sendDesignConfirmationSms(Order $order, string $designReviewUrl): void
    {
        $phone = $order->contact_phone ?? $order->user?->phone ?? $order->user?->mobile;

        if (! $phone) {
            Log::warning('Design confirmation SMS: no phone for order', ['order_number' => $order->order_number]);

            return;
        }

        try {
            $this->sendFromTemplate(
                self::TEMPLATE_DESIGN_CONFIRM,
                $order,
                (object) [
                    'order_number' => $order->order_number,
                    'design_review_url' => $designReviewUrl,
                ],
                NotificationChannel::SMS,
            );
        } catch (\Throwable $e) {
            Log::error('Design confirmation SMS failed', [
                'order_number' => $order->order_number,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /** @return array<string, string> */
    protected function buildVariables(string $templateNumber, object $context): array
    {
        return match ($templateNumber) {
            self::TEMPLATE_DESIGN_CONFIRM => $this->variablesDesignConfirmation($context),
            default => [],
        };
    }

    private function variablesDesignConfirmation(object $context): array
    {
        return [
            'order_number' => $context->order_number ?? '',
            'design_review_url' => $context->design_review_url ?? '',
        ];
    }
}
