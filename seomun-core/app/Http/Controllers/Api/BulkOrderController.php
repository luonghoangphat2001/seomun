<?php

namespace App\Http\Controllers\Api;

use App\Http\Exports\BulkOrderTemplateExport;
use App\Http\Requests\BulkOrder\CreateBulkOrderRequest;
use App\Http\Requests\BulkOrder\UploadExcelRequest;
use App\Models\BulkOrderBatch;
use App\Models\Product;
use App\Models\Template;
use App\Services\BulkOrderService;
use App\Services\MyPage\MyPageCartService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BulkOrderController extends BaseController
{
    public function __construct(
        protected BulkOrderService $bulkOrderService,
        protected PaginationService $paginationService,
        protected MyPageCartService $myPageCartService
    ) {}

    /**
     * Download Excel template for bulk order by product (단체 주문 엑셀 템플릿).
     * GET /api/products/{id}/bulk-order-template
     */
    public function downloadTemplate(Request $request, int $id): BinaryFileResponse|JsonResponse
    {
        $product = Product::active()->find($id);

        if (! $product) {
            return response()->json([
                'success' => false,
                'message' => '상품을 찾을 수 없거나 비활성화 상태입니다.',
            ], 404);
        }

        $templateId = null;
        if ($request->filled('template_id')) {
            $templateId = (int) $request->query('template_id');
            $templateOk = Template::query()
                ->whereKey($templateId)
                ->where('product_id', $product->id)
                ->where('is_active', true)
                ->exists();
            if (! $templateOk) {
                return response()->json([
                    'success' => false,
                    'message' => '해당 상품의 템플릿을 찾을 수 없습니다.',
                ], 404);
            }
        }

        $slug = $product->slug ?? 'product';
        $filename = sprintf('bulk-order-product-%d-%s.xlsx', $product->id, $slug);

        $columns = $this->bulkOrderService->getBulkOrderExcelColumnDefinitions($product, $templateId);
        $export = new BulkOrderTemplateExport($columns);

        return Excel::download($export, $filename, \Maatwebsite\Excel\Excel::XLSX, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Create a new bulk order batch.
     */
    public function store(CreateBulkOrderRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $batch = $this->bulkOrderService->createBatch($request->validated(), $user);

            return response()->json([
                'success' => true,
                'message' => '단체 주문 배치가 성공적으로 생성되었습니다.',
                'data' => [
                    'batch' => $batch->load(['product']),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '단체 주문 배치 생성 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get list of bulk order batches.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $filters = [
                'status' => $request->input('status'),
                'product_id' => $request->input('product_id'),
            ];
            $perPage = (int) $request->input('per_page', 15);

            $batches = $this->bulkOrderService->getBatches($user, $filters, $perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'batches' => $batches->items(),
                ],
                'pagination' => $this->paginationService->format($batches),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '단체 주문 배치 목록을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get bulk order batch details.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $batch = BulkOrderBatch::findOrFail($id);
            $batch = $this->bulkOrderService->getBatch($batch, $user);

            return response()->json([
                'success' => true,
                'data' => [
                    'batch' => $batch,
                ],
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '단체 주문 배치를 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '단체 주문 배치를 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Upload Excel file for bulk order batch.
     */
    public function uploadExcel(UploadExcelRequest $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $batch = BulkOrderBatch::findOrFail($id);

            if ($batch->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => '해당 배치에 대한 접근 권한이 없습니다.',
                ], 403);
            }

            $file = $request->file('excel_file');
            $batch = $this->bulkOrderService->uploadExcel($batch, $file, $request->user());

            return response()->json([
                'success' => true,
                'message' => '엑셀 파일이 성공적으로 업로드 및 처리되었습니다.',
                'data' => [
                    'batch' => $batch->load(['product', 'entries']),
                ],
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '단체 주문 배치를 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '엑셀 파일 업로드 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Validate entries in bulk order batch.
     */
    public function validate(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $batch = BulkOrderBatch::findOrFail($id);

            if ($batch->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => '해당 배치에 대한 접근 권한이 없습니다.',
                ], 403);
            }

            $result = $this->bulkOrderService->validateBatch($batch);

            return response()->json([
                'success' => true,
                'message' => '배치 유효성 검사가 완료되었습니다.',
                'data' => [
                    'validation_result' => $result,
                    'batch' => $batch->fresh(['product', 'entries']),
                ],
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '단체 주문 배치를 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '배치 유효성 검사 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Add validated bulk batch to cart as a single line (all designs in one cart item).
     * POST /api/bulk-orders/{id}/add-to-cart
     */
    public function addToCart(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $batch = BulkOrderBatch::findOrFail($id);

            if ($batch->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => '해당 배치에 대한 접근 권한이 없습니다.',
                ], 403);
            }

            $cartItem = $this->myPageCartService->addBulkBatchToCart($user, $batch);

            return response()->json([
                'success' => true,
                'message' => '단체 주문이 장바구니에 추가되었습니다.',
                'data' => [
                    'cart_item' => $cartItem,
                ],
            ], 201);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '단체 주문 배치를 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '장바구니 추가 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Cancel bulk order batch.
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $batch = BulkOrderBatch::findOrFail($id);

            if ($batch->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => '해당 배치에 대한 접근 권한이 없습니다.',
                ], 403);
            }

            $batch = $this->bulkOrderService->cancelBatch($batch);

            return response()->json([
                'success' => true,
                'message' => '배치가 성공적으로 취소되었습니다.',
                'data' => [
                    'batch' => $batch->load(['product', 'entries']),
                ],
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '단체 주문 배치를 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '배치 취소 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }
}
