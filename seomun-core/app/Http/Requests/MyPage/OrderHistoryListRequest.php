<?php

namespace App\Http\Requests\MyPage;

use App\Enums\OrderStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderHistoryListRequest extends FormRequest
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
            'product_scope' => ['nullable', 'string', 'max:50'],
            'filter_label' => ['nullable', 'string', Rule::in(['all', 'exclude_cancelled', 'file_error'])],
            'status' => ['nullable', 'string', Rule::enum(OrderStatus::class)],
            'period' => ['nullable', 'string', Rule::in(['1w', '1m', '3m', '6m'])],
            'order_number_keyword' => ['nullable', 'string', 'max:100'],
            'product_name_keyword' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'sort_by' => ['nullable', 'string', Rule::in(['created_at', 'order_number'])],
            'sort_order' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
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
            'filter_label.in' => '필터 값이 유효하지 않습니다.',
            'status.enum' => '주문 상태가 유효하지 않습니다.',
            'period.in' => '기간 필터 값이 유효하지 않습니다.',
            'date_to.after_or_equal' => '종료일은 시작일보다 이후여야 합니다.',
            'per_page.max' => '페이지당 항목 수는 최대 100개까지 가능합니다.',
            'sort_by.in' => '정렬 필드가 유효하지 않습니다.',
            'sort_order.in' => '정렬 순서는 asc 또는 desc여야 합니다.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'product_scope' => $this->input('product_scope', 'all'),
            'filter_label' => $this->input('filter_label', 'all'),
        ]);
    }
}
