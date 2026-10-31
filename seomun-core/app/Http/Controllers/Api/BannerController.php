<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;

class BannerController extends Controller
{
    /**
     * Homepage banners (공통 배너 - 홈 화면).
     */
    public function homepage(): JsonResponse
    {
        try {
            $banners = Banner::visible()
                ->where('exposure_location', 'main')
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    // Use ::collection() to handle the array of banners properly
                    'banners' => BannerResource::collection($banners),
                ],
            ]);
        } catch (\Throwable $e) {
            // Tip: Log $e->getMessage() here during development to see internal errors!
            return response()->json([
                'success' => false,
                'message' => '홈페이지 배너를 불러오는 중 오류가 발생했습니다.',
            ], 500);
        }
    }

    /**
     * Login modal banners (로그인 모달 배너).
     */
    public function login(): JsonResponse
    {
        try {
            $banner = Banner::visible()
                ->where('exposure_location', 'login')
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'banners' => $banner ? [new BannerResource($banner)] : [],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => '로그인 배너를 불러오는 중 오류가 발생했습니다.',
            ], 500);
        }
    }
}
