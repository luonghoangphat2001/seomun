<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class SendVerificationCodeRequest extends FormRequest
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
            'purpose' => 'required|in:register,find_username,find_id,reset_password,change_phone',
            'company_code' => 'nullable|string|max:50',
            'name' => 'required_if:purpose,find_username,find_id,reset_password|string|max:100',
            'username' => 'nullable|required_if:purpose,reset_password|string|max:50|exists:users,username',
            'type' => 'required|in:email,mobile',
            'email' => 'nullable|required_if:type,email|email|max:255',
            'mobile' => 'nullable|required_if:type,mobile|string|max:20|regex:/^[0-9-]+$/',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'purpose.required' => '요청 용도를 선택해주세요.',
            'purpose.in' => '요청 용도는 find_id, find_username 또는 reset_password여야 합니다.',
            'name.required_if' => '이름을 입력해주세요.',
            'username.required_if' => '아이디를 입력해주세요.',
            'username.exists' => '존재하지 않는 아이디입니다.',
            'type.required' => '인증 타입을 선택해주세요.',
            'type.in' => '인증 타입은 email 또는 mobile이어야 합니다.',
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
