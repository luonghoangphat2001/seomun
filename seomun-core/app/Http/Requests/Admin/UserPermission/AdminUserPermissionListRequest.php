<?php

namespace App\Http\Requests\Admin\UserPermission;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUserPermissionListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // FSD: Search filters - Customer, authority, status
            'customer' => ['nullable', 'string', 'max:255'],   // customer company name
            'authority' => ['nullable', 'string', 'max:255'],  // admin permission name
            // Backward-compatible combined search (customer/authority/registrant)
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive'])],
            'sort_by' => ['nullable', 'string', 'in:grant_date,created_at,status'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
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
        ]);
    }
}
