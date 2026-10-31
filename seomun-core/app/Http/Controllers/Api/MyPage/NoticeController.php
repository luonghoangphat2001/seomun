<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Enums\NoticeType;
use App\Http\Controllers\Api\BaseController;
use App\Services\MyPage\MyPageNoticeService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class NoticeController extends BaseController
{
    public function __construct(
        protected MyPageNoticeService $noticeService
    ) {}

    /**
     * GET /api/mypage/notices
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'type' => [
                    'nullable',
                    'string',
                    Rule::in(array_map(fn ($case) => $case->value, NoticeType::cases())),
                ],
                'search'      => 'nullable|string',
                'per_page'    => 'nullable|integer|min:1|max:100',
                'exclude_ids' => 'nullable|string',
            ]);

            $data = $this->noticeService->getNotices(
                $validated['type'] ?? null,
                $validated['search'] ?? null,
                (int) ($validated['per_page'] ?? 15),
                $validated['exclude_ids'] ?? null,
            );

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'notices' => $data['notices'],
            ], $data['pagination']);
        } catch (\Throwable $e) {
            Log::error('Get MyPage Notices failed', [
                'user_id' => $request->user()->id ?? null,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '공지사항 목록을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * GET /api/mypage/category_notices
     */
    public function categoryNotices(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'category'    => ['nullable', 'string', Rule::in(array_map(fn ($case) => $case->value, NoticeType::cases()))],
                'search'      => 'nullable|string',
                'per_page'    => 'nullable|integer|min:1|max:100',
                'exclude_ids' => 'nullable|string',
                'page'        => 'nullable|integer|min:1',
            ]);

            $data = $this->noticeService->getNoticesByCategory(
                $validated['category'] ?? null,
                $validated['search'] ?? null,
                (int) ($validated['per_page'] ?? 15),
                $validated['exclude_ids'] ?? null,
            );

            return $this->responsePaginatedSuccess(200, 'successfully', [
                'notices' => $data['notices'],
            ], $data['pagination']);
        } catch (\Throwable $e) {
            Log::error('Get MyPage Notices by category failed', [
                'user_id' => $request->user()->id ?? null,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '공지사항 목록을 카테고리별로 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * GET /api/mypage/notices/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $data = $this->noticeService->getNoticeDetail($id);

            return $this->responseSuccess(200, '성공적으로 조회되었습니다.', $data);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '공지사항을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Get MyPage Notice detail failed', [
                'user_id'   => $request->user()->id ?? null,
                'notice_id' => $id,
                'error'     => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '공지사항 상세 정보를 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }
}
