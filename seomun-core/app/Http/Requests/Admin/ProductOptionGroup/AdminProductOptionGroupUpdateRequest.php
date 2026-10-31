<?php

namespace App\Http\Requests\Admin\ProductOptionGroup;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminProductOptionGroupUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $groupId = $this->route('id');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'product_option_group_tab' => ['sometimes', 'required', 'string', 'max:150'],
            'display_type' => ['nullable', 'string', 'in:select,radio,checkbox,color'],
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
            'name.required' => '옵션 그룹명은 필수입니다.',
        ];
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
