<?php

namespace App\Http\Controllers\Api;

use App\Enums\FileType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\Admin\AdminFileResource;
use App\Services\FileService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FileController extends BaseController
{
    public function __construct(
        protected FileService $fileService,
        protected PaginationService $paginationService
    ) {}

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
}
