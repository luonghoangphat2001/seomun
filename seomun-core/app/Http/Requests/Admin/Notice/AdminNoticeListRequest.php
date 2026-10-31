<?php

namespace App\Http\Requests\Admin\Notice;

use App\Enums\NoticeType;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class AdminNoticeListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // PagingREQ
            'page' => ['nullable', 'integer', 'min:1'],
            'current_page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            // SortByREQ
            'sort_by' => ['nullable', 'string', 'in:title,author,created_at,updated_at'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            // NoticeFilterREQ
            'title' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', Rule::in(array_map(fn ($case) => $case->value, NoticeType::cases()))],
            'author_id' => ['nullable', 'integer', 'exists:users,id'],
            'exposure_status' => ['nullable', 'string', 'in:exposed,non-exposed'],
            'exposure_location' => ['nullable', 'string', 'in:main,login,dashboard'],
            'registrant_id' => ['nullable', 'integer', 'exists:users,id'],
            'exposure_start_date' => ['nullable', 'string', 'date'],
            'exposure_end_date' => ['nullable', 'string', 'date'],
            // Backward compatibility
            'search_term' => ['nullable', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Normalize: Use 'page' if provided, otherwise use 'current_page'
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
