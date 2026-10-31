<?php

namespace App\Services;

use App\Enums\WalletTransactionType;
use App\Models\PaymentTransaction;
use App\Models\VirtualAccountDeposit;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class WalletTransactionService
{
    public function createWalletTransaction(int $userId, float $amount, WalletTransactionType $type): WalletTransaction
    {
        return DB::transaction(function () use ($userId, $amount, $type) {

            $wallet = Wallet::where('user_id', $userId)
                ->lockForUpdate()
                ->first();

            if (! $wallet) {
                throw new \Exception("Wallet not found for user ID: {$userId}");
            }

            $walletBefore = $wallet->balance;
            $walletAfter = $walletBefore + $amount;

            $wallet->update([
                'balance' => $walletAfter,
            ]);

            return WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => $type->value,
                'reference_type' => PaymentTransaction::class,
                'reference_id' => null,
                'amount' => $amount,
                'balance_before' => $walletBefore,
                'balance_after' => $walletAfter,
            ]);
        });
    }
}
