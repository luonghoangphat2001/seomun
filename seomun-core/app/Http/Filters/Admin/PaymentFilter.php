<?php

namespace App\Http\Filters\Admin;

use Illuminate\Database\Eloquent\Builder;

class PaymentFilter
{
    /**
     * Apply filters to the query
     */
    public function apply(Builder $query, array $filters): Builder
    {
        $sortField = $this->validateSortField($filters['sort_by'] ?? null);
        $sortDirection = $this->validateSortDirection($filters['sort_order'] ?? null);

        $query
            ->when(isset($filters['payment_method']), function ($query) use ($filters) {
                $query->where('payment_method', $filters['payment_method']);
            })
            ->when(isset($filters['status']), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->when(isset($filters['statuses']) && ! empty($filters['statuses']), function ($query) use ($filters) {
                $query->whereIn('status', $filters['statuses']);
            })
            ->when(isset($filters['customer_name']), function ($query) use ($filters) {
                $query->whereHas('order', function ($query) use ($filters) {
                    $query->whereHas('user', function ($query) use ($filters) {
                        $query->where('name', 'like', '%'.$filters['customer_name'].'%');
                    });
                });
            })
            ->when(isset($filters['order_number']), function ($query) use ($filters) {
                $query->whereHas('order', function ($query) use ($filters) {
                    $query->where('order_number', 'like', '%'.$filters['order_number'].'%');
                });
            })
            // Date filters: keep same style as other list APIs (FE gửi string → whereDate)
            ->when(isset($filters['start_date']), function ($query) use ($filters) {
                $query->whereDate('created_at', '>=', $filters['start_date']);
            })
            ->when(isset($filters['end_date']), function ($query) use ($filters) {
                $query->whereDate('created_at', '<=', $filters['end_date']);
            })
            ->when(isset($filters['customer_ids']) && ! empty($filters['customer_ids']), function ($query) use ($filters) {
                $query->whereHas('order', function ($query) use ($filters) {
                    $query->whereHas('user', function ($query) use ($filters) {
                        $query->whereIn('customer_id', $filters['customer_ids']);
                    });
                });
            })
            ->when(isset($filters['pg_transaction_id']), function ($query) use ($filters) {
                $query->where('pg_transaction_id', 'like', '%'.$filters['pg_transaction_id'].'%');
            })
            ->when(isset($filters['transaction_id']), function ($query) use ($filters) {
                $query->where('transaction_id', 'like', '%'.$filters['transaction_id'].'%');
            })
            ->when(isset($filters['user_id']), function ($query) use ($filters) {
                $query->whereHas('order', function ($query) use ($filters) {
                    $query->where('user_id', $filters['user_id']);
                });
            });

        // Custom sort handling:
        // - For 'order_number', we need to join the orders table because the column
        //   lives on orders, not payment_transactions. FE maps "Approve Number"
        //   to this field.
        if ($sortField === 'order_number') {
            $query->join('orders', 'payment_transactions.order_id', '=', 'orders.id')
                ->select('payment_transactions.*')
                ->orderBy('orders.order_number', $sortDirection);
        } else {
            // Default: sort by a column on payment_transactions
            $query->orderBy($sortField, $sortDirection);
        }

        return $query;
    }

    /**
     * Get sort field
     *
     * @param  mixed  $field
     */
    private function validateSortField(?string $field): string
    {
        // NOTE:
        // - 'order_number' is a virtual sort field that maps to orders.order_number
        //   and is handled specially in apply().
        // - Other fields are direct columns on payment_transactions.
        $allowedFields = [
            'created_at',
            'updated_at',
            'amount',
            'status',
            'payment_method',
            'paid_at',
            'order_number',
        ];

        if (! $field || ! in_array($field, $allowedFields)) {
            return 'created_at';
        }

        return $field;
    }

    /**
     * Get sort direction
     *
     * @param  mixed  $direction
     */
    private function validateSortDirection(?string $direction): string
    {
        $allowedDirections = ['asc', 'desc'];

        if (! $direction || ! in_array(strtolower($direction), $allowedDirections)) {
            return 'desc';
        }

        return strtolower($direction);
    }
}
