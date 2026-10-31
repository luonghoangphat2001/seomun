<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ErpOptionGroupCode;
use App\Enums\ExcelHistoryStatus;
use App\Enums\FileType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminProductExport;
use App\Http\Requests\Admin\Product\AdminProductBulkDeleteRequest;
use App\Http\Requests\Admin\Product\AdminProductCopyRequest;
use App\Http\Requests\Admin\Product\AdminProductBulkUpdateStatusRequest;
use App\Http\Requests\Admin\Product\AdminProductCreateRequest;
use App\Http\Requests\Admin\Product\AdminProductExportRequest;
use App\Http\Requests\Admin\Product\AdminProductListRequest;
use App\Http\Requests\Admin\Product\AdminProductToggleStatusRequest;
use App\Http\Requests\Admin\Product\AdminProductUpdateRequest;
use App\Http\Requests\Admin\Product\AdminProductUploadImagesRequest;
use App\Http\Resources\Admin\AdminProductResource;
use App\Http\Resources\AdminExportHistory;
use App\Models\ErpOptionGroup;
use App\Models\ExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminProductService;
use App\Services\FileService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AdminProductController extends BaseController
{
    public function __construct(
        protected AdminProductService $adminProductService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PaginationService $paginationService,
        protected FileService $fileService,
    ) {}

    /**
     * Get search filter options for products
     * 제품 목록 검색 필터 조회
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminProductService->getSearchFilters();

            return response()->json([
                'success' => true,
                'data' => [
                    'filters' => $filters,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get product list for admin with filters
     * 제품 목록 조회 (관리자) - 템플릿 목록, 맞춤제품 목록, 홍보물 목록, 파일주문 제품목록
     */
    public function index(AdminProductListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $products = $this->adminProductService->getProductsForAdmin($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '상품 목록이 성공적으로 조회되었습니다.', [
                'products' => AdminProductResource::collection($products->items()),
            ], $this->paginationService->format($products));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get all ERP option groups with active options for admin product creation.
     * ERP 옵션 그룹 목록 조회 (관리자 – 제품 생성용)
     */
    public function getErpOptionGroups(): JsonResponse
    {
        try {
            $groups = ErpOptionGroup::query()
                ->whereNotIn('code', [
                    ErpOptionGroupCode::PAPER_TYPE,
                    ErpOptionGroupCode::PAPER_COLOR,
                    ErpOptionGroupCode::PAPER_WEIGHT,
                ])
                ->with([
                    'erpOptions' => fn($q) => $q
                        ->where('is_active', true)
                        ->orderBy('sort_order')
                ])
                ->orderBy('sort_order')
                ->get();

            return response()->json([
                'success' => true,
                'data' => ['erp_option_groups' => $groups],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get product detail for admin
     * 제품 상세 조회 (관리자)
     */
    public function show(int|string $id): JsonResponse
    {
        try {
            // Admin can view deleted products if requested
            $includeDeleted = request()->boolean('include_deleted', false);

            $product = $this->adminProductService->getProductForAdmin($id, $includeDeleted);

            return response()->json([
                'success' => true,
                'data' => [
                    'product' => new AdminProductResource($product),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Create a new product
     * 제품 생성 (관리자)
     */
    public function store(AdminProductCreateRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $product = $this->adminProductService->createProduct($validated);

            return response()->json([
                'success' => true,
                'message' => '제품이 성공적으로 생성되었습니다.',
                'data' => [
                    'product' => new AdminProductResource($product),
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Update a product
     * 제품 수정 (관리자)
     */
    public function update(AdminProductUpdateRequest $request, int|string $id): JsonResponse
    {
        try {
            $validated = $request->validated();

            $product = $this->adminProductService->updateProduct($id, $validated);

            return response()->json([
                'success' => true,
                'message' => '제품이 성공적으로 수정되었습니다.',
                'data' => [
                    'product' => new AdminProductResource($product),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Delete a product (soft delete)
     * 제품 삭제 (관리자)
     */
    public function destroy(int|string $id): JsonResponse
    {
        try {
            $this->adminProductService->deleteProduct($id);

            return response()->json([
                'success' => true,
                'message' => '제품이 성공적으로 삭제되었습니다.',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get copy preview data for product copy modal.
     */
    public function copyPreview(int|string $id): JsonResponse
    {
        try {
            $preview = $this->adminProductService->getProductCopyPreview($id);

            return response()->json([
                'success' => true,
                'data' => $preview,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Copy product with templates, customers, erpOptions.
     */
    public function copy(AdminProductCopyRequest $request, int|string $id): JsonResponse
    {
        try {
            $copyTitle = (string) $request->validated()['copy_title'];
            $product = $this->adminProductService->copyProduct($id, $copyTitle);

            return response()->json([
                'success' => true,
                'message' => '제품이 복사되어 생성되었습니다.',
                'data' => [
                    'product' => new AdminProductResource($product),
                ],
            ], 201);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Toggle product status (is_active, is_popular, is_featured)
     * 제품 상태 변경 (관리자)
     */
    public function toggleStatus(AdminProductToggleStatusRequest $request, int|string $id): JsonResponse
    {
        try {
            $validated = $request->validated();
            $field = $validated['field'];
            $value = $validated['value'] ?? null; // null means toggle

            $product = $this->adminProductService->toggleProductStatus($id, $field, $value);

            return response()->json([
                'success' => true,
                'message' => '제품 상태가 성공적으로 변경되었습니다.',
                'data' => [
                    'product' => new AdminProductResource($product),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Upload product images
     * 제품 이미지 업로드 (관리자)
     * 제품 이미지를 업로드하세요 (Upload product images)
     * Upload product images (max 5 images). For Product List / create / update product_images field.
     */
    public function uploadImages(AdminProductUploadImagesRequest $request): JsonResponse
    {
        try {
            $files = $request->file('images');
            $files = is_array($files) ? $files : ($files ? [$files] : []);

            $paths = [];
            foreach ($files as $file) {
                $path = $file->store('products/images', 'public');
                $paths[] = Storage::disk('public')->url($path);
                $this->fileService->create($file, $path, FileType::PRODUCT_IMAGES, $request->user());
            }

            return response()->json([
                'success' => true,
                'message' => '상품 이미지가 성공적으로 업로드되었습니다.',
                'data' => [
                    'product_images' => $paths,
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Bulk update product status
     * 제품 상태 일괄 변경 (관리자)
     */
    public function bulkUpdateStatus(AdminProductBulkUpdateStatusRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $productIds = $validated['product_ids'];
            $field = $validated['field'];
            $value = $validated['value'];

            $result = $this->adminProductService->bulkUpdateStatus($productIds, $field, $value);

            return response()->json([
                'success' => true,
                'message' => '제품 상태가 성공적으로 변경되었습니다.',
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Bulk delete products (soft delete)
     * 제품 일괄 삭제 (관리자)
     */
    public function bulkDelete(AdminProductBulkDeleteRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $productIds = $validated['product_ids'];

            $result = $this->adminProductService->bulkDelete($productIds);

            return response()->json([
                'success' => true,
                'message' => '제품이 성공적으로 삭제되었습니다.',
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Export products to Excel
     * 제품 목록 Excel 다운로드
     * Supports 3 export types: ALL, CURRENT_PAGE, SELECTED
     * Supports locale for column headings and sheet name
     */
    public function exportExcel(AdminProductExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();

            // Create export history and queue Excel generation
            $history = $this->adminExportHistoryService->executeExcel(
                AdminProductExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'products'
            );

            return response()->json([
                'success' => true,
                'message' => '내보내기 요청이 접수되었습니다.',
                'data' => [
                    'history' => new AdminExportHistory($history),
                ],
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => '상품 내보내기 중 오류가 발생했습니다.',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Check progress status of product export
     * 제품 Excel 다운로드 진행 상태 확인
     */
    public function checkProgressStatus(ExportHistory $history): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'history' => new AdminExportHistory($history),
            ],
        ]);
    }

    /**
     * Download product export file
     * 제품 Excel 파일 다운로드
     */
    public function download(ExportHistory $history)
    {
        if (! $history) {
            return response()->json([
                'success' => false,
                'message' => '내보내기 이력을 찾을 수 없습니다.',
            ], 404);
        }

        if ($history->status !== ExcelHistoryStatus::COMPLETED) {
            return response()->json([
                'success' => false,
                'message' => '내보내기가 아직 완료되지 않았습니다.',
            ], 400);
        }

        $disk = Storage::disk('public');
        if (! $disk->exists($history->file_path)) {
            $disk = Storage::disk('local');
            if (! $disk->exists($history->file_path)) {
                return response()->json([
                    'success' => false,
                    'message' => '내보내기 파일을 찾을 수 없습니다.',
                ], 404);
            }
        }

        return $disk->download($history->file_path, $history->file_name, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $history->file_name . '"',
        ]);
    }
}
