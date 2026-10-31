<?php

namespace App\Services;

use App\Models\PointBalance;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PointBalanceService
{
    public function getBalance(User $user): PointBalance
    {
        $balance = PointBalance::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );

        return $balance;
    }

    public function getBalanceByUserId(int $userId): PointBalance
    {
        $balance = PointBalance::firstOrCreate(
            ['user_id' => $userId],
            ['balance' => 0]
        );

        return $balance;
    }

    public function getBalanceForUpdate(User $user): int
    {
        $row = DB::table('point_balances')
            ->where('user_id', $user->id)
            ->lockForUpdate()
            ->first();

        if (! $row) {
            DB::table('point_balances')->insert([
                'user_id' => $user->id,
                'balance' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return 0;
        }

        return (int) $row->balance;
    }

    /**
     * Update balance
     */
    public function updateBalance(User $user, int $newBalance): void
    {
        DB::table('point_balances')
            ->where('user_id', $user->id)
            ->update([
                'balance' => $newBalance,
                'updated_at' => now(),
            ]);
    }
}
