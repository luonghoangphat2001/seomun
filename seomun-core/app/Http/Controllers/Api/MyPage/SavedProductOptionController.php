<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\MyPage\AddSavedProductOptionsToCartRequest;
use App\Http\Requests\MyPage\StoreSavedProductOptionRequest;
use App\Http\Resources\CartItemResource;
use App\Http\Resources\SavedProductOptionResource;
use App\Models\ProductOption;
use App\Models\SavedProductOption;
use App\Services\MyPage\MyPageCartService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SavedProductOptionController extends BaseController
{
    public function __construct(
        protected PaginationService $paginationService,
        protected MyPageCartService $cartService
    ) {}

    /**
     * 저장한 옵션 목록 (필터: 기간, 상품, 주문명/요약 검색) — 만료 전 항목만.
     * GET /api/mypage/saved-options
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $perPage = max(1, min(100, (int) $request->input('per_page', 10)));

            $query = SavedProductOption::query()
                ->forUser($user->id)
                ->notExpired()
                ->with(['product:id,name,slug,is_active'])
                ->orderByDesc('created_at');

            if ($request->filled('start_date')) {
                $query->whereDate('created_at', '>=', $request->input('start_date'));
            }
            if ($request->filled('end_date')) {
                $query->whereDate('created_at', '<=', $request->input('end_date'));
            }
            if ($request->filled('product_id')) {
                $query->where('product_id', $request->input('product_id'));
            }

            if ($request->filled('search')) {
                $term = $request->input('search');
                $query->where(function ($q) use ($term) {
                    $q->where('order_name', 'like', "%{$term}%")
                        ->orWhere('notes', 'like', "%{$term}%")
                        ->orWhere('summary_text', 'like', "%{$term}%")
                        ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$term}%"));
                });
            }

            $paginator = $query->paginate($perPage);

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'saved_options' => SavedProductOptionResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            Log::error('List saved product options failed', [
                'user_id' => $request->user()->id ?? null,
                'error'   => $e->getMessage(),
            ]);

            return $this->responseError(500, '저장한 옵션 목록을 불러오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * 상품 구성 저장 (디자인 파일은 저장하지 않음).
     * POST /api/mypage/saved-options
     */
    public function store(StoreSavedProductOptionRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();
            $options = collect($validated['options'] ?? []);

            $optionIds = $options->pluck('option_id');

            $productOptions = ProductOption::with('group')
                ->whereIn('id', $optionIds)
                ->get()
                ->keyBy('id');

            $optionDetail = $options->map(function ($item) use ($productOptions) {
                $option = $productOptions[$item['option_id']] ?? null;
                return [
                    'group' => [
                        'id' => $option?->group?->id,
                        'name' => $option?->group?->name,
                        'code' => $option?->group?->code,
                    ],
                    'option' => [
                        'id' => $option?->id,
                        'label' => $option?->label,
                        'value' => $option?->value,
                    ],
                ];
            });

            $saved = SavedProductOption::create([
                'user_id' => $user->id,
                'product_id' => $validated['product_id'],
                'order_name' => $validated['order_name'] ?? null,
                'detail' => $optionDetail,
                'quantity' => $validated['quantity'],
                'number_of_cases' => $validated['number_of_cases'] ?? 1,
                'options' => $validated['options'] ?? null,
                'input_options' => $validated['input_options'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            $saved->load(['product:id,name,slug']);

            return response()->json([
                'success' => true,
                'message' => '옵션이 저장되었습니다.',
                'data' => [
                    'saved_option' => new SavedProductOptionResource($saved),
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Store saved product option failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '옵션 저장 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 저장 옵션을 장바구니로 옮김 — 금액은 현행 단가표 기준으로 재계산됨.
     * POST /api/mypage/saved-options/add-to-cart
     */
    public function addToCart(AddSavedProductOptionsToCartRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $ids = $request->validated()['saved_option_ids'];

            $position = array_flip($ids);

            $saved = SavedProductOption::query()
                ->forUser($user->id)
                ->notExpired()
                ->whereIn('id', $ids)
                ->get()
                ->sortBy(fn (SavedProductOption $m) => $position[$m->id] ?? PHP_INT_MAX)
                ->values();

            if ($saved->count() !== count($ids)) {
                return response()->json([
                    'success' => false,
                    'message' => '일부 저장 옵션을 찾을 수 없거나 만료되었습니다.',
                ], 404);
            }

            $cartItems = [];

            DB::beginTransaction();
            try {
                foreach ($saved as $row) {
                    $payload = [
                        'product_id' => $row->product_id,
                        'product_quantity_price_id' => $row->product_quantity_price_id,
                        'quantity' => $row->quantity,
                        'number_of_cases' => $row->number_of_cases,
                        'options' => $row->options,
                        'notes' => $row->notes,
                    ];
                    if (is_array($row->design_ids) && $row->design_ids !== []) {
                        $payload['design_ids'] = $row->design_ids;
                    } elseif ($row->design_id) {
                        $payload['design_id'] = $row->design_id;
                    }

                    $cartItems[] = $this->cartService->addItem($user, $payload);
                }
                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                throw $e;
            }

            return response()->json([
                'success' => true,
                'message' => '선택한 옵션이 장바구니에 담겼습니다.',
                'data' => [
                    'cart_items' => array_map(
                        fn (CartItemResource $r) => $r->toArray($request),
                        $cartItems
                    ),
                ],
            ], 201);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '상품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Add saved options to cart failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $message = str_contains($e->getMessage(), 'No query results')
                ? '상품을 찾을 수 없거나 판매 중이 아닙니다.'
                : '장바구니 담기 중 오류가 발생했습니다.';

            return response()->json([
                'success' => false,
                'message' => $message,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * DELETE /api/mypage/saved-options/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $row = SavedProductOption::query()
                ->forUser($user->id)
                ->whereKey($id)
                ->firstOrFail();

            $row->delete();

            return response()->json([
                'success' => true,
                'message' => '저장한 옵션이 삭제되었습니다.',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '저장한 옵션을 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Delete saved product option failed', [
                'user_id' => $request->user()->id,
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '삭제 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
