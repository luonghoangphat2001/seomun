<?php

namespace App\Http\Requests\Admin\Notification;

use App\Enums\NotificationTriggerEvent;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class AdminNotificationTemplateUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'template_number' => ['sometimes', 'nullable', 'string', 'max:100'],
            'channel_configs' => ['sometimes', 'array'],
            'usage_status' => ['sometimes', 'string', 'in:enabled,disabled'],
            'trigger_event' => ['sometimes', 'nullable', 'string', Rule::enum(NotificationTriggerEvent::class)],
        ];
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
