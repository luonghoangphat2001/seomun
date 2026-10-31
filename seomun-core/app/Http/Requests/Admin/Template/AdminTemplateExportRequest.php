<?php

namespace App\Http\Requests\Admin\Template;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminTemplateExportRequest extends FormRequest
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
            'selected_ids.*' => ['integer', 'exists:templates,id'],
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
            'template_name' => 'nullable|string|max:255',
            'linked_product' => 'nullable|string|max:255',
            'product_id' => 'nullable|integer|exists:products,id',
            'specification' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive',
            'registrant' => 'nullable|string|max:255',
            'last_modified_from' => 'nullable|date',
            'last_modified_to' => 'nullable|date|after_or_equal:last_modified_from',
            'sort_by' => 'nullable|string|in:name,created_at,updated_at,is_active',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Only normalize current_page when it's actually provided
        if ($this->has('page') || $this->has('current_page')) {
            $page = $this->input('page') ?? $this->input('current_page');
            $this->merge(['current_page' => $page]);
        }
    }
}
