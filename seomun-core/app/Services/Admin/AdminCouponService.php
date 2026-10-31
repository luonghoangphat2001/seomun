<?php

namespace App\Services\Admin;

use App\Enums\CouponTargetType;
use App\Enums\UserAuthority;
use App\Enums\UserCouponStatus;
use App\Enums\UserStatus;
use App\Models\Coupon;
use App\Models\User;
use App\Models\UserCoupon;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;

class AdminCouponService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for coupons.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        return [
            'discount_type_options' => [
                ['value' => 'percentage', 'label' => '정률 할인 (%)'],
                ['value' => 'fixed', 'label' => '정액 할인 (원)'],
            ],
            'status_options' => [
                ['value' => '1', 'label' => '활성'],
                ['value' => '0', 'label' => '비활성'],
            ],
            'validity_options' => [
                ['value' => 'all', 'label' => '전체'],
                ['value' => 'valid', 'label' => '유효'],
                ['value' => 'expired', 'label' => '만료'],
                ['value' => 'upcoming', 'label' => '예정'],
            ],
            'target_type_options' => CouponTargetType::options(),
        ];
    }

    /**
     * Get paginated coupons with filters.
     *
     * @param array<string, mixed> $filters
     */
    public function getCoupons(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = Coupon::query()->withCount('userCoupons');

        if (! empty($filters['search_term'])) {
            $term = trim($filters['search_term']);
            $query->where(function ($q) use ($term) {
                $q->where('code', 'like', "%{$term}%")
                  ->orWhere('name', 'like', "%{$term}%");
            });
        }

        if (! empty($filters['discount_type'])) {
            $query->where('discount_type', $filters['discount_type']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== null && $filters['is_active'] !== '') {
            $isActive = filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        if (! empty($filters['validity_status'])) {
            match ($filters['validity_status']) {
                'valid' => $query->where('is_active', true)
                    ->where(function ($q) {
                        $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
                    })
                    ->where(function ($q) {
                        $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
                    })
                    ->where(function ($q) {
                        $q->whereNull('usage_limit')->orWhereColumn('usage_count', '<', 'usage_limit');
                    }),
                'expired' => $query->where(function ($q) {
                    $q->where('expires_at', '<', now())
                      ->orWhere(function ($sub) {
                          $sub->whereNotNull('usage_limit')->whereColumn('usage_count', '>=', 'usage_limit');
                      });
                }),
                'upcoming' => $query->where('starts_at', '>', now()),
                default => null,
            };
        }

        if (! empty($filters['starts_at_from'])) {
            $query->where('starts_at', '>=', $filters['starts_at_from']);
        }

        if (! empty($filters['starts_at_to'])) {
            $query->where('starts_at', '<=', $filters['starts_at_to']);
        }

        if (! empty($filters['expires_at_from'])) {
            $query->where('expires_at', '>=', $filters['expires_at_from']);
        }

        if (! empty($filters['expires_at_to'])) {
            $query->where('expires_at', '<=', $filters['expires_at_to']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $page = $filters['current_page'] ?? $filters['page'] ?? null;

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get single coupon detail.
     */
    public function getCoupon(int $id): Coupon
    {
        return Coupon::query()
            ->withCount([
                'userCoupons',
                'userCoupons as used_user_coupons_count' => fn ($query) => $query->where('status', UserCouponStatus::USED->value),
                'userCoupons as available_user_coupons_count' => fn ($query) => $query->where('status', UserCouponStatus::AVAILABLE->value),
                'userCoupons as upcoming_user_coupons_count' => fn ($query) => $query->where('status', UserCouponStatus::UPCOMING->value),
                'userCoupons as expired_user_coupons_count' => fn ($query) => $query->where('status', UserCouponStatus::EXPIRED->value),
            ])
            ->findOrFail($id);
    }

    /**
     * Get the users to whom a coupon was issued, including its current usage.
     *
     * @param array<string, mixed> $filters
     */
    public function getCouponIssuances(int $couponId, array $filters, int $perPage = 20): LengthAwarePaginator
    {
        Coupon::findOrFail($couponId);

        $query = UserCoupon::query()
            ->where('coupon_id', $couponId)
            ->with([
                'user:id,username,name,email,mobile,customer_id',
                'user.customer:id,company_name',
                'order:id,order_number,status,total_amount,discount_amount',
            ]);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $term = trim($filters['search']);
            $query->whereHas('user', function ($userQuery) use ($term) {
                $userQuery->where(function ($searchQuery) use ($term) {
                    $searchQuery->where('username', 'like', "%{$term}%")
                        ->orWhere('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%")
                        ->orWhere('mobile', 'like', "%{$term}%");
                });
            });
        }

        if (! empty($filters['received_from'])) {
            $query->where('received_at', '>=', $filters['received_from']);
        }

        if (! empty($filters['received_to'])) {
            $query->where('received_at', '<=', $filters['received_to']);
        }

        if (! empty($filters['used_from'])) {
            $query->where('used_at', '>=', $filters['used_from']);
        }

        if (! empty($filters['used_to'])) {
            $query->where('used_at', '<=', $filters['used_to']);
        }

        $sortBy = $filters['sort_by'] ?? 'received_at';
        $sortOrder = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortOrder)->paginate($perPage);
    }

    /**
     * Create a new coupon.
     *
     * @param array<string, mixed> $data
     */
    public function createCoupon(array $data): Coupon
    {
        return Coupon::create($data);
    }

    /**
     * Update an existing coupon.
     *
     * @param array<string, mixed> $data
     */
    public function updateCoupon(int $id, array $data): Coupon
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->update($data);

        return $coupon->fresh()->loadCount('userCoupons');
    }

    /**
     * Delete a coupon (soft delete).
     */
    public function deleteCoupon(int $id): bool
    {
        $coupon = Coupon::findOrFail($id);

        return (bool) $coupon->delete();
    }

    /**
     * Update coupon active status.
     */
    public function updateStatus(int $id, bool $isActive): Coupon
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->update(['is_active' => $isActive]);

        return $coupon->fresh()->loadCount('userCoupons');
    }

    /**
     * Issue coupon to target users.
     *
     * @param int $couponId
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     * @throws \Exception
     */
    public function issueCoupon(int $couponId, array $data): array
    {
        $coupon = Coupon::findOrFail($couponId);

        if (! $coupon->isClaimable()) {
            throw new \Exception('수령 기간이 아니거나 발급할 수 없는 쿠폰입니다.', 422);
        }

        $targetType = CouponTargetType::tryFrom($data['target_type'] ?? '') ?? CouponTargetType::SPECIFIC_USERS;

        $targetUserIds = match ($targetType) {
            CouponTargetType::SPECIFIC_USERS => array_values(array_unique(array_map('intval', $data['user_ids'] ?? []))),
            CouponTargetType::MEMBERSHIP_TIER => User::where('membership_tier_id', $data['membership_tier_id'])
                ->where('status', UserStatus::ACTIVE->value)
                ->pluck('id')
                ->toArray(),
            CouponTargetType::CUSTOMER => User::where('customer_id', $data['customer_id'])
                ->where('status', UserStatus::ACTIVE->value)
                ->pluck('id')
                ->toArray(),
            CouponTargetType::ALL_USERS => User::where('authority', UserAuthority::USER->value)
                ->where('status', UserStatus::ACTIVE->value)
                ->pluck('id')
                ->toArray(),
        };

        if (empty($targetUserIds)) {
            return [
                'total_targets' => 0,
                'issued_count' => 0,
                'skipped_count' => 0,
                'skipped_user_ids' => [],
            ];
        }

        // Find users who already have this coupon
        $alreadyIssuedUserIds = UserCoupon::where('coupon_id', $coupon->id)
            ->whereIn('user_id', $targetUserIds)
            ->pluck('user_id')
            ->map(fn ($id) => (int) $id)
            ->toArray();

        $userIdsToIssue = array_values(array_diff($targetUserIds, $alreadyIssuedUserIds));

        // Insert new records
        if (! empty($userIdsToIssue)) {
            $now = now();
            $initialStatus = ($coupon->starts_at && $coupon->starts_at->isFuture())
                ? UserCouponStatus::UPCOMING->value
                : UserCouponStatus::AVAILABLE->value;

            $records = array_map(fn ($userId) => [
                'user_id' => $userId,
                'coupon_id' => $coupon->id,
                'received_at' => $now,
                'status' => $initialStatus,
                'created_at' => $now,
                'updated_at' => $now,
            ], $userIdsToIssue);

            foreach (array_chunk($records, 500) as $chunk) {
                UserCoupon::insert($chunk);
            }
        }

        return [
            'total_targets' => count($targetUserIds),
            'issued_count' => count($userIdsToIssue),
            'skipped_count' => count($alreadyIssuedUserIds),
            'skipped_user_ids' => $alreadyIssuedUserIds,
        ];
    }
}
