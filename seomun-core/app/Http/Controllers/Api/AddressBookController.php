<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddressBook\StoreAddressBookRequest;
use App\Http\Requests\AddressBook\UpdateAddressBookRequest;
use App\Http\Resources\AddressBookResource;
use App\Models\AddressBook;
use App\Services\MyPage\MyPageShippingAddressService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressBookController extends Controller
{
    protected PaginationService $paginationService;
    protected MyPageShippingAddressService $shippingAddressService;

    public function __construct(
        PaginationService $paginationService,
        MyPageShippingAddressService $shippingAddressService
    ) {
        $this->paginationService = $paginationService;
        $this->shippingAddressService = $shippingAddressService;
    }

    /**
     * Get all address books for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $perPage = (int) $request->input('per_page', 15);
            $query = AddressBook::where('user_id', $user->id);

            // Search functionality - 검색어를 입력해주세요
            if ($request->has('search') && $request->input('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('recipient', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhere('detailed_address', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%");
                });
            }

            $addressBooks = $query->orderBy('is_default', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'address_books' => AddressBookResource::collection($addressBooks->items()),
                ],
                'pagination' => $this->paginationService->format($addressBooks),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '배송지 목록을 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific address book entry
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $addressBook = AddressBook::where('user_id', $user->id)
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'address_book' => new AddressBookResource($addressBook),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '배송지를 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '배송지를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new address book entry
     */
    public function store(StoreAddressBookRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();
            $validated['user_id'] = $user->id;

            // Normalize phone and mobile numbers (remove hyphens)
            if (isset($validated['phone'])) {
                $validated['phone'] = preg_replace('/[^0-9]/', '', $validated['phone']);
            }
            if (isset($validated['mobile'])) {
                $validated['mobile'] = preg_replace('/[^0-9]/', '', $validated['mobile']);
            }

            // If this is set as default, unset other defaults for this user
            if (isset($validated['is_default']) && $validated['is_default']) {
                DB::transaction(function () use ($user) {
                    AddressBook::where('user_id', $user->id)
                        ->where('is_default', true)
                        ->update(['is_default' => false]);
                });
            }

            $addressBook = AddressBook::create($validated);

            return response()->json([
                'success' => true,
                'message' => '배송지가 등록되었습니다.',
                'data' => [
                    'address_book' => new AddressBookResource($addressBook),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '배송지 등록 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an address book entry
     */
    public function update(UpdateAddressBookRequest $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $addressBook = AddressBook::where('user_id', $user->id)
                ->findOrFail($id);

            $validated = $request->validated();

            // Normalize phone and mobile numbers (remove hyphens)
            if (isset($validated['phone'])) {
                $validated['phone'] = preg_replace('/[^0-9]/', '', $validated['phone']);
            }
            if (isset($validated['mobile'])) {
                $validated['mobile'] = preg_replace('/[^0-9]/', '', $validated['mobile']);
            }

            // If this is set as default, unset other defaults for this user
            if (isset($validated['is_default']) && $validated['is_default']) {
                DB::transaction(function () use ($user, $id) {
                    AddressBook::where('user_id', $user->id)
                        ->where('id', '!=', $id)
                        ->where('is_default', true)
                        ->update(['is_default' => false]);
                });
            }

            $addressBook->update($validated);

            return response()->json([
                'success' => true,
                'message' => '배송지가 수정되었습니다.',
                'data' => [
                    'address_book' => new AddressBookResource($addressBook->fresh()),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '배송지를 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '배송지 수정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an address book entry
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $addressBook = AddressBook::where('user_id', $user->id)
                ->findOrFail($id);

            $addressBook->delete();

            return response()->json([
                'success' => true,
                'message' => '배송지가 삭제되었습니다.',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '배송지를 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '배송지 삭제 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Batch delete address book entries
     */
    public function batchDestroy(Request $request): JsonResponse
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
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '배송지 삭제 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Set an address book entry as default
     */
    public function setDefault(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $addressBook = AddressBook::where('user_id', $user->id)
                ->findOrFail($id);

            DB::transaction(function () use ($user, $id, $addressBook) {
                // Unset all other defaults for this user
                AddressBook::where('user_id', $user->id)
                    ->where('id', '!=', $id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);

                // Set this one as default
                $addressBook->update(['is_default' => true]);
            });

            return response()->json([
                'success' => true,
                'message' => '기본 배송지로 설정되었습니다.',
                'data' => [
                    'address_book' => new AddressBookResource($addressBook->fresh()),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '배송지를 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '기본 배송지 설정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
