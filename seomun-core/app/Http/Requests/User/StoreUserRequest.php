<?php

namespace App\Http\Requests\User;

use App\Enums\UserAuthority;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
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
            // Basic Information
            'name' => 'required|string|max:100',
            'username' => 'required|string|unique:users,username|min:2|max:50|regex:/^[\p{Hangul}a-zA-Z0-9_]+$/u',
            'password' => [
                'required',
                'string',
                'regex:/^\d{4}$/',
            ],
            'password_confirmation' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20|regex:/^[0-9-]+$/',
            'mobile' => 'nullable|string|max:20|regex:/^[0-9-]+$/',

            // Address Information
            'postcode' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:255',
            'detailed_address' => 'nullable|string|max:255',

            // Organization Information
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

            // Terms Agreement
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
            // Basic Information
            'name.required' => '이름을 입력해주세요.',
            'name.max' => '이름은 :max자를 초과할 수 없습니다.',

            'username.required' => '아이디를 입력해주세요.',
            'username.unique' => '이미 사용중인 아이디입니다.',
            'username.min' => '아이디는 최소 :min자 이상이어야 합니다.',
            'username.max' => '아이디는 최대 :max자를 초과할 수 없습니다.',
            'username.regex' => '아이디는 한글, 영문, 숫자, 언더스코어(_)만 사용 가능합니다.',

            'password.required' => '비밀번호를 입력해주세요.',
            'password.regex' => '비밀번호는 4자리 숫자만 입력 가능합니다.',
            'password.confirmed' => '비밀번호 확인이 일치하지 않습니다.',
            'password_confirmation.required' => '비밀번호 확인을 입력해주세요.',

            'email.required' => '이메일을 입력해주세요.',
            'email.email' => '올바른 이메일 형식을 입력해주세요.',
            'email.unique' => '이미 사용중인 이메일입니다.',

            'phone.regex' => '올바른 전화번호 형식을 입력해주세요.',
            'phone.max' => '전화번호는 :max자를 초과할 수 없습니다.',

            'mobile.regex' => '올바른 핸드폰 번호 형식을 입력해주세요.',
            'mobile.max' => '핸드폰 번호는 :max자를 초과할 수 없습니다.',

            // Address Information
            'postcode.max' => '우편번호는 :max자를 초과할 수 없습니다.',
            'address.max' => '주소는 :max자를 초과할 수 없습니다.',
            'detailed_address.max' => '상세주소는 :max자를 초과할 수 없습니다.',

            // Organization Information
            // 'authority.max' => '권한은 :max자를 초과할 수 없습니다.',
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

            // Terms Agreement
            'agree_privacy.required' => '개인정보취급방침에 동의해주세요.',
            'agree_privacy.accepted' => '개인정보취급방침에 동의해주세요.',
            'agree_terms.required' => '이용약관에 동의해주세요.',
            'agree_terms.accepted' => '이용약관에 동의해주세요.',
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
