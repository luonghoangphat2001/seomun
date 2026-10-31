<?php

namespace App\Listeners;

use App\Events\MemberNotificationRequested;
use App\Models\User;
use App\Notifications\MemberDatabaseNotification;

class StoreAndBroadcastMemberNotification
{
    public function handle(MemberNotificationRequested $event): void
    {
        $user = User::query()->find($event->userId);

        if ($user === null) {
            return;
        }

        $user->notify(new MemberDatabaseNotification(
            userId: $user->id,
            type: $event->type,
            payload: $event->payload,
        ));
    }
}
