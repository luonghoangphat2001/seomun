<?php

namespace App\Events;

use App\Enums\RealtimeNotificationType;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MemberNotificationRequested implements ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    /** @param array<string, mixed> $payload */
    public function __construct(
        public readonly int $userId,
        public readonly RealtimeNotificationType $type,
        public readonly array $payload,
    ) {}
}
