<?php

namespace App\Http\Requests\Admin\Membership;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMembershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'condition_amount' => 'required|integer|min:0',
            'accrual_rate' => 'required|integer|min:0|max:100',
            'free_shipping' => 'required|boolean',
            'is_active' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => '멤버십 등급명을 입력해주세요.',
            'threshold_amount.required' => '기준 금액을 입력해주세요.',
            'threshold_amount.min' => '기준 금액은 0 이상이어야 합니다.',
            'accumulation_rate.required' => '적립률을 입력해주세요.',
            'accumulation_rate.min' => '적립률은 0 이상이어야 합니다.',
            'accumulation_rate.max' => '적립률은 100 이하이어야 합니다.',
            'sort_order.min' => '정렬 순서는 0 이상이어야 합니다.',
        ];
    }
}
