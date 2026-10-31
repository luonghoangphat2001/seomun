<?php

namespace App\Http\Requests\Admin\SizeOption;

use Illuminate\Foundation\Http\FormRequest;

class AdminSizeOptionListRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<string>|string>
     */
    public function rules(): array
    {
        return [
            'search' => 'nullable|string',
            'per_page' => 'nullable|integer|min:10|max:100',
            'page' => 'nullable|integer|min:1',
            'current_page' => ['nullable', 'integer', 'min:1'],
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
            'sort_order' => 'nullable|in:asc,desc',
            'sort_column' => 'nullable|string',
        ];
    }
}