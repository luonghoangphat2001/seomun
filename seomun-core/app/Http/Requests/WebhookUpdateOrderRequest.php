<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WebhookUpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'external_order_ids' => 'required|array|min:1',
            'external_order_ids.*' => 'required|string',

            // Contact (sender)
            'tel' => 'nullable|string',
            'hp' => 'nullable|string',
            'hp2' => 'nullable|string',
            'email' => 'nullable|email',
            'f_name' => 'nullable|string',
            'f_tel' => 'nullable|string',
            'f_zipcode' => 'nullable|string',
            'f_addr' => 'nullable|string',
            'f_addr2' => 'nullable|string',

            // Shipping (recipient)
            'd_name' => 'nullable|string',
            'd_tel' => 'nullable|string',
            'd_hp' => 'nullable|string',
            'd_zipcode' => 'nullable|string',
            'd_addr1' => 'nullable|string',
            'd_addr2' => 'nullable|string',
            'd_type_admin' => 'nullable|string',
            'd_fee' => 'nullable|string',
            'd_loc2' => 'nullable|string',
            'd_time' => 'nullable|string',
        ];
    }
}
