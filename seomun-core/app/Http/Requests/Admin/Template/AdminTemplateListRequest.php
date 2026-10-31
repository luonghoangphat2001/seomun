<?php

namespace App\Http\Requests\Admin\Template;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminTemplateListRequest extends FormRequest
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
            'export_type' => ['string', Rule::in(['ALL', 'CURRENT_PAGE', 'SELECTED'])],

            // Selected template IDs (required if export_type = SELECTED)
            'selected_ids' => [
                'required_if:export_type,SELECTED',
                'array',
                'min:1',
            ],
            'selected_ids.*' => ['integer', 'exists:templates,id'],

            // Locale for Excel column headings and sheet name (optional, defaults handled in export class)
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],

            // Current page info (required if export_type = CURRENT_PAGE)
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],

            // Template name (템플릿명)
            'template_name' => 'nullable|string|max:255',

            // Linked product (연결된 제품)
            'linked_product' => 'nullable|string|max:255',

            // Product ID
            'product_id' => 'nullable|integer|exists:products,id',

            // Specification keyword: search in any spec value (size, paper, sides). e.g. "90x50mm", "300gsm", "A4"
            'specification' => 'nullable|string|max:255',

            // Status (active/inactive)
            'status' => 'nullable|string|in:active,inactive',

            // Registrant (등록자)
            'registrant' => 'nullable|string|max:255',

            // Last modified date
            'last_modified_from' => 'nullable|date',
            'last_modified_to' => 'nullable|date|after_or_equal:last_modified_from',

            // Pagination - Support both 'page' and 'current_page' for backward compatibility
            'page' => 'nullable|integer|min:1',
            'current_page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',

            // Sort
            'sort_by' => 'nullable|string|in:name,created_at,updated_at,is_active',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Normalize: Use 'page' if provided, otherwise use 'current_page'
        $page = $this->input('page') ?? $this->input('current_page');

        $this->merge([
            'current_page' => $page,
        ]);
    }
}
