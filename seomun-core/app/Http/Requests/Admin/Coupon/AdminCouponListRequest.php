<?php

namespace App\Http\Requests\Admin\Coupon;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminCouponListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search_term' => ['nullable', 'string', 'max:255'],
            'discount_type' => ['nullable', 'string', 'in:percentage,fixed'],
            'is_active' => ['nullable'],
            'validity_status' => ['nullable', 'string', 'in:all,valid,expired,upcoming'],
            'starts_at_from' => ['nullable', 'date'],
            'starts_at_to' => ['nullable', 'date'],
            'expires_at_from' => ['nullable', 'date'],
            'expires_at_to' => ['nullable', 'date'],
            'sort_by' => [
                'nullable',
                'string',
                'in:id,code,name,discount_type,discount_value,min_order_amount,usage_count,usage_limit,starts_at,expires_at,sort_order,created_at',
            ],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            'page' => ['nullable', 'integer', 'min:1'],
            'current_page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $page = $this->input('page') ?? $this->input('current_page');
        $searchTerm = $this->input('search_term') ?? $this->input('keyword');

        $this->merge([
            'current_page' => $page,
            'search_term' => $searchTerm,
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
