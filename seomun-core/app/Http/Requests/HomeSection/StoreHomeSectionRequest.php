<?php

namespace App\Http\Requests\HomeSection;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreHomeSectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Will be protected by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => 'required|string|max:50|in:banner,popular_products,category_icons,recent_orders,notices,custom',
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'content' => 'nullable|json',
            'image' => 'nullable|string|max:500|url',
            'link' => 'nullable|string|max:500|url',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'metadata' => 'nullable|json',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'type.required' => '섹션 타입을 입력해주세요.',
            'type.in' => '유효하지 않은 섹션 타입입니다.',
            'title.max' => '제목은 :max자를 초과할 수 없습니다.',
            'subtitle.max' => '부제목은 :max자를 초과할 수 없습니다.',
            'content.json' => '내용은 유효한 JSON 형식이어야 합니다.',
            'image.url' => '올바른 이미지 URL을 입력해주세요.',
            'link.url' => '올바른 링크 URL을 입력해주세요.',
            'sort_order.integer' => '정렬 순서는 숫자여야 합니다.',
            'sort_order.min' => '정렬 순서는 0 이상이어야 합니다.',
            'is_active.boolean' => '활성화 여부는 true 또는 false여야 합니다.',
            'starts_at.date' => '올바른 시작 날짜 형식을 입력해주세요.',
            'ends_at.date' => '올바른 종료 날짜 형식을 입력해주세요.',
            'ends_at.after' => '종료 날짜는 시작 날짜 이후여야 합니다.',
            'metadata.json' => '메타데이터는 유효한 JSON 형식이어야 합니다.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @return void
     *
     * @throws HttpResponseException
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => '입력값이 올바르지 않습니다.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
