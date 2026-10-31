<?php

namespace App\Services;

use App\Models\User;

class LimitManagementService
{
    /**
     * Check if user has sufficient limit for an amount
     */
    public function checkLimit(User $user, float $amount): bool
    {
        $userLimit = $user->limit;

        if (! $userLimit) {
            return false;
        }

        return $userLimit->remaining_amount >= $amount;
    }
}
