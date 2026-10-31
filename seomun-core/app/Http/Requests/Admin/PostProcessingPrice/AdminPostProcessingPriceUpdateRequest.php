<?php

namespace App\Http\Requests\Admin\PostProcessingPrice;

use App\Enums\ErpOptionGroupCode;
use App\Enums\PostProcessingSizeType;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class AdminPostProcessingPriceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                new Enum(ErpOptionGroupCode::class),
            ],
            'erp_option_id' => ['sometimes', 'required', 'integer', 'exists:erp_options,id'],
            'post_processing_size_type' => ['sometimes', 'required', Rule::enum(PostProcessingSizeType::class)],
            'attributes' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'items' => ['nullable', 'array'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:0'],
            'items.*.supply_price' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.cost' => ['required_with:items', 'numeric', 'min:0'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => '입력값이 올바르지 않습니다.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}