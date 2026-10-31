<?php

namespace App\Observers;

use App\Models\Inquiry;
use App\Services\Admin\AdminDashboardService;

class InquiryObserve
{
    public function saved(Inquiry $inquiry): void
    {
        if ($inquiry->isPending()) {
            \Log::info('InquiryObserve triggered for Inquiry ID: '.$inquiry->id);
            app(AdminDashboardService::class)->broadcastNotificationHighlight();
        }
    }
}
