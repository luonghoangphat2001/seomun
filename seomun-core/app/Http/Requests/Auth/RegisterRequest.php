<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

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

            // Organization Information (customer portal members)
            'authority' => 'nullable|string|max:50',
            'headquarters' => 'nullable|string|max:100',
            'business_office' => 'nullable|string|max:100',
            'team' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',

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
            'business_registration_file' => $isBusiness
                ? 'required|file|mimes:pdf,jpg,jpeg,png|max:10240'
                : 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',

            // Terms Agreement
            'agree_privacy' => 'required|accepted',
            'agree_terms' => 'required|accepted',
            'agree_sms' => 'required|in:true,false,1,0',
            'agree_email' => 'required|in:true,false,1,0',
        ];
    }

    public function messages(): array
    {
        return [
            'member_type.required' => '회원 유형을 선택해주세요.',
            'member_type.in' => '올바른 회원 유형을 선택해주세요.',

            'name.required' => '이름을 입력해주세요.',
            'username.required' => '아이디를 입력해주세요.',
            'username.unique' => '이미 사용중인 아이디입니다.',
            'username.min' => '아이디는 최소 :min자 이상이어야 합니다.',
            'username.max' => '아이디는 최대 :max자를 초과할 수 없습니다.',
            'username.regex' => '아이디는 영문, 숫자, 언더스코어(_)만 사용 가능합니다.',

            'password.required' => '비밀번호를 입력해주세요.',
            'password.min' => '비밀번호는 최소 6자 이상이어야 합니다.',
            'password.max' => '비밀번호는 최대 :max자를 초과할 수 없습니다.',
            'password.regex' => '비밀번호는 영문/숫자, 특수문자를 포함해야 합니다.',
            'password_confirmation.required' => '비밀번호 확인을 입력해주세요.',

            'email.required' => '이메일을 입력해주세요.',
            'email.email' => '올바른 이메일 형식을 입력해주세요.',
            'email.unique' => '이미 사용중인 이메일입니다.',

            'mobile.required' => '휴대폰 번호를 입력해주세요.',
            'mobile.regex' => '올바른 휴대폰 번호 형식을 입력해주세요.',

            'phone.regex' => '올바른 전화번호 형식을 입력해주세요.',

            // Business fields
            'company_name.required' => '기업명을 입력해주세요.',
            'business_registration_number.required' => '사업자등록번호를 입력해주세요.',
            'business_registration_number.unique' => '이미 등록된 사업자등록번호입니다.',
            'representative_name.required' => '대표자명을 입력해주세요.',
            'business_postcode.required' => '기업 우편번호를 입력해주세요.',
            'business_address.required' => '기업 주소를 입력해주세요.',
            'business_registration_file.required' => '사업자등록증을 업로드해주세요.',
            'business_registration_file.mimes' => '사업자등록증은 PDF, JPG, PNG 형식만 가능합니다.',
            'business_registration_file.max' => '파일 크기는 10MB를 초과할 수 없습니다.',
            'tax_invoice_email.email' => '올바른 이메일 형식을 입력해주세요.',
            'homepage_url.url' => '올바른 URL 형식을 입력해주세요.',

            'agree_privacy.required' => '개인정보취급방침에 동의해주세요.',
            'agree_privacy.accepted' => '개인정보취급방침에 동의해주세요.',
            'agree_terms.required' => '이용약관에 동의해주세요.',
            'agree_terms.accepted' => '이용약관에 동의해주세요.',
            'agree_sms.required' => 'SMS 수신에 동의해주세요.',
            'agree_sms.accepted' => 'SMS 수신에 동의해주세요.',
            'agree_email.required' => '이메일 수신에 동의해주세요.',
            'agree_email.accepted' => '이메일 수신에 동의해주세요.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => '입력값이 올바르지 않습니다.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
