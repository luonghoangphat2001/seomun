<?php

namespace App\Http\Requests\Admin\Payment;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminPaymentExportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $paymentMethodValues = array_column(PaymentMethod::cases(), 'value');
        $paymentStatusValues = array_column(PaymentStatus::cases(), 'value');

        $sortByValues = ['created_at', 'updated_at', 'amount', 'status', 'payment_method', 'paid_at', 'order_number'];

        return [
            'export_type' => ['required', 'string', Rule::in(['ALL', 'CURRENT_PAGE', 'SELECTED'])],
            'selected_ids' => [
                'required_if:export_type,SELECTED',
                'array',
                'min:1',
            ],
            // When exporting selected payments, FE sends payment transaction_ids (string),
            // so we validate them as strings that exist on transaction_id column.
            'selected_ids.*' => ['string', 'exists:payment_transactions,transaction_id'],
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'order_number' => ['nullable', 'string'],
            'approve_number' => ['nullable', 'string'],
            'payment_method' => ['nullable', 'string', 'in:'.implode(',', $paymentMethodValues)],
            'status' => ['nullable', 'string', 'in:'.implode(',', $paymentStatusValues)],
            'customer_name' => ['nullable', 'string'],
            'sort_by' => ['nullable', 'string', 'in:'.implode(',', $sortByValues)],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
        ];
    }

    /**
     * Map approve_number to order_number so filter receives it.
     */
    protected function prepareForValidation(): void
    {
        if ($this->filled('approve_number') && ! $this->filled('order_number')) {
            $this->merge(['order_number' => $this->input('approve_number')]);
        }
    }
}
