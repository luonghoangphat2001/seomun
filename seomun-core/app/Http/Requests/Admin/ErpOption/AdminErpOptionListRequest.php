<?php

namespace App\Http\Requests\Admin\ErpOption;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminErpOptionListRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Export type: ALL, CURRENT_PAGE, SELECTED
            'export_type' => ['string', Rule::in(['ALL', 'CURRENT_PAGE', 'SELECTED'])],

            // Selected ERP option IDs (required if export_type = SELECTED)
            'selected_ids' => [
                'required_if:export_type,SELECTED',
                'array',
                'min:1',
            ],
            'selected_ids.*' => ['integer', 'exists:erp_options,id'],

            // Locale for Excel column headings and sheet name (optional, defaults handled in export class)
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
            
            // Current page info (required if export_type = CURRENT_PAGE)
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],
            
            // Legacy filters (backward compatibility)
            'erp_code' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive',

            // New ERP option filters
            'option_code' => 'nullable|string|max:255',
            'option_label' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:255',
            'label' => 'nullable|string|max:255',
            'value' => 'nullable|string|max:255',
            'erp_option_group_id' => 'nullable|integer|exists:erp_option_groups,id',
            'group_code' => 'nullable|string|max:255',
            'group_label' => 'nullable|string|max:255',
            'display_type' => 'nullable|string|in:select,radio,checkbox',
            'is_required' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'amount' => 'nullable|numeric',
            'additional_price_min' => 'nullable|numeric',
            'additional_price_max' => 'nullable|numeric|gte:additional_price_min',
            'created_from' => 'nullable|date',
            'created_to' => 'nullable|date|after_or_equal:created_from',

            // Legacy date aliases
            'registered_from' => 'nullable|date',
            'registered_to' => 'nullable|date|after_or_equal:registered_from',
            
            // Pagination - Support both 'page' and 'current_page' for backward compatibility
            'page' => 'nullable|integer|min:1',
            'current_page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            
            // Sort
            'sort_by' => 'nullable|string|in:erp_code,name,status,amount,registered_at,option_code,option_label,code,label,additional_price,is_active,sort_order,created_at',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Normalize: Use 'page' if provided, otherwise use 'current_page'
        $page = $this->input('page') ?? $this->input('current_page');
        $this->merge(['current_page' => $page]);

        // Accept date params in ISO 8601 / RFC 2822 (e.g. 2026-01-21T17:00:00.000Z)
        // and normalize to full datetime string (Y-m-d H:i:s) for DB range filtering.
        foreach (['registered_from', 'registered_to', 'created_from', 'created_to'] as $key) {
            $value = $this->input($key);
            if ($value !== null && $value !== '') {
                try {
                    $this->merge([$key => Carbon::parse($value)->format('Y-m-d H:i:s')]);
                } catch (\Throwable $e) {
                    // Leave as-is; validation rule 'date' will fail if unparseable
                }
            }
        }
    }
}
