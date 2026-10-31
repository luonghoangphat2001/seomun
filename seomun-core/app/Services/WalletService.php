<?php

namespace App\Services;

use App\Models\VirtualAccountDeposit;
use App\Models\Wallet;
use App\Models\WalletTransaction;

class WalletService
{
    public function getWallet(int $userId)
    {
        return Wallet::firstOrCreate(
            ['user_id' => $userId],
            ['balance' => 0]
        );
    }

    public function creditWallet(int $userId, float $amount, VirtualAccountDeposit $deposit): void
    {
        $wallet = Wallet::where('user_id', $userId)->first();

        if ($wallet) {
            return;
        }

        $wallet = Wallet::create([
            'user_id' => $userId,
            'balance' => 0,
        ]);

        $balanceBefore = (float) $wallet->balance;
        $balanceAfter = $balanceBefore + $amount;

        $wallet->update(['balance' => $balanceAfter]);

        WalletTransaction::create([
            'wallet_id' => $wallet->id,
            'type' => 'DEPOSIT',
            'reference_type' => VirtualAccountDeposit::class,
            'reference_id' => $deposit->id,
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
        ]);
    }
}
