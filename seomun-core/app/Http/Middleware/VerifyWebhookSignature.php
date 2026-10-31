<?php

namespace App\Http\Middleware;

use App\Enums\CustomerStatus;
use App\Models\Customer;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhookSignature
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check for API Key in HEADER - support both formats for backward compatibility
        $apiKey = $request->header('X-API-Key');
        $clientIp = $request->ip();
        $userAgent = $request->userAgent();

        if (! $apiKey) {
            \Log::warning('Webhook authentication failed: Missing API Key', [
                'ip' => $clientIp,
                'user_agent' => $userAgent,
                'url' => $request->fullUrl(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '서버 오류가 발생했습니다. 관리자에게 문의하세요.',
            ], 401);
        }

        // Find customer with matching API Key
        $customer = Customer::where('api_key', $apiKey)->first();

        if (! $customer || $customer->status !== CustomerStatus::ACTIVE->value) {
            \Log::warning('Webhook authentication failed: Invalid API Key or inactive customer', [
                'api_key' => $apiKey,
                'customer_found' => ! is_null($customer),
                'customer_status' => $customer?->status,
                'ip' => $clientIp,
                'user_agent' => $userAgent,
                'url' => $request->fullUrl(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '유효하지 않은 API 키입니다.',
            ], 401);
        }

        \Log::info('Webhook authentication successful', [
            'customer_id' => $customer->id,
            'customer_name' => $customer->company_name,
            'ip' => $clientIp,
            'url' => $request->fullUrl(),
        ]);
        $request->merge(['customer' => $customer]);

        return $next($request);
    }
}
