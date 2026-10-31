<?php

namespace App\Providers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Observers\CustomerObserve;
use App\Observers\OrderObserve;
use App\Observers\PaymentObserver;
use App\Observers\ProductObserve;
use App\Observers\ReviewObserve;
use App\Observers\UserObserve;
use Illuminate\Support\ServiceProvider;

class ObserverProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void {}

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Customer::observe(CustomerObserve::class);
        PaymentTransaction::observe(PaymentObserver::class);
        User::observe(UserObserve::class);
        Product::observe(ProductObserve::class);
        Order::observe(OrderObserve::class);
        Review::observe(ReviewObserve::class);
    }
}
