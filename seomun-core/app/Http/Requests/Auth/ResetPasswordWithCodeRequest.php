<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ResetPasswordWithCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|exists:users,name',
            'username' => 'required|string|exists:users,username',
            'type' => 'required|in:email,mobile',
            'email' => 'required_if:type,email|email|max:255',
            'mobile' => 'required_if:type,mobile|string|max:20|regex:/^[0-9-]+$/',
            'verification_code' => 'nullable|string|size:6',
            'password' => [
                'required',
                'string',
                'min:6',
                'max:20',
                'regex:/^(?=.*[a-zA-Z])[A-Za-z\d!@#$%^&*_]+$/',
                'confirmed',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => '아이디를 입력해주세요.',
            'username.exists' => '존재하지 않는 아이디입니다.',
            'type.required' => '인증 타입을 선택해주세요.',
            'type.in' => '인증 타입은 email 또는 mobile이어야 합니다.',
            'email.required_if' => '이메일을 입력해주세요.',
            'email.email' => '올바른 이메일 형식을 입력해주세요.',
            'mobile.required_if' => '핸드폰 번호를 입력해주세요.',
            'mobile.regex' => '올바른 핸드폰 번호 형식을 입력해주세요.',
            'verification_code.required' => '인증번호를 입력해주세요.',
            'verification_code.size' => '인증번호는 6자리여야 합니다.',
            'password.required' => '새 비밀번호를 입력해주세요.',
            'password.min' => '비밀번호는 최소 :min자 이상이어야 합니다.',
            'password.max' => '비밀번호는 최대 :max자를 초과할 수 없습니다.',
            'password.regex' => '비밀번호는 영문/숫자, 특수문자를 포함해야 합니다.',
            'password.confirmed' => '비밀번호 확인이 일치하지 않습니다.',
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
