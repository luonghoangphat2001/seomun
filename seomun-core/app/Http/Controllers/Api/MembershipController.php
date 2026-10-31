<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\MembershipResource;
use App\Http\Resources\MembershipSummaryResource;
use App\Services\MembershipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MembershipController extends BaseController
{
    public function __construct(
        protected MembershipService $membershipService
    ) {}

    public function me(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $summary = $this->membershipService->getMembershipSummary($user);

            return $this->responseSuccess(200, '멤버십 정보 조회 성공', new MembershipSummaryResource((object) $summary));
        } catch (\Exception $e) {
            Log::error('Get membership summary failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '멤버십 정보 조회 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $tiers = $this->membershipService->getAllTiers();

            return $this->responseSuccess(200, '멤버십 등급 목록 조회 성공', MembershipResource::collection($tiers));
        } catch (\Exception $e) {
            Log::error('Get all memberships failed', [
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '멤버십 등급 목록 조회 중 오류가 발생했습니다.', $e->getMessage());
        }
    }
}
