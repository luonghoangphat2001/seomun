<?php

namespace App\Http\Requests\Admin\Product;

use App\Constants\ProductStatusField;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminProductBulkUpdateStatusRequest extends FormRequest
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
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'required|integer|exists:products,id',
            'field' => [
                'required',
                'string',
                Rule::in(ProductStatusField::ALLOWED_FIELDS),
            ],
            'value' => 'required|boolean',
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
            'product_ids.required' => '최소 1개 이상의 제품 ID가 필요합니다.',
            'product_ids.array' => '제품 ID는 배열 형태여야 합니다.',
            'product_ids.min' => '최소 1개 이상의 제품 ID가 필요합니다.',
            'product_ids.*.required' => '제품 ID가 필요합니다.',
            'product_ids.*.integer' => '제품 ID는 정수여야 합니다.',
            'product_ids.*.exists' => '존재하지 않는 제품 ID가 포함되어 있습니다.',
            'field.required' => '상태 필드가 필요합니다.',
            'field.in' => '유효하지 않은 상태 필드입니다. (is_active, is_popular, is_featured)',
            'value.required' => '상태 값이 필요합니다.',
            'value.boolean' => '상태 값은 true 또는 false여야 합니다.',
        ];
    }
}
