<?php

namespace App\Http\Requests\Admin\Inquiry;

use Illuminate\Foundation\Http\FormRequest;

class AdminAssignInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assigned_to' => ['required', 'integer', 'exists:users,id'],
            'note' => ['nullable', 'string'],
        ];
    }
}
