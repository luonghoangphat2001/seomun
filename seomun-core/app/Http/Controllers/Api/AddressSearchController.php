<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Address\SearchAddressRequest;
use Illuminate\Http\JsonResponse;

/**
 * Address / postal code search (주소 검색).
 * Stub implementation: returns empty or sample data.
 * Replace with real postal API (e.g. Korean address API) when available.
 */
class AddressSearchController extends BaseController
{
    /**
     * POST /api/address/search
     */
    public function search(SearchAddressRequest $request): JsonResponse
    {
        $postcode = $request->input('postcode');
        $keyword = $request->input('keyword');
        $perPage = (int) $request->input('per_page', 20);
        $page = (int) $request->input('page', 1);

        if (empty($postcode) && empty($keyword)) {
            return response()->json([
                'success' => false,
                'message' => '우편번호 또는 검색어를 입력해주세요.',
            ], 422);
        }

        // Stub: return empty list. Replace with real API call when integrated.
        $addresses = [];
        $total = 0;

        return response()->json([
            'success' => true,
            'data' => [
                'addresses' => $addresses,
            ],
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => (int) ceil($total / $perPage),
            ],
        ]);
    }
}
