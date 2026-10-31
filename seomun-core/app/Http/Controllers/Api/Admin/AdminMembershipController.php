<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Membership\UpdateMembershipRequest;
use App\Http\Resources\Admin\AdminMembershipResource;
use App\Services\Admin\AdminMembershipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminMembershipController extends BaseController
{
    public function __construct(
        protected AdminMembershipService $adminMembershipService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $tiers = $this->adminMembershipService->getAllTiersForAdmin();

            return $this->responseSuccess(200, '멤버십 등급 목록 조회 성공', [
                'tiers' => AdminMembershipResource::collection($tiers),
            ]);
        } catch (\Exception $e) {
            Log::error('Get all memberships failed', [
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '멤버십 등급 목록 조회 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $tier = $this->adminMembershipService->getTierById($id);

            if (! $tier) {
                return $this->responseError(404, '멤버십 등급을 찾을 수 없습니다.');
            }

            return $this->responseSuccess(200, '멤버십 등급 상세 조회 성공', new AdminMembershipResource($tier));
        } catch (\Exception $e) {
            Log::error('Get membership detail failed', [
                'membership_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '멤버십 등급 상세 조회 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    /**
     * Manually upgrade a member's membership tier regardless of their order amount.
     */
    public function upgradeMember(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'tier_id' => 'required|integer|exists:membership_tiers,id',
        ]);

        try {
            $user = $this->adminMembershipService->upgradeMemberMembership(
                $request->integer('user_id'),
                $request->integer('tier_id')
            );

            if (! $user) {
                return $this->responseError(404, '회원 또는 멤버십 등급을 찾을 수 없습니다.');
            }

            return $this->responseSuccess(200, '멤버십 등급 수동 변경 성공', [
                'user_id'    => $user->id,
                'user_name'  => $user->name,
                'tier_id'    => $user->membership_tier_id,
                'tier_name'  => $user->membershipTier?->name,
            ]);
        } catch (\Exception $e) {
            Log::error('Manual membership upgrade failed', [
                'user_id' => $request->input('user_id'),
                'tier_id' => $request->input('tier_id'),
                'error'   => $e->getMessage(),
            ]);

            return $this->responseError(500, '멤버십 등급 수동 변경 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    public function update(UpdateMembershipRequest $request, int $id): JsonResponse
    {
        try {
            $tier = $this->adminMembershipService->updateTier($id, $request->validated());

            if (! $tier) {
                return $this->responseError(404, '멤버십 등급을 찾을 수 없습니다.');
            }

            return $this->responseSuccess(200, '멤버십 등급 수정 성공', new AdminMembershipResource($tier));
        } catch (\Exception $e) {
            Log::error('Update membership failed', [
                'membership_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '멤버십 등급 수정 중 오류가 발생했습니다.', $e->getMessage());
        }
    }
}
