<?php

namespace App\Http\Requests\Admin\Permission;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class AdminPermissionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:100', Rule::unique('admin_permissions', 'code')->ignore($this->route('id'))],
            'description' => ['nullable', 'string'],
            'usage_status' => ['required', 'string', 'in:active,inactive'],
            'menu_permissions' => ['nullable', 'array'],
            'menu_permissions.*.menu' => ['required_with:menu_permissions', 'string', 'max:100'],
            'menu_permissions.*.actions' => ['required_with:menu_permissions', 'array'],
            'menu_permissions.*.actions.*' => ['required_with:menu_permissions.*.actions', 'string', 'in:view,register,edit,delete,approval'],
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
