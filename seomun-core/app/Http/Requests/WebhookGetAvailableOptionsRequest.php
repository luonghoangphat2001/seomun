<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WebhookGetAvailableOptionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_code' => 'required|string',
            'size_option_id' => 'nullable|integer|exists:erp_size_options,id',
            'selected_options' => 'nullable|array',
        ];
    }
}
