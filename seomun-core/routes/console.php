<?php

use App\Console\Commands\ExpireCoupons;
use App\Console\Commands\ExpirePoints;
use App\Console\Commands\PollDeliveryTrackings;
use App\Console\Commands\PruneExpiredSavedProductOptions;
use App\Console\Commands\ProcessQuarterlyMembershipUpgrade;
use App\Console\Commands\UnpublishLowRatedReviews;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Check pending jobs every minute; the poller limits new collections to five minutes.
Schedule::command(\App\Console\Commands\PollPopbillBankDeposits::class)
    ->everyMinute()->withoutOverlapping(60)->onOneServer();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Schedule::command(ProcessQuarterlyMembershipUpgrade::class)
    ->quarterly()
    ->at('00:00');

Schedule::command(ExpirePoints::class)
    ->dailyAt('00:01');

Schedule::command(ExpireCoupons::class)
    ->everyMinute()
    ->withoutOverlapping()
    ->onOneServer();

Schedule::command(UnpublishLowRatedReviews::class)
    ->dailyAt('00:00');

Schedule::command(PruneExpiredSavedProductOptions::class)
    ->dailyAt('00:30');

Schedule::command(PollDeliveryTrackings::class)
    ->everyThirtyMinutes()
    ->withoutOverlapping()
    ->onOneServer();
