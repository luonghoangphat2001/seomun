<?php

namespace App\Http\Requests\Admin\DeliveryTracking;

use App\Enums\DeliveryStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminDeliveryTrackingExportRequest extends FormRequest
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
            // Export type: ALL, CURRENT_PAGE, SELECTED
            'export_type' => ['required', 'string', Rule::in(['ALL', 'CURRENT_PAGE', 'SELECTED'])],
            'selected_ids' => [
                'required_if:export_type,SELECTED',
                'array',
                'min:1',
            ],
            'selected_ids.*' => ['integer', 'exists:delivery_trackings,id'],
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],
            'search_term' => 'nullable|string|max:255',
            'invoice_number' => 'nullable|string|max:100',
            'order_number' => 'nullable|string|max:100',
            'customer_name' => 'nullable|string|max:255',
            'product_name' => 'nullable|string|max:255',
            'delivery_status' => ['nullable', 'string', Rule::in($statusValues)],
            'waybill_registration_date_from' => 'nullable|date',
            'waybill_registration_date_to' => 'nullable|date|after_or_equal:waybill_registration_date_from',
            'sort_by' => 'nullable|string|in:invoice_number,delivery_status,waybill_registered_at',
            'sort_order' => 'nullable|string|in:asc,desc',
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Only set current_page when provided, so integer/min rules don't run for export_type = ALL.
        $page = $this->input('page') ?? $this->input('current_page');
        if ($page !== null && $page !== '') {
            $this->merge(['current_page' => $page]);
        }
    }
}
