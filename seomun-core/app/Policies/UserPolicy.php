<?php

namespace App\Policies;

use App\Enums\UserAuthority;
use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can update the model.
     */
    public function update(User $admin, User $target): bool
    {
        if (! $admin->isAdmin()) {
            return false;
        }

        return $target->authority === UserAuthority::USER->value;
    }
}
