<?php

namespace App\Http\Requests\Admin\Order;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminOrderExportRequest extends FormRequest
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
        return [
            'export_type' => ['required', 'string', Rule::in(['ALL', 'CURRENT_PAGE', 'SELECTED'])],
            'selected_ids' => [
                'required_if:export_type,SELECTED',
                'array',
                'min:1',
            ],
            'selected_ids.*' => ['integer', 'exists:orders,id'],
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],
            'search_term' => 'nullable|string|max:255',
            'search' => 'nullable|string|max:255',
            'keyword' => 'nullable|string|max:255',
            'order_number' => 'nullable|string|max:100',
            'customer_name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'orderer_name' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:50',
            'order_date_from' => 'nullable|date',
            'order_date_to' => 'nullable|date|after_or_equal:order_date_from',
            'sort_by' => 'nullable|string|in:placed_at,order_number,total_amount,status',
            'sort_order' => 'nullable|string|in:asc,desc',
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
        ];
    }

    protected function prepareForValidation(): void
    {
        $searchTerm = $this->input('search_term') ?? $this->input('search') ?? $this->input('keyword');
        $companyName = $this->input('company_name') ?? $this->input('customer_name');

        $merge = [];
        if ($searchTerm !== null) {
            $merge['search_term'] = $searchTerm;
        }
        if ($companyName !== null) {
            $merge['customer_name'] = $companyName;
            $merge['company_name'] = $companyName;
        }
        if (! empty($merge)) {
            $this->merge($merge);
        }
    }
}
