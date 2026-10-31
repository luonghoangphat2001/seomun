<?php

namespace App\Http\Requests\Admin\OrderExtraEntry;

use App\Enums\OrderExtraEntryInputType;
use App\Enums\OrderExtraEntryStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateOrderExtraEntryRequest extends FormRequest
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
            'status' => ['nullable', new Enum(OrderExtraEntryStatus::class)],
            'is_required' => 'nullable|boolean',
            'label' => 'nullable|string|max:100',
            'input_type' => ['nullable', new Enum(OrderExtraEntryInputType::class)],
            'input_options' => 'nullable|array',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'integer|exists:products,id',
        ];
    }
}
