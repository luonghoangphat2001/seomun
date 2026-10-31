<?php

namespace App\Http\Requests\Admin\EditorSize;

use Illuminate\Foundation\Http\FormRequest;

class AdminEditorSizeListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search_keyword' => ['nullable', 'string', 'max:255'],
            'editor_size_type_id' => ['nullable', 'integer', 'exists:editor_size_types,id'],
            'is_active' => ['nullable', 'string', 'in:true,false,all'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'current_page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}