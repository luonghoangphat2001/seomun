<?php

namespace App\Http\Requests\Admin\ProductOptionGroup;

use App\Enums\ProductOptionGroupTab;
use App\Models\ProductOptionGroup;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminProductOptionGroupStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'product_option_group_tab' => ['nullable', 'string', 'in:'.implode(',', ProductOptionGroupTab::values())],
            'code' => ['required', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:150'],
            'display_type' => ['nullable', 'string', 'in:select,radio,checkbox'],
            'is_required' => ['nullable', 'boolean'],
            'info_icon_enabled' => ['nullable', 'boolean'],
            'info_content' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'erp_option_group_id' => ['nullable', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => '상품 ID는 필수입니다.',
            'code.required' => '옵션 그룹 코드는 필수입니다.',
            'code.unique' => '상품 내에서 고유한 코드여야 합니다.',
            'name.required' => '옵션 그룹명은 필수입니다.',
        ];
    }

    protected function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $productId = $this->input('product_id');
            $code = $this->input('code');

            if ($productId && $code) {
                $exists = ProductOptionGroup::where('product_id', $productId)
                    ->where('code', $code)
                    ->exists();

                if ($exists) {
                    $validator->errors()->add('code', '상품 내에서 고유한 코드여야 합니다.');
                }
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $booleanFields = ['is_required', 'info_icon_enabled'];
        $data = [];

        foreach ($booleanFields as $field) {
            if ($this->has($field)) {
                $value = $this->input($field);
                if (is_string($value)) {
                    $data[$field] = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                }
            }
        }

        if (! empty($data)) {
            $this->merge($data);
        }
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
