<?php

namespace App\Http\Requests\Admin\TransactionSettings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'address' => ['nullable', 'string', 'max:500'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:30'],
        ];
    }
}
