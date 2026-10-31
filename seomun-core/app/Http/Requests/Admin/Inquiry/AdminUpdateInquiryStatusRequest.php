<?php

namespace App\Http\Requests\Admin\Inquiry;

use App\Enums\InquiryStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUpdateInquiryStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $statusValues = array_map(fn ($case) => $case->value, InquiryStatus::cases());

        return [
            'status' => ['required', 'string', Rule::in($statusValues)],
            'note' => ['nullable', 'string'],
        ];
    }
}
