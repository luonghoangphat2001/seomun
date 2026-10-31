<?php

namespace App\Http\Requests\Admin\Inquiry;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminAnswerInquiryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('attachments')) {
            $this->merge([
                'attachments' => array_values(array_filter(
                    (array) $this->input('attachments'),
                    fn ($item) => is_array($item) && !empty($item)
                )),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'contact_phone' => ['nullable', 'string', 'max:20'],
            'reply_content' => ['required', 'string'],
            'attachments' => ['nullable', 'array'],
            'attachments.*.key' => ['required_with:attachments', 'string'],
            'attachments.*.name' => ['required_with:attachments', 'string'],
            'attachments.*.url' => ['required_with:attachments', 'string'],
            'attachments.*.size' => ['required_with:attachments', 'integer'],
            'notification_channel' => ['nullable', 'string'],
            'send_notification' => ['nullable'],
        ];
    }
}
