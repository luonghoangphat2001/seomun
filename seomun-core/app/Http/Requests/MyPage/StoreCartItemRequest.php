<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreCartItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by auth middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => 'required|integer|exists:products,id',
            'design_group_id' => ['required', 'integer', 'exists:design_groups,id'],
            'quantity' => 'required|integer|min:1',
            'number_of_cases' => 'required|integer|min:1',
            'selected_options' => ['required', 'array'],
            'selected_options.*.group_id' => ['required_with:selected_options', 'integer', 'exists:product_option_groups,id'],
            'selected_options.*.option_id' => ['required_with:selected_options', 'integer', 'exists:product_options,id'],
            "input_options" => ['required', 'array'],
            'notes' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'product_id.required' => '상품을 선택해주세요.',
            'product_id.integer' => '상품 ID가 올바르지 않습니다.',
            'product_id.exists' => '선택한 상품을 찾을 수 없습니다.',
            'design_id.integer' => '디자인 ID가 올바르지 않습니다.',
            // 'design_id.exists' => '선택한 디자인을 찾을 수 없습니다.',
            'quantity.required' => '수량을 입력해주세요.',
            'quantity.integer' => '수량은 숫자여야 합니다.',
            'quantity.min' => '수량은 최소 1개 이상이어야 합니다.',
            'options.array' => '옵션 형식이 올바르지 않습니다.',
            'notes.max' => '메모는 :max자를 초과할 수 없습니다.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
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
