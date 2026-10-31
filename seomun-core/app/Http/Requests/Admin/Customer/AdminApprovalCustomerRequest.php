<?php

namespace App\Http\Requests\Admin\Customer;

use App\Enums\ApprovalStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminApprovalCustomerRequest extends FormRequest
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
    public function rules(): array
    {
        $approvalValues = array_map(fn ($case) => $case->value, ApprovalStatus::cases());

        return [
            'customer_ids' => ['required', 'array', 'min:1'],
            'customer_ids.*' => ['integer'],
            'approval_status' => ['required', 'string', Rule::in($approvalValues)],
            'reason' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
