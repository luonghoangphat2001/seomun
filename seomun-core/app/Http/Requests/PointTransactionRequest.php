<?php

namespace App\Http\Requests;

use App\Enums\PointCategory;
use App\Enums\PointTransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class PointTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'type' => ['required', 'string', new Enum(PointTransactionType::class)],
            'amount' => ['required', 'integer', 'min:1'],
            'category' => ['required', 'string', new Enum(PointCategory::class)],
            'reference_id' => ['nullable', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer'],
            'expired_at' => ['nullable', 'date'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => '사용자 ID는 필수입니다.',
            'user_id.exists' => '존재하지 않는 사용자입니다.',
            'type.required' => '트랜잭션 유형은 필수입니다.',
            'amount.required' => '금액은 필수입니다.',
            'amount.min' => '금액은 1 이상이어야 합니다.',
            'category.required' => '카테고리는 필수입니다.',
        ];
    }
}
