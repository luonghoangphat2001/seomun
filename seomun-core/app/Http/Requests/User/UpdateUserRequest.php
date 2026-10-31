<?php

namespace App\Http\Requests\User;

use App\Enums\UserAuthority;
use App\Enums\UserStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
        return [
            // Status
            'status' => [
                'nullable',
                Rule::in(array_column(UserStatus::cases(), 'value')),
            ],

            // Basic Info
            'name' => 'nullable|string|max:100',

            // Contact
            'phone' => 'nullable|string|max:20|regex:/^[0-9-]+$/',
            'mobile' => 'nullable|string|max:20|regex:/^[0-9-]+$/',

            // Address
            'postcode' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:255',
            'detailed_address' => 'nullable|string|max:255',

            // Organization
            'authority' => ['nullable', Rule::enum(UserAuthority::class)],
            'headquarters' => 'nullable|string|max:100',
            'business_office' => 'nullable|string|max:100',
            'team' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'hire_date' => 'nullable|date',
            'resignation_date' => 'nullable|date|after_or_equal:hire_date',
            'bank_name' => 'nullable|string|max:100',
            'account_number' => 'nullable|string|max:50',

            // Admin Permissions
            'admin_permission_ids' => 'nullable|array',
            'admin_permission_ids.*' => 'integer|exists:admin_permissions,id',

            // Terms
            'agree_privacy' => 'nullable|boolean',
            'agree_terms' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            // Status
            'status.in' => '상태 값이 올바르지 않습니다.',

            // Name
            'name.max' => '이름은 :max자를 초과할 수 없습니다.',

            // Phone
            'phone.regex' => '올바른 전화번호 형식을 입력해주세요.',
            'phone.max' => '전화번호는 :max자를 초과할 수 없습니다.',

            'mobile.regex' => '올바른 핸드폰 번호 형식을 입력해주세요.',
            'mobile.max' => '핸드폰 번호는 :max자를 초과할 수 없습니다.',

            // Address
            'postcode.max' => '우편번호는 :max자를 초과할 수 없습니다.',
            'address.max' => '주소는 :max자를 초과할 수 없습니다.',
            'detailed_address.max' => '상세주소는 :max자를 초과할 수 없습니다.',

            // Organization
            'headquarters.max' => '본부는 :max자를 초과할 수 없습니다.',
            'business_office.max' => '사업소는 :max자를 초과할 수 없습니다.',
            'team.max' => '팀은 :max자를 초과할 수 없습니다.',
            'position.max' => '직책은 :max자를 초과할 수 없습니다.',
            'department.max' => '부서는 :max자를 초과할 수 없습니다.',
            'hire_date.date' => '올바른 입사일 형식을 입력해주세요.',
            'resignation_date.date' => '올바른 퇴사일 형식을 입력해주세요.',
            'resignation_date.after_or_equal' => '퇴사일은 입사일 이후여야 합니다.',
            'bank_name.max' => '은행명은 :max자를 초과할 수 없습니다.',
            'account_number.max' => '계좌번호는 :max자를 초과할 수 없습니다.',

            // Terms
            'agree_privacy.boolean' => '개인정보 동의 값이 올바르지 않습니다.',
            'agree_terms.boolean' => '이용약관 동의 값이 올바르지 않습니다.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => '입력값이 올바르지 않습니다.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
