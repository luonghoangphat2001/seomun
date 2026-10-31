<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\AddressBook\StoreAddressBookRequest;
use App\Http\Requests\AddressBook\UpdateAddressBookRequest;
use App\Services\MyPage\MyPageShippingAddressService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShippingAddressController extends BaseController
{
    public function __construct(
        protected MyPageShippingAddressService $shippingAddressService
    ) {}

    /**
     * Get shipping addresses list (배송지 목록)
     * GET /api/mypage/shipping-addresses
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $search = $request->input('search');
            $searchType = $request->input('search_type', 'all');
            $perPage = (int) $request->input('per_page', 15);

            $data = $this->shippingAddressService->getAddresses($user, $search, $searchType, $perPage);

            return $this->responsePaginatedSuccess(200, 'Success', [
                'addresses' => $data['addresses'],
            ], $data['pagination']);
        } catch (\Exception $e) {
            Log::error('Get MyPage shipping addresses failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '배송지 목록을 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get shipping address detail (배송지 상세)
     * GET /api/mypage/shipping-addresses/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $address = $this->shippingAddressService->getAddressDetail($user, $id);

            return response()->json([
                'success' => true,
                'data' => [
                    'address' => $address,
                ],
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '배송지를 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Get MyPage shipping address detail failed', [
                'user_id' => $request->user()->id ?? null,
                'address_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '배송지 상세 정보를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create shipping address (배송지 등록)
     * POST /api/mypage/shipping-addresses
     */
    public function store(StoreAddressBookRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $address = $this->shippingAddressService->createAddress($user, $validated);

            return response()->json([
                'success' => true,
                'message' => '배송지가 등록되었습니다.',
                'data' => [
                    'address' => $address,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create MyPage shipping address failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '배송지 등록 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update shipping address (배송지 수정)
     * PUT /api/mypage/shipping-addresses/{id}
     */
    public function update(UpdateAddressBookRequest $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $address = $this->shippingAddressService->updateAddress($user, $id, $validated);

            return response()->json([
                'success' => true,
                'message' => '배송지가 수정되었습니다.',
                'data' => [
                    'address' => $address,
                ],
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '배송지를 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Update MyPage shipping address failed', [
                'user_id' => $request->user()->id,
                'address_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '배송지 수정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete shipping addresses (배송지 삭제)
     * DELETE /api/mypage/shipping-addresses
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer',
        ]);

        try {
            $deleted = $this->shippingAddressService->batchDeleteAddresses(
                $request->user(),
                $request->input('ids')
            );

            return response()->json([
                'success' => true,
                'message' => '선택한 배송지가 삭제되었습니다.',
                'data' => [
                    'deleted_count' => $deleted,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete MyPage shipping addresses failed', [
                'user_id' => $request->user()->id,
                'ids' => $request->input('ids'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '배송지 삭제 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Set shipping address as default (기본 배송지 설정)
     * POST /api/mypage/shipping-addresses/{id}/set-default
     */
    public function setDefault(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $address = $this->shippingAddressService->setDefaultAddress($user, $id);

            return response()->json([
                'success' => true,
                'message' => '기본 배송지로 설정되었습니다.',
                'data' => [
                    'address' => $address,
                ],
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '배송지를 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Set default shipping address failed', [
                'user_id' => $request->user()->id,
                'address_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '기본 배송지 설정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
