<?php

namespace App\Http\Requests\Admin\Inquiry;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminInquiryExportRequest extends FormRequest
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
        $inquiryStatusValues = array_map(fn ($case) => $case->value, InquiryStatus::cases());
        $inquiryCategoryValues = array_map(fn ($case) => $case->value, InquiryCategory::cases());

        return [
            'export_type' => ['required', 'string', Rule::in(['ALL', 'CURRENT_PAGE', 'SELECTED'])],
            'selected_ids' => [
                'required_if:export_type,SELECTED',
                'array',
                'min:1',
            ],
            'selected_ids.*' => ['integer', 'exists:inquiries,id'],
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
            'search_term' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in($inquiryStatusValues)],
            'inquiry_type' => ['nullable', 'string', Rule::in($inquiryCategoryValues)],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'inquirer_name' => ['nullable', 'string', 'max:255'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'created_from' => ['nullable', 'date'],
            'created_to' => ['nullable', 'date', 'after_or_equal:created_from'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'has_attachment' => ['nullable', 'boolean'],
            'sort_by' => ['nullable', 'string', 'in:created_at,updated_at,inquiry_type,status,customer_name'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            'search' => ['nullable', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'created_from' => $this->input('created_from') ?? $this->input('start_date'),
            'created_to' => $this->input('created_to') ?? $this->input('end_date'),
        ]);
    }
}
