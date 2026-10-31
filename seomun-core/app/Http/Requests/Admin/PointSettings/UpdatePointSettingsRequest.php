<?php

namespace App\Http\Requests\Admin\PointSettings;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePointSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'signup_reward' => ['nullable', 'integer', 'min:0'],

            'monthly_reward_limit' => ['nullable', 'integer', 'min:0'],
            'invite_reward_inviter' => ['nullable', 'integer', 'min:0'],
            'invite_reward_invited' => ['nullable', 'integer', 'min:0'],

            'enable_payment_restriction' => ['nullable', 'boolean'],
            'min_order_amount_to_use' => ['nullable', 'integer', 'min:0'],

            'enable_point_restriction' => ['nullable', 'boolean'],
            'max_point_usage_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'max_point_usage_amount' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'max_point_usage_percent.max' => '최대 포인트 사용 비율은 100%를 초과할 수 없습니다.',
        ];
    }
}
