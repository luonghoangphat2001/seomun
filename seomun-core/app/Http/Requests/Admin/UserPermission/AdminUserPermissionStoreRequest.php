<?php

namespace App\Http\Requests\Admin\UserPermission;

use App\Rules\UniqueUserPermission;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminUserPermissionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Ensure JSON body is merged so validation sees name, description, status
        if ($this->isJson() && $this->getContent()) {
            $decoded = json_decode($this->getContent(), true);
            if (is_array($decoded)) {
                $this->merge($decoded);
            }
        }
    }

    public function rules(): array
    {
        return [
            // FSD: Register User Permission = chọn user + authority + status
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'admin_permission_id' => [
                'required',
                'integer',
                'exists:admin_permissions,id',
                new UniqueUserPermission($this->route('id')),
            ],
            'status' => ['required', 'string', 'in:active,inactive'],
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
