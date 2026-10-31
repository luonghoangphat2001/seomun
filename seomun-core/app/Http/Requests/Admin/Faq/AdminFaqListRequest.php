<?php

namespace App\Http\Requests\Admin\Faq;

use App\Enums\FaqCategory;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rules\Enum;

class AdminFaqListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search_term' => ['nullable', 'string', 'max:255'],
            'faq_category' => ['nullable', new Enum(FaqCategory::class)],
            'title' => ['nullable', 'string', 'max:500'],
            'author_id' => ['nullable', 'integer', 'exists:users,id'],
            'posting_status' => ['nullable', 'string', 'in:exposed,non-exposed'],
            'exposure_target' => ['nullable', 'string'],
            'registration_date_from' => ['nullable', 'date'],
            'registration_date_to' => ['nullable', 'date', 'after_or_equal:registration_date_from'],
            'sort_by' => ['nullable', 'string', 'in:category,title,created_at'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            'page' => ['nullable', 'integer', 'min:1'],
            'current_page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $page = $this->input('page') ?? $this->input('current_page');

        $this->merge([
            'current_page' => $page,
        ]);
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
