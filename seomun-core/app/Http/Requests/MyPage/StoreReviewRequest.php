<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreReviewRequest extends FormRequest
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
            'order_id' => 'nullable|integer|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'required|string|max:200',
            'content' => 'required|string|max:5000',
            'images' => 'nullable|array|max:10',
            'images.*' => 'nullable|string|url|max:500',
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
            'order_id.integer' => '주문 ID가 올바르지 않습니다.',
            'order_id.exists' => '선택한 주문을 찾을 수 없습니다.',
            'rating.required' => '별점을 선택해주세요.',
            'rating.integer' => '별점은 숫자여야 합니다.',
            'rating.min' => '별점은 1점 이상이어야 합니다.',
            'rating.max' => '별점은 5점 이하여야 합니다.',
            'title.required' => '리뷰 제목을 입력해주세요.',
            'title.string' => '리뷰 제목은 문자열이어야 합니다.',
            'title.max' => '리뷰 제목은 :max자를 초과할 수 없습니다.',
            'content.required' => '리뷰 내용을 입력해주세요.',
            'content.string' => '리뷰 내용은 문자열이어야 합니다.',
            'content.max' => '리뷰 내용은 :max자를 초과할 수 없습니다.',
            'images.array' => '이미지는 배열 형식이어야 합니다.',
            'images.max' => '이미지는 최대 :max개까지 첨부할 수 있습니다.',
            'images.*.url' => '유효한 이미지 URL이 아닙니다.',
            'images.*.max' => '이미지 URL은 :max자를 초과할 수 없습니다.',
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
