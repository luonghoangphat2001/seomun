<?php

use App\Http\Middleware\CheckIsAdmin;
use App\Http\Middleware\CheckIsStoreAdmin;
use App\Http\Middleware\CheckUserStatus;
use App\Http\Middleware\OptionalAuth;
use App\Http\Middleware\VerifyWebhookSignature;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withCommands([
        __DIR__.'/../app/Console/Commands',
    ])
    ->withEvents(discover: false)
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['prefix' => 'api', 'middleware' => ['api', 'auth:sanctum']],
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Allow CORS for API routes (for Swagger UI and other frontend apps)
        $middleware->api(prepend: [
            HandleCors::class,
        ]);
        $middleware->alias([
            'user.active' => CheckUserStatus::class,
            'user.admin' => CheckIsAdmin::class,
            'user.store.admin' => CheckIsStoreAdmin::class,
            'verify.webhook' => VerifyWebhookSignature::class,
            'optional.auth' => OptionalAuth::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
