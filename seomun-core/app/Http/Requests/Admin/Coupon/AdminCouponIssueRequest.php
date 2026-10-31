<?php

namespace App\Http\Requests\Admin\Coupon;

use App\Enums\CouponTargetType;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class AdminCouponIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'target_type' => ['sometimes', 'string', Rule::enum(CouponTargetType::class)],
            'user_ids' => ['required_if:target_type,'.CouponTargetType::SPECIFIC_USERS->value, 'nullable', 'array', 'min:1'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'membership_tier_id' => ['required_if:target_type,'.CouponTargetType::MEMBERSHIP_TIER->value, 'nullable', 'integer', 'exists:membership_tiers,id'],
            'customer_id' => ['required_if:target_type,'.CouponTargetType::CUSTOMER->value, 'nullable', 'integer', 'exists:customers,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('target_type')) {
            $this->merge([
                'target_type' => CouponTargetType::SPECIFIC_USERS->value,
            ]);
        }
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
