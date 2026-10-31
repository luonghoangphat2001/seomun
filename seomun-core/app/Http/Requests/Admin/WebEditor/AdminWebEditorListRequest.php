<?php

namespace App\Http\Requests\Admin\WebEditor;

use Illuminate\Foundation\Http\FormRequest;

class AdminWebEditorListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search_keyword' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'in:' . implode(',', \App\Enums\WebEditorType::values())],
            'is_active' => ['nullable', 'string', 'in:true,false,all'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'current_page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}