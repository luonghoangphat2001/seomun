<?php

namespace App\Services\MyPage;

use App\Http\Requests\MyPage\NotificationIndexRequest;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Notifications\DatabaseNotification;

class MemberNotificationService
{
    /** @param array<string, mixed> $filters */
    public function paginate(User $user, array $filters): LengthAwarePaginator
    {
        $query = $user->notifications()->latest();

        if (array_key_exists('read', $filters) && $filters['read'] !== null) {
            $filters['read'] ? $query->read() : $query->unread();
        }

        return $query->paginate((int) ($filters['per_page'] ?? NotificationIndexRequest::DEFAULT_PER_PAGE));
    }

    public function markAsRead(User $user, string $notificationId): DatabaseNotification
    {
        /** @var DatabaseNotification $notification */
        $notification = $user->notifications()
            ->whereKey($notificationId)
            ->firstOrFail();

        $notification->markAsRead();

        return $notification->fresh();
    }

    public function markAllAsRead(User $user): int
    {
        return $user->unreadNotifications()->update(['read_at' => now()]);
    }
}
