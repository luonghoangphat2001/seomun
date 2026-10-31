<?php

namespace App\Http\Requests\Admin\Product;

use App\Enums\ProductType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class AdminProductExportRequest extends FormRequest
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
        return [
            // Export type: ALL, CURRENT_PAGE, SELECTED
            'export_type' => ['required', 'string', Rule::in(['ALL', 'CURRENT_PAGE', 'SELECTED'])],

            // Selected product IDs (required if export_type = SELECTED)
            'selected_ids' => [
                'required_if:export_type,SELECTED',
                'array',
                'min:1',
            ],
            'selected_ids.*' => ['integer', 'exists:products,id'],

            // Locale for Excel column headings and sheet name (optional, defaults handled in export class)
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],

            // Current page info (required if export_type = CURRENT_PAGE)
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],

            // Product filters (same as list API)
            'product_name' => 'nullable|string|max:255',
            'product_code' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:sold,hidden',
            'is_promotional' => 'nullable|boolean',
            'category_id' => 'nullable|integer|exists:categories,id',
            'category_name' => 'nullable|string|max:255',
            'product_type' => ['nullable', Rule::enum(ProductType::class)],
            'search_term' => 'nullable|string|max:255',
            'branch' => 'nullable|string|max:255',
            'client_name' => 'nullable|string|max:255',
            'is_public' => 'nullable|boolean',
            'has_quotation' => 'nullable|boolean',
            'quotation' => 'nullable|boolean',
            'availability' => 'nullable|string|in:in_stock,out_of_stock',
            'sort_by' => 'nullable|string|in:created_at,updated_at,sort_order,name,view_count',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
    }

    protected function prepareForValidation(): void
    {
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

        if (! empty($data)) {
            $this->merge($data);
        }
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => '입력값이 올바르지 않습니다.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
