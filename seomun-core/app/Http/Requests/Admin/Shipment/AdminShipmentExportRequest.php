<?php

namespace App\Http\Requests\Admin\Shipment;

use App\Enums\OrderShipmentStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminShipmentExportRequest extends FormRequest
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
        $statusValues = array_column(OrderShipmentStatus::cases(), 'value');

        return [
            // Export type: ALL, CURRENT_PAGE, SELECTED
            'export_type' => ['required', 'string', Rule::in(['ALL', 'CURRENT_PAGE', 'SELECTED'])],
            'selected_ids' => [
                'required_if:export_type,SELECTED',
                'array',
                'min:1',
            ],
            'selected_ids.*' => ['integer', 'exists:order_shipments,id'],
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],
            'search_term' => 'nullable|string|max:255',
            'shipment_date_from' => 'nullable|date',
            'shipment_date_to' => 'nullable|date|after_or_equal:shipment_date_from',
            'order_number' => 'nullable|string|max:100',
            'customer_name' => 'nullable|string|max:255',
            'product_name' => 'nullable|string|max:255',
            'shipping_manager_id' => 'nullable|integer|exists:users,id',
            'shipment_status' => ['nullable', 'string', Rule::in($statusValues)],
            'sort_by' => 'nullable|string|in:shipment_date,order_number',
            'sort_order' => 'nullable|string|in:asc,desc',
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
        ];
    }
}
