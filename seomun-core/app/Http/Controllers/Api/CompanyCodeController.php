<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompanyCode\VerifyCompanyCodeRequest;
use App\Models\CompanyCode;
use Illuminate\Http\JsonResponse;

class CompanyCodeController extends Controller
{
    /**
     * Verify company code (고객사 정보 확인)
     */
    public function verify(VerifyCompanyCodeRequest $request): JsonResponse
    {
        try {
            $code = $request->input('code');

            $companyCode = CompanyCode::where('code', $code)->first();

            if (! $companyCode) {
                return response()->json([
                    'success' => false,
                    'message' => '입력하신 코드가 유효하지 않습니다.',
                    'detail' => '코드를 다시 확인해주세요.',
                ], 404);
            }

            if (! $companyCode->isValid()) {
                $reason = '코드가 유효하지 않습니다.';

                if ($companyCode->expires_at && $companyCode->expires_at->isPast()) {
                    $reason = '코드가 만료되었습니다.';
                } elseif ($companyCode->max_usage && $companyCode->usage_count >= $companyCode->max_usage) {
                    $reason = '코드 사용 횟수가 초과되었습니다.';
                } elseif (! $companyCode->is_active) {
                    $reason = '코드가 비활성화되었습니다.';
                }

                return response()->json([
                    'success' => false,
                    'message' => '입력하신 코드가 유효하지 않습니다.',
                    'detail' => $reason,
                ], 400);
            }

            // Increment usage count
            $companyCode->incrementUsage();

            return response()->json([
                'success' => true,
                'message' => '인증이 완료되었습니다.',
                'data' => [
                    'code' => $companyCode->code,
                    'company_name' => $companyCode->company_name,
                    'is_valid' => true,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '인증 처리 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
