<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\FileType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\Admin\AdminFileResource;
use App\Services\FileService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminFileController extends BaseController
{
    public function __construct(
        protected FileService $fileService,
        protected PaginationService $paginationService
    ) {}

    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->fileService->getSearchFilters();

            return $this->responseSuccess(200, '검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->all();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->fileService->getFiles($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '파일 목록이 성공적으로 조회되었습니다.', [
                'files' => AdminFileResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function upload(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'file' => 'required|file',
                'type' => ['required', Rule::enum(FileType::class)],
            ]);

            $type = FileType::from($request->input('type'));

            $file = $this->fileService->upload(
                $request->file('file'),
                $type,
                $request->user()
            );

            return $this->responseSuccess(201, '파일이 성공적으로 업로드되었습니다.', ['file' => new AdminFileResource($file)]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $file = $this->fileService->getFile($id);

            return $this->responseSuccess(200, '파일이 성공적으로 조회되었습니다.', [
                'file' => new AdminFileResource($file),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError(404, '파일을 찾을 수 없습니다.');
        }
    }
}
