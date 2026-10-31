<?php

namespace App\Services;

use App\Enums\PointCategory;
use App\Enums\PointTransactionType;
use App\Models\Order;
use App\Models\PointTransaction;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PointTransactionService
{
    public function __construct(
        protected PointBalanceService $balanceService,
        protected PointSettingsService $settingsService
    ) {}

    public function getTransactions(User $user, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = PointTransaction::with(['parent', 'creator', 'order', 'user.MembershipTier'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if (isset($filters['type']) && $filters['type'] !== null) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['category']) && $filters['category'] !== null) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['start_date']) && $filters['start_date'] !== null) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date']) && $filters['end_date'] !== null) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        if (isset($filters['search']) && $filters['search'] !== null) {
            $query->whereHas('order', function ($q) use ($filters) {
                $q->where('order_number', 'like', '%'.$filters['search'].'%')
                  ->orWhere('product_name', 'like', '%'.$filters['search'].'%');
            });
        }

        if (isset($filters['order_number']) && $filters['order_number'] !== null) {
            $query->whereHas('order', function ($q) use ($filters) {
                $q->where('order_number', 'like', '%'.$filters['order_number'].'%');
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * =========================
     * EARN
     * =========================
     */
    public function earn(
        User $user,
        PointTransactionType $type,
        PointCategory $category,
        int $amount,
        ?string $referenceId = null,
        ?int $parentId = null,
        ?string $description = null,
        ?User $createdBy = null,
        ?Order $order = null
    ): PointTransaction {
        return DB::transaction(function () use (
            $user,
            $type,
            $category,
            $amount,
            $referenceId,
            $parentId,
            $description,
            $createdBy,
            $order
        ) {

            $balance = $this->balanceService->getBalanceForUpdate($user);

            if ($amount <= 0) {
                throw new \InvalidArgumentException('Amount must be greater than 0');
            }

            // idempotency
            if ($referenceId) {
                $exists = PointTransaction::query()
                    ->where('user_id', $user->id)
                    ->where('reference_id', $referenceId)
                    ->where('category', $category)
                    ->exists();

                if ($exists) {
                    throw new \Exception('Duplicate transaction');
                }
            }

            // monthly limit
            $setting = $this->settingsService->getSettings();

            if ($setting->monthly_reward_limit) {
                $earned = PointTransaction::query()
                    ->where('user_id', $user->id)
                    ->where('type', PointTransactionType::EARN)
                    ->whereMonth('created_at', now()->month)
                    ->sum('amount');

                if (($earned + $amount) > $setting->monthly_reward_limit) {
                    throw new \Exception('Monthly reward limit exceeded');
                }
            }

            $expiredAt = now()->addMonths(12);
            $newBalance = $balance + $amount;

            $tx = PointTransaction::create([
                'user_id' => $user->id,
                'type' => $type,
                'amount' => $amount,
                'remaining_amount' => $amount,
                'balance_after' => $newBalance,
                'category' => $category,
                'reference_id' => $referenceId,
                'parent_id' => $parentId,
                'expired_at' => $expiredAt,
                'description' => $description,
                'created_by' => $createdBy?->id,
                'order_id' => $order?->id,
            ]);

            $this->balanceService->updateBalance($user, $newBalance);

            return $tx;
        });
    }

    /**
     * =========================
     * 💸 USE (FIFO)
     * =========================
     */
    public function use(
        User $user,
        int $amount,
        int $orderAmount,
        Order $order,
    ): PointTransaction {
        return DB::transaction(function () use ($user, $amount, $orderAmount, $order) {

            $setting = $this->settingsService->getSettings();
            $balance = $this->balanceService->getBalanceForUpdate($user);

            if ($amount <= 0) {
                throw new \InvalidArgumentException('Invalid amount');
            }

            if ($balance < $amount) {
                throw new \Exception('Not enough points');
            }

            // rule: min order
            if (
                $setting->enable_payment_restriction &&
                $orderAmount < $setting->min_order_amount_to_use
            ) {
                throw new \Exception('Order amount too low');
            }

            // rule: %
            if ($setting->enable_point_restriction && $amount < (($orderAmount * $setting->max_point_usage_percent) / 100)) {
                throw new \Exception('Order amount too low');
            }

            // rule: fixed max
            if ($setting->enable_point_restriction && $amount < $setting->max_point_usage_amount) {
                throw new \Exception('Order amount too low');
            }

            // FIFO
            $earns = PointTransaction::query()
                ->where('user_id', $user->id)
                ->where('type', PointTransactionType::EARN)
                ->where('remaining_amount', '>', 0)
                ->where(function ($q) {
                    $q->whereNull('expired_at')
                        ->orWhere('expired_at', '>', now()->startOfDay());
                })
                ->orderBy('expired_at')
                ->lockForUpdate()
                ->get();

            $remaining = $amount;
            $details = [];

            foreach ($earns as $earn) {
                if ($remaining <= 0) {
                    break;
                }

                $deduct = min($earn->remaining_amount, $remaining);

                $earn->decrement('remaining_amount', $deduct);

                $remaining -= $deduct;

                $details[] = [
                    'earn_id' => $earn->id,
                    'amount' => $deduct,
                ];
            }

            if ($remaining > 0) {
                throw new \Exception('Not enough usable points');
            }

            $newBalance = $balance - $amount;

            $useTx = PointTransaction::create([
                'user_id' => $user->id,
                'type' => PointTransactionType::USE,
                'amount' => -$amount,
                'remaining_amount' => 0,
                'balance_after' => $newBalance,
                'category' => PointCategory::ORDER,
                'order_id' => $order?->id,
            ]);

            $this->balanceService->updateBalance($user, $newBalance);

            return $useTx;
        });
    }

    /**
     * =========================
     * EXPIRE (CRON) - Daily at 00:01
     * =========================
     */
    public function expire(int $chunkSize = 100): int
    {
        $totalExpired = 0;

        PointTransaction::query()
            ->where('type', PointTransactionType::EARN)
            ->where('remaining_amount', '>', 0)
            ->where('expired_at', '<=', now())
            ->chunk($chunkSize, function ($earns) use (&$totalExpired) {
                foreach ($earns as $earn) {
                    $user = $earn->user;
                    if (! $user) {
                        continue;
                    }

                    $balance = $this->balanceService->getBalanceForUpdate($user);
                    $expireAmount = $earn->remaining_amount;

                    $earn->update(['remaining_amount' => 0]);
                    $newBalance = $balance - $expireAmount;

                    PointTransaction::create([
                        'user_id' => $user->id,
                        'type' => PointTransactionType::EXPIRE,
                        'amount' => -$expireAmount,
                        'remaining_amount' => 0,
                        'balance_after' => $newBalance,
                        'category' => PointCategory::EXPIRE,
                        'parent_id' => $earn->id,
                    ]);

                    $this->balanceService->updateBalance($user, $newBalance);
                    $totalExpired++;
                }
            });

        if ($totalExpired > 0) {
            Log::info("Expired {$totalExpired} point transactions");
        }

        return $totalExpired;
    }

    public function awardSignupReward(User $user, ?User $createdBy = null): ?PointTransaction
    {
        $setting = $this->settingsService->getSettings();

        if ($setting->signup_reward <= 0) {
            return null;
        }

        // check duplicate (idempotent)
        $exists = PointTransaction::query()
            ->where('user_id', $user->id)
            ->where('category', PointCategory::SIGNUP)
            ->exists();

        if ($exists) {
            return null;
        }

        return $this->earn(
            user: $user,
            type: PointTransactionType::EARN,
            category: PointCategory::SIGNUP,
            amount: $setting->signup_reward,
            referenceId: 'SIGNUP_'.$user->id,
            parentId: null,
            description: 'Signup reward',
            createdBy: $createdBy,
            order: null
        );
    }

    public function awardOrderPoints(Order $order, ?User $createdBy = null): array
    {
        $setting = $this->settingsService->getSettings();

        $user = $order->user;
        if (! $user || ! $user->membershipTier || ! $user->membershipTier->is_active || $user->membershipTier->accumulation_rate === 0) {
            return [];
        }

        $referenceId = "ORDER_{$order->id}";

        $exists = PointTransaction::query()
            ->where('user_id', $user->id)
            ->where('reference_id', $referenceId)
            ->where('category', PointCategory::ORDER)
            ->exists();

        if ($exists) {
            return [];
        }

        $points = ($order->metadata['estimated_points_earned'] ?? null) 
            ?: $this->calcOrderPoints($user, (int) $order->subtotal_amount, (int) $order->discount_amount, (int) $order->point_discount);

        $order_reward = (int) $points;
        $results['order_reward'] = $this->earn(
            user: $user,
            type: PointTransactionType::EARN,
            category: PointCategory::ORDER,
            amount: $order_reward,
            referenceId: $referenceId,
            parentId: null,
            description: "Order reward (order: {$order->order_number})",
            createdBy: $createdBy,
            order: $order
        );

        return $results;
    }

    public function calcOrderPoints(User $user, int $subtotal_amount, int $discount_amount, int $point_discount = 0): int
    {
        $setting = $this->settingsService->getSettings();

        if (! $user || ! $user->membershipTier || ! $user->membershipTier->is_active || $user->membershipTier->accumulation_rate === 0) {
            return 0;
        }

        $order_reward = ($subtotal_amount - $discount_amount - $point_discount) * $user->membershipTier->accumulation_rate / 100;
        return (int) $order_reward;
    }

    public function awardInvitePoints(
        User $inviter,
        User $invited,
        ?User $createdBy = null
    ): array {
        $setting = $this->settingsService->getSettings();

        $results = [];

        // idempotency key
        $referenceId = "INVITE_{$inviter->id}_{$invited->id}";

        // check rewarded?
        $exists = PointTransaction::query()
            ->where('reference_id', $referenceId)
            ->exists();

        if ($exists) {
            return $results;
        }

        // reward inviter
        if ($setting->invite_reward_inviter > 0) {
            $results['inviter'] = $this->earn(
                user: $inviter,
                type: PointTransactionType::EARN,
                category: PointCategory::INVITE,
                amount: $setting->invite_reward_inviter,
                parentId: null,
                referenceId: $referenceId,
                description: "Invite reward (inviter: {$inviter->id}, invited: {$invited->id})",
                createdBy: $createdBy,
                order: null
            );
        }

        // reward invited
        if ($setting->invite_reward_invited > 0) {
            $results['invited'] = $this->earn(
                user: $invited,
                type: PointTransactionType::EARN,
                category: PointCategory::INVITE,
                amount: $setting->invite_reward_invited,
                parentId: null,
                referenceId: $referenceId,
                description: 'Invite reward (invited user)',
                createdBy: $createdBy,
                order: null
            );
        }

        return $results;
    }

    public function deduct(
        User $user,
        int $amount,
        ?string $description = null,
        ?User $createdBy = null
    ): PointTransaction {
        return DB::transaction(function () use ($user, $amount, $description, $createdBy) {
            $balance = $this->balanceService->getBalanceForUpdate($user);

            if ($amount <= 0) {
                throw new \InvalidArgumentException('Amount must be greater than 0');
            }

            if ($balance < $amount) {
                throw new \Exception('Insufficient point balance');
            }

            $newBalance = $balance - $amount;

            $tx = PointTransaction::create([
                'user_id' => $user->id,
                'type' => PointTransactionType::USE,
                'amount' => -$amount,
                'remaining_amount' => 0,
                'balance_after' => $newBalance,
                'category' => PointCategory::MANUAL,
                'description' => $description,
                'created_by' => $createdBy?->id,
            ]);

            $this->balanceService->updateBalance($user, $newBalance);

            return $tx;
        });
    }

    public function getSummary(User $user): array
    {
        $totalEarned = PointTransaction::query()
            ->where('user_id', $user->id)
            ->where('type', PointTransactionType::EARN)
            ->sum('amount');

        $totalUsed = PointTransaction::query()
            ->where('user_id', $user->id)
            ->where('type', PointTransactionType::USE)
            ->sum('amount');

        $totalExpired = PointTransaction::query()
            ->where('user_id', $user->id)
            ->where('type', PointTransactionType::EXPIRE)
            ->sum('amount');

        $balance = $this->balanceService->getBalance($user);

        $expiringSoon = PointTransaction::query()
            ->where('user_id', $user->id)
            ->where('type', PointTransactionType::EARN)
            ->where('remaining_amount', '>', 0)
            ->where('expired_at', '>', now())
            ->orderBy('expired_at')
            ->first();

        $expiringSoonPoints = $expiringSoon ? (int) $expiringSoon->remaining_amount : 0;
        $expiringSoonDate = $expiringSoon ? $expiringSoon->expired_at->copy()->addDay()->toDateString() : null;

        return [
            'total_earned' => (int) $totalEarned,
            'total_used' => (int) abs($totalUsed),
            'total_expired' => (int) abs($totalExpired),
            'balance' => (int) $balance->balance,
            'expiring_soon_points' => $expiringSoonPoints,
            'expiring_soon_date' => $expiringSoonDate,
        ];
    }
}
