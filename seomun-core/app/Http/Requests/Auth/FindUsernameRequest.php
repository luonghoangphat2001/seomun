<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class FindUsernameRequest extends FormRequest
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
        $isMobile = $this->input('type') === 'mobile';

        return [
            'name'                      => 'required_unless:type,business|nullable|string|max:100',
            'type'                      => 'required|in:email,mobile,business',
            'email'                     => 'required_if:type,email|nullable|email|exists:users,email',
            'mobile'                    => 'required_if:type,mobile|nullable|string|max:20|regex:/^[0-9-]+$/',
            'verification_code'         => $isMobile ? 'required|string|size:6' : 'nullable|string|size:6',
            'company_name'              => 'required_if:type,business|nullable|string|max:255',
            'business_registration_number' => 'required_if:type,business|nullable|string|max:20',
            'representative_name'       => 'required_if:type,business|nullable|string|max:100',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => '이름을 입력해주세요.',
            'type.required' => '인증 타입을 선택해주세요.',
            'type.in'                              => '인증 타입은 email, mobile 또는 business이어야 합니다.',
            'company_name.required_if'             => '상호명을 입력해주세요.',
            'business_registration_number.required_if' => '사업자번호를 입력해주세요.',
            'representative_name.required_if'       => '대표자명을 입력해주세요.',
            'email.required_if' => '이메일을 입력해주세요.',
            'email.email' => '올바른 이메일 형식을 입력해주세요.',
            'email.exists' => '등록되지 않은 이메일입니다.',
            'mobile.required_if' => '핸드폰 번호를 입력해주세요.',
            'mobile.regex' => '올바른 핸드폰 번호 형식을 입력해주세요.',
            'verification_code.required' => '인증번호를 입력해주세요.',
            'verification_code.size' => '인증번호는 6자리여야 합니다.',
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
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => '입력값이 올바르지 않습니다.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
