<?php

namespace App\Http\Requests\Admin\Payment;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Requests\Admin\Commons\PaginationRequest;
use Illuminate\Contracts\Validation\ValidationRule;

class PaymentListRequest extends PaginationRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $paymentMethodValues = array_column(PaymentMethod::cases(), 'value');
        $paymentStatusValues = array_column(PaymentStatus::cases(), 'value');
        $sortByValues = ['created_at', 'updated_at', 'amount', 'status', 'payment_method', 'paid_at', 'order_number'];

        return array_merge(parent::rules(), [
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'order_number' => ['nullable', 'string'],
            'transaction_id' => ['nullable', 'string'],
            'approve_number' => ['nullable', 'string'],
            'payment_method' => ['nullable', 'string', 'in:'.implode(',', $paymentMethodValues)],
            'status' => ['nullable', 'string', 'in:'.implode(',', $paymentStatusValues)],
            'customer_name' => ['nullable', 'string'],
            'sort_by' => ['nullable', 'string', 'in:'.implode(',', $sortByValues)],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
        ]);
    }

    /**
     * Map approve_number to order_number so filter receives it (FE sends "Approve number" as approve_number).
     */
    protected function prepareForValidation(): void
    {
        if ($this->filled('approve_number') && ! $this->filled('order_number')) {
            $this->merge(['order_number' => $this->input('approve_number')]);
        }
    }
}
