<?php

namespace App\Http\Filters\Admin;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class OrderFillter
{
    /**
     * Apply filters to the query
     */
    public function apply(Builder $query, array $filters): Builder
    {
        return $query
            ->when(isset($filters['start_date']), function ($query) use ($filters) {
                $start_date = Carbon::parse($filters['start_date'])->startOfDay();
                $query->where('orders.created_at', '>=', $start_date);
            })
            ->when(isset($filters['end_date']), function ($query) use ($filters) {
                $end_date = Carbon::parse($filters['end_date'])->endOfDay();
                $query->where('orders.created_at', '<=', $end_date);
            })
            ->when(isset($filters['customer_ids']) && ! empty($filters['customer_ids']), function ($query) use ($filters) {
                $query->whereHas('user', function ($q) use ($filters) {
                    $q->whereIn('id', $filters['customer_ids']);
                });
            })
            ->when(isset($filters['status']) && ! empty($filters['status']), function ($query) use ($filters) {
                $query->where('orders.status', $filters['status']);
            })
            ->when(! empty($filters['search_term']), function ($query) use ($filters) {
                $search = $filters['search_term'];
                $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $search).'%';
                $query->where(function (Builder $q) use ($like) {
                    $q->where('orders.order_number', 'like', $like)
                        ->orWhere('orders.company_name', 'like', $like)
                        ->orWhere('orders.product_name', 'like', $like)
                        ->orWhere('orders.contact_name', 'like', $like)
                        ->orWhereHas('user', function (Builder $uq) use ($like) {
                            $uq->where('name', 'like', $like);
                        })
                        ->orWhereHas('user.customer', function (Builder $cq) use ($like) {
                            $cq->where('company_name', 'like', $like);
                        });
                });
            });
    }
}
