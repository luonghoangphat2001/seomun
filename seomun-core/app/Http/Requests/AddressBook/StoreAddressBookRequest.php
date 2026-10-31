<?php

namespace App\Http\Requests\AddressBook;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreAddressBookRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $input = $this->all();

        if (! isset($input['recipient']) && isset($input['name'])) {
            $input['recipient'] = $input['name'];
        }

        if (! isset($input['name']) && isset($input['recipient'])) {
            $input['name'] = $input['recipient'];
        }

        $this->replace($input);
    }

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
            'recipient' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20|regex:/^[0-9-]+$/',
            'mobile' => 'nullable|string|max:20|regex:/^[0-9-]+$/',
            'email' => 'nullable|email|max:255',
            'postcode' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:255',
            'detailed_address' => 'nullable|string|max:255',
            'is_default' => 'nullable|boolean',
            'delivery_message' => 'nullable|string|max:255',
            'delivery_message_preset' => 'nullable|string|max:255',
            'delivery_message_custom' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => '배송지명을 입력해주세요.',
            'name.max' => '배송지명은 :max자를 초과할 수 없습니다.',

            'recipient.required' => '수령자를 입력해주세요.',
            'recipient.max' => '수령자명은 :max자를 초과할 수 없습니다.',

            'phone.regex' => '올바른 전화번호 형식을 입력해주세요.',
            'phone.max' => '전화번호는 :max자를 초과할 수 없습니다.',

            'mobile.regex' => '올바른 핸드폰 번호 형식을 입력해주세요.',
            'mobile.max' => '핸드폰 번호는 :max자를 초과할 수 없습니다.',

            'postcode.max' => '우편번호는 :max자를 초과할 수 없습니다.',
            'address.max' => '주소는 :max자를 초과할 수 없습니다.',
            'detailed_address.max' => '상세주소는 :max자를 초과할 수 없습니다.',

            'is_default.boolean' => '기본 배송지 설정은 true 또는 false여야 합니다.',

            'email.email' => '올바른 이메일 형식을 입력해주세요.',
            'delivery_message.max' => '배송 메시지는 :max자를 초과할 수 없습니다.',
            'delivery_message_preset.max' => '배송 메시지는 :max자를 초과할 수 없습니다.',
            'delivery_message_custom.max' => '직접 입력 배송 메시지는 :max자를 초과할 수 없습니다.',
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
