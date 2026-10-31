<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\WebEditorType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\WebEditor\AdminWebEditorListRequest;
use App\Http\Requests\Admin\WebEditor\AdminWebEditorStoreRequest;
use App\Http\Requests\Admin\WebEditor\AdminWebEditorUpdateRequest;
use App\Http\Resources\Admin\AdminWebEditorResource;
use App\Http\Resources\Admin\TemplateResource;
use App\Services\Admin\AdminWebEditorService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminWebEditorController extends BaseController
{
    public function __construct(
        protected AdminWebEditorService $webEditorService,
        protected PaginationService $paginationService,
    ) {}

    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->webEditorService->getSearchFilters();

            return $this->responseSuccess(200, '웹 에디터 검색 필터가 성공적으로 조회되었습니다.', [
                'filters' => $filters,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function index(AdminWebEditorListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $webEditors = $this->webEditorService->getList($filters, $perPage);

            $items = $webEditors->getCollection()->map(function ($webEditor) {
                return [
                    'id' => $webEditor->id,
                    'name' => $webEditor->name,
                    'type' => $webEditor->type,
                    'type_label' => WebEditorType::labels()[$webEditor->type] ?? $webEditor->type,
                    'width' => (float) $webEditor->width,
                    'height' => (float) $webEditor->height,
                    'unit' => $webEditor->unit,
                    'dpi' => $webEditor->dpi,
                    'bleed' => $webEditor->bleed !== null ? (float) $webEditor->bleed : null,
                    'safe_area' => $webEditor->safe_area !== null ? (float) $webEditor->safe_area : null,
                    'config_json' => $webEditor->config_json,
                    'status' => [
                        'value' => $webEditor->is_active ? 'active' : 'hidden',
                        'label' => $webEditor->is_active ? 'Active' : 'Hidden',
                    ],
                    'is_active' => (bool) $webEditor->is_active,
                    'created_at' => $webEditor->created_at,
                    'updated_at' => $webEditor->updated_at,
                ];
            });

            return $this->responsePaginatedSuccess(200, '웹 에디터 목록이 성공적으로 조회되었습니다.', [
                'web_editors' => $items,
            ], $this->paginationService->format($webEditors));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $webEditor = $this->webEditorService->getWebEditor($id);

            return $this->responseSuccess(200, '웹 에디터가 성공적으로 조회되었습니다.', [
                'web_editor' => [
                    'id' => $webEditor->id,
                    'name' => $webEditor->name,
                    'type' => $webEditor->type,
                    'type_label' => WebEditorType::labels()[$webEditor->type] ?? $webEditor->type,
                    'width' => (float) $webEditor->width,
                    'height' => (float) $webEditor->height,
                    'unit' => $webEditor->unit,
                    'dpi' => $webEditor->dpi,
                    'bleed' => $webEditor->bleed !== null ? (float) $webEditor->bleed : null,
                    'safe_area' => $webEditor->safe_area !== null ? (float) $webEditor->safe_area : null,
                    'config_json' => $webEditor->config_json,
                    'status' => [
                        'value' => $webEditor->is_active ? 'active' : 'hidden',
                        'label' => $webEditor->is_active ? 'Active' : 'Hidden',
                    ],
                    'is_active' => (bool) $webEditor->is_active,
                    'created_at' => $webEditor->created_at,
                    'updated_at' => $webEditor->updated_at,
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function store(AdminWebEditorStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $webEditor = $this->webEditorService->createWebEditor($data);

            return $this->responseSuccess(201, '웹 에디터가 성공적으로 생성되었습니다.', [
                'web_editor' => new AdminWebEditorResource($webEditor),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function update(AdminWebEditorUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $webEditor = $this->webEditorService->updateWebEditor($id, $data);

            return $this->responseSuccess(200, '웹 에디터가 성공적으로 수정되었습니다.', [
                'web_editor' => new AdminWebEditorResource($webEditor),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->webEditorService->deleteWebEditor($id);

            return $this->responseSuccess(200, '웹 에디터가 성공적으로 삭제되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError(422, $e->getMessage());
        }
    }

    public function templates(int $id, Request $request): JsonResponse
    {
        try {
            $this->webEditorService->getWebEditor($id);

            $filters = $request->only(['search_keyword', 'is_active', 'per_page']);
            $perPage = (int) ($filters['per_page'] ?? 20);
            unset($filters['per_page']);

            $templates = $this->webEditorService->getTemplatesByWebEditor($id, $filters, $perPage);

            $items = $templates->getCollection()->map(function ($template) {
                return [
                    'id' => $template->id,
                    'name' => $template->name,
                    'type' => $template->type?->value ?? null,
                    'side' => $template->side?->value ?? null,
                    'orientation' => $template->orientation?->value ?? null,
                    'is_active' => (bool) $template->is_active,
                    'size_option_id' => $template->size_option_id,
                    'created_at' => $template->created_at,
                    'updated_at' => $template->updated_at,
                ];
            });

            return $this->responsePaginatedSuccess(200, '웹 에디터의 템플릿 목록이 성공적으로 조회되었습니다.', [
                'templates' => $items,
            ], $this->paginationService->format($templates));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}