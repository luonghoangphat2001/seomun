<?php

namespace App\Http\Requests\Payment;

use App\Enums\PaymentMethod;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InitiatePaymentRequest extends FormRequest
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
            'order_number' => ['required', 'string', 'exists:orders,order_number'],
            'payment_method' => ['required', 'string', Rule::in(array_column(PaymentMethod::cases(), 'value'))],
            'bank_account_holder' => [
                Rule::requiredIf(fn () => config('popbill.enabled') && $this->input('payment_method') === 'bank_transfer'),
                'nullable', 'string', 'max:100',
            ],
            'bank_account_key' => [
                Rule::requiredIf(fn () => config('popbill.enabled') && $this->input('payment_method') === 'bank_transfer'),
                'nullable', 'string', Rule::in(['hana', 'im', 'woori']),
            ],
            'return_url' => ['nullable', 'url', 'max:255'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'order_number.required' => '주문번호는 필수입니다.',
            'order_number.exists' => '주문을 찾을 수 없습니다.',
            'payment_method.required' => '결제 수단은 필수입니다.',
            'payment_method.in' => '유효하지 않은 결제 수단입니다.',
            'return_url.url' => '반환 URL은 올바른 URL 형식이어야 합니다.',
        ];
    }
}
