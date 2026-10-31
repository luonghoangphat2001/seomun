<?php

namespace App\Http\Requests\Admin\EditorSizeType;

use Illuminate\Foundation\Http\FormRequest;

class AdminEditorSizeTypeListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search_keyword' => ['nullable', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'string', 'in:true,false,all'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'current_page' => ['nullable', 'integer', 'min:1'],
            'tree' => ['nullable', 'boolean'],
        ];
    }
}
