<?php

namespace App\Observers;

use App\Models\User;
use App\Services\Admin\AdminDashboardService;

class UserObserve
{
    public function saved(User $user): void
    {
        if ($user->isDirty('status')) {
            \Log::info('UserObserve triggered for User ID: '.$user->id);
            app()->make(AdminDashboardService::class)->broadcastOperationalMetrics();
        }
    }
}
