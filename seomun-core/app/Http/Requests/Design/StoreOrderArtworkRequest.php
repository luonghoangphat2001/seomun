<?php

namespace App\Http\Requests\Design;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderArtworkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'side' => ['required', 'string', 'in:front,back'],
            'layout_data' => ['required', 'array'],
            'layout_s3_path' => ['nullable', 'string'],
            'logo_path' => ['nullable', 'string'],
            'preview_image_path' => ['nullable', 'string'],
        ];
    }
}
