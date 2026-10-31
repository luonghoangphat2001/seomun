<?php

namespace App\Services;

use App\Enums\WalletTransactionType;
use App\Exceptions\VirtualAccountCreationException;
use App\Exceptions\VirtualAccountDepositException;
use App\Models\Order;
use App\Models\User;
use App\Models\VirtualAccount;
use App\Models\VirtualAccountDeposit;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VirtualAccountService
{
    public function __construct(
        protected PaymentService $paymentService,
        protected WalletService $walletService,
    ) {}

    /**
     * Create a virtual account for a user via Toss Payment API
     *
     * @throws VirtualAccountCreationException
     */
    public function createVirtualAccount(User $user, array $data): VirtualAccount
    {
        return DB::transaction(function () use ($user, $data) {
            $existingAccount = VirtualAccount::where('user_id', $user->id)->first();

            if ($existingAccount) {
                throw new \Exception("가상 계정이 존재합니다");
            }

            $orderId = 'VA-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(8));
            $tossPayload = [
                'method' => 'virtualAccount',
                'amount' => 300,
                'orderId' => $orderId,
                'orderName' => 'Create Dedicated Virtual Account',
                'customerName' => $user->name,
                'bank' => $data['bank_code'] ?? '',
                'accountType' => "고정",
                'accountKey' => $user->id
            ];

            $tossResponse = $this->paymentService->createTossVirtualAccount($tossPayload)['virtualAccount'];

            return VirtualAccount::create([
                'user_id' => $user->id,
                'provider' => 'TOSS',
                'account_number' => $tossResponse['accountNumber'] ?? '',
                'bank_code' => $tossResponse['bankCode'] ?? $data['bank_code'],
                'customer_name' => $tossResponse['customerName'] ?? $user->name,
                'account_type' => $tossResponse['virtualAccountType'] ?? 'FIXED',
                'status' => $tossResponse['status'] ?? 'ISSUED',
                'issued_at' => now(),
                'closed_at' => $tossResponse['dueDate'] ?? null,
            ]);
        });
    }

    /**
     * Handle deposit from virtual account and update wallet balance
     *
     * @throws VirtualAccountDepositException
     */
    public function handleDeposit(VirtualAccount $virtualAccount, array $depositData): VirtualAccountDeposit
    {
        $existingDeposit = VirtualAccountDeposit::where('transaction_key', $depositData['transaction_key'])
            ->where('virtual_account_id', $virtualAccount->id)
            ->first();

        if ($existingDeposit) {
            return $existingDeposit;
        }

        return DB::transaction(function () use ($virtualAccount, $depositData) {
            $deposit = VirtualAccountDeposit::create([
                'virtual_account_id' => $virtualAccount->id,
                'transaction_key' => $depositData['transaction_key'] ?? null,
                'depositor_name' => $depositData['depositor_name'] ?? null,
                'amount' => $depositData['amount'],
                'status' => $depositData['status'] ?? 'SUCCESS',
                'deposited_at' => $depositData['deposited_at'] ?? now(),
                'raw_payload' => $depositData['raw_payload'] ?? null,
            ]);

            if (in_array($deposit->status, ['SUCCESS', 'COMPLETED'])) {
                $this->walletService->creditWallet($virtualAccount->user_id, $deposit->amount, $deposit);
            }

            return $deposit;
        });
    }

    /**
     * Update a virtual account for a user.
     *
     * @throws \Exception
     */
    public function updateVirtualAccount(User $user, array $data): ?VirtualAccount
    {
        return DB::transaction(function () use ($user, $data) {
            $existingAccount = VirtualAccount::where('user_id', $user->id)->first();

            if ($existingAccount) {
                $daysSinceCreated = $existingAccount->issued_at->diffInDays(now());

                if ($daysSinceCreated > 30) {
                    $existingAccount->delete();
                } else {
                    throw new \Exception("30일 후에 은행을 변경하세요");
                }
            }

            $orderId = 'VA-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(8));
            $tossPayload = [
                'method' => 'virtualAccount',
                'amount' => 300,
                'orderId' => $orderId,
                'orderName' => 'Create Dedicated Virtual Account',
                'customerName' => $user->name,
                'bank' => $data['bank_code'] ?? '',
                'accountType' => "고정",
                'accountKey' => $user->id
            ];

            $tossResponse = $this->paymentService->createTossVirtualAccount($tossPayload)['virtualAccount'];

            return VirtualAccount::create([
                'user_id' => $user->id,
                'provider' => 'TOSS',
                'account_number' => $tossResponse['accountNumber'] ?? '',
                'bank_code' => $tossResponse['bankCode'] ?? $data['bank_code'],
                'customer_name' => $tossResponse['customerName'] ?? $user->name,
                'account_type' => $tossResponse['virtualAccountType'] ?? 'FIXED',
                'status' => $tossResponse['status'] ?? 'ISSUED',
                'issued_at' => now(),
                'closed_at' => $tossResponse['dueDate'] ?? null,
            ]);
        });
    }

    /**
     * Get virtual accounts for a user
     */
    public function getVirtualAccountsForUser(int $userId)
    {
        return VirtualAccount::where('user_id', $userId)
            ->with('deposits')
            ->get();
    }

    public function getMyVirtualAccounts(int $userId)
    {
        return VirtualAccount::where('user_id', $userId)
            ->first();
    }
}
