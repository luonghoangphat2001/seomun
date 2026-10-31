<?php

namespace App\Notifications;

use App\Enums\RealtimeNotificationType;
use App\Support\RealtimeChannel;
use DateTimeImmutable;
use DateTimeInterface;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class MemberDatabaseNotification extends Notification
{
    private const CHANNEL_DATABASE = 'database';

    private const CHANNEL_BROADCAST = 'broadcast';

    /** @param array<string, mixed> $payload */
    public function __construct(
        private readonly int $userId,
        private readonly RealtimeNotificationType $type,
        private readonly array $payload,
        private readonly DateTimeInterface $issuedAt = new DateTimeImmutable,
    ) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return [self::CHANNEL_DATABASE, self::CHANNEL_BROADCAST];
    }

    public function databaseType(object $notifiable): string
    {
        return $this->type->value;
    }

    /** @return array<string, mixed> */
    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => $this->type->title(),
            'message' => $this->type->message($this->payload),
            'payload' => $this->payload,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'notification_id' => $this->id,
            'notification' => [
                'id' => $this->id,
                'type' => $this->type->value,
                'data' => $this->toDatabase($notifiable),
                'read_at' => null,
                'created_at' => $this->issuedAt->format(DATE_ATOM),
            ],
            'unread_count' => $notifiable->unreadNotifications()->count(),
        ]);
    }

    /** @return array<int, PrivateChannel> */
    public function broadcastOn(): array
    {
        return [new PrivateChannel(RealtimeChannel::memberNotifications($this->userId))];
    }

    public function broadcastAs(): string
    {
        return RealtimeChannel::MEMBER_NOTIFICATION_CREATED_EVENT;
    }

    public function broadcastType(): string
    {
        return $this->type->value;
    }
}
