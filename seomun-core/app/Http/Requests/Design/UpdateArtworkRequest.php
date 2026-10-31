<?php

namespace App\Http\Requests\Design;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateArtworkRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by controller / middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'side' => ['sometimes', 'string', 'in:front,back'],
            'layout_data' => ['nullable', 'array'],
            'layout_s3_path' => ['nullable', 'string'],
            'logo_path' => ['nullable', 'string'],
            'preview_image_path' => ['nullable', 'string'],
        ];
    }
}
