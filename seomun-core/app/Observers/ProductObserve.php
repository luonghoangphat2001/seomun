<?php

namespace App\Observers;

use App\Models\Product;
use App\Services\Admin\AdminDashboardService;

class ProductObserve
{
    public function saved(Product $product)
    {
        if ($product->isDirty('stock_quantity') && $product->isOutOfStock()) {
            \Log::info('ProductObserve triggered for Product ID: '.$product->id);
            app(AdminDashboardService::class)->broadcastNotificationHighlight();
        }
    }
}
