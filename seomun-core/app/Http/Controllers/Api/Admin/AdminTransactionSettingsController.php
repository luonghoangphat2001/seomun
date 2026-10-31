<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\TransactionSettings\UpdateTransactionSettingsRequest;
use App\Http\Requests\Admin\TransactionSettings\UploadTransactionSettingsLogoRequest;
use App\Http\Resources\Admin\AdminTransactionSettingResource;
use App\Services\CompanySettingsService;
use App\Services\TransactionSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminTransactionSettingsController extends BaseController
{
    public function __construct(
        protected TransactionSettingsService $transactionSettingsService,
        protected CompanySettingsService $companySettingsService
    ) {}

    public function show(Request $request): JsonResponse
    {
        try {
            return $this->responseSuccess(
                200,
                '거래 설정 조회 성공',
                new AdminTransactionSettingResource(
                    $this->transactionSettingsService->getSettings(),
                    $this->companySettingsService->getSettings()
                )
            );
        } catch (\Throwable $e) {
            Log::error('Get transaction settings failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '거래 설정 조회 중 오류가 발생했습니다.');
        }
    }

    public function update(UpdateTransactionSettingsRequest $request): JsonResponse
    {
        try {
            return $this->responseSuccess(
                200,
                '거래 설정이 성공적으로 업데이트되었습니다.',
                new AdminTransactionSettingResource(
                    $this->transactionSettingsService->updateSettings($request->validated()),
                    $this->companySettingsService->getSettings()
                )
            );
        } catch (\Throwable $e) {
            Log::error('Update transaction settings failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '거래 설정 업데이트 중 오류가 발생했습니다.');
        }
    }

    public function uploadLogo(UploadTransactionSettingsLogoRequest $request): JsonResponse
    {
        try {
            return $this->responseSuccess(
                200,
                '로고가 성공적으로 업로드되었습니다.',
                new AdminTransactionSettingResource(
                    $this->transactionSettingsService->replaceLogo($request->file('logo')),
                    $this->companySettingsService->getSettings()
                )
            );
        } catch (\Throwable $e) {
            Log::error('Upload transaction settings logo failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '로고 업로드 중 오류가 발생했습니다.');
        }
    }
}
