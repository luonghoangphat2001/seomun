<?php

namespace App\Http\Requests\Admin\ShippingSetting;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateShippingSettingRequest extends FormRequest
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
            'free_shipping_start_at' => ['nullable', 'date'],
            'free_shipping_end_at' => ['nullable', 'date', 'after_or_equal:free_shipping_start_at'],
        ];
    }
}
