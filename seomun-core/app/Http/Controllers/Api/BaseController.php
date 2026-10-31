<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;

class BaseController extends Controller
{
    use AuthorizesRequests;

    /**
     * Resolve HTTP status code from exception.
     */
    protected function resolveStatusCode(\Throwable $e): int
    {
        $code = (int) $e->getCode();

        return $code >= 400 && $code < 600 ? $code : 500;
    }

    /**
     * Response successfully
     *
     * @param  int  $code
     * @param  string  $message
     * @param  array  $data
     */
    protected function responseSuccess($code = 200, $message = '성공', $data = []): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * Response successfully with detached pagination metadata.
     *
     * @param  int  $code
     * @param  string  $message
     * @param  array  $data
     * @param  array  $pagination
     */
    protected function responsePaginatedSuccess($code = 200, $message = '성공', $data = [], $pagination = []): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'pagination' => $pagination,
        ], $code);
    }

    /**
     * Response error
     *
     * @param  int  $code
     * @param  string  $message
     * @param  array  $errors
     * @param  string|null  $errorCode  WebhookErrorCode constant (e.g. WebhookErrorCode::ORD001)
     */
    protected function responseError($code = 422, $message = '오류가 발생했습니다.', $errors = [], ?string $errorCode = null): JsonResponse
    {
        $body = [
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ];

        if ($errorCode !== null) {
            $body['error_code'] = $errorCode;
        }

        return response()->json($body, $code);
    }
}
