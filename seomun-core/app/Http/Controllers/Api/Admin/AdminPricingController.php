<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Pricing\PricingProfileRequest;
use App\Models\PricingProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

/** CRUD for Product-level calculator configuration. */
class AdminPricingController extends BaseController
{
    public function profiles(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => ['pricing_profiles' => PricingProfile::orderBy('name')->get()]]);
    }

    public function storeProfile(PricingProfileRequest $request): JsonResponse
    {
        $profile = PricingProfile::create($request->validated());

        return response()->json(['success' => true, 'data' => ['pricing_profile' => $profile]], 201);
    }

    public function showProfile(PricingProfile $pricingProfile): JsonResponse
    {
        return response()->json(['success' => true, 'data' => ['pricing_profile' => $pricingProfile]]);
    }

    public function updateProfile(PricingProfileRequest $request, PricingProfile $pricingProfile): JsonResponse
    {
        $pricingProfile->update($request->validated());

        return response()->json(['success' => true, 'data' => ['pricing_profile' => $pricingProfile->fresh()]]);
    }

    public function destroyProfile(PricingProfile $pricingProfile): JsonResponse
    {
        if ($pricingProfile->products()->exists()) {
            throw ValidationException::withMessages(['pricing_profile' => '상품이 연결된 Pricing Profile은 삭제할 수 없습니다.']);
        }
        $pricingProfile->delete();

        return response()->json(['success' => true]);
    }
}
