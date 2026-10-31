<?php

namespace App\Http\Requests\Admin\Color;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminCreateColorRequest extends FormRequest
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
            'r_value' => 'required|string',
            'g_value' => 'required|string',
            'b_value' => 'required|string',
            'c_value' => 'required|integer',
            'm_value' => 'required|integer',
            'y_value' => 'required|integer',
            'k_value' => 'required|integer',
        ];
    }
}
