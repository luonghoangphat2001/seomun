<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminProductBulkDeleteRequest extends FormRequest
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
        ];
    }
}
