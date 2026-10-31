<?php

namespace App\Http\Requests\User;

use App\Enums\UserAuthority;
use App\Enums\UserStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserListRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Search term (검색어)
            'search_term' => 'nullable|string|max:255',

            // Status
            'status' => [
                'nullable',
                Rule::in(array_column(UserStatus::cases(), 'value')),
            ],

            // Status
            'authority' => [
                'nullable',
                Rule::in(array_column(UserAuthority::cases(), 'value')),
            ],

            // Pagination
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',

            // Sort
            'sort_by' => 'nullable|string|in:created_at,id,status,username,name,email,agreed_at,email_verified_at,hire_date,resignation_date,department',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'page' => $this->page ?? 1,
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
            'status.in' => 'Status 값이 올바르지 않습니다.',
            'authority.in' => 'Authority 값이 올바르지 않습니다.',
        ];
    }
}
