<?php

namespace App\Http\Requests\Admin\Customer;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UploadCustomerLogoRequest extends FormRequest
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
    /**
     * At least one logo file should be sent. Each field is optional for partial update.
     */
    public function rules(): array
    {
        return [
            'logo_v3_common' => [
                'nullable',
                'image',
                'mimes:jpeg,jpg,png,svg,webp',
                'max:5120', // 5MB
            ],
            'logo_v2_header' => [
                'nullable',
                'image',
                'mimes:jpeg,jpg,png,svg,webp',
                'max:5120', // 5MB
            ],
            'logo_v2_login' => [
                'nullable',
                'image',
                'mimes:jpeg,jpg,png,svg,webp',
                'max:5120', // 5MB
            ],
        ];
    }
}
