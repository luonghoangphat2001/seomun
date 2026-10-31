<?php

namespace App\Providers;

use App\Events\MemberNotificationRequested;
use App\Listeners\StoreAndBroadcastMemberNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use SocialiteProviders\Manager\SocialiteWasCalled;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        SocialiteWasCalled::class => [
            \SocialiteProviders\Kakao\KakaoExtendSocialite::class,
            \SocialiteProviders\Naver\NaverExtendSocialite::class,
        ],
        MemberNotificationRequested::class => [
            StoreAndBroadcastMemberNotification::class,
        ],
    ];

    public function boot(): void
    {
        //
    }
}
