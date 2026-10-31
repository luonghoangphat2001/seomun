<?php

namespace App\Http\Requests\Admin\Member;

use App\Enums\ApprovalStatus;
use App\Enums\UserStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMemberPermissionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'membership_tier_id' => 'nullable|integer|exists:membership_tiers,id',
            'availability' => 'nullable|boolean',
            'approval_status' => [
                'nullable',
                Rule::in(array_column(ApprovalStatus::cases(), 'value')),
            ],
            'authority' => 'nullable|string|max:255',
            'status' => [
                'nullable',
                Rule::in(array_column(UserStatus::cases(), 'value')),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'membership_tier_id.exists' => '유효한 멤버십 등급이 아닙니다.',
            'approval_status.in' => '승인상태 값이 올바르지 않습니다.',
            'status.in' => '상태 값이 올바르지 않습니다.',
        ];
    }
}
