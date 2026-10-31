<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateQuickMenuRequest extends FormRequest
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
            'items' => 'required|array|max:6',
            'items.*.menu_code' => 'required|string|max:50',
            'items.*.label' => 'required|string|max:100',
            'items.*.label_en' => 'nullable|string|max:100',
            'items.*.menu_type' => 'nullable|string|max:50',
            'items.*.route' => 'nullable|string|max:255',
            'items.*.sort_order' => 'nullable|integer|min:0',
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
            'items.required' => '메뉴 항목을 입력해주세요.',
            'items.array' => '메뉴 항목 형식이 올바르지 않습니다.',
            'items.max' => '최대 6개의 메뉴만 설정할 수 있습니다.',
            'items.*.menu_code.required' => '메뉴 코드를 입력해주세요.',
            'items.*.menu_code.max' => '메뉴 코드는 :max자를 초과할 수 없습니다.',
            'items.*.label.required' => '메뉴 이름을 입력해주세요.',
            'items.*.label.max' => '메뉴 이름은 :max자를 초과할 수 없습니다.',
            'items.*.label_en.max' => '영문 메뉴 이름은 :max자를 초과할 수 없습니다.',
            'items.*.menu_type.max' => '메뉴 타입은 :max자를 초과할 수 없습니다.',
            'items.*.route.max' => '라우트는 :max자를 초과할 수 없습니다.',
            'items.*.sort_order.integer' => '정렬 순서는 숫자여야 합니다.',
            'items.*.sort_order.min' => '정렬 순서는 최소 0 이상이어야 합니다.',
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
