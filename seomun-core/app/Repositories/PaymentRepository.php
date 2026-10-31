<?php

namespace App\Repositories;

use App\Enums\PaymentStatus;
use App\Models\PaymentTransaction;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PaymentRepository implements PaymentRepositoryInterface
{
    /**
     * get Paginate of payments transaction
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return PaymentTransaction::with('order')->filters($filters)->paginate($perPage);
    }

    /**
     * Get payment analytics for dashboard
     */
    public function getAnalytics(array $filters = []): array
    {
        $paymentQuery = PaymentTransaction::filters($filters);

        return [
            'total' => $paymentQuery->count(),
            'amount' => $paymentQuery->sum('amount'),
        ];
    }

    /**
     * Get weekly payment data for dashboard
     */
    public function getDataWeekly(array $filters = []): array
    {
        $selectRaw = 'YEARWEEK(created_at, 1) as week, MIN(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY)) as date, COUNT(*) as total, SUM(amount) as total_amount';

        $query = PaymentTransaction::selectRaw($selectRaw);

        $query->when(isset($filters['start_date']), function ($query) use ($filters) {
            $start_date = Carbon::parse($filters['start_date'])->startOfDay();
            $query->where('created_at', '>=', $start_date);
        })
            ->when(isset($filters['end_date']), function ($query) use ($filters) {
                $end_date = Carbon::parse($filters['end_date'])->endOfDay();
                $query->where('created_at', '<=', $end_date);
            })
            ->when(isset($filters['customer_ids']) && ! empty($filters['customer_ids']), function ($query) use ($filters) {
                $query->whereHas('order', function ($query) use ($filters) {
                    $query->whereHas('user', function ($query) use ($filters) {
                        $query->whereIn('customer_id', $filters['customer_ids']);
                    });
                });
            });

        return $query->groupBy('week')
            ->orderBy('week')
            ->get()
            ->toArray();
    }

    /**
     * Get daily payment data for dashboard
     */
    public function getDataDaily(array $filters = []): array
    {
        $selectRaw = 'DATE(created_at) as date, COUNT(*) as total';

        $query = PaymentTransaction::selectRaw($selectRaw);

        $query->when(isset($filters['start_date']), function ($query) use ($filters) {
            $start_date = Carbon::parse($filters['start_date'])->startOfDay();
            $query->where('created_at', '>=', $start_date);
        })
            ->when(isset($filters['end_date']), function ($query) use ($filters) {
                $end_date = Carbon::parse($filters['end_date'])->endOfDay();
                $query->where('created_at', '<=', $end_date);
            })
            ->when(isset($filters['customer_ids']) && ! empty($filters['customer_ids']), function ($query) use ($filters) {
                $query->whereHas('order', function ($query) use ($filters) {
                    $query->whereHas('user', function ($query) use ($filters) {
                        $query->whereIn('customer_id', $filters['customer_ids']);
                    });
                });
            });

        return $query->groupBy('date')->get()->toArray();
    }

    /**
     * Get payment statistics - returns raw data for both payment method and status statistics
     */
    public function getPaymentStatistics(array $customerIds = [], array $configPeriod = []): array
    {
        $query = PaymentTransaction::query();

        if (isset($configPeriod['start_date'])) {
            $query->where('created_at', '>=', $configPeriod['start_date']);
        }
        if (isset($configPeriod['end_date'])) {
            $query->where('created_at', '<=', $configPeriod['end_date']);
        }
        if (! empty($customerIds)) {
            $query->whereHas('order', function ($q) use ($customerIds) {
                $q->whereHas('user', function ($q) use ($customerIds) {
                    $q->whereIn('id', $customerIds);
                });
            });
        }

        // Get statistics by payment method
        $results = $query->selectRaw('
            payment_method,
            COUNT(*) as total_count,
            SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as successful_count,
            SUM(CASE WHEN status IN (?, ?, ?) THEN 1 ELSE 0 END) as failed_count,
            SUM(CASE WHEN status IN (?, ?) THEN 1 ELSE 0 END) as refunded_count,
            SUM(CASE WHEN status = ? THEN amount ELSE 0 END) as successful_amount,
            SUM(CASE WHEN status IN (?, ?, ?) THEN amount ELSE 0 END) as failed_amount,
            SUM(CASE WHEN status IN (?, ?) THEN amount ELSE 0 END) as refunded_amount,
            SUM(amount) as total_amount
        ', [
            PaymentStatus::PAID->value,
            PaymentStatus::FAILED->value,
            PaymentStatus::CANCELLED->value,
            PaymentStatus::EXPIRED->value,
            PaymentStatus::REFUNDED->value,
            PaymentStatus::PARTIALLY_REFUNDED->value,
            PaymentStatus::PAID->value,
            PaymentStatus::FAILED->value,
            PaymentStatus::CANCELLED->value,
            PaymentStatus::EXPIRED->value,
            PaymentStatus::REFUNDED->value,
            PaymentStatus::PARTIALLY_REFUNDED->value,
        ])
            ->groupBy('payment_method')
            ->get();

        // Get total statistics
        $totalAmount = $results->sum('total_amount');
        $totalCount = $results->sum('total_count');

        return [
            'results' => $results->toArray(),
            'total_amount' => $totalAmount,
            'total_count' => $totalCount,
        ];
    }

    public function findById(int $id): ?\App\Models\PaymentTransaction
    {
        return PaymentTransaction::with('order')->find($id);
    }
}
