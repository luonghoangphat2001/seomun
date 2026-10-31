<?php

namespace App\Services\MyPage;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MyPageDepositStatusService
{
    /**
     * Get deposit/payment history for user.
     * UI: 번호, 거래방법, 거래일, 입출금, 입금자
     */
    public function getList(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = PaymentTransaction::with('order:id,order_number,user_id')
            ->whereHas('order', fn ($q) => $q->where('user_id', $user->id))
            ->where('payment_method', PaymentMethod::VIRTUAL_ACCOUNT->value)
            ->whereIn('status', [
                PaymentStatus::PAID,
                PaymentStatus::REFUNDED,
                PaymentStatus::PARTIALLY_REFUNDED,
            ])
            ->orderBy('paid_at', 'desc');

        if (!empty($filters['start_date'])) {
            $query->where('paid_at', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->where('paid_at', '<=', $filters['end_date'] . ' 23:59:59');
        }

        if (!empty($filters['months'])) {
            $query->where('paid_at', '>=', now()->subMonths((int) $filters['months']));
        }

        if (!empty($filters['search'])) {
            $query->whereHas('order', fn ($q) =>
                $q->where('order_number', 'like', '%' . $filters['search'] . '%')
            );
        }

        return $query->paginate($perPage);
    }

    /**
     * Total sum for the filtered period.
     */
    public function getTotal(User $user, array $filters = []): string
    {
        $query = PaymentTransaction::whereHas('order', fn ($q) => $q->where('user_id', $user->id))
            ->whereIn('status', [PaymentStatus::PAID, PaymentStatus::REFUNDED, PaymentStatus::PARTIALLY_REFUNDED]);

        if (!empty($filters['start_date'])) {
            $query->where('paid_at', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->where('paid_at', '<=', $filters['end_date'] . ' 23:59:59');
        }

        if (!empty($filters['months'])) {
            $query->where('paid_at', '>=', now()->subMonths((int) $filters['months']));
        }

        return (string) $query->sum('amount');
    }
}
