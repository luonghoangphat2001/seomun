<?php

namespace App\Http\Requests\Admin\Coupon;

use App\Enums\UserCouponStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminCouponIssuanceListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', Rule::enum(UserCouponStatus::class)],
            'search' => ['nullable', 'string', 'max:255'],
            'received_from' => ['nullable', 'date'],
            'received_to' => ['nullable', 'date', 'after_or_equal:received_from'],
            'used_from' => ['nullable', 'date'],
            'used_to' => ['nullable', 'date', 'after_or_equal:used_from'],
            'sort_by' => ['nullable', 'string', 'in:received_at,used_at,status,created_at'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
