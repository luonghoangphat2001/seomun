<?php

namespace App\Http\Requests\Admin\Notification;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminNotificationHistoryListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search_term' => ['nullable', 'string', 'max:255'],
            'template_number' => ['nullable', 'string', 'max:100'],
            'notification_type' => ['nullable', 'string', 'in:email,notification_talk,sms'],
            'recipient_name' => ['nullable', 'string', 'max:255'],
            'sending_date_from' => ['nullable', 'date'],
            'sending_date_to' => ['nullable', 'date', 'after_or_equal:sending_date_from'],
            'sending_result' => ['nullable', 'string', 'in:success,failure'],
            'sender_id' => ['nullable', 'integer', 'exists:users,id'],
            'sort_by' => ['nullable', 'string', 'in:recipient_name,sent_at'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            'page' => ['nullable', 'integer', 'min:1'],
            'current_page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $page = $this->input('page') ?? $this->input('current_page');

        $this->merge([
            'current_page' => $page,
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
