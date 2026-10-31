<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\PointCategory;
use App\Enums\PointTransactionType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\Admin\AdminPointTransactionResource;
use App\Models\PointTransaction;
use App\Models\User;
use App\Services\PaginationService;
use App\Services\PointBalanceService;
use App\Services\PointTransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class AdminPointController extends BaseController
{
    public function __construct(
        protected PointTransactionService $transactionService,
        protected PaginationService $paginationService,
        protected PointBalanceService $pointBalanceService
    ) {}

    public function adjust(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'amount' => ['required', 'integer'],
            'type' => ['required', 'string', Rule::in(['grant', 'deduct'])],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $user = User::findOrFail($validated['user_id']);
            $isGrant = $validated['type'] === 'grant';

            if ($isGrant) {
                $transaction = $this->transactionService->earn(
                    user: $user,
                    type: PointTransactionType::EARN,
                    category: PointCategory::MANUAL,
                    amount: $validated['amount'],
                    referenceId: 'ADMIN_GRANT_'.uniqid(),
                    parentId: null,
                    description: $validated['description'] ?? '관리자 포인트 지급',
                    createdBy: $request->user(),
                    order: null
                );
                $message = '포인트가 성공적으로 지급되었습니다.';
            } else {
                $transaction = $this->transactionService->deduct(
                    user: $user,
                    amount: $validated['amount'],
                    description: $validated['description'] ?? '관리자 포인트 차감',
                    createdBy: $request->user()
                );
                $message = '포인트가 성공적으로 차감되었습니다.';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'transaction_id' => $transaction->id,
                    'user_id' => $user->id,
                    'amount' => $isGrant ? $validated['amount'] : -$validated['amount'],
                    'balance_after' => $transaction->balance_after,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Admin adjust points failed', [
                'admin_id' => $request->user()->id ?? null,
                'target_user_id' => $validated['user_id'] ?? null,
                'amount' => $validated['amount'] ?? null,
                'type' => $validated['type'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '포인트 조정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function searchFilters(): JsonResponse
    {
        $typeOptions = array_map(
            fn (PointTransactionType $t) => ['value' => $t->value, 'label' => $t->label()],
            PointTransactionType::cases()
        );

        $categoryOptions = array_map(
            fn (PointCategory $c) => ['value' => $c->value, 'label' => $c->label()],
            PointCategory::cases()
        );

        $periodOptions = [
            ['value' => 'today', 'label' => 'Today'],
            ['value' => 'yesterday', 'label' => 'Yesterday'],
            ['value' => '1_week', 'label' => '1 Week'],
            ['value' => '1_month', 'label' => '1 Month'],
            ['value' => '3_months', 'label' => '3 Months'],
            ['value' => '6_months', 'label' => '6 Months'],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'type_options' => array_merge(
                    [['value' => 'all', 'label' => 'All']],
                    $typeOptions
                ),
                'category_options' => array_merge(
                    [['value' => 'all', 'label' => 'All']],
                    $categoryOptions
                ),
                'period_options' => $periodOptions,
            ],
        ]);
    }

    public function getUserBalance(int $userId): JsonResponse
    {
        try {
            $point = $this->pointBalanceService->getBalanceByUserId($userId);

            $balance = $point->balance;

            return response()->json([
                'success' => true,
                'data' => [
                    'user_id' => $userId,
                    'balance' => $balance,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get user point balance failed', [
                'user_id' => $userId ?? null,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '포인트 잔액 조회 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function history(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['nullable', new Enum(PointCategory::class)],
            'type' => ['nullable', new Enum(PointTransactionType::class)],
            'order_number' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'name' => ['nullable', 'string'],
            'contact' => ['nullable', 'string'],
            'user_id_input' => ['nullable', 'string'],
            'email' => ['nullable', 'string'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        try {
            $filters = [
                'category' => $validated['category'] ?? 'all',
                'type' => $validated['type'] ?? 'all',
                'order_number' => $validated['order_number'] ?? null,
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'name' => $validated['name'] ?? null,
                'contact' => $validated['contact'] ?? null,
                'user_id_input' => $validated['user_id_input'] ?? null,
                'email' => $validated['email'] ?? null,
            ];

            $perPage = (int) ($validated['per_page'] ?? 20);

            $query = PointTransaction::with(['user', 'order', 'creator'])
                ->select('point_transactions.*')
                ->join('users', 'point_transactions.user_id', '=', 'users.id');

            if ($filters['type'] !== 'all') {
                $query->where('point_transactions.type', PointTransactionType::from($filters['type']));
            }

            if ($filters['category'] !== 'all') {
                $query->where('point_transactions.category', PointCategory::from($filters['category']));
            }

            if ($filters['order_number']) {
                $query->whereHas('order', function ($q) use ($filters) {
                    $q->where('order_number', 'like', '%'.$filters['order_number'].'%');
                });
            }

            if ($filters['start_date']) {
                $query->whereDate('point_transactions.created_at', '>=', $filters['start_date']);
            }

            if ($filters['end_date']) {
                $query->whereDate('point_transactions.created_at', '<=', $filters['end_date']);
            }

            if ($filters['name']) {
                $query->where(function ($q) use ($filters) {
                    $q->where('users.name', 'like', '%'.$filters['name'].'%')
                        ->orWhere('users.username', 'like', '%'.$filters['name'].'%');
                });
            }

            if ($filters['contact']) {
                $query->where('users.phone', 'like', '%'.$filters['contact'].'%');
            }

            if ($filters['user_id_input']) {
                $query->where('users.id', 'like', '%'.$filters['user_id_input'].'%');
            }

            if ($filters['email']) {
                $query->where('users.email', 'like', '%'.$filters['email'].'%');
            }

            $results = $query->orderBy('point_transactions.created_at', 'desc')
                ->paginate($perPage);

            return $this->responsePaginatedSuccess(200, '포인트 내역이 성공적으로 조회되었습니다.', [
                'point_transactions' => AdminPointTransactionResource::collection($results),
            ], $this->paginationService->format($results));
        } catch (\Exception $e) {
            Log::error('Get point history failed', [
                'admin_id' => $request->user()->id ?? null,
                'filters' => $validated,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '포인트 사용 내역 조회 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
