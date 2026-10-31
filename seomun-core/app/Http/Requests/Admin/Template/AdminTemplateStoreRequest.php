<?php

namespace App\Http\Requests\Admin\Template;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminTemplateStoreRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'product_id' => 'nullable|integer|exists:products,id',
            'size_option_id' => 'required|integer|exists:erp_size_options,id',
            'specifications' => 'nullable|array',
            'file_path' => 'nullable|string|max:500',
            'safety_line' => 'nullable|array',
            'cut_line' => 'nullable|array',
            'font_set' => 'nullable|array',
            'color_set' => 'nullable|array',
            'spot_color' => 'nullable|array',
            'layout_config' => 'nullable|array',
            'editor_permission' => 'nullable|array',
            'front_preview_url' => 'nullable|string|max:500',
            'back_preview_url' => 'nullable|string|max:500',
            'preview_images' => 'nullable|array',
            'preview_images.*' => 'string|max:500',
            'web_editor_id' => 'required|integer|exists:web_editors,id',
            'type' => 'nullable|string|in:' . implode(',', \App\Enums\TemplateType::values()),
            'orientation' => 'nullable|string|in:' . implode(',', \App\Enums\TemplateOrientation::values()),
            'side' => 'nullable|string|in:' . implode(',', \App\Enums\TemplateSide::values()),
            'is_active' => 'nullable|boolean',
        ];
    }
}
