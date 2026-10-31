<?php

namespace App\Http\Requests\Admin\Member;

use App\Enums\ApprovalStatus;
use App\Enums\UserStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminMemberExportRequest extends FormRequest
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
            'selected_ids.*' => ['integer', 'exists:users,id'],
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],
            'search_term' => 'nullable|string|max:255',
            'authority' => 'nullable|string|max:255',
            'approval_status' => ['nullable', Rule::in(array_column(ApprovalStatus::cases(), 'value'))],
            'status' => ['nullable', Rule::in(array_column(UserStatus::cases(), 'value'))],
            'sort_by' => 'nullable|string|in:created_at,name,status,username,email',
            'sort_order' => 'nullable|string|in:asc,desc',
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
        ];
    }
}
