<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckIsStoreAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user->isStoreAdmin()) {
            return response()->json([
                'success' => false,
                'message' => '관리자 권한이 필요합니다.',
            ], 403);
        }

        return $next($request);
    }
}
