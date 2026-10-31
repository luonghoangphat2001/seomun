<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BatchDeleteOrdersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by auth middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'order_numbers' => ['required', 'array', 'min:1'],
            'order_numbers.*' => ['required', 'string', 'distinct'],
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
            'order_numbers.required' => '주문 번호 목록이 필요합니다.',
            'order_numbers.array' => '주문 번호는 배열 형태여야 합니다.',
            'order_numbers.min' => '최소 1개 이상의 주문 번호가 필요합니다.',
            'order_numbers.*.required' => '주문 번호가 필요합니다.',
            'order_numbers.*.string' => '주문 번호는 문자열이어야 합니다.',
            'order_numbers.*.distinct' => '중복된 주문 번호가 있습니다.',
        ];
    }
}
