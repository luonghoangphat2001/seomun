<?php

namespace App\Http\Requests\Admin\Member;

use App\Enums\ApprovalStatus;
use App\Enums\UserStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MemberListRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Admin authorization is handled by middleware
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
            // Search term (검색어)
            'search_term' => 'nullable|string|max:255',

            // Authority filter (권한)
            'authority' => 'nullable|string|max:255',

            // Approval status filter (승인상태)
            'approval_status' => [
                'nullable',
                Rule::in(array_column(ApprovalStatus::cases(), 'value')),
            ],

            // Status filter (상태)
            'status' => [
                'nullable',
                Rule::in(array_column(UserStatus::cases(), 'value')),
            ],

            // Pagination - Support both 'page' and 'current_page' for backward compatibility
            'page' => 'nullable|integer|min:1',
            'current_page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',

            // Sort
            'sort_by' => 'nullable|string|in:created_at,name,status,username,email',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Normalize: Use 'page' if provided, otherwise use 'current_page'
        $page = $this->input('page') ?? $this->input('current_page');

        $this->merge([
            'current_page' => $page,
            'per_page' => $this->per_page ?? 20,
            'sort_by' => $this->sort_by ?? 'created_at',
            'sort_order' => $this->sort_order ?? 'desc',
        ]);
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'approval_status.in' => '승인상태 값이 올바르지 않습니다.',
            'status.in' => '상태 값이 올바르지 않습니다.',
        ];
    }
}
