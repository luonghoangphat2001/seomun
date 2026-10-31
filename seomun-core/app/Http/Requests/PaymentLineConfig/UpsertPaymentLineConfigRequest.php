<?php

namespace App\Http\Requests\PaymentLineConfig;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpsertPaymentLineConfigRequest extends FormRequest
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
            'user_id' => 'required|integer',
            'is_enabled' => 'required|boolean',
            'is_use_email_notification' => 'required|boolean',
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
            // user_id
            'user_id.required' => '사용자를 선택해주세요.',
            'user_id.integer' => '사용자 ID 형식이 올바르지 않습니다.',

            // is_enabled
            'is_enabled.required' => '활성화 여부를 입력해주세요.',
            'is_enabled.boolean' => '활성화 여부 값이 올바르지 않습니다.',

            // is_use_email_notification
            'is_use_email_notification.required' => '이메일 알림 사용 여부를 입력해주세요.',
            'is_use_email_notification.boolean' => '이메일 알림 사용 여부 값이 올바르지 않습니다.',
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
