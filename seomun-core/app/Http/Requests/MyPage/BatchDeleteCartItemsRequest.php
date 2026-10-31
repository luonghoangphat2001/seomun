<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class BatchDeleteCartItemsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by auth middleware
    }

    /**
     * Prepare the data for validation.
     * DELETE requests often have body stripped by proxies/clients; allow item_ids from query string as fallback.
     * Body: { "item_ids": [1, 2, 3] }. Query: ?item_ids[]=1&item_ids[]=2 or ?item_ids=1,2,3
     */
    protected function prepareForValidation(): void
    {
        $ids = $this->input('item_ids') ?? $this->query('item_ids');
        if ($ids === null || $ids === '') {
            return;
        }
        if (is_string($ids)) {
            $ids = array_map('intval', array_filter(explode(',', $ids)));
        }
        if (is_array($ids)) {
            $this->merge(['item_ids' => array_values(array_map('intval', $ids))]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'item_ids' => 'required|array|min:1',
            'item_ids.*' => 'required|integer|exists:cart_items,id',
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
            'item_ids.required' => '삭제할 항목을 선택해주세요.',
            'item_ids.array' => '항목 ID 형식이 올바르지 않습니다.',
            'item_ids.min' => '최소 1개 이상의 항목을 선택해주세요.',
            'item_ids.*.required' => '항목 ID가 필요합니다.',
            'item_ids.*.integer' => '항목 ID는 숫자여야 합니다.',
            'item_ids.*.exists' => '선택한 항목을 찾을 수 없습니다.',
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
