<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\UserAuthority;
use App\Models\MembershipTier;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class MembershipService
{
    public function assignDefaultTier(User $user): User
    {
        $familyTier = MembershipTier::where('threshold_amount', 0)->first();

        if (! $familyTier) {
            Log::error('Membership tier "패밀리" not found');

            return $user;
        }

        $user->membership_tier_id = $familyTier->id;
        $user->save();

        return $user;
    }

    public function accumulateSpending(User $user, int $amount, Carbon $orderDate): void
    {
        Log::info("User {$user->id} spending accumulated: {$amount} won (order date: {$orderDate})");
    }

    public function getCurrentQuarterStart(): Carbon
    {
        $now = Carbon::now();
        $quarter = (int) (($now->month - 1) / 3) + 1;
        $month = ($quarter - 1) * 3 + 1;

        return Carbon::create($now->year, $month, 1);
    }

    public function isStartOfQuarter(): bool
    {
        $now = Carbon::now();

        return $now->isSameDay($this->getCurrentQuarterStart());
    }

    public function getQuarterlySpent(User $user, Carbon $quarterStart): int
    {
        $quarterEnd = $quarterStart->copy()->addMonths(3);

        return Order::where('user_id', $user->id)
            ->where('status', OrderStatus::Completed->value)
            ->where('placed_at', '>=', $quarterStart)
            ->where('placed_at', '<', $quarterEnd)
            ->sum('total_amount');
    }

    public function evaluateQuarterlyTier(User $user): User
    {
        if (! $this->isStartOfQuarter()) {
            return $user;
        }

        $currentQuarterStart = $this->getCurrentQuarterStart();
        $previousQuarterStart = $currentQuarterStart->copy()->subMonths(3);

        $previousQuarterSpent = $this->getQuarterlySpent($user, $previousQuarterStart);

        $newTier = $this->determineTierBySpending($previousQuarterSpent);

        if ($newTier && $newTier->id !== $user->membership_tier_id) {
            $oldTierName = $user->membershipTier?->name ?? 'Unknown';
            $user->membership_tier_id = $newTier->id;
            $user->save();

            Log::info("User {$user->id} tier changed from {$oldTierName} to {$newTier->name} (quarterly_spent: {$previousQuarterSpent})");
        }

        return $user;
    }

    public function determineTierBySpending(int $quarterlySpent): ?MembershipTier
    {
        $tiers = MembershipTier::where('is_active', true)
            ->orderBy('sort_order', 'desc')
            ->get();

        foreach ($tiers as $tier) {
            if ($quarterlySpent >= $tier->threshold_amount) {
                return $tier;
            }
        }

        $familyTier = MembershipTier::where('threshold_amount', 0)->first();

        return $familyTier;
    }

    public function processQuarterlyUpgrade(): void
    {
        if (! $this->isStartOfQuarter()) {
            return;
        }

        $processedCount = 0;
        User::query()
            ->where('authority', UserAuthority::USER)
            ->chunk(100, function ($users) use (&$processedCount) {
                foreach ($users as $user) {
                    $this->evaluateQuarterlyTier($user);
                    $processedCount++;
                }
            });

        Log::info("Processed quarterly upgrade for {$processedCount} users");
    }

    public function getAllTiers()
    {
        return MembershipTier::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }

    public function getMembershipSummary(User $user): array
    {
        $currentTier = $user->membershipTier;
        $currentQuarterStart = $this->getCurrentQuarterStart();
        $currentQuarterSpent = $this->getQuarterlySpent($user, $currentQuarterStart);

        $nextTier = null;
        $nextTierRequired = null;

        if ($currentTier) {
            $nextTier = MembershipTier::where('is_active', true)
                ->where('sort_order', '>', $currentTier->sort_order)
                ->orderBy('sort_order')
                ->first();

            if ($nextTier) {
                $nextTierRequired = $nextTier->threshold_amount - $currentQuarterSpent;
            }
        }

        return [
            'current_quarter_spent' => $currentQuarterSpent,
            'current' => $currentTier ? [
                'id' => $currentTier->id,
                'name' => $currentTier->name,
                'threshold_amount' => $currentTier->threshold_amount,
                'accumulation_rate' => $currentTier->accumulation_rate,
                'has_free_shipping' => $currentTier->has_free_shipping,
            ] : null,
            'next' => $nextTier ? [
                'id' => $nextTier->id,
                'name' => $nextTier->name,
                'threshold_amount' => $nextTier->threshold_amount,
                'accumulation_rate' => $nextTier->accumulation_rate,
                'has_free_shipping' => $nextTier->has_free_shipping,
                'required_amount' => $nextTierRequired,
            ] : null,
        ];
    }
}
