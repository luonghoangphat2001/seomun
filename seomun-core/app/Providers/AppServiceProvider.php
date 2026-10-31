<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Facades\Socialite;
use SocialiteProviders\Kakao\KakaoProvider;
use SocialiteProviders\Naver\Provider as NaverProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force https in non-local environments to avoid mixed-content (Swagger, assets)
        if (! $this->app->environment('local', 'testing')) {
            URL::forceScheme('https');
        }

        // Register Kakao & Naver Socialite drivers
        Socialite::extend('kakao', function () {
            return Socialite::buildProvider(KakaoProvider::class, config('services.kakao'));
        });

        Socialite::extend('naver', function () {
            return Socialite::buildProvider(NaverProvider::class, config('services.naver'));
        });
    }
}
