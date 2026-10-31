<?php

namespace App\Http\Requests\Admin\TransactionSettings;

use Illuminate\Foundation\Http\FormRequest;

class UploadTransactionSettingsLogoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'logo' => ['required', 'image', 'mimes:jpeg,jpg,png,webp,svg', 'max:5120'],
        ];
    }
}
