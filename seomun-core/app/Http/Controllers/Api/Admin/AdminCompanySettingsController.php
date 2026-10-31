<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\CompanySettings\UpdateCompanySettingsRequest;
use App\Http\Requests\Admin\CompanySettings\UploadCompanyStampRequest;
use App\Http\Resources\Admin\AdminCompanySettingResource;
use App\Services\CompanySettingsService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminCompanySettingsController extends BaseController
{
    public function __construct(
        protected CompanySettingsService $companySettingsService
    ) {}

    public function show(Request $request): JsonResponse
    {
        try {
            return $this->responseSuccess(
                200,
                '회사 설정 조회 성공',
                new AdminCompanySettingResource($this->companySettingsService->getSettings())
            );
        } catch (\Throwable $e) {
            Log::error('Get company settings failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '회사 설정 조회 중 오류가 발생했습니다.');
        }
    }

    public function update(UpdateCompanySettingsRequest $request): JsonResponse
    {
        try {
            $settings = $this->companySettingsService->updateSettings($request->validated());

            return $this->responseSuccess(
                200,
                '회사 설정이 성공적으로 업데이트되었습니다.',
                new AdminCompanySettingResource($settings)
            );
        } catch (\Throwable $e) {
            Log::error('Update company settings failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '회사 설정 업데이트 중 오류가 발생했습니다.');
        }
    }

    public function uploadStamp(UploadCompanyStampRequest $request): JsonResponse
    {
        try {
            $settings = $this->companySettingsService->replaceStamp($request->file('stamp'));

            return $this->responseSuccess(
                200,
                '회사 도장이 성공적으로 업데이트되었습니다.',
                new AdminCompanySettingResource($settings)
            );
        } catch (\Throwable $e) {
            Log::error('Upload company stamp failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '회사 도장 업데이트 중 오류가 발생했습니다.');
        }
    }

    public function showStamp(): StreamedResponse|JsonResponse
    {
        try {
            return $this->companySettingsService->getStampResponse();
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, $e->getMessage());
        } catch (\Throwable $e) {
            return $this->responseError(500, '회사 도장 조회 중 오류가 발생했습니다.');
        }
    }

    public function destroyStamp(Request $request): JsonResponse
    {
        try {
            $settings = $this->companySettingsService->removeStamp();

            return $this->responseSuccess(
                200,
                '회사 도장이 삭제되었습니다.',
                new AdminCompanySettingResource($settings)
            );
        } catch (\Throwable $e) {
            Log::error('Delete company stamp failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(500, '회사 도장 삭제 중 오류가 발생했습니다.');
        }
    }
}
