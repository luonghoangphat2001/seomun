<?php

namespace App\Http\Requests\Admin\ErpOption;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminErpOptionStoreRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'erp_option_group_id' => [
                'required',
                'integer',
                Rule::exists('erp_option_groups', 'id')->where(function ($query) {
                    $query->whereNotIn('code', ['SIZE', 'PAPER']);
                }),
            ],
            'code' => ['required', 'string', 'max:255', 'unique:erp_options,code'],
            'label' => ['required', 'string', 'max:255'],
            'value' => ['nullable', 'string', 'max:255'],
            'additional_price' => ['nullable', 'numeric', 'min:0'],
            'osrc_um' => ['nullable', 'numeric', 'min:0'],
            'preview_image' => ['nullable', 'string', 'max:255'], // Assuming it's a URL or path string
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'attributes' => ['nullable', 'array'],
        ];
    }
}
