<?php

namespace App\Http\Requests\Admin\DeliveryTracking;

use App\Enums\DeliveryStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminDeliveryTrackingListRequest extends FormRequest
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
        $statusValues = array_column(DeliveryStatus::cases(), 'value');

        return [
            'search_term' => 'nullable|string|max:255',
            'invoice_number' => 'nullable|string|max:100',
            'order_number' => 'nullable|string|max:100',
            'customer_name' => 'nullable|string|max:255',
            'product_name' => 'nullable|string|max:255',
            'delivery_status' => ['nullable', 'string', Rule::in($statusValues)],
            'waybill_registration_date_from' => 'nullable|date',
            'waybill_registration_date_to' => 'nullable|date|after_or_equal:waybill_registration_date_from',
            'page' => 'nullable|integer|min:1',
            'current_page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:invoice_number,delivery_status,waybill_registered_at',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'current_page' => $this->input('page') ?? $this->input('current_page'),
        ]);
    }
}
