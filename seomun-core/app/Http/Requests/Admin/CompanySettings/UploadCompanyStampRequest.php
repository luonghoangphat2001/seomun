<?php

namespace App\Http\Requests\Admin\CompanySettings;

use Illuminate\Foundation\Http\FormRequest;

class UploadCompanyStampRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stamp' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
        ];
    }
}
