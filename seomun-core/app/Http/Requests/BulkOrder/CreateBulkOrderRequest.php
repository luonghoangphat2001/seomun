<?php

namespace App\Http\Requests\BulkOrder;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateBulkOrderRequest extends FormRequest
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
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'configuration' => ['nullable', 'array'],
            'configuration.template_id' => [
                'nullable',
                'integer',
                Rule::exists('templates', 'id')->where(fn ($q) => $q->where('product_id', (int) $this->input('product_id'))),
            ],
            'configuration.design_mode_id' => ['nullable', 'integer', 'exists:product_design_modes,id'],
            'configuration.quantity' => ['nullable', 'integer', 'min:1'],
            'configuration.options' => ['nullable', 'array'],
            'configuration.selected_options' => ['nullable', 'array'],
            'configuration.selected_options.*.group_id' => ['required_with:configuration.selected_options', 'integer', 'exists:product_option_groups,id'],
            'configuration.selected_options.*.option_id' => ['required_with:configuration.selected_options', 'integer', 'exists:product_options,id'],
            'configuration.input_options' => ['nullable', 'array'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
