<?php

namespace App\Services\Notifications;

use App\Contracts\NotifiableSubject;
use App\Enums\NotificationChannel;
use App\Jobs\SendNotificationJob;
use App\Models\NotificationTemplate;
use Illuminate\Support\Facades\Log;

abstract class BaseNotificationService
{
    /**
     * Build only the variables needed for the given template number.
     * Each subclass maps template numbers to their specific variables.
     *
     * @return array<string, string>
     */
    abstract protected function buildVariables(string $templateNumber, object $context): array;

    /**
     * Look up template, resolve variables, and dispatch to all configured channels.
     *
     * @param  array{name?: string, phone?: string}|null  $recipientOverride  Override recipient (name + phone) for cases where the recipient is not the subject contact (e.g. approver, staff notifications).
     */
    protected function sendFromTemplate(
        string $templateNumber,
        NotifiableSubject $subject,
        object $context,
        ?NotificationChannel $onlyChannel = null,
        ?array $recipientOverride = null,
        string $reason = 'and',
    ): void {
        $template = NotificationTemplate::where('template_number', $templateNumber)
            ->where('usage_status', 'enabled')
            ->first();

        if (! $template) {
            Log::warning("Notification template not found or disabled: {$templateNumber}");

            return;
        }

        $variables = $this->buildVariables($templateNumber, $context);

        foreach ($template->channel_configs as $channel => $config) {
            if ($onlyChannel && $onlyChannel->value !== $channel) {
                continue;
            }
            $this->queueChannel($channel, $config, $variables, $template, $subject, $recipientOverride, $reason);
        }
    }

    /**
     * Resolve recipient, interpolate content, and dispatch a queued job per channel.
     *
     * @param  array<string, mixed>  $config
     * @param  array<string, string>  $variables
     * @param  array{name?: string, phone?: string}|null  $recipientOverride
     */
    private function queueChannel(
        string $channel,
        array $config,
        array $variables,
        NotificationTemplate $template,
        NotifiableSubject $subject,
        ?array $recipientOverride = null,
        string $reason = 'and',
    ): void {
        $channelEnum = NotificationChannel::tryFrom($channel);

        [$recipientName, $recipientContact, $content] = match ($channelEnum) {
            NotificationChannel::SMS => $this->resolveSMS($config, $variables, $subject, $recipientOverride),
            NotificationChannel::EMAIL => $this->resolveEmail($config, $variables, $subject, $recipientOverride),
            default => [null, null, null],
        };

        if ($recipientContact === null) {
            return;
        }

        try {
            SendNotificationJob::dispatch(
                templateId: $template->id,
                channel: $channel,
                config: $config,
                variables: $variables,
                interpolatedContent: $content,
                recipientName: $recipientName,
                recipientContact: $recipientContact,
                reference: $subject->getNotificationReference(),
                meta: $subject->getNotificationMeta(),
                userId: $subject->getNotificationUserId(),
                reason: $reason,
            );
        } catch (\Throwable $e) {

        }
    }

    private function resolveEmail(array $config, array $variables, NotifiableSubject $subject, ?array $recipientOverride = null): array
    {
        $email = $recipientOverride['email'] ?? $subject->getNotificationEmail();
        $name = $recipientOverride['name'] ?? $subject->getNotificationName();

        if (! $email) {
            return ['', null, ''];
        }

        // `$config` is already the value of channel_configs.email because
        // sendFromTemplate() iterates over each channel configuration.
        $content = $this->interpolate($config['body'] ?? '', $variables);

        return [$name, $email, $content];
    }

    private function resolveSMS(array $config, array $variables, NotifiableSubject $subject, ?array $recipientOverride = null): array
    {
        $phone = $recipientOverride['phone'] ?? $subject->getNotificationPhone();
        $name = $recipientOverride['name'] ?? $subject->getNotificationName();

        if (! $phone) {
            return ['', null, ''];
        }

        $content = $this->interpolate($config['content'] ?? '', $variables);

        return [$name, $phone, $content];
    }

    /**
     * Replace #{변수} placeholders in template strings.
     *
     * @param  array<string, string>  $variables
     */
    private function interpolate(string $text, array $variables): string
    {
        foreach ($variables as $key => $value) {
            $text = str_replace('{{'.$key.'}}', $value, $text);
        }

        return $text;
    }
}
