<?php

namespace App\Http\Requests\Notice;

use App\Enums\NoticeType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreNoticeRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => ['nullable', 'string', 'max:50', Rule::enum(NoticeType::class)],
            'is_pinned' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:published_at',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => '제목을 입력해주세요.',
            'title.max' => '제목은 :max자를 초과할 수 없습니다.',
            'content.required' => '내용을 입력해주세요.',
            'type.in' => '유효하지 않은 공지 유형입니다.',
            'is_pinned.boolean' => '고정 여부는 true 또는 false여야 합니다.',
            'is_active.boolean' => '활성화 여부는 true 또는 false여야 합니다.',
            'published_at.date' => '올바른 게시 날짜 형식을 입력해주세요.',
            'expires_at.date' => '올바른 만료 날짜 형식을 입력해주세요.',
            'expires_at.after' => '만료 날짜는 게시 날짜 이후여야 합니다.',
        ];
    }

    /**
     * Handle a failed validation attempt.
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
