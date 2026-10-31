<?php

namespace App\Http\Requests\Admin\Member;

use App\Enums\ApprovalStatus;
use App\Enums\UserStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MemberRegistrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isBusiness = $this->input('member_type') === 'business';

        return [
            // Member type
            'member_type' => 'required|string|in:individual,business',

            // Basic Information
            'name' => 'required|string|max:100',
            'username' => 'required|string|unique:users,username|min:4|max:50|regex:/^[a-zA-Z0-9_]+$/',
            'password' => 'required|string|min:6|max:20|regex:/^(?=.*[a-zA-Z])[A-Za-z\d!@#$%^&*_]+$/',
            'password_confirmation' => 'required|string',
            'email' => 'nullable|email|unique:users,email',
            'mobile' => 'required|string|max:20|regex:/^[0-9-]+$/',
            'phone' => 'nullable|string|max:20|regex:/^[0-9-]+$/',

            // Address Information (개인)
            'postcode' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:255',
            'detailed_address' => 'nullable|string|max:255',

            // Business Information — maps to Customer record (기업회원 전용)
            'company_name' => $isBusiness ? 'required|string|max:200' : 'nullable|string|max:200',
            'business_registration_number' => $isBusiness
                ? 'required|string|max:20|unique:customers,business_registration_number'
                : 'nullable|string|max:20',
            'representative_name' => $isBusiness ? 'required|string|max:100' : 'nullable|string|max:100',
            'industry_type' => 'nullable|string|max:100',
            'business_type' => 'nullable|string|max:100',
            'business_postcode' => $isBusiness ? 'required|string|max:10' : 'nullable|string|max:10',
            'business_address' => $isBusiness ? 'required|string|max:255' : 'nullable|string|max:255',
            'business_address_detail' => 'nullable|string|max:255',
            'tax_invoice_email' => 'nullable|email|max:255',
            'homepage_url' => 'nullable|url|max:255',
            'business_registration_file' => 'nullable|string|max:255',
            'note' => 'nullable|string',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Combine email_prefix and email_domain if email is not provided
        if (! $this->has('email') && $this->has('email_prefix') && $this->has('email_domain')) {
            $this->merge([
                'email' => $this->email_prefix.'@'.$this->email_domain,
            ]);
        }

        // Normalize phone and mobile numbers (remove hyphens)
        if ($this->has('phone')) {
            $this->merge([
                'phone' => preg_replace('/[^0-9]/', '', $this->phone),
            ]);
        }
        if ($this->has('mobile')) {
            $this->merge([
                'mobile' => preg_replace('/[^0-9]/', '', $this->mobile),
            ]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Ensure email is provided (either as single field or split fields)
            if (! $this->has('email') && (! $this->has('email_prefix') || ! $this->has('email_domain'))) {
                $validator->errors()->add('email', '이메일을 입력해주세요.');
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            // Account Information
            'name.required' => '이름은 필수입니다.',
            'name.max' => '이름은 :max자를 초과할 수 없습니다.',

            'username.required' => '아이디는 필수입니다.',
            'username.unique' => '이미 사용중인 아이디입니다.',
            'username.min' => '아이디는 최소 :min자 이상이어야 합니다.',
            'username.max' => '아이디는 최대 :max자를 초과할 수 없습니다.',
            'username.regex' => '아이디는 영문, 숫자, 언더스코어(_)만 사용 가능합니다.',

            'password.required' => '비밀번호는 필수입니다.',
            'password.min' => '비밀번호는 최소 :min자 이상이어야 합니다.',
            'password.max' => '비밀번호는 최대 :max자를 초과할 수 없습니다.',
            'password.regex' => '비밀번호는 영문, 숫자, 특수문자(!@#$%^&*_)를 포함해야 합니다.',
            'password_confirmation.required' => '비밀번호 확인은 필수입니다.',
            'password_confirmation.same' => '비밀번호 확인이 일치하지 않습니다.',

            // Email
            'email.email' => '올바른 이메일 형식이 아닙니다.',
            'email.unique' => '이미 사용중인 이메일입니다.',

            // Contact Information
            'phone.regex' => '올바른 전화번호 형식이 아닙니다.',
            'mobile.regex' => '올바른 휴대폰 번호 형식이 아닙니다.',

            // Status
            'status.in' => '상태 값이 올바르지 않습니다.',
            'approval_status.in' => '승인상태 값이 올바르지 않습니다.',
        ];
    }
}
