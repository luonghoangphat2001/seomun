<?php

namespace App\Http\Requests\Admin\Category;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminCategoryExportRequest extends FormRequest
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
            'selected_ids.*' => ['integer', 'exists:categories,id'],
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],
            'large_category_name' => ['nullable', 'string', 'max:255'],
            'medium_category_name' => ['nullable', 'string', 'max:255'],
            'small_category_name' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:active,hidden'],
            'registrant' => ['nullable', 'string', 'max:255'],
            'sort_by' => ['nullable', 'string', 'in:name,status,sort_order,created_at'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
        ];
    }
}
