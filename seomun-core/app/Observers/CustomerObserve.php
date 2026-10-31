<?php

namespace App\Observers;

use App\Models\Customer;
use App\Services\Admin\AdminDashboardService;

class CustomerObserve
{
    public function saved(Customer $customer)
    {
        if ($customer->isDirty('status') && $customer->isPending()) {
            \Log::info('CustomerObserve triggered for Customer ID: '.$customer->id);
            app(AdminDashboardService::class)->broadcastNotificationHighlight();
        }
    }
}
