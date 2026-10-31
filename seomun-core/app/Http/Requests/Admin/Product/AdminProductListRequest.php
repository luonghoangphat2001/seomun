<?php

namespace App\Http\Requests\Admin\Product;

use App\Enums\ProductType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminProductListRequest extends FormRequest
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
            // Product name (제품명)
            'product_name' => 'nullable|string|max:255',

            // Product code (제품 코드) - maps to SKU
            'product_code' => 'nullable|string|max:255',

            // Status (sold/hidden)
            'status' => 'nullable|string|in:sold,hidden',

            // Promotional use (홍보용 여부)
            'is_promotional' => 'nullable|boolean',

            // Category ID
            'category_id' => 'nullable|integer|exists:categories,id',

            // Category name (카테고리명)
            'category_name' => 'nullable|string|max:255',

            // Product type filter - template, custom, promotional, file_order
            'product_type' => ['nullable', Rule::enum(ProductType::class)],

            // Search term (검색어) - product name, product code, description
            'search_term' => 'nullable|string|max:255',

            // Branch name (지점명)
            'branch' => 'nullable|string|max:255',

            // Client name (고객사명)
            'client_name' => 'nullable|string|max:255',

            // Whether to disclose (공개여부) - maps to is_active
            'is_public' => 'nullable|boolean',

            // Whether or not to quote (견적 여부)
            // Support both 'quotation' and 'has_quotation' parameter names
            'has_quotation' => 'nullable|boolean',
            'quotation' => 'nullable|boolean',

            // Availability (재고 상태)
            'availability' => 'nullable|string|in:in_stock,out_of_stock',

            // Pagination - Support both 'page' and 'current_page' for backward compatibility
            'page' => 'nullable|integer|min:1',
            'current_page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',

            // Sort
            'sort_by' => 'nullable|string|in:created_at,updated_at,sort_order,name,view_count',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Normalize: Use 'page' if provided, otherwise use 'current_page'
        $page = $this->input('page') ?? $this->input('current_page');

        // Convert string "true"/"false" to boolean for boolean fields
        // Query string parameters come as strings, need to convert them
        $booleanFields = ['is_promotional', 'is_public', 'has_quotation', 'quotation'];
        $data = [];

        foreach ($booleanFields as $field) {
            if ($this->has($field)) {
                $value = $this->input($field);
                // Convert string "true"/"false" to boolean
                if (is_string($value)) {
                    $data[$field] = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                } else {
                    $data[$field] = $value;
                }
            }
        }

        $this->merge([
            'current_page' => $page,
        ] + $data);
    }
}
