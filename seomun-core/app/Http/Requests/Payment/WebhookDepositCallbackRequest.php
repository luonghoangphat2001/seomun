<?php

namespace App\Http\Requests\Payment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class WebhookDepositCallbackRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // TODO: Add signature verification for production
        // Verify webhook comes from legitimate PG
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
            'createdAt' => ['required', 'date'],
            'secret' => ['required', 'string', 'max:255'],
            'status' => ['required', 'string'],
            'transactionKey' => ['required', 'string', 'max:255'],
            'orderId' => ['required', 'string', 'max:255'],
        ];
    }
}
