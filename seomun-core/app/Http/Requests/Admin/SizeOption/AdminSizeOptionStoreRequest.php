<?php

namespace App\Http\Requests\Admin\SizeOption;

use Illuminate\Foundation\Http\FormRequest;

class AdminSizeOptionStoreRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'cutting_width' => ['required', 'integer'],
            'cutting_height' => ['required', 'integer'],
            'working_width' => 'nullable|integer',
            'working_height' => 'nullable|integer',
        ];
    }
}
