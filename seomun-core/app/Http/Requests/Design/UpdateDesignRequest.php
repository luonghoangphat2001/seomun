<?php

namespace App\Http\Requests\Design;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDesignRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'metadata' => ['sometimes', 'array'],
            'size_option_id' => ['sometimes', 'integer', 'exists:erp_size_options,id'],
            'width_mm' => ['sometimes', 'integer'],
            'height_mm' => ['sometimes', 'integer'],
            'preview_image_path' => ['sometimes', 'string'],
            'artworks' => ['nullable', 'array'],
            'artworks.*.id' => ['sometimes', 'integer', 'exists:order_artworks,id'],
            'artworks.*.side' => ['sometimes', 'string', 'in:front,back'],
            'artworks.*.layout_data' => ['nullable', 'array'],
            'artworks.*.layout_s3_path' => ['nullable', 'string'],
            'artworks.*.logo_path' => ['nullable', 'string'],
            'artworks.*.preview_image_path' => ['nullable', 'string'],
            'artworks.*.cutline_image_url' => ['nullable', 'string'],
        ];
    }
}
