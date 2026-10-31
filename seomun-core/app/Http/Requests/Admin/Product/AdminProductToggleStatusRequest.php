<?php

namespace App\Http\Requests\Admin\Product;

use App\Constants\ProductStatusField;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminProductToggleStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // TODO: Add admin authorization check
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
            'field' => [
                'required',
                'string',
                'in:'.implode(',', ProductStatusField::ALLOWED_FIELDS),
            ],
            'value' => 'nullable|boolean', // If not provided, will toggle
        ];
    }
}
