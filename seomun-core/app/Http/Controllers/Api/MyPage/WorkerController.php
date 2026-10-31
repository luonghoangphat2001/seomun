<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Services\MyPage\MyPageWorkerService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WorkerController extends BaseController
{
    public function __construct(
        protected MyPageWorkerService $workerService,
    ) {}

    /**
     * GET /api/mypage/workers
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search_type' => 'nullable|in:name,mobile',
            'keyword'     => 'nullable|string|max:100',
            'per_page'    => 'nullable|integer|min:1|max:100',
        ]);

        try {
            $data = $this->workerService->getWorkers(
                $request->user(),
                $request->input('search_type'),
                $request->input('keyword'),
                (int) $request->input('per_page', 15),
            );

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'workers' => $data['items'],
            ], $data['pagination']);
        } catch (\Throwable $e) {
            Log::error('Get workers failed', ['error' => $e->getMessage()]);

            return $this->responseError(500, '작업자 목록을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * POST /api/mypage/workers
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'   => 'required|string|max:100',
            'mobile' => 'required|string|max:20',
        ]);

        try {
            $worker = $this->workerService->createWorker(
                $request->user(),
                $request->only(['name', 'mobile'])
            );

            return $this->responseSuccess(201, '작업자가 추가되었습니다.', ['worker' => $worker]);
        } catch (\InvalidArgumentException $e) {
            return $this->responseError(422, $e->getMessage());
        } catch (\Throwable $e) {
            Log::error('Create worker failed', ['error' => $e->getMessage()]);

            return $this->responseError(500, '작업자 추가 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * GET /api/mypage/workers/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $worker = $this->workerService->getWorker($request->user(), $id);

            return $this->responseSuccess(200, '성공적으로 조회되었습니다.', ['worker' => $worker]);
        } catch (ModelNotFoundException) {
            return $this->responseError(404, '작업자를 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Get worker detail failed', ['id' => $id, 'error' => $e->getMessage()]);

            return $this->responseError(500, '작업자 정보를 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * PUT /api/mypage/workers/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name'   => 'sometimes|required|string|max:100',
            'mobile' => 'sometimes|required|string|max:20',
        ]);

        try {
            $worker = $this->workerService->updateWorker(
                $request->user(),
                $id,
                $request->only(['name', 'mobile'])
            );

            return $this->responseSuccess(200, '작업자 정보가 수정되었습니다.', ['worker' => $worker]);
        } catch (ModelNotFoundException) {
            return $this->responseError(404, '작업자를 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Update worker failed', ['id' => $id, 'error' => $e->getMessage()]);

            return $this->responseError(500, '작업자 수정 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * DELETE /api/mypage/workers/batch
     */
    public function batchDestroy(Request $request): JsonResponse
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'required|integer',
        ]);

        try {
            $deleted = $this->workerService->batchDeleteWorkers(
                $request->user(),
                $request->input('ids')
            );

            return $this->responseSuccess(200, "{$deleted}명의 작업자가 삭제되었습니다.");
        } catch (\Throwable $e) {
            Log::error('Batch delete workers failed', ['error' => $e->getMessage()]);

            return $this->responseError(500, '작업자 삭제 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * DELETE /api/mypage/workers/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $this->workerService->deleteWorker($request->user(), $id);

            return $this->responseSuccess(200, '작업자가 삭제되었습니다.');
        } catch (ModelNotFoundException) {
            return $this->responseError(404, '작업자를 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Delete worker failed', ['id' => $id, 'error' => $e->getMessage()]);

            return $this->responseError(500, '작업자 삭제 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

}
