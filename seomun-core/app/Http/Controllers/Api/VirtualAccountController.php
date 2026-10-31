<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\VirtualAccountResource;
use App\Services\VirtualAccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VirtualAccountController extends BaseController
{
    public function __construct(
        protected VirtualAccountService $virtualAccountService,
    ) {}

    /**
     * Get virtual accounts for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $virtualAccounts = $this->virtualAccountService->getMyVirtualAccounts($user->id);

            return $this->responseSuccess(200, '가상계좌 목록이 성공적으로 조회되었습니다.', [
                "virtual_account" => $virtualAccounts
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve virtual accounts for user: ' . $user->id, ['error' => $e->getMessage()]);
            return $this->responseError(500, '가상계좌 목록을 불러오는 중 오류가 발생했습니다.', $e->getMessage());
        }
    }

    /**
     * Create a virtual account for the authenticated user.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'bank_code' => 'required|string|max:20',
            ]);

            $user = $request->user();

            $data = [
                'bank_code' => $validatedData['bank_code']
            ];

            $virtualAccount = $this->virtualAccountService->createVirtualAccount($user, $data);

            return $this->responseSuccess(201, '가상계좌가 성공적으로 생성되었습니다.', [
                'virtual_account' => new VirtualAccountResource($virtualAccount),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create virtual account for user: ' . $request->user()->id, ['error' => $e->getMessage()]);
            return $this->responseError(500, '가상계좌 생성 중 오류가 발생했습니다.', $e->getMessage());
        }
    }
    /**
     * Update a virtual account for the authenticated user.
     */
    public function update(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'bank_code' => 'required|string|max:20',
            ]);

            $user = $request->user();

            $data = [
                'bank_code' => $validatedData['bank_code']
            ];

            $virtualAccount = $this->virtualAccountService->updateVirtualAccount($user, $data);

            if (! $virtualAccount) {
                return $this->responseError(404, '가상계좌를 찾을 수 없거나 접근 권한이 없습니다.');
            }

            return $this->responseSuccess(200, '가상계좌가 성공적으로 수정되었습니다.', [
                'virtual_account' => new VirtualAccountResource($virtualAccount),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update virtual account for user: ' . $request->user()->id, ['error' => $e->getMessage()]);
            return $this->responseError(500, '가상계좌 수정 중 오류가 발생했습니다.', $e->getMessage());
        }
    }
}
