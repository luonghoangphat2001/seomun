<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\MyPage\UpdateApprovalSettingsRequest;
use App\Services\MyPage\MyPageApprovalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApprovalSettingsController extends BaseController
{
    public function __construct(
        protected MyPageApprovalService $approvalService
    ) {}

    /**
     * Get approval settings
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $settings = $this->approvalService->getSettings($user);

            return $this->responseSuccess(200, '성공적으로 조회되었습니다.', [
                'individual_approval' => $settings['individual_approval'],
                'approval_line' => $settings['approval_line'],
            ]);
        } catch (\Exception $e) {
            return $this->responseError(500, '결재 설정을 불러오는데 실패했습니다.');
        }
    }

    /**
     * Get approval options: organization labels, organization option lists,
     * and approver candidates for building approval line.
     *
     * GET /api/mypage/approval-settings/options
     */
    public function options(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $options = $this->approvalService->getOptions($user);

            return $this->responseSuccess(200, '성공적으로 조회되었습니다.', $options);
        } catch (\Exception $e) {
            return $this->responseError(500, '결재 옵션을 불러오는데 실패했습니다.');
        }
    }

    /**
     * Update approval settings
     */
    public function update(UpdateApprovalSettingsRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $settings = $this->approvalService->updateSettings($user, $request->validated());

            return $this->responseSuccess(200, '결재 설정이 성공적으로 업데이트되었습니다.', [
                'individual_approval' => $settings['individual_approval'],
                'approval_line' => $settings['approval_line'],
            ]);
        } catch (\Exception $e) {
            return $this->responseError(500, $e->getMessage() ?: '결재 설정 업데이트에 실패했습니다.');
        }
    }
}
