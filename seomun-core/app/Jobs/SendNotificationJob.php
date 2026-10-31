<?php

namespace App\Jobs;

use App\Enums\NotificationChannel;
use App\Models\NotificationHistory;
use App\Services\MailService;
use App\Services\Popbill\PopbillSmsService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SendNotificationJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 10;

    public function __construct(
        private readonly ?int $templateId,
        private readonly string $channel,
        private readonly array $config,
        private readonly array $variables,
        private readonly string $interpolatedContent,
        private readonly string $recipientName,
        private readonly string $recipientContact,
        private readonly string $reference,
        private readonly array $meta = [],
        private readonly ?int $userId = null,
        private readonly ?string $reason = null,
    ) {}

    public function handle(PopbillSmsService $smsService, MailService $mailService): void
    {
        $result = true;
        $failureReason = null;
        try {
            match (NotificationChannel::from($this->channel)) {
                NotificationChannel::SMS => $result = $smsService->send(
                    $this->recipientContact,
                    $this->interpolatedContent,
                ),
                NotificationChannel::EMAIL => $result = $mailService->send(
                    email: $this->recipientContact,
                    subject: $this->config['title'],
                    content: $this->interpolatedContent,
                ),
            };
        } catch (\Throwable $e) {
            throw $e;
        }

        $this->recordHistory($result ? 'success' : 'failure', $failureReason);
    }

    public function failed(\Throwable $e): void
    {
        Log::error('SendNotificationJob exhausted all retries', [
            'channel' => $this->channel,
            'reference' => $this->reference,
            'error' => $e->getMessage(),
        ]);

        $this->recordHistory('failure', $e->getMessage());
    }

    private function recordHistory(string $result, ?string $failureReason): void
    {
        NotificationHistory::create([
            'notification_template_id' => $this->templateId,
            'notification_type' => $this->channel,
            'recipient_name' => $this->recipientName,
            'recipient_contact' => $this->recipientContact,
            'message_title' => $this->config['subject'] ?? $this->config['title'] ?? null,
            'message_content' => $this->interpolatedContent,
            'sending_result' => $result,
            'failure_reason' => $failureReason,
            'sender_id' => null,
            'user_id' => $this->userId,
            'reason' => $this->reason,
            'sent_at' => now(),
            'meta' => $this->meta ?: ['reference' => $this->reference],
        ]);
    }
}
