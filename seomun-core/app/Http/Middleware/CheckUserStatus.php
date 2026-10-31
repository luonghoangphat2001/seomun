<?php

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user->isActive()) {
            if ($user()->currentAccessToken()) {
                $user()->currentAccessToken()->delete();
            }

            return response()->json([
                'success' => false,
                'message' => match ($user->status) {
                    UserStatus::INACTIVE => '계정이 비활성화 상태입니다.',
                    UserStatus::BLOCKED => '계정이 차단되었습니다.',
                    default => '접근할 수 없는 계정입니다.',
                },
            ], 403);
        }

        return $next($request);
    }
}
