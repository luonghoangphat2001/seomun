<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Services\FaqService;
use App\Services\MyPage\MyPageFaqService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FaqController extends BaseController
{
    public function __construct(
        protected MyPageFaqService $faqService,
        protected FaqService $faqSharedService,
    ) {}

    /**
     * GET /api/mypage/faqs/category-counts
     */
    public function categoryCounts(Request $request): JsonResponse
    {
        try {
            return $this->responseSuccess(200, '성공적으로 조회되었습니다.', [
                'category_counts' => $this->faqSharedService->categoryCounts(
                    $request->user(),
                    $request->input('search'),
                ),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError(500, 'FAQ 카테고리 집계를 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * GET /api/mypage/faqs
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $category = $request->input('category');
            $search   = $request->input('search');
            $perPage  = (int) $request->input('per_page', 15);

            $data = $this->faqService->getFaqs($request->user(), $category, $search, $perPage);

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'faqs' => $data['faqs'],
            ], $data['pagination']);
        } catch (\Throwable $e) {
            Log::error('Get MyPage FAQs failed', [
                'user_id' => $request->user()->id ?? null,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, 'FAQ 목록을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * GET /api/mypage/faqs/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $faq = $this->faqService->getFaqDetail($id);

            return $this->responseSuccess(200, '성공적으로 조회되었습니다.', ['faq' => $faq]);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, 'FAQ를 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Get MyPage FAQ detail failed', [
                'user_id' => $request->user()->id ?? null,
                'faq_id'  => $id,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, 'FAQ 상세 정보를 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }
}
