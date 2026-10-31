<?php

namespace App\Http\Requests\Admin\ProductOption;

use App\Models\ProductOption;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminProductOptionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'option_group_id' => ['required', 'integer', 'exists:product_option_groups,id'],
            'option_code' => ['nullable', 'string', 'max:100'],
            'field_name' => ['nullable', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:100'],
            'label' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string', 'max:255'],
            'additional_price' => ['nullable', 'numeric', 'min:0'],
            'metadata' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'option_group_id.required' => '옵션 그룹 ID는 필수입니다.',
            'label.required' => '옵션 라벨은 필수입니다.',
            'value.required' => '옵션 값은 필수입니다.',
        ];
    }

    protected function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $optionGroupId = $this->input('option_group_id');
            $value = $this->input('value');

            if ($optionGroupId && $value) {
                $exists = ProductOption::withTrashed()
                    ->where('option_group_id', $optionGroupId)
                    ->where('value', $value)
                    ->first();

                if ($exists) {
                    if ($exists->deleted_at === null) {
                        $validator->errors()->add('value', '옵션 그룹 내에서 고유한 값이어야 합니다.');
                    } else {
                        $validator->errors()->add('value', '동일한 값의 삭제된 옵션이 이미 존재합니다.');
                    }
                }
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $fields = ['is_active'];
        $data = [];

        foreach ($fields as $field) {
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
