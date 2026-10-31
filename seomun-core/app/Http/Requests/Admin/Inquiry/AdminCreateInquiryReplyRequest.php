<?php

namespace App\Http\Requests\Admin\Inquiry;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminCreateInquiryReplyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'contact_phone' => ['nullable', 'string', 'max:20'],
            'reply_content' => ['required', 'string'],
            'channels' => ['nullable', 'array'],
            'attachments' => ['nullable', 'array'],
            'attachments.*.key' => ['required_with:attachments', 'string'],
            'attachments.*.name' => ['required_with:attachments', 'string'],
            'attachments.*.url' => ['required_with:attachments', 'string'],
            'attachments.*.size' => ['required_with:attachments', 'integer'],
        ];
    }
}
