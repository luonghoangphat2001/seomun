<?php

namespace App\Services\MyPage;

use App\Enums\UserCouponStatus;
use App\Http\Resources\CouponResource;
use App\Http\Resources\UserCouponResource;
use App\Models\Coupon;
use App\Models\User;
use App\Models\UserCoupon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MyPageCouponService
{
    /**
     * Get user's coupons with filters and badge counts
     */
    public function getUserCoupons(User $user, array $filters = [], int $perPage = 20): array
    {
        try {
            $userCoupons = UserCoupon::forUser($user->id);

            $counts = [
                'all' => (clone $userCoupons)->count(),
                UserCouponStatus::AVAILABLE->value => (clone $userCoupons)->available()->count(),
                UserCouponStatus::USED->value => (clone $userCoupons)->used()->count(),
                UserCouponStatus::EXPIRED->value => (clone $userCoupons)->expired()->count(),
                UserCouponStatus::UPCOMING->value => (clone $userCoupons)->upcoming()->count(),
            ];

            $query = (clone $userCoupons)->with(['coupon', 'order:id,order_number']);

            $status = ! empty($filters['available_only'])
                ? UserCouponStatus::AVAILABLE->value
                : ($filters['status'] ?? null);

            match ($status) {
                UserCouponStatus::AVAILABLE->value => $query->available()
                    ->leftJoin('coupons', 'coupons.id', '=', 'user_coupons.coupon_id')
                    ->orderByRaw('coupons.expires_at IS NULL, coupons.expires_at ASC')
                    ->orderBy('user_coupons.received_at', 'desc')
                    ->select('user_coupons.*'),

                UserCouponStatus::USED->value => $query->used()
                    ->orderBy('used_at', 'desc'),

                UserCouponStatus::EXPIRED->value => $query->expired()
                    ->leftJoin('coupons', 'coupons.id', '=', 'user_coupons.coupon_id')
                    ->orderByRaw('coupons.expires_at IS NULL, coupons.expires_at DESC')
                    ->orderBy('user_coupons.received_at', 'desc')
                    ->select('user_coupons.*'),

                UserCouponStatus::UPCOMING->value => $query->upcoming()
                    ->leftJoin('coupons', 'coupons.id', '=', 'user_coupons.coupon_id')
                    ->orderByRaw('coupons.starts_at ASC')
                    ->orderBy('user_coupons.received_at', 'desc')
                    ->select('user_coupons.*'),

                default => $query->orderBy('received_at', 'desc'),
            };

            $paginator = $query->paginate($perPage);

            // Transform to resource and sync status in DB if needed
            $paginator->getCollection()->transform(function (UserCoupon $item) {
                $actualStatus = $item->getActualStatus();
                if ($item->status !== $actualStatus && $item->status !== UserCouponStatus::USED) {
                    $item->update(['status' => $actualStatus]);
                }

                return new UserCouponResource($item);
            });

            return [
                'paginator' => $paginator,
                'counts' => $counts,
            ];
        } catch (\Exception $e) {
            Log::error('Get user coupons failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get available coupons (coupons user can receive)
     */
    public function getAvailableCoupons(User $user, int $perPage = 20): LengthAwarePaginator
    {
        try {
            // Claim availability is independent from coupon usage availability.
            $coupons = Coupon::claimable()
                ->whereDoesntHave('userCoupons', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->orderBy('sort_order')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            // Transform to resource
            $coupons->getCollection()->transform(function ($item) {
                return new CouponResource($item);
            });

            return $coupons;
        } catch (\Exception $e) {
            Log::error('Get available coupons failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Claim a coupon for user
     */
    public function claimCoupon(User $user, int $couponId): UserCoupon
    {
        try {
            DB::beginTransaction();

            $coupon = Coupon::findOrFail($couponId);

            if (! $coupon->isClaimable()) {
                throw new \Exception('쿠폰을 받을 수 없습니다. (수령 기간이 아니거나 발급할 수 없는 쿠폰입니다)');
            }

            // Check if user already has this coupon
            $existingUserCoupon = UserCoupon::where('user_id', $user->id)
                ->where('coupon_id', $couponId)
                ->first();

            if ($existingUserCoupon) {
                throw new \Exception('이미 받은 쿠폰입니다.');
            }

            $initialStatus = ($coupon->starts_at && $coupon->starts_at->isFuture())
                ? UserCouponStatus::UPCOMING
                : UserCouponStatus::AVAILABLE;

            // Create user coupon
            $userCoupon = UserCoupon::create([
                'user_id' => $user->id,
                'coupon_id' => $couponId,
                'received_at' => now(),
                'status' => $initialStatus,
            ]);

            DB::commit();

            // Load relationships
            $userCoupon->load(['coupon', 'order']);

            return $userCoupon;
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            throw new \Exception('쿠폰을 찾을 수 없습니다.', 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Claim coupon failed', [
                'user_id' => $user->id,
                'coupon_id' => $couponId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Register a coupon by coupon code (쿠폰 코드로 등록)
     */
    public function registerCouponByCode(User $user, string $code): UserCoupon
    {
        try {
            DB::beginTransaction();

            $code = trim($code);
            $coupon = Coupon::where('code', $code)->first();

            if (! $coupon) {
                throw new \Exception('유효하지 않은 쿠폰 코드입니다.', 404);
            }

            if (! $coupon->isClaimable()) {
                throw new \Exception('등록할 수 없는 쿠폰입니다. (수령 기간이 아니거나 발급할 수 없는 쿠폰입니다)', 400);
            }

            // Check if user already has this coupon
            $existingUserCoupon = UserCoupon::where('user_id', $user->id)
                ->where('coupon_id', $coupon->id)
                ->first();

            if ($existingUserCoupon) {
                throw new \Exception('이미 등록된 쿠폰입니다.', 400);
            }

            $initialStatus = ($coupon->starts_at && $coupon->starts_at->isFuture())
                ? UserCouponStatus::UPCOMING
                : UserCouponStatus::AVAILABLE;

            // Create user coupon
            $userCoupon = UserCoupon::create([
                'user_id' => $user->id,
                'coupon_id' => $coupon->id,
                'received_at' => now(),
                'status' => $initialStatus,
            ]);

            DB::commit();

            // Load relationships
            $userCoupon->load(['coupon', 'order']);

            return $userCoupon;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Register coupon failed', [
                'user_id' => $user->id,
                'code' => $code,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get benefits information for user
     */
    public function getBenefits(User $user): array
    {
        try {
            $userCoupons = UserCoupon::forUser($user->id);

            $availableToClaimCount = Coupon::claimable()
                ->whereDoesntHave('userCoupons', fn ($query) => $query->where('user_id', $user->id))
                ->count();

            return [
                'available_coupons' => (clone $userCoupons)->available()->count(),
                'used_coupons' => (clone $userCoupons)->used()->count(),
                'expired_coupons' => (clone $userCoupons)->expired()->count(),
                'upcoming_coupons' => (clone $userCoupons)->upcoming()->count(),
                'total_coupons' => (clone $userCoupons)->count(),
                'available_to_claim' => $availableToClaimCount,
                // Future: Add loyalty points, membership tier, etc.
            ];
        } catch (\Exception $e) {
            Log::error('Get benefits failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get applicable and inapplicable coupons for a given order amount (after tax).
     *
     * @return array{base_amount: float, applicable: array, inapplicable: array}
     */
    public function getApplicableCoupons(User $user, float $baseAmountAfterTax): array
    {
        try {
            $userCoupons = UserCoupon::forUser($user->id)
                ->available()
                ->with('coupon')
                ->get();

            $applicable = [];
            $inapplicable = [];

            foreach ($userCoupons as $userCoupon) {
                if ($userCoupon->isExpired()) {
                    if ($userCoupon->status !== UserCouponStatus::EXPIRED) {
                        $userCoupon->update(['status' => UserCouponStatus::EXPIRED]);
                    }
                    continue;
                }

                $actualStatus = $userCoupon->getActualStatus();
                if ($userCoupon->status !== $actualStatus) {
                    $userCoupon->update(['status' => $actualStatus]);
                    $userCoupon->refresh();
                }

                if ($userCoupon->isUpcoming()) {
                    if ($userCoupon->status !== UserCouponStatus::UPCOMING) {
                        $userCoupon->update(['status' => UserCouponStatus::UPCOMING]);
                    }
                    continue;
                }

                if (! $userCoupon->coupon
                    || ! $userCoupon->coupon->isValid()
                    || $userCoupon->status !== UserCouponStatus::AVAILABLE) {
                    continue;
                }

                $coupon = $userCoupon->coupon;
                $minOrderAmount = (float) $coupon->min_order_amount;
                $discount = $coupon->calculateDiscount($baseAmountAfterTax);

                $couponData = [
                    'user_coupon_id' => $userCoupon->id,
                    'coupon_id' => $coupon->id,
                    'code' => $coupon->code,
                    'name' => $coupon->name,
                    'description' => $coupon->description,
                    'discount_type' => $coupon->discount_type,
                    'discount_value' => (float) $coupon->discount_value,
                    'min_order_amount' => $minOrderAmount,
                    'max_discount_amount' => $coupon->max_discount_amount ? (float) $coupon->max_discount_amount : null,
                    'calculated_discount' => round($discount),
                    'expires_at' => $coupon->expires_at?->toISOString(),
                ];

                if ($baseAmountAfterTax >= $minOrderAmount) {
                    $applicable[] = $couponData;
                } else {
                    $couponData['missing_amount'] = round($minOrderAmount - $baseAmountAfterTax);
                    $couponData['reason'] = '최소 주문 금액 미달';
                    $inapplicable[] = $couponData;
                }
            }

            usort($applicable, fn ($a, $b) => $b['calculated_discount'] <=> $a['calculated_discount']);

            return [
                'base_amount' => round($baseAmountAfterTax),
                'applicable' => $applicable,
                'inapplicable' => $inapplicable,
            ];
        } catch (\Exception $e) {
            Log::error('Get applicable coupons failed', [
                'user_id' => $user->id,
                'base_amount' => $baseAmountAfterTax,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Validate user coupon and calculate discount against base amount after tax.
     *
     * @return array{valid: bool, discount: float, user_coupon: ?UserCoupon, summary: ?array}
     *
     * @throws \InvalidArgumentException
     */
    public function validateAndCalculateDiscount(?User $user, ?int $userCouponId, float $baseAmountAfterTax): array
    {
        if (empty($userCouponId)) {
            return [
                'valid' => true,
                'discount' => 0.0,
                'user_coupon' => null,
                'summary' => null,
            ];
        }

        if (! $user) {
            throw new \InvalidArgumentException('쿠폰은 로그인 후 이용 가능합니다.');
        }

        $userCoupon = UserCoupon::with('coupon')
            ->where('id', $userCouponId)
            ->where('user_id', $user->id)
            ->first();

        if (! $userCoupon) {
            throw new \InvalidArgumentException('존재하지 않거나 해당 사용자의 쿠폰이 아닙니다.');
        }

        if ($userCoupon->status === UserCouponStatus::USED) {
            throw new \InvalidArgumentException('이미 사용된 쿠폰입니다.');
        }

        if ($userCoupon->isExpired()) {
            if ($userCoupon->status !== UserCouponStatus::EXPIRED) {
                $userCoupon->update(['status' => UserCouponStatus::EXPIRED]);
            }
            throw new \InvalidArgumentException('유효기간이 만료되었거나 비활성화된 쿠폰입니다.');
        }

        $actualStatus = $userCoupon->getActualStatus();
        if ($userCoupon->status !== $actualStatus) {
            $userCoupon->update(['status' => $actualStatus]);
            $userCoupon->refresh();
        }

        if ($userCoupon->isUpcoming()) {
            if ($userCoupon->status !== UserCouponStatus::UPCOMING) {
                $userCoupon->update(['status' => UserCouponStatus::UPCOMING]);
            }
            throw new \InvalidArgumentException('아직 사용 기간이 되지 않은 쿠폰입니다.');
        }

        if (! $userCoupon->coupon || ! $userCoupon->coupon->isValid() || $userCoupon->status !== UserCouponStatus::AVAILABLE) {
            throw new \InvalidArgumentException('사용할 수 없는 상태의 쿠폰입니다.');
        }

        $coupon = $userCoupon->coupon;
        $minOrderAmount = (float) $coupon->min_order_amount;

        if ($baseAmountAfterTax < $minOrderAmount) {
            throw new \InvalidArgumentException(sprintf(
                '최소 주문 금액(%s원)을 충족하지 않아 쿠폰을 사용할 수 없습니다.',
                number_format($minOrderAmount)
            ));
        }

        $discount = $coupon->calculateDiscount($baseAmountAfterTax);

        return [
            'valid' => true,
            'discount' => round($discount),
            'user_coupon' => $userCoupon,
            'summary' => [
                'user_coupon_id' => $userCoupon->id,
                'coupon_id' => $coupon->id,
                'code' => $coupon->code,
                'name' => $coupon->name,
                'discount_type' => $coupon->discount_type,
                'discount_value' => (float) $coupon->discount_value,
                'discount_amount' => round($discount),
            ],
        ];
    }
}
