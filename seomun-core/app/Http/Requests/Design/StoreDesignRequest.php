<?php

namespace App\Http\Requests\Design;

use Illuminate\Foundation\Http\FormRequest;

class StoreDesignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'order_id' => ['nullable', 'integer', 'exists:orders,id'],
            'order_item_id' => ['nullable', 'integer', 'exists:order_items,id'],
            'title' => ['nullable', 'string', 'max:255'],
            'size_option_id' => ['nullable', 'integer', 'exists:erp_size_options,id'],
            'width_mm' => ['nullable', 'integer'],
            'height_mm' => ['nullable', 'integer'],
            'source_type' => ['nullable', 'string', 'in:web_editor,upload_file'],
            'preview_image_path' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
            'artworks' => ['nullable', 'array'],
            'artworks.*.side' => ['required', 'string', 'in:front,back'],
            'artworks.*.layout_data' => ['required', 'array'],
            'artworks.*.layout_s3_path' => ['nullable', 'string'],
            'artworks.*.logo_path' => ['nullable', 'string'],
            'artworks.*.preview_image_path' => ['nullable', 'string'],
            'artworks.*.cutline_image_url' => ['nullable', 'string'],
        ];

        return $rules;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'source_type' => $this->input('source_type', 'web_editor'),
        ]);
    }
}
