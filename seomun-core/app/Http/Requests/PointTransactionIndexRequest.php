<?php

namespace App\Http\Requests;

use App\Enums\PointCategory;
use App\Enums\PointTransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class PointTransactionIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['nullable', 'string', new Enum(PointTransactionType::class)],
            'category' => ['nullable', 'string', new Enum(PointCategory::class)],
            'search' => ['nullable', 'string', 'max:255'],
            'order_number' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date', 'before_or_equal:end_date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'per_page' => $this->per_page ?? 20,
        ]);
    }

    public function messages(): array
    {
        return [
            'start_date.before_or_equal' => '시작 날짜는 종료 날짜보다 이전이어야 합니다.',
            'end_date.after_or_equal' => '종료 날짜는 시작 날짜 이후여야 합니다.',
        ];
    }
}
