<?php

namespace App\Http\Controllers\Api;

use App\Services\ProxyLoginService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class ProxyLoginController extends BaseController
{
    public function __construct(protected ProxyLoginService $proxyLoginService) {}

    /** Exchange the one-time HttpOnly handoff cookie for a short-lived bearer token. */
    public function exchange(Request $request): JsonResponse
    {
        $cookieName = config('sanctum.proxy_login_handoff_cookie', 'proxy_handoff');
        $cookieDomain = config('sanctum.proxy_login_cookie_domain') ?: null;
        $handoffCode = $request->cookie($cookieName);

        if (! is_string($handoffCode) || $handoffCode === '') {
            return response()->json(['success' => false, 'message' => 'Proxy login handoff cookie is missing.'], 401)
                ->withCookie(cookie()->forget($cookieName, '/', $cookieDomain));
        }

        try {
            $result = $this->proxyLoginService->exchange($handoffCode, $request);

            return response()->json([
                'success' => true,
                'data' => [
                    'access_token' => $result['access_token'],
                    'token_type' => 'Bearer',
                    'expires_in' => $result['expires_in'],
                    'proxy_login' => [
                        'session_id' => $result['session']->id,
                        'target_user_id' => $result['session']->target_user_id,
                        'expires_at' => $result['session']->expires_at->toISOString(),
                    ],
                ],
            ])->withCookie(cookie()->forget($cookieName, '/', $cookieDomain));
        } catch (HttpExceptionInterface $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], $e->getStatusCode())
                ->withCookie(cookie()->forget($cookieName, '/', $cookieDomain));
        }
    }
}
