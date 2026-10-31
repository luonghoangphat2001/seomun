<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminCustomerBookkeepingExport;
use App\Http\Exports\Admin\AdminCustomerExport;
use App\Http\Exports\Admin\AdminCustomerStatisticsExport;
use App\Http\Requests\Admin\AdminCustomerStatistics\AdminCustomerStatisticsRequest;
use App\Http\Requests\Admin\Customer\AdminApprovalCustomerRequest;
use App\Http\Requests\Admin\Customer\AdminCustomerExportRequest;
use App\Http\Requests\Admin\Customer\CheckDuplicateAccessCodeRequest;
use App\Http\Requests\Admin\Customer\CustomerListRequest;
use App\Http\Requests\Admin\Customer\SuperAdminUpsertCustomerRequest;
use App\Http\Requests\Admin\Customer\UpdatePromotionalProductsRequest;
use App\Http\Requests\Admin\Customer\UploadCustomerLogoRequest;
use App\Http\Resources\Admin\AdminCustomerDetailResource;
use App\Http\Resources\Admin\AdminCustomerResource;
use App\Http\Resources\Admin\AdminMemberResource;
use App\Http\Resources\Admin\ExportHistoriesResource;
use App\Models\ExportHistory;
use App\Services\Admin\AdminCustomerService;
use App\Services\Admin\AdminCustomerStatisticsService;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\FileService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AdminCustomerController extends BaseController
{
    public function __construct(
        protected AdminCustomerService $adminCustomerService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PaginationService $paginationService,
        protected AdminCustomerStatisticsService $adminCustomerStatisticsService,
        protected FileService $fileService,
    ) {}

    /**
     * Get search filters metadata
     * 검색 필터 메타데이터 조회
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminCustomerService->getSearchFilters();

            return response()->json([
                'success' => true,
                'data' => $filters,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Display a listing of customers
     * 고객사 목록 조회
     */
    public function index(CustomerListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $customers = $this->adminCustomerService->getCustomers($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '고객 목록이 성공적으로 조회되었습니다.', [
                'customers' => AdminCustomerResource::collection($customers->items()),
            ], $this->paginationService->format($customers));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get customer detail
     * 고객사 상세 조회
     */
    public function show(int $id): JsonResponse
    {
        try {
            $customer = $this->adminCustomerService->getCustomer($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'customer' => new AdminCustomerDetailResource($customer),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '고객사를 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function getMembers(Request $request, int $id): JsonResponse
    {
        try {
            $perPage = (int) ($request->query('per_page', 20));
            $members = $this->adminCustomerService->getCustomerMembers($id, $perPage);

            return $this->responsePaginatedSuccess(200, '회원 목록이 성공적으로 조회되었습니다.', [
                'members' => AdminMemberResource::collection($members->items()),
            ], $this->paginationService->format($members));
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '고객사를 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Register a new customer
     * 신규 고객사 등록
     */
    public function store(SuperAdminUpsertCustomerRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            if ($request->hasFile('business_registration_file')) {
                $file = $request->file('business_registration_file');
                $validated['business_registration_file'] = $file->store('business-registrations', 'public');
                $this->fileService->create($file, $validated['business_registration_file'], \App\Enums\FileType::BUSINESS_REGISTRATIONS, $user);
            }

            $customer = $this->adminCustomerService->createCustomer($validated, $user);

            return response()->json([
                'success' => true,
                'message' => '고객사가 성공적으로 등록되었습니다.',
                'data' => [
                    'customer' => new AdminCustomerDetailResource($customer->load(['code', 'approvedBy'])),
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating customer', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '고객사 등록 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update customer
     * 고객사 수정
     */
    public function update(SuperAdminUpsertCustomerRequest $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            if ($request->hasFile('business_registration_file')) {
                $file = $request->file('business_registration_file');
                $validated['business_registration_file'] = $file->store('business-registrations', 'public');
                $this->fileService->create($file, $validated['business_registration_file'], \App\Enums\FileType::BUSINESS_REGISTRATIONS, $user);
            }

            $customer = $this->adminCustomerService->updateCustomer($id, $validated, $user);

            return response()->json([
                'success' => true,
                'message' => '고객사가 성공적으로 수정되었습니다.',
                'data' => [
                    'customer' => new AdminCustomerDetailResource($customer),
                ],
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '고객사를 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error updating customer', [
                'customer_id' => $id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '고객사 수정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function checkAccessCode(CheckDuplicateAccessCodeRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $result = $this->adminCustomerService->checkAccessCode($validated, $user);

            return response()->json([
                'success' => true,
                'data' => $result,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error checking access code', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '접속 코드 확인 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function uploadLogo(UploadCustomerLogoRequest $request, string|int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $result = $this->adminCustomerService->uploadLogo($validated, $user, $id);

            return response()->json([
                'success' => true,
                'data' => $result,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error uploading logo', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '로고 업로드 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function forMemberRegistration(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $customers = $this->adminCustomerService->getCustomersForMemberRegistration($user);

            return response()->json([
                'success' => true,
                'data' => [
                    'customers' => $customers,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function getApproveRequests(Request $request): JsonResponse
    {
        try {
            $perPage = (int) ($request->perPage ?? 20);
            $requestType = $request->query('request_type')
                ? strtolower($request->query('request_type'))
                : null;
            $customers = $this->adminCustomerService->getApproveRequests($perPage, $requestType);

            return response()->json([
                'success' => true,
                'data' => [
                    'customers' => AdminCustomerResource::collection($customers->items()),
                    'pagination' => $this->paginationService->format($customers),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '고객사를 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function getApprovalHistories(Request $request): JsonResponse
    {
        try {
            $perPage = (int) ($request['per_page'] ?? 20);
            $requestType = $request->query('request_type')
                ? strtolower($request->query('request_type'))
                : null;
            $approvalStatus = $request->query('approval_status')
                ? strtolower($request->query('approval_status'))
                : null;
            $customers = $this->adminCustomerService->getApprovalHistories($perPage, $requestType, $approvalStatus);

            return response()->json([
                'success' => true,
                'data' => [
                    'customers' => AdminCustomerResource::collection($customers->items()),
                    'pagination' => $this->paginationService->format($customers),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '고객사를 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function approval(AdminApprovalCustomerRequest $request): JsonResponse
    {

        try {
            $user = $request->user();
            $validated = $request->validated();

            $this->adminCustomerService->approval($validated, $user);

            return response()->json([
                'success' => true,
                'message' => '승인이 완료되었습니다.',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error approving customer member', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '고객사 회원 승인 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export customers to Excel. Supports export_type: ALL, CURRENT_PAGE, SELECTED.
     */
    public function exportExcel(AdminCustomerExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $history = $this->adminExportHistoryService->executeExcel(
                AdminCustomerExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'customers'
            );

            return response()->json([
                'success' => true,
                'message' => '내보내기 요청이 접수되었습니다.',
                'data' => [
                    'history' => new ExportHistoriesResource($history),
                ],
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => '고객사 내보내기 중 오류가 발생했습니다.',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Check progress status of customer export
     * 고객사 Excel 다운로드 진행 상태 확인
     */
    public function checkProgressStatus(ExportHistory $history): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'history' => new ExportHistoriesResource($history),
            ],
        ]);
    }

    /**
     * Get customer statistics
     * 고객사 통계 조회
     */
    public function statistics(AdminCustomerStatisticsRequest $request): JsonResponse
    {
        try {
            $customerIds = $request->input('customer_ids', []);

            $salesRep = $request->input('sales_representative');
            $export = $request->boolean('export', false);

            $data = $this->adminCustomerStatisticsService->getCustomerStatistics($customerIds, $salesRep);

            if ($export) {
                $history = $this->adminExportHistoryService->executeExcel(
                    AdminCustomerStatisticsExport::class,
                    $data,
                    $request->user()->id,
                    'customer_statistics '.now()->format('Y-m-d H:i:s'),
                    'customer_statistics'
                );

                return response()->json([
                    'success' => true,
                    'message' => '고객사 통계 내보내기 요청이 접수되었습니다.',
                    'data' => [
                        'history' => new ExportHistoriesResource($history),
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => '고객사 통계가 성공적으로 조회되었습니다.',
                'data' => $data,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error getting customer statistics: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => '고객사 통계 조회 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download customer export file
     * 고객사 Excel 파일 다운로드
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
            'Content-Disposition' => 'attachment; filename="'.$history->file_name.'"',
        ]);
    }

    /**
     * Get customer payment information
     * 고객사 결제 정보 조회
     */
    public function getPaymentInformation(int $id): JsonResponse
    {
        try {
            $data = $this->adminCustomerService->getPaymentInformation($id);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '고객사를 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get customer bookkeeping (ledger) data
     * 고객사 장부 조회
     */
    public function getBookkeeping(Request $request, int $id): JsonResponse
    {
        try {
            $filters = $request->only(['date_from', 'date_to', 'page', 'per_page']);
            $data = $this->adminCustomerService->getBookkeeping($id, $filters);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '고객사를 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Export bookkeeping data to Excel
     * 고객사 장부 Excel 다운로드
     */
    public function exportBookkeeping(Request $request, int $id): JsonResponse
    {
        try {
            $filters = $request->only(['date_from', 'date_to']);
            $filters['customer_id'] = $id;

            $history = $this->adminExportHistoryService->executeExcel(
                AdminCustomerBookkeepingExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'bookkeeping_customer_'.$id
            );

            return response()->json([
                'success' => true,
                'message' => '내보내기 요청이 접수되었습니다.',
                'data' => [
                    'history' => new ExportHistoriesResource($history),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => '장부 내보내기 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get audit logs for a customer (edit history).
     */
    public function auditLogs(Request $request, int $id): JsonResponse
    {
        try {
            $result = $this->adminCustomerService->getAuditLogs($id, $request->only(['page', 'per_page']));

            return $this->responsePaginatedSuccess(200, '고객사 편집 이력이 성공적으로 조회되었습니다.', $result['data'], $result['pagination']);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get promotional products for a customer
     * 고객사 홍보 제품 목록 조회
     */
    public function getPromotionalProducts(Request $request, int $id): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'category_id', 'page', 'current_page', 'per_page']);
            $result = $this->adminCustomerService->getPromotionalProducts($id, $filters);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '고객사를 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Update promotional products for a customer
     * 고객사 홍보 제품 설정 업데이트
     */
    public function updatePromotionalProducts(UpdatePromotionalProductsRequest $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $result = $this->adminCustomerService->updatePromotionalProducts(
                $id,
                $validated['product_ids'],
                $user
            );

            return response()->json([
                'success' => true,
                'message' => '홍보 상품이 성공적으로 수정되었습니다.',
                'data' => $result,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '고객사를 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            Log::error('Error updating promotional products', [
                'customer_id' => $id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '홍보 상품 수정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all customers as minimal list for dropdowns (no pagination).
     */
    public function all(): JsonResponse
    {
        try {
            $customers = $this->adminCustomerService->getAllCustomersMinimal();

            return response()->json([
                'success' => true,
                'data' => [
                    'customers' => $customers,
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
     * Get customer detail with member list.
     */
    public function showWithMembers(int $id): JsonResponse
    {
        try {
            $customer = $this->adminCustomerService->getCustomerWithMembers($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'customer' => new AdminCustomerDetailResource($customer),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '고객사를 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }
}
