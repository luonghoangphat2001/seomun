<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ForgotPasswordRequest extends FormRequest
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
            'name' => 'required|string|max:100',
            'username' => 'required|string|exists:users,username',
            'type' => 'required|in:email,mobile',
            'email' => 'required_if:type,email|nullable|email|exists:users,email',
            'mobile' => 'required_if:type,mobile|nullable|string|max:20|regex:/^[0-9-]+$/',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => '이름을 입력해주세요.',
            'username.required' => '아이디를 입력해주세요.',
            'username.exists' => '존재하지 않는 아이디입니다.',
            'type.required' => '인증 타입을 선택해주세요.',
            'type.in' => '인증 타입은 email 또는 mobile이어야 합니다.',
            'email.required_if' => '이메일을 입력해주세요.',
            'email.email' => '올바른 이메일 형식을 입력해주세요.',
            'email.exists' => '등록되지 않은 이메일입니다.',
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
