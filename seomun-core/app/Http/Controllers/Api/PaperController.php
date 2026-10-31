<?php

namespace App\Http\Controllers\Api;

use App\Services\PaperService;
use Illuminate\Http\JsonResponse;

class PaperController extends BaseController
{
    public function __construct(
        protected PaperService $paperService
    ) {}

    public function index(): JsonResponse
    {
        try {
            $papers = $this->paperService->getActivePapers();

            return response()->json([
                'success' => true,
                'data' => [
                    'papers' => $papers,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => '용지 목록을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getPapersByProductId(int $productId): JsonResponse
    {
        try {
            $paperTypes = $this->paperService->getPapersByProductId($productId);

            return response()->json([
                'success' => true,
                'data' => [
                    'paper_types' => $paperTypes,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => '용지 정보를 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
