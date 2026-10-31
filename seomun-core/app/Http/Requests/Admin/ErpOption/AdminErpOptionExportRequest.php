<?php

namespace App\Http\Requests\Admin\ErpOption;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminErpOptionExportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
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
            'selected_ids.*' => ['integer', 'exists:erp_options,id'],
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'nullable', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'nullable', 'integer', 'min:1', 'max:100'],
            'erp_code' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive',
            'option_code' => 'nullable|string|max:255',
            'option_label' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:255',
            'label' => 'nullable|string|max:255',
            'value' => 'nullable|string|max:255',
            'group_code' => 'nullable|string|max:255',
            'group_label' => 'nullable|string|max:255',
            'display_type' => 'nullable|string|in:select,radio,checkbox',
            'is_required' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'amount' => 'nullable|numeric',
            'additional_price_min' => 'nullable|numeric',
            'additional_price_max' => 'nullable|numeric|gte:additional_price_min',
            'registered_from' => 'nullable|date',
            'registered_to' => 'nullable|date|after_or_equal:registered_from',
            'created_from' => 'nullable|date',
            'created_to' => 'nullable|date|after_or_equal:created_from',
            'sort_by' => 'nullable|string|in:erp_code,name,status,amount,registered_at,option_code,option_label,code,label,additional_price,is_active,sort_order,created_at',
            'sort_order' => 'nullable|string|in:asc,desc',
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
        ];
    }

    protected function prepareForValidation(): void
    {
        $page = $this->input('page') ?? $this->input('current_page');
        // Only set current_page when a value is actually provided,
        // so that integer/min rules don't run for export_type = ALL.
        if ($page !== null && $page !== '') {
            $this->merge(['current_page' => $page]);
        }
        foreach (['registered_from', 'registered_to', 'created_from', 'created_to'] as $key) {
            $value = $this->input($key);
            if ($value !== null && $value !== '') {
                try {
                    $this->merge([$key => Carbon::parse($value)->format('Y-m-d H:i:s')]);
                } catch (\Throwable $e) {
                }
            }
        }
    }
}
