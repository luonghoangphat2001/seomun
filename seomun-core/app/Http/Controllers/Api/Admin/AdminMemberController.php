<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminMemberExport;
use App\Http\Requests\Admin\Member\AdminMemberExportRequest;
use App\Http\Requests\Admin\Member\ApproveMemberRequest;
use App\Http\Requests\Admin\Member\ChangePasswordRequest;
use App\Http\Requests\Admin\Member\MemberListRequest;
use App\Http\Requests\Admin\Member\MemberRegistrationRequest;
use App\Http\Requests\Admin\Member\RejectMemberRequest;
use App\Http\Requests\Admin\Member\UpdateMemberBasicInfoRequest;
use App\Http\Requests\Admin\Member\UpdateMemberPermissionsRequest;
use App\Http\Requests\Admin\Member\UpdateMemberRequest;
use App\Http\Requests\Admin\Payment\PaymentListRequest;
use App\Http\Resources\Admin\AdminMemberDetailResource;
use App\Http\Resources\Admin\AdminMemberResource;
use App\Http\Resources\AdminExportHistory;
use App\Http\Resources\AdminPaymentResource;
use App\Models\ExportHistory;
use App\Models\ProxyLoginSession;
use App\Models\User;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminMemberActivityLogService;
use App\Services\Admin\AdminMemberService;
use App\Services\Admin\AdminPaymentService;
use App\Services\PaginationService;
use App\Services\ProxyLoginService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AdminMemberController extends BaseController
{
    public function __construct(
        protected AdminMemberService $adminMemberService,
        protected AdminMemberActivityLogService $adminMemberActivityLogService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PaginationService $paginationService,
        protected AdminPaymentService $adminPaymentService,
        protected ProxyLoginService $proxyLoginService,
    ) {}

    /**
     * Register a new member
     * 회원 등록
     */
    public function store(MemberRegistrationRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $adminUser = Auth::user();

            $member = $this->adminMemberService->registerMember($data, $adminUser);

            return response()->json([
                'success' => true,
                'message' => '회원이 성공적으로 등록되었습니다.',
                'data' => [
                    'member' => new AdminMemberDetailResource($member),
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
     * Get search filters metadata
     * 검색 필터 메타데이터 조회
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminMemberService->getSearchFilters();

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
     * Display a listing of members
     * 회원 목록 조회
     */
    public function index(MemberListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $members = $this->adminMemberService->getMembers($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '회원 목록이 성공적으로 조회되었습니다.', [
                'members' => AdminMemberResource::collection($members->items()),
            ], $this->paginationService->format($members));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get member detail
     * 회원 상세 조회 (includes Basic Information, Permission Information, and Activity Log)
     */
    public function show(int|string $id, Request $request): JsonResponse
    {
        try {
            $member = $this->adminMemberService->getMember($id);
            $member->load('membershipTier', 'customer', 'virtualAccount');
            // Get permissions
            $permissions = $this->adminMemberService->getPermissions($id);

            // Get activity logs (with optional filters from query params)
            $activityLogFilters = $request->only([
                'login_date_from',
                'login_date_to',
                'order_date_from',
                'order_date_to',
                'modification_date_from',
                'modification_date_to',
                'per_page',
            ]);
            $perPage = (int) ($activityLogFilters['per_page'] ?? 20);
            $activityLogs = $this->adminMemberActivityLogService->getActivityLogs($id, $activityLogFilters, $perPage);
            $formattedActivityLogs = $this->adminMemberActivityLogService->formatResponse($activityLogs);

            return response()->json([
                'success' => true,
                'data' => [
                    'member' => new AdminMemberDetailResource($member),
                    'permission_information' => $permissions,
                    'activity_log' => $formattedActivityLogs,
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '회원을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Start a short-lived, audited session that acts as a customer for order support.
     */
    public function proxyLogin(Request $request, User $user): JsonResponse
    {
        $target = $user;
        if (! $target) {
            return response()->json(['success' => false, 'message' => '회원을 찾을 수 없습니다.'], 404);
        }

        if (! $target->isUser() || ! $target->isActive()) {
            return response()->json([
                'success' => false,
                'message' => '활성 고객 계정으로만 주문 대행 로그인이 가능합니다.',
            ], 422);
        }

        try {
            $result = $this->proxyLoginService->start(
                $request->user(),
                $target,
                $request,
            );

            $cookieName = config('sanctum.proxy_login_handoff_cookie', 'proxy_handoff');
            $cookieDomain = config('sanctum.proxy_login_cookie_domain') ?: null;
            $cookieMinutes = (int) config('sanctum.proxy_login_handoff_expiration', 2);

            return response()->json([
                'success' => true,
                'message' => '주문 대행 핸드오프가 생성되었습니다.',
                'data' => [
                    'proxy_login' => [
                        'session_id' => $result['session']->id,
                        'admin_user_id' => $request->user()->id,
                        'target_user_id' => $target->id,
                        'target_username' => $target->username,
                        'expires_at' => $result['session']->expires_at->toISOString(),
                    ],
                    'redirect_url' => config('sanctum.proxy_login_user_redirect_url'),
                ],
            ], 201)->cookie(
                $cookieName,
                $result['handoff_code'],
                $cookieMinutes,
                '/',
                $cookieDomain,
                (bool) config('sanctum.proxy_login_cookie_secure', true),
                true,
                false,
                'lax',
            );
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => '주문 대행 로그인 생성 중 오류가 발생했습니다.',
            ], 500);
        }
    }

    /** Revoke an issued proxy token before its scheduled expiry. */
    public function endProxyLogin(Request $request, ProxyLoginSession $session): JsonResponse
    {
        $admin = $request->user();
        if ($session->admin_user_id !== $admin->id && ! $admin->isSuperAdmin()) {
            return response()->json(['success' => false, 'message' => '권한이 없습니다.'], 403);
        }

        $this->proxyLoginService->end($session, $admin);

        return response()->json([
            'success' => true,
            'message' => '주문 대행 로그인이 종료되었습니다.',
        ]);
    }

    /**
     * Get member payments
     * 회원 결제 목록 조회
     */
    public function payments(PaymentListRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['user_id'] = $id; // Filter by member ID
            $perPage = (int) $request->input('per_page', config('app.paginate.per_page', 20));
            $payments = $this->adminPaymentService->getPaginate($data, $perPage);

            return $this->responsePaginatedSuccess(200, '회원 결제 목록이 성공적으로 조회되었습니다.', [
                'payments' => AdminPaymentResource::collection($payments->items()),
            ], $this->paginationService->format($payments));
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Update member
     * 회원 업데이트
     */
    public function update(UpdateMemberRequest $request, int|string $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $member = $this->adminMemberService->update($id, $data);

            return response()->json([
                'success' => true,
                'message' => '회원 정보가 성공적으로 업데이트되었습니다.',
                'data' => [
                    'member' => new AdminMemberDetailResource($member),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Update member basic information
     * 회원 기본정보 업데이트
     */
    public function updateBasicInfo(UpdateMemberBasicInfoRequest $request, int|string $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $member = $this->adminMemberService->updateBasicInfo($id, $data);

            return response()->json([
                'success' => true,
                'message' => '기본정보가 성공적으로 업데이트되었습니다.',
                'data' => [
                    'member' => new AdminMemberDetailResource($member),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get member permissions
     * 회원 권한 정보 조회
     *
     * @deprecated Use GET /api/admin/members/{id} instead. This endpoint is kept for backward compatibility.
     */
    public function getPermissions(int|string $id): JsonResponse
    {
        try {
            $permissions = $this->adminMemberService->getPermissions($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'permissions' => $permissions,
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Update member permissions
     * 회원 권한 정보 업데이트
     */
    public function updatePermissions(UpdateMemberPermissionsRequest $request, int|string $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $adminUser = Auth::user();

            if (! $adminUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.',
                ], 401);
            }

            $member = $this->adminMemberService->updatePermissions($id, $data, $adminUser);

            return response()->json([
                'success' => true,
                'message' => '권한 정보가 성공적으로 업데이트되었습니다.',
                'data' => [
                    'permissions' => $this->adminMemberService->getPermissions($id),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Approve member
     * 회원 승인
     */
    public function approve(ApproveMemberRequest $request, int|string $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $adminUser = Auth::user();

            if (! $adminUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.',
                ], 401);
            }

            $member = $this->adminMemberService->approve(
                $id,
                $data['approval_reason'] ?? null,
                $adminUser
            );

            return response()->json([
                'success' => true,
                'message' => '회원이 성공적으로 승인되었습니다.',
                'data' => [
                    'member' => new AdminMemberDetailResource($member),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Reject member
     * 회원 거절
     */
    public function reject(RejectMemberRequest $request, int|string $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $adminUser = Auth::user();

            if (! $adminUser) {
                return response()->json([
                    'success' => false,
                    'message' => '인증이 필요합니다.',
                ], 401);
            }

            $member = $this->adminMemberService->reject(
                $id,
                $data['rejection_reason'],
                $adminUser
            );

            return response()->json([
                'success' => true,
                'message' => '회원이 거절되었습니다.',
                'data' => [
                    'member' => new AdminMemberDetailResource($member),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '회원을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get member activity logs
     * 회원 활동 이력 조회
     *
     * @deprecated Use GET /api/admin/members/{id} instead. This endpoint is kept for backward compatibility.
     */
    public function activityLogs(int|string $id, Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'login_date_from',
                'login_date_to',
                'order_date_from',
                'order_date_to',
                'modification_date_from',
                'modification_date_to',
                'per_page',
            ]);

            $perPage = (int) ($filters['per_page'] ?? 20);

            $activityLogs = $this->adminMemberActivityLogService->getActivityLogs($id, $filters, $perPage);
            $formatted = $this->adminMemberActivityLogService->formatResponse($activityLogs);

            return response()->json([
                'success' => true,
                'data' => [
                    'activity_logs' => $formatted,
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '회원을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Change member password
     * 회원 비밀번호 변경
     */
    public function changePassword(ChangePasswordRequest $request, int|string $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $this->adminMemberService->changePassword($id, $data['new_password']);

            return $this->responseSuccess(200, '비밀번호가 성공적으로 변경되었습니다.');
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '회원을 찾을 수 없습니다.');
        } catch (\Throwable $th) {
            return $this->responseError(500, $th->getMessage());
        }
    }

    /**
     * Export members to Excel. Supports export_type: ALL, CURRENT_PAGE, SELECTED.
     */
    public function exportExcel(AdminMemberExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $history = $this->adminExportHistoryService->executeExcel(
                AdminMemberExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'members'
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
                'message' => '회원 내보내기 중 오류가 발생했습니다.',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Check progress status of member export
     * 회원 Excel 다운로드 진행 상태 확인
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
     * Download member export file
     * 회원 Excel 파일 다운로드
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
}
