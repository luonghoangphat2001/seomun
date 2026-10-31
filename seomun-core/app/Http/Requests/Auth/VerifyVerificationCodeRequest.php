<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class VerifyVerificationCodeRequest extends FormRequest
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
            'type' => 'required|in:email,mobile',
            'code' => 'required|string|size:6',
            'purpose' => 'required|in:register,find_username,find_id,reset_password,change_phone',
            'email' => 'required_if:type,email|email|max:255|nullable',
            'mobile' => 'required_if:type,mobile|string|max:20|regex:/^[0-9-]+$/|nullable',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'type.required' => '인증 타입을 선택해주세요.',
            'type.in' => '인증 타입은 email 또는 mobile이어야 합니다.',
            'code.required' => '인증번호를 입력해주세요.',
            'code.size' => '인증번호는 6자리여야 합니다.',
            'purpose.required' => '용도를 선택해주세요.',
            'purpose.in' => '용도는 find_id, find_username 또는 reset_password여야 합니다.',
            'email.required_if' => '이메일을 입력해주세요.',
            'email.email' => '올바른 이메일 형식을 입력해주세요.',
            'mobile.required_if' => '핸드폰 번호를 입력해주세요.',
            'mobile.regex' => '올바른 핸드폰 번호 형식을 입력해주세요.',
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
