<?php

namespace App\Jobs;

use App\Enums\NotificationDeliveryStatus;
use App\Models\NotificationDelivery;
use App\Models\NotificationHistory;
use App\Services\MailService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SendNotificationDeliveryJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(private readonly int $deliveryId) {}

    public function handle(MailService $mailService): void
    {
        $delivery = NotificationDelivery::findOrFail($this->deliveryId);

        if ($delivery->status === NotificationDeliveryStatus::ACCEPTED) {
            return;
        }

        $delivery->increment('attempts');
        $delivery->update([
            'status' => NotificationDeliveryStatus::SENDING,
            'error_message' => null,
        ]);

        try {
            $mail = $delivery->payload['mail'] ?? [];
            $mailService->send(
                email: $delivery->recipient_address,
                subject: (string) ($mail['subject'] ?? ''),
                content: (string) ($mail['content'] ?? ''),
                recipientName: $delivery->recipient_name,
            );

            $delivery->update([
                'status' => NotificationDeliveryStatus::ACCEPTED,
                'provider_response' => ['provider' => 'smtp'],
                'sent_at' => now(),
            ]);

            NotificationHistory::create([
                'notification_template_id' => $delivery->payload['template_id'] ?? null,
                'notification_type' => $delivery->channel,
                'recipient_name' => $delivery->recipient_name,
                'recipient_contact' => $delivery->recipient_address,
                'message_title' => $mail['subject'] ?? null,
                'message_content' => $mail['content'] ?? null,
                'sending_result' => 'success',
                'failure_reason' => null,
                'sender_id' => null,
                'sent_at' => now(),
                'meta' => $delivery->payload['meta'] ?? [],
            ]);
        } catch (\Throwable $e) {
            $delivery->update([
                'status' => NotificationDeliveryStatus::FAILED,
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $e): void
    {
        $delivery = NotificationDelivery::query()->find($this->deliveryId);

        if ($delivery !== null) {
            $delivery->update([
                'status' => NotificationDeliveryStatus::FAILED,
                'error_message' => $e->getMessage(),
            ]);

            $mail = $delivery->payload['mail'] ?? [];
            NotificationHistory::create([
                'notification_template_id' => $delivery->payload['template_id'] ?? null,
                'notification_type' => $delivery->channel,
                'recipient_name' => $delivery->recipient_name,
                'recipient_contact' => $delivery->recipient_address,
                'message_title' => $mail['subject'] ?? null,
                'message_content' => $mail['content'] ?? null,
                'sending_result' => 'failure',
                'failure_reason' => $e->getMessage(),
                'sender_id' => null,
                'sent_at' => now(),
                'meta' => $delivery->payload['meta'] ?? [],
            ]);
        }

        Log::error('Notification delivery exhausted all retries', [
            'delivery_id' => $this->deliveryId,
            'error' => $e->getMessage(),
        ]);
    }
}
