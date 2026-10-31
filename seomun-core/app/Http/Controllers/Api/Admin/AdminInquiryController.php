<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Enums\FileType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminInquiryExport;
use App\Http\Requests\Admin\Inquiry\AdminAnswerInquiryRequest;
use App\Http\Requests\Admin\Inquiry\AdminAssignInquiryRequest;
use App\Http\Requests\Admin\Inquiry\AdminCreateInquiryReplyRequest;
use App\Http\Requests\Admin\Inquiry\AdminCreateInternalMemoRequest;
use App\Http\Requests\Admin\Inquiry\AdminGetInquiriesRequest;
use App\Http\Requests\Admin\Inquiry\AdminInquiryExportRequest;
use App\Http\Requests\Admin\Inquiry\AdminUpdateAnswerInquiryRequest;
use App\Http\Requests\Admin\Inquiry\AdminUpdateInquiryReplyRequest;
use App\Http\Requests\Admin\Inquiry\AdminUpdateInquiryStatusRequest;
use App\Http\Resources\Admin\ExportHistoriesResource;
use App\Http\Resources\AdminInquiryResource;
use App\Models\ExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminInquiryService;
use App\Services\FileService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AdminInquiryController extends BaseController
{
    public function __construct(
        protected AdminInquiryService $adminInquiryService,
        protected PaginationService $paginationService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected FileService $fileService,
    ) {}

    /**
     * Upload attachment for inquiry reply.
     */
    public function uploadAttachment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpeg,jpg,png'],
            ]);

            $file = $request->file('file');
            $path = $file->store('inquiry-attachments', 'public');
            $this->fileService->create($file, $path, FileType::INQUIRY_ATTACHMENTS, $request->user());

            return $this->responseSuccess(201, '첨부파일이 성공적으로 업로드되었습니다.', [
                'key' => $path,
                'name' => $file->getClientOriginalName(),
                'url' => asset('storage/' . $path),
                'size' => $file->getSize(),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get filter metadata for inquiry list.
     */
    public function filters(Request $request): JsonResponse
    {
        try {
            $data = $this->adminInquiryService->getFilterSearch();

            return response()->json([
                'success' => true,
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get Inquiry filters failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '문의 필터 정보를 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index(AdminGetInquiriesRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $data = $this->adminInquiryService->getInquiries($user, $validated);

            return $this->responsePaginatedSuccess(200, '문의 목록이 성공적으로 조회되었습니다.', [
                'inquiries' => AdminInquiryResource::collection($data->items()),
            ], $this->paginationService->format($data));
        } catch (\Exception $e) {
            Log::error('Get Inquiries failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '문의 목록을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $inquiry = $this->adminInquiryService->getInquiryForAdmin($user, $id);

            // Match FE's InquiryDetailRESP: BaseResponse<{ inquiry: InquiryDetail }>
            return response()->json([
                'success' => true,
                'data' => [
                    'inquiry' => $inquiry,
                ],
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '해당 스토어 권한을 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Get StorePermission detail failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '문의 상세 정보를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAnswer(string $id): JsonResponse
    {
        try {
            $data = $this->adminInquiryService->getAnswer((int) $id);

            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function answer(AdminAnswerInquiryRequest $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $inquiry = $this->adminInquiryService->answerInquiry($user, $id, $validated);

            // Map to ReplyRESP shape: { reply: Reply }
            $replies = $this->adminInquiryService->getReplies($user, (int) $id);
            $reply = $replies['replies'][0] ?? null;

            return response()->json([
                'success' => true,
                'message' => '문의 답변이 성공적으로 등록되었습니다.',
                'data' => [
                    'reply' => $reply,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create inquiry answer failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '문의 답변 등록 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get related inquiries for a given inquiry.
     */
    public function related(string $id, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $this->adminInquiryService->getRelatedInquiries($user, (int) $id);

            return response()->json([
                'success' => true,
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get related inquiries failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '관련 문의를 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get timeline events for an inquiry.
     */
    public function timeline(string $id, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $this->adminInquiryService->getTimeline($user, (int) $id);

            return response()->json([
                'success' => true,
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get inquiry timeline failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '타임라인을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get replies for an inquiry.
     */
    public function replies(string $id, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $this->adminInquiryService->getReplies($user, (int) $id);

            return response()->json([
                'success' => true,
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get inquiry replies failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '답변 내역을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new reply (admin comment) for an inquiry.
     */
    public function storeReply(AdminCreateInquiryReplyRequest $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $data = $this->adminInquiryService->createReply($user, (int) $id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Reply created successfully',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create inquiry reply failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '답변 등록 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an existing reply (admin comment) for an inquiry.
     */
    public function updateReply(AdminUpdateInquiryReplyRequest $request, string $id, string $replyId): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $data = $this->adminInquiryService->updateReply($user, (int) $id, (int) $replyId, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Reply updated successfully',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update inquiry reply failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'reply_id' => $replyId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '답변 수정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a reply (admin comment) for an inquiry.
     */
    public function deleteReply(Request $request, string $id, string $replyId): JsonResponse
    {
        try {
            $user = $request->user();

            $data = $this->adminInquiryService->deleteReply($user, (int) $id, (int) $replyId);

            return response()->json([
                'success' => true,
                'message' => 'Reply deleted successfully',
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete inquiry reply failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'reply_id' => $replyId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '답변 삭제 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get audit logs for an inquiry (placeholder).
     */
    public function auditLogs(string $id, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $this->adminInquiryService->getAuditLogs($user, (int) $id);

            return response()->json([
                'success' => true,
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get inquiry audit logs failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '수정 이력을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get internal memo for an inquiry (placeholder).
     */
    public function memo(string $id, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $this->adminInquiryService->getInternalMemo($user, (int) $id);

            return response()->json([
                'success' => true,
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get inquiry internal memo failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '내부 메모를 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update inquiry status (Admin API).
     * FSD: Change processing status (Received → Processing → Completed).
     */
    public function updateStatus(AdminUpdateInquiryStatusRequest $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $detail = $this->adminInquiryService->updateStatus($user, (int) $id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Inquiry status updated successfully',
                'data' => [
                    'inquiry' => $detail,
                ],
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Update inquiry status failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '문의 상태를 업데이트하는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign manager for an inquiry (Admin API).
     */
    public function assign(AdminAssignInquiryRequest $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $detail = $this->adminInquiryService->assignManager($user, (int) $id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Inquiry manager assigned successfully',
                'data' => [
                    'inquiry' => $detail,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Assign inquiry manager failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '문의 담당자를 지정하는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export inquiries to Excel. Supports export_type: ALL, CURRENT_PAGE, SELECTED. Locale: en, ko, ja.
     */
    public function exportExcel(AdminInquiryExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $history = $this->adminExportHistoryService->executeExcel(
                AdminInquiryExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'inquiries'
            );

            return response()->json([
                'success' => true,
                'message' => '내보내기 요청이 접수되었습니다.',
                'data' => [
                    'history' => new ExportHistoriesResource($history),
                ],
            ]);
        } catch (\Throwable $th) {
            Log::error('Inquiry export failed', ['error' => $th->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => '문의 내보내기 중 오류가 발생했습니다.',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Check progress status of inquiry export.
     */
    public function checkExportProgress(ExportHistory $history): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'history' => new ExportHistoriesResource($history),
            ],
        ]);
    }

    /**
     * Download inquiry export file.
     */
    public function downloadExport(ExportHistory $history)
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
     * Create internal memo for an inquiry.
     */
    public function storeMemo(AdminCreateInternalMemoRequest $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();
            $data = $this->adminInquiryService->createInternalMemo($user, (int) $id, $validated);

            return response()->json([
                'success' => true,
                'message' => '내부 메모가 성공적으로 등록되었습니다.',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create inquiry internal memo failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '내부 메모 등록 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update (edit) inquiry answer.
     */
    public function updateAnswer(AdminUpdateAnswerInquiryRequest $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();
            $inquiry = $this->adminInquiryService->updateAnswer($user, (int) $id, $validated);

            return response()->json([
                'success' => true,
                'message' => '문의 답변이 성공적으로 수정되었습니다.',
                'data' => [
                    'inquiry' => $inquiry,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update inquiry answer failed', [
                'user_id' => $request->user()->id,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '문의 답변 수정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete inquiry answer.
     */
    public function deleteAnswer(Request $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            $inquiry = $this->adminInquiryService->deleteAnswer($user, (int) $id);

            return response()->json([
                'success' => true,
                'message' => '문의 답변이 성공적으로 삭제되었습니다.',
                'data' => [
                    'inquiry' => $inquiry,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete inquiry answer failed', [
                'user_id' => $request->user()->id,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '문의 답변 삭제 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
