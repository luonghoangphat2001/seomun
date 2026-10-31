<?php

namespace App\Console\Commands;

use App\Enums\UserCouponStatus;
use App\Models\UserCoupon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireCoupons extends Command
{
    protected $signature = 'coupons:expire {--chunk=500 : Number of records to process per batch}';

    protected $description = 'Update status of expired user coupons daily at 00:05';

    public function handle(): int
    {
        $chunkSize = (int) $this->option('chunk');

        $this->info('Starting coupon expiration process...');

        $totalExpired = 0;
        $totalActivated = 0;

        // Query user coupons that are still marked as available or upcoming but whose coupon has expired or is inactive
        $expireQuery = UserCoupon::whereIn('status', [UserCouponStatus::AVAILABLE->value, UserCouponStatus::UPCOMING->value])
            ->where(function ($q) {
                $q->whereHas('coupon', function ($cq) {
                    $cq->where(function ($sub) {
                        $sub->whereNotNull('expires_at')
                            ->where('expires_at', '<=', now());
                    })->orWhere('is_active', false);
                })->orWhereDoesntHave('coupon');
            });

        $expireQuery->chunkById($chunkSize, function ($userCoupons) use (&$totalExpired) {
            $ids = $userCoupons->pluck('id');
            $count = UserCoupon::whereIn('id', $ids)->update(['status' => UserCouponStatus::EXPIRED->value]);
            $totalExpired += $count;
        });

        // Activate upcoming coupons that have now started
        $activateQuery = UserCoupon::where('status', UserCouponStatus::UPCOMING->value)
            ->whereHas('coupon', function ($cq) {
                $cq->where('is_active', true)
                    ->where(function ($sub) {
                        $sub->whereNull('starts_at')
                            ->orWhere('starts_at', '<=', now());
                    })
                    ->where(function ($sub) {
                        $sub->whereNull('expires_at')
                            ->orWhere('expires_at', '>', now());
                    });
            });

        $activateQuery->chunkById($chunkSize, function ($userCoupons) use (&$totalActivated) {
            $ids = $userCoupons->pluck('id');
            $count = UserCoupon::whereIn('id', $ids)->update(['status' => UserCouponStatus::AVAILABLE->value]);
            $totalActivated += $count;
        });

        if ($totalExpired > 0) {
            Log::info("Expired {$totalExpired} user coupons.");
        }

        if ($totalActivated > 0) {
            Log::info("Activated {$totalActivated} upcoming user coupons.");
        }

        $this->info("Coupon process completed. Total expired: {$totalExpired}, total activated: {$totalActivated}");

        return Command::SUCCESS;
    }
}
