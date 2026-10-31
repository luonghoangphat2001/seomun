<?php

namespace App\Http\Requests\Admin\ErpOptionGroup;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminErpOptionGroupExportRequest extends FormRequest
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
            'selected_ids.*' => ['integer', 'exists:erp_option_groups,id'],
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'nullable', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'nullable', 'integer', 'min:1', 'max:100'],
            'code' => 'nullable|string|max:255',
            'label' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'display_type' => 'nullable|string|in:select,radio,checkbox',
            'is_required' => 'nullable|boolean',
            'created_from' => 'nullable|date',
            'created_to' => 'nullable|date|after_or_equal:created_from',
            'sort_by' => 'nullable|string|in:code,label,type,is_required,display_type,created_at',
            'sort_order' => 'nullable|string|in:asc,desc',
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
        ];
    }

    protected function prepareForValidation(): void
    {
        $page = $this->input('page') ?? $this->input('current_page');
        if ($page !== null && $page !== '') {
            $this->merge(['current_page' => $page]);
        }
        foreach (['created_from', 'created_to'] as $key) {
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
