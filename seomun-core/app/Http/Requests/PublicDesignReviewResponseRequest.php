<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class PublicDesignReviewResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'version_id' => ['required', 'integer'],
            'response' => ['required', 'in:approved,rejected'],
            'note' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($this->input('response') === 'rejected' && blank($this->input('note'))) {
                $validator->errors()->add('note', '디자인 반려 시 수정 요청 내용을 입력해주세요.');
            }
        }];
    }
}
