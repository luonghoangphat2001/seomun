<?php

namespace App\Http\Requests\Payment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TossConfirmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validate payload sent from FE after Toss redirects back.
     *
     * Expected fields follow Toss docs: paymentKey, orderId, amount.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'paymentKey' => ['required', 'string', 'max:255'],
            'orderId' => ['required', 'string', 'exists:orders,order_number'],
            'amount' => ['required', 'integer', 'min:1'],
        ];
    }
}
