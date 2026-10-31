<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class OptionalAuth
{
    public function handle($request, Closure $next)
    {
        if ($request->bearerToken()) {
            Auth::shouldUse('sanctum');
            Auth::guard('sanctum')->user();
        }

        return $next($request);
    }
}