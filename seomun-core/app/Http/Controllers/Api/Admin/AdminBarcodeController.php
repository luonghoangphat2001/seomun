<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Services\Admin\AdminBarcodeService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminBarcodeController extends BaseController
{
    public function __construct(
        protected AdminBarcodeService $service,
    ) {}

    public function scan(Request $request): JsonResponse
    {
        $request->validate([
            'barcode' => 'required|string|max:100',
        ]);

        try {
            $result = $this->service->scan($request->input('barcode'));

            return response()->json([
                'success' => true,
                'message' => '바코드 스캔 상태 변경 완료',
                'data'    => $result,
            ]);
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => '해당 주문을 찾을 수 없습니다.',
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->errors()['barcode'][0] ?? $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }
}
