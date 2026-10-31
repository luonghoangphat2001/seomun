<?php

namespace App\Http\Requests\Admin\UserPermission;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUserPermissionExportRequest extends FormRequest
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
            'selected_ids.*' => ['integer', 'exists:user_admin_permissions,id'],
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],
            'customer' => 'nullable|string|max:255',
            'authority' => 'nullable|string|max:255',
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive',
            'sort_by' => 'nullable|string|in:grant_date,created_at',
            'sort_order' => 'nullable|string|in:asc,desc',
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
        ];
    }
}
