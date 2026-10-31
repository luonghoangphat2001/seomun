<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreSavedProductOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'product_id' => 'required|integer|exists:products,id',
            'order_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
            'quantity' => 'required|integer|min:1',
            'number_of_cases' => 'nullable|numeric|min:0.01',
            'options' => ['required', 'array'],
            'options.*.group_id' => ['required_with:options', 'integer', 'exists:product_option_groups,id'],
            'options.*.option_id' => ['required_with:options', 'integer', 'exists:product_options,id'],
            'input_options' => ['nullable', 'array'],
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
