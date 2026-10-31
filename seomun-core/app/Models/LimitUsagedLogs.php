<?php

namespace App\Models;

use App\Http\Filters\Admin\LimitUsagedLogsFilter;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LimitUsagedLogs extends Model
{
    use Filterable, HasFactory;

    protected $fillable = [
        'user_limit_id',
        'reference_type',
        'reference_id',
        'usage_amount',
        'remaining_amount',
        'description',
        'quantity',
        'notes',
        'transaction_person',
    ];

    /**
     * Get filters class
     */
    protected function getFiltersClass(): string
    {
        return LimitUsagedLogsFilter::class;
    }

    /**
     * Get user limit
     *
     * @return BelongsTo<UserLimit, LimitUsagedLogs>
     */
    public function userLimit(): BelongsTo
    {
        return $this->belongsTo(UserLimit::class);
    }

    /**
     * Get payment transaction
     *
     * @return BelongsTo<PaymentTransaction, LimitUsagedLogs>
     */
    public function paymentTransaction(): BelongsTo
    {
        return $this->belongsTo(PaymentTransaction::class, 'reference_id')->where('reference_type', PaymentTransaction::class);
    }

    /**
     * Get order
     *
     * @return BelongsTo<Order, LimitUsagedLogs>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'reference_id')->where('reference_type', Order::class);
    }
}
