<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminPaymentExport;
use App\Http\Exports\Admin\AdminPaymentStatisticsExport;
use App\Http\Requests\Admin\Payment\AdminPaymentExportRequest;
use App\Http\Requests\Admin\Payment\PaymentListRequest;
use App\Http\Requests\Admin\Payment\PaymentStatisticsRequest;
use App\Http\Resources\AdminExportHistory;
use App\Http\Resources\AdminPaymentResource;
use App\Models\ExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminPaymentService;
use App\Services\Admin\PaymentReceiptPdfService;
use App\Services\PaymentService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminPaymentController extends BaseController
{
    public function __construct(
        protected AdminPaymentService $adminPaymentService,
        protected PaginationService $paginationService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PaymentReceiptPdfService $receiptPdfService,
        protected PaymentService $paymentService,
    ) {}

    /**
     * Get payment statistics by payment method
     */
    public function statistics(PaymentStatisticsRequest $request): JsonResponse
    {
        try {
            $customerIds = $request->input('customer_ids', []);
            if (is_string($customerIds)) {
                $customerIds = array_map('intval', array_filter(array_map('trim', explode(',', $customerIds))));
            }
            $period = $request->input('period', 'monthly');
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            $export = $request->boolean('export', false);

            $configPeriod = $this->adminPaymentService->configPeriod($period, $startDate, $endDate);
            $data = $this->adminPaymentService->getPaymentStatistics($customerIds, $configPeriod);

            if ($export) {
                $userId = $request->user()?->id ?? 1;
                $baseName = 'payment_statistics';
                $basePath = $baseName.'_'.now()->format('Y-m-d_H-i-s');
                $basePath = str_replace(' ', '_', $basePath);

                $history = $this->adminExportHistoryService->executeExcel(
                    AdminPaymentStatisticsExport::class,
                    $data,
                    $userId,
                    $basePath,
                    $baseName
                );

                return $this->responseSuccess(200, '결제 통계 내보내기 요청이 접수되었습니다.', new AdminExportHistory($history));
            }

            return $this->responseSuccess(200, '결제 통계 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Throwable $th) {
            return $this->responseError(500, '결제 통계 데이터 조회에 실패하였습니다.', [$th->getMessage()]);
        }
    }

    /**
     * Get list payment transaction
     */
    public function index(PaymentListRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $perPage = $request->input('per_page', config('app.paginate.per_page'));
            $payments = $this->adminPaymentService->getPaginate($data, $perPage);

            return $this->responsePaginatedSuccess(200, '결제 목록이 성공적으로 조회되었습니다.', [
                'payments' => AdminPaymentResource::collection($payments->items()),
            ], $this->paginationService->format($payments));
        } catch (\Throwable $th) {
            return $this->responseError(500, '결제 목록 조회에 실패하였습니다.', [$th->getMessage()]);
        }
    }

    /**
     * Check progress status of export
     *
     * @return JsonResponse
     */
    public function checkProgressStatus(ExportHistory $history)
    {
        return $this->responseSuccess(200, '내보내기 진행 상태가 성공적으로 조회되었습니다.', [
            'history' => new AdminExportHistory($history),
        ]);
    }

    /**
     * Export payment to Excel. Supports export_type: ALL, CURRENT_PAGE, SELECTED.
     */
    public function exportExcel(AdminPaymentExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $history = $this->adminExportHistoryService->executeExcel(
                AdminPaymentExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'payments'
            );

            return $this->responseSuccess(200, '내보내기 요청이 접수되었습니다.', [
                'history' => new AdminExportHistory($history),
            ]);
        } catch (\Throwable $th) {
            return $this->responseError(500, '결제 내보내기에 실패하였습니다.', [$th->getMessage()]);
        }
    }

    /**
     * Download export file
     */
    public function download(ExportHistory $history)
    {
        if (! $history) {
            return $this->responseError(404, '내보내기 기록을 찾을 수 없습니다.');
        }

        if ($history->status !== ExcelHistoryStatus::COMPLETED) {
            return $this->responseError(400, '내보내기가 아직 완료되지 않았습니다.');
        }

        // Try public disk first (new files), then local disk (old files)
        $disk = Storage::disk('public');
        if (! $disk->exists($history->file_path)) {
            $disk = Storage::disk('local');
            if (! $disk->exists($history->file_path)) {
                return $this->responseError(404, '내보내기 파일을 찾을 수 없습니다.');
            }
        }

        return $disk->download($history->file_path, $history->file_name, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$history->file_name.'"',
        ]);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $payment = $this->adminPaymentService->getById($id);

            return $this->responseSuccess(200, '결제 정보가 성공적으로 조회되었습니다.', [
                'payment' => $payment,
            ]);
        } catch (ModelNotFoundException) {
            return $this->responseError(404, '결제 정보를 찾을 수 없습니다.');
        } catch (\Throwable $th) {
            return $this->responseError(500, '결제 정보 조회에 실패하였습니다.', [$th->getMessage()]);
        }
    }

    public function printReceipt(int $id): JsonResponse
    {
        try {
            $url = $this->receiptPdfService->generate($id);

            return $this->responseSuccess(200, '영수증 PDF가 성공적으로 생성되었습니다.', [
                'pdf_url' => $url,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function refund(Request $request, string $transactionId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'reason' => ['required', 'string', 'max:500'],
                'amount' => ['nullable', 'numeric', 'min:0'],
            ]);

            $transaction = $this->paymentService->requestRefund(
                $transactionId,
                $validated['reason'],
                $validated['amount'] ?? null
            );

            return $this->responseSuccess(200, '환불이 성공적으로 처리되었습니다.', [
                'transaction_id' => $transaction->transaction_id,
                'status' => $transaction->status,
                'refunded_at' => $transaction->refunded_at,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
