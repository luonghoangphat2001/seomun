<?php

namespace App\Http\Requests\Admin\ErpOptionGroup;

use App\Enums\ErpOptionGroupType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminErpOptionGroupUpdateRequest extends FormRequest
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
        $erpOptionGroupId = $this->route('erp_option_group');

        return [
            'label' => ['sometimes', 'string', 'max:255', Rule::unique('erp_option_groups', 'label')->ignore($erpOptionGroupId)],
            'display_type' => ['sometimes', 'string', Rule::in(['select', 'radio', 'checkbox'])],
            'is_required' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
