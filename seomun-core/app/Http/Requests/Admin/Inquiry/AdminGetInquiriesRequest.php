<?php

namespace App\Http\Requests\Admin\Inquiry;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminGetInquiriesRequest extends FormRequest
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
        $inquiryStatusValues = array_map(fn ($case) => $case->value, InquiryStatus::cases());
        $inquiryCategoryValues = array_map(fn ($case) => $case->value, InquiryCategory::cases());

        return [
            // FSD: filters
            'search_term' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in($inquiryStatusValues)],
            'inquiry_type' => ['nullable', 'string', Rule::in($inquiryCategoryValues)],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'inquirer_name' => ['nullable', 'string', 'max:255'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            // created_from/created_to (alias cho start_date/end_date cũ)
            'created_from' => ['nullable', 'date'],
            'created_to' => ['nullable', 'date', 'after_or_equal:created_from'],
            // Backward compatibility
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'has_attachment' => ['nullable', 'boolean'],
            // Sorting
            'sort_by' => ['nullable', 'string', 'in:created_at,updated_at,inquiry_type,status,customer_name'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            // Legacy combined search
            'search' => ['nullable', 'string', 'max:255'],
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
            // Normalize created_from/created_to from legacy start_date/end_date if FE dùng tên cũ
            'created_from' => $this->input('created_from') ?? $this->input('start_date'),
            'created_to' => $this->input('created_to') ?? $this->input('end_date'),
        ]);
    }
}
