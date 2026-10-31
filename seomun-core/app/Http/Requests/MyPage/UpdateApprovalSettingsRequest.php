<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateApprovalSettingsRequest extends FormRequest
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
            'individual_approval' => 'sometimes|boolean',
            'approval_line' => 'sometimes|array',
            'approval_line.*.stage' => 'required_with:approval_line|integer|min:1',
            'approval_line.*.approver_id' => 'required_with:approval_line|integer|exists:users,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'individual_approval.boolean' => '개별 결재 여부는 boolean 값이어야 합니다.',
            'approval_line.array' => '결재선은 배열 형식이어야 합니다.',
            'approval_line.*.stage.required_with' => '결재선 항목의 단계는 필수입니다.',
            'approval_line.*.stage.integer' => '결재선 단계는 정수여야 합니다.',
            'approval_line.*.stage.min' => '결재선 단계는 1 이상이어야 합니다.',
            'approval_line.*.approver_id.required_with' => '결재선 항목의 결재자 ID는 필수입니다.',
            'approval_line.*.approver_id.integer' => '결재자 ID는 정수여야 합니다.',
            'approval_line.*.approver_id.exists' => '존재하지 않는 결재자입니다.',
        ];
    }
}
