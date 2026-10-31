<?php

namespace App\Http\Requests\Admin\Notification;

use App\Enums\NotificationTriggerEvent;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class AdminNotificationTemplateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'template_number' => ['nullable', 'string', 'max:100'],
            'channel_configs' => ['required', 'array'], // Detailed validation per channel can be added later
            'usage_status' => ['required', 'string', 'in:enabled,disabled'],
            'trigger_event' => ['nullable', 'string', Rule::enum(NotificationTriggerEvent::class)],
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
