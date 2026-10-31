<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class PublicDesignReviewBatchResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'responses' => ['required', 'array', 'min:1'],
            'responses.*.order_item_id' => ['required', 'integer', 'distinct'],
            'responses.*.version_id' => ['required', 'integer', 'distinct'],
            'responses.*.response' => ['required', 'in:approved,rejected'],
            'responses.*.note' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            foreach ($this->input('responses', []) as $index => $response) {
                if (($response['response'] ?? null) === 'rejected' && blank($response['note'] ?? null)) {
                    $validator->errors()->add("responses.{$index}.note", '디자인 반려 시 수정 요청 내용을 입력해주세요.');
                }
            }
        }];
    }
}
