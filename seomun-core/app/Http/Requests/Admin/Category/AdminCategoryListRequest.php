<?php

namespace App\Http\Requests\Admin\Category;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminCategoryListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // New generic filters aligned with FE table
            'name' => ['nullable', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'level' => ['nullable', 'string', 'in:large,medium,small'],
            // Legacy filters (still supported for backward compatibility)
            'large_category_name' => ['nullable', 'string', 'max:255'],
            'medium_category_name' => ['nullable', 'string', 'max:255'],
            'small_category_name' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:active,hidden'],
            'is_best' => ['nullable', 'boolean'],
            'registrant' => ['nullable', 'string', 'max:255'],
            // Accept date string (Y-m-d or ISO 8601 UTC). MySQL whereDate() will parse correctly.
            'exposure_start_date_from' => ['nullable', 'date'],
            'exposure_start_date_to' => ['nullable', 'date'],
            'exposure_end_date_from' => ['nullable', 'date'],
            'exposure_end_date_to' => ['nullable', 'date'],
            'sort_by' => ['nullable', 'string', 'in:name,status,is_best,sort_order,created_at'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            'tree' => ['nullable', 'boolean'],
            // Pagination - Support both 'page' and 'current_page' for backward compatibility
            'page' => ['nullable', 'integer', 'min:1'],
            'current_page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Normalize: Use 'page' if provided, otherwise use 'current_page'
        $page = $this->input('page') ?? $this->input('current_page');

        $this->merge([
            'current_page' => $page,
        ]);

        // Convert string "true"/"false" to boolean for boolean fields
        // Query string parameters come as strings, need to convert them
        $booleanFields = ['tree', 'is_best'];
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

        // When filtering by level (large/medium/small) and tree is not explicitly set,
        // default to flat list (tree = false) so the result only contains the requested level.
        if ($this->filled('level') && ! $this->has('tree')) {
            $this->merge(['tree' => false]);
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
