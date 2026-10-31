<?php

namespace App\Http\Requests\Admin\UserPermission;

use App\Rules\UniqueUserPermission;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminUserPermissionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Allow changing linked authority & status
            'admin_permission_id' => [
                'nullable',
                'integer',
                'exists:admin_permissions,id',
                new UniqueUserPermission($this->route('id')),
            ],
            'status' => ['nullable', 'string', 'in:active,inactive'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => '입력값이 올바르지 않습니다.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
