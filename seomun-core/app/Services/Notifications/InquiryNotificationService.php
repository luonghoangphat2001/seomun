<?php

namespace App\Services\Notifications;

use App\Enums\NotificationChannel;
use App\Enums\NotificationDeliveryStatus;
use App\Enums\NotificationEvent;
use App\Jobs\SendNotificationDeliveryJob;
use App\Models\Inquiry;
use App\Models\InquiryComment;
use App\Models\NotificationDelivery;
use App\Models\NotificationTemplate;
use Illuminate\Support\Facades\Log;

class InquiryNotificationService extends BaseNotificationService
{
    // hooked: AdminInquiryService::answerInquiry
    private const TEMPLATE_QA_INQUIRY_ANSWERED = 'TEMPLATE_QA_INQUIRY_ANSWERED';

    // Notify customer when their 1:1 inquiry is answered
    /** @param array<int, string> $channels */
    public function notifyInquiryAnswered(Inquiry $inquiry, ?InquiryComment $reply = null, array $channels = []): void
    {
        if ($reply !== null) {
            $normalizedChannels = array_values(array_unique(array_map('strtolower', $channels)));

            if (in_array(NotificationChannel::EMAIL->value, $normalizedChannels, true)) {
                $this->queueEmailDelivery($inquiry, $reply);
            }

            if (in_array(NotificationChannel::SMS->value, $normalizedChannels, true)) {
                $this->sendFromTemplate(
                    self::TEMPLATE_QA_INQUIRY_ANSWERED,
                    $inquiry,
                    (object) ['inquiry' => $inquiry],
                    NotificationChannel::SMS,
                );
            }

            return;
        }

        $this->queueEmailDelivery($inquiry);
        $this->sendFromTemplate(
            self::TEMPLATE_QA_INQUIRY_ANSWERED,
            $inquiry,
            (object) ['inquiry' => $inquiry],
            NotificationChannel::SMS,
        );
    }

    private function queueEmailDelivery(Inquiry $inquiry, ?InquiryComment $reply = null): void
    {
        $template = NotificationTemplate::query()
            ->where('template_number', self::TEMPLATE_QA_INQUIRY_ANSWERED)
            ->where('usage_status', 'enabled')
            ->first();

        $recipient = $inquiry->getNotificationEmail();
        if ($template === null || $recipient === null) {
            Log::warning('Inquiry email notification skipped', [
                'inquiry_id' => $inquiry->id,
                'has_template' => $template !== null,
                'has_recipient' => $recipient !== null,
            ]);

            return;
        }

        $config = $template->channel_configs[NotificationChannel::EMAIL->value] ?? null;
        if (! is_array($config)) {
            Log::warning('Inquiry email notification template has no email channel', [
                'template_number' => self::TEMPLATE_QA_INQUIRY_ANSWERED,
            ]);

            return;
        }

        $variables = $this->buildVariables(
            self::TEMPLATE_QA_INQUIRY_ANSWERED,
            (object) ['inquiry' => $inquiry]
        );
        $content = $this->interpolate($config['content'] ?? $config['body'] ?? '', $variables);
        $subject = $this->interpolate($config['subject'] ?? $config['title'] ?? '문의 답변 안내', $variables);

        $delivery = NotificationDelivery::create([
            'subject_type' => ($reply ?? $inquiry)::class,
            'subject_id' => ($reply ?? $inquiry)->id,
            'event' => NotificationEvent::INQUIRY_REPLY->value,
            'channel' => NotificationChannel::EMAIL->value,
            'recipient_name' => $inquiry->getNotificationName(),
            'recipient_address' => $recipient,
            'template_code' => self::TEMPLATE_QA_INQUIRY_ANSWERED,
            'payload' => [
                'template_id' => $template->id,
                'mail' => [
                    'subject' => $subject,
                    'content' => $content,
                ],
                'meta' => [
                    'reference' => $inquiry->getNotificationReference(),
                    'inquiry_id' => $inquiry->id,
                    'reply_id' => $reply?->id,
                ],
            ],
            'status' => NotificationDeliveryStatus::PENDING,
        ]);

        SendNotificationDeliveryJob::dispatch($delivery->id)->afterCommit();
    }

    /** @param array<string, string> $variables */
    private function interpolate(string $text, array $variables): string
    {
        foreach ($variables as $key => $value) {
            $text = str_replace('{{'.$key.'}}', $value, $text);
        }

        return $text;
    }

    /** @return array<string, string> */
    protected function buildVariables(string $templateNumber, object $context): array
    {
        $inquiry = $context->inquiry;

        return [
            'customer_name' => $inquiry->user?->name ?? '',
            'inquiry_created_at' => $inquiry->title ?? '',
            'category' => $inquiry->category->value ?? '',
            'title' => $inquiry->title ?? '',
            'reply_url' => config('app.frontend_url')."/ko/my/{$inquiry->category->path()}/{$inquiry->id}",
        ];
    }
}
