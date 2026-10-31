<?php

namespace App\Models;

use App\Casts\PaymentMethodCast;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Filters\Admin\PaymentFilter;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    use Filterable, HasFactory;

    protected $fillable = [
        'order_id',
        'transaction_id',
        'pg_transaction_id',
        'payment_method',
        'status',
        'amount',
        'currency',
        'pg_name',
        'pg_response',
        'pg_request',
        'card_name',
        'card_number',
        'virtual_account_number',
        'virtual_account_bank',
        'virtual_account_expires_at',
        'bank_account_holder',
        'refund_reason',
        'paid_at',
        'failed_at',
        'refunded_at',
        'metadata',
        'tax_invoice_status',
        'tax_invoice_issued_at',
        'cash_receipt_status',
        'cash_receipt_issued_at',
        'receipt_notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'virtual_account_expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'failed_at' => 'datetime',
        'refunded_at' => 'datetime',
        'tax_invoice_issued_at' => 'datetime',
        'cash_receipt_issued_at' => 'datetime',
        'metadata' => 'array',
        'pg_response' => 'array',
        'pg_request' => 'array',
        'payment_method' => PaymentMethodCast::class,
        'status' => PaymentStatus::class,
    ];

    protected function getFiltersClass(): string
    {
        return PaymentFilter::class;
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get payment method enum
     */
    public function getPaymentMethodEnum(): ?PaymentMethod
    {
        return $this->payment_method;
    }

    /**
     * Get payment status enum
     */
    public function getPaymentStatusEnum(): ?PaymentStatus
    {
        if ($this->status instanceof PaymentStatus) {
            return $this->status;
        }

        return PaymentStatus::tryFrom($this->status);
    }

    /**
     * Check if payment is completed
     */
    public function isPaid(): bool
    {
        $enum = $this->getPaymentStatusEnum();

        return $enum?->isCompleted() ?? false;
    }

    /**
     * Check if payment is pending
     */
    public function isPending(): bool
    {
        $enum = $this->getPaymentStatusEnum();

        return $enum?->isPending() ?? false;
    }

    /**
     * Check if payment failed
     */
    public function isFailed(): bool
    {
        $enum = $this->getPaymentStatusEnum();

        return $enum?->isFailed() ?? false;
    }
}
