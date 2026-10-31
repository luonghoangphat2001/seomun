<?php

namespace App\Services\Admin;

use App\Models\MembershipTier;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AdminMembershipService
{
    public function getAllTiersForAdmin()
    {
        return MembershipTier::orderBy('sort_order')
            ->withCount('users as members_count')
            ->get()
            ->map(function (MembershipTier $tier) {
                $tier->average_quarterly_spend = $tier->threshold_amount > 0
                    ? round($tier->threshold_amount / 3)
                    : 0;
                return $tier;
            });
    }

    public function getTierById(int $id): ?MembershipTier
    {
        return MembershipTier::find($id);
    }

    public function updateTier(int $id, array $data): ?MembershipTier
    {
        $tier = MembershipTier::find($id);
        if (! $tier) {
            return null;
        }

        $tier->update([
            'name' => $data['name'],
            'threshold_amount' => $data['condition_amount'],
            'accumulation_rate' => $data['accrual_rate'],
            'has_free_shipping' => $data['free_shipping'],
            'is_active' => $data['is_active'] ?? $tier->is_active,
        ]);

        return $tier->fresh();
    }

    public function upgradeMemberMembership(int $userId, int $tierId): ?User
    {
        $user = User::find($userId);
        if (! $user) {
            return null;
        }

        $tier = MembershipTier::find($tierId);
        if (! $tier) {
            return null;
        }

        $oldTierName = $user->membershipTier?->name ?? 'None';

        $user->membership_tier_id = $tierId;
        $user->save();

        Log::info("Manual membership upgrade for user {$userId}: {$oldTierName} -> {$tier->name} (by admin)");

        return $user;
    }
}
