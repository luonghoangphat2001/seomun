<?php

namespace App\Http\Requests\Admin\SizeOption;

use Illuminate\Foundation\Http\FormRequest;

class AdminSizeOptionUpdateRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:255'],
            'cutting_width' => ['sometimes', 'integer'],
            'cutting_height' => ['sometimes', 'integer'],
            'working_width' => ['sometimes', 'integer'],
            'working_height' => ['sometimes', 'integer'],
        ];
    }
}