<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Outsourcing\AdminCreateOutsourcingRequest;
use App\Http\Requests\Admin\Outsourcing\AdminGetOutsourcingRequest;
use App\Http\Requests\Admin\Outsourcing\AdminUpdateOutsourcingRequest;
use App\Http\Resources\Admin\AdminOutsourcingCompanyResource;
use App\Services\Admin\AdminOutsourcingService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class AdminOutsourcingController extends BaseController
{
    public function __construct(
        protected AdminOutsourcingService $adminOutsourcingService,
        protected PaginationService $paginationService,
    ) {}

    public function index(AdminGetOutsourcingRequest $request): JsonResponse
    {
        try {
            $perPage = (int) $request->input('per_page', 15);

            $companies = $this->adminOutsourcingService->getList(
                searchType: $request->input('search_type'),
                keyword: $request->input('keyword'),
                isActive: $request->has('is_active') ? $request->boolean('is_active') : null,
                perPage: $perPage,
            );

            return $this->responsePaginatedSuccess(200, '외주 업체 목록이 성공적으로 조회되었습니다.', [
                'outsourcing_companies' => AdminOutsourcingCompanyResource::collection($companies->items()),
            ], $this->paginationService->format($companies));
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $company = $this->adminOutsourcingService->getById($id);

            return response()->json([
                'success' => true,
                'data' => ['outsourcing_company' => new AdminOutsourcingCompanyResource($company)],
            ]);
        } catch (ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => '외주업체를 찾을 수 없습니다.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(AdminCreateOutsourcingRequest $request): JsonResponse
    {
        try {
            $company = $this->adminOutsourcingService->create($request->validated(), $request->user());

            return response()->json([
                'success' => true,
                'message' => '외주업체 등록 성공',
                'data' => ['outsourcing_company' => new AdminOutsourcingCompanyResource($company)],
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update(AdminUpdateOutsourcingRequest $request, int $id): JsonResponse
    {
        try {
            $company = $this->adminOutsourcingService->update($id, $request->validated(), $request->user());

            return response()->json([
                'success' => true,
                'message' => '외주업체 수정 성공',
                'data' => ['outsourcing_company' => new AdminOutsourcingCompanyResource($company)],
            ]);
        } catch (ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => '외주업체를 찾을 수 없습니다.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminOutsourcingService->delete($id);

            return response()->json(['success' => true, 'message' => '외주업체 삭제 성공']);
        } catch (ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => '외주업체를 찾을 수 없습니다.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
