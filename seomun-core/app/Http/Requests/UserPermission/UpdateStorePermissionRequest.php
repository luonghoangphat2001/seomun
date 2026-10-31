<?php

namespace App\Http\Requests\UserPermission;

use App\Enums\StorePermissionScope;
use App\Enums\StorePermissionType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateStorePermissionRequest extends FormRequest
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
        $permissionScopeValues = array_map(fn ($case) => $case->value, StorePermissionScope::cases());
        $permissionTypeValues = array_map(fn ($case) => $case->value, StorePermissionType::cases());

        return [
            'name' => 'required|string',
            'permission_scope' => ['required', 'string', Rule::in($permissionScopeValues)],
            'permission_type' => 'required|array',
            'permission_type.*' => ['required', 'string', Rule::in($permissionTypeValues)],
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // name
            'name.required' => '권한 이름을 입력해주세요.',
            'name.string' => '권한 이름은 문자열이어야 합니다.',

            // permission_scope
            'permission_scope.required' => '권한 범위를 선택해주세요.',
            'permission_scope.string' => '권한 범위 형식이 올바르지 않습니다.',
            'permission_scope.in' => '올바른 권한 범위를 선택해주세요.',

            // permission_type (array)
            'permission_type.required' => '권한 유형을 선택해주세요.',
            'permission_type.array' => '권한 유형 형식이 올바르지 않습니다.',

            // permission_type.*
            'permission_type.*.required' => '권한 유형 값이 비어있습니다.',
            'permission_type.*.string' => '권한 유형 값은 문자열이어야 합니다.',
            'permission_type.*.in' => '올바른 권한 유형을 선택해주세요.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @return void
     *
     * @throws HttpResponseException
     */
    protected function failedValidation(Validator $validator)
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
