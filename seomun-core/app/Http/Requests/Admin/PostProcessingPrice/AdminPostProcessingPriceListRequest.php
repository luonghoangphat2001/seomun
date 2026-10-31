<?php

namespace App\Http\Requests\Admin\PostProcessingPrice;

use Illuminate\Foundation\Http\FormRequest;

class AdminPostProcessingPriceListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'current_page' => ['nullable', 'integer', 'min:1'],
            'page' => ['nullable', 'integer', 'min:1'],
            'search' => ['nullable', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:255'],
            'erp_option_id' => ['nullable', 'integer', 'exists:erp_options,id'],
            'post_processing_size_type' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}