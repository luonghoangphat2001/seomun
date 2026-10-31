<?php

namespace App\Http\Requests\MyPage;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GetInquiriesRequest extends FormRequest
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
        $inquiryStatusValues = array_map(fn($case) => $case->value, InquiryStatus::cases());
        $inquiryCategoryValues = array_map(fn($case) => $case->value, InquiryCategory::cases());

        return [
            // FSD: filters
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in($inquiryStatusValues)],
            'category' => ['nullable', 'string', Rule::in($inquiryCategoryValues)],
            // created_from/created_to
            'created_from' => ['nullable', 'date'],
            'created_to' => ['nullable', 'date', 'after_or_equal:created_from'],
            // Sorting
            'sort_by' => ['nullable', 'string', 'in:created_at,updated_at,inquiry_type,status,customer_name'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            // Pagination - Support both 'page' and 'current_page' for backward compatibility
            'page' => ['nullable', 'integer', 'min:1'],
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
