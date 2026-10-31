<?php

namespace App\Http\Requests\Admin\Order;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminOrderListRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // TODO: Add admin authorization check
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Combined search term (order_number, company_name, order name)
            'search_term' => 'nullable|string|max:255',
            'search' => 'nullable|string|max:255',
            'keyword' => 'nullable|string|max:255',

            // FSD: Search filters such as order number, customer, orderer, order status, and order period
            'order_number' => 'nullable|string|max:100',
            'customer_name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'orderer_name' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:50',

            // Order date range (주문일)
            'order_date_from' => 'nullable|date',
            'order_date_to' => 'nullable|date|after_or_equal:order_date_from',

            // Pagination - Support both 'page' and 'current_page' for backward compatibility
            'page' => 'nullable|integer|min:1',
            'current_page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',

            // Sort
            'sort_by' => 'nullable|string|in:placed_at,order_number,total_amount,status',
            'sort_order' => 'nullable|string|in:asc,desc',

            // Tax invoice and cash receipt status filters
            'tax_invoice_status_is_null' => 'nullable|boolean',
            'cash_receipt_status_is_null' => 'nullable|boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Normalize: Use 'page' if provided, otherwise use 'current_page'
        $page = $this->input('page') ?? $this->input('current_page');
        $searchTerm = $this->input('search_term') ?? $this->input('search') ?? $this->input('keyword');
        $companyName = $this->input('company_name') ?? $this->input('customer_name');

        $merge = [
            'current_page' => $page,
        ];

        if ($searchTerm !== null) {
            $merge['search_term'] = $searchTerm;
        }

        if ($companyName !== null) {
            $merge['customer_name'] = $companyName;
            $merge['company_name'] = $companyName;
        }

        $this->merge($merge);
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'order_date_to.after_or_equal' => '주문일 종료일은 시작일보다 이후여야 합니다.',
            'delivery_date_to.after_or_equal' => '납기일 종료일은 시작일보다 이후여야 합니다.',
        ];
    }
}
