<?php

namespace App\Services\MyPage;

use App\Models\RefundHistory;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Support\Facades\Log;

class MyPageAccountService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get current refund account info for the user.
     */
    public function getAccount(User $user): ?array
    {
        if (! $user->refund_bank && ! $user->refund_account_number) {
            return null;
        }

        return [
            'bank_code' => $user->refund_bank,
            'account_number' => $user->refund_account_number,
            'account_holder' => $user->refund_account_name,
            'status' => 'active',
            'created_at' => $user->updated_at?->toDateString(),
            'last_transaction_at' => $user->refundHistories()
                ->latest('settlement_date')
                ->value('settlement_date'),
        ];
    }

    /**
     * Register or update refund account.
     */
    public function saveAccount(User $user, array $data): array
    {
        try {
            $user->update([
                'refund_bank' => $data['bank_code'],
                'refund_account_number' => $data['account_number'],
                'refund_account_name' => $data['account_holder'],
            ]);

            return $this->getAccount($user->fresh());
        } catch (\Exception $e) {
            Log::error('Save refund account failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Mask account number, showing only last 4 digits.
     * e.g. 00106796097680 → **********7680
     */
    private function maskAccountNumber(?string $accountNumber): ?string
    {
        if (! $accountNumber) {
            return null;
        }

        $len = strlen($accountNumber);
        if ($len <= 4) {
            return $accountNumber;
        }

        return str_repeat('*', $len - 4).substr($accountNumber, -4);
    }

    /**
     * Get dedicated account issuance certificate data (전용계좌 발급확인서).
     */
    public function getCertificate(User $user): ?array
    {
        if (! $user->refund_bank || ! $user->refund_account_number) {
            return null;
        }

        return [
            'account_holder' => $user->refund_account_name,
            'bank_code' => $user->refund_bank,
            'account_number' => $user->refund_account_number,
            'issued_at' => $user->updated_at?->toDateString(),
        ];
    }

    /**
     * Get paginated refund histories with date filter.
     */
    public function getHistories(User $user, array $filters, int $perPage = 15): array
    {
        try {
            $query = RefundHistory::where('user_id', $user->id);

            if (! empty($filters['start_date'])) {
                $query->whereDate('settlement_date', '>=', $filters['start_date']);
            }

            if (! empty($filters['end_date'])) {
                $query->whereDate('settlement_date', '<=', $filters['end_date']);
            }

            if (! empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            $histories = $query->orderBy('settlement_date', 'desc')
                ->orderBy('id', 'desc')
                ->paginate($perPage);

            return [
                'histories' => $histories->map(fn ($h) => [
                    'id' => $h->id,
                    'settlement_date' => $h->settlement_date?->toDateString(),
                    'refund_amount' => $h->refund_amount,
                    'account_holder' => $h->account_holder,
                    'bank_code' => $h->bank_code,
                    'account_number' => $h->account_number,
                    'deposit_date' => $h->deposit_date?->toDateString(),
                    'status' => $h->status,
                    'note' => $h->note,
                ])->values(),
                'pagination' => $this->paginationService->format($histories),
            ];
        } catch (\Exception $e) {
            Log::error('Get refund histories failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
