<?php

namespace App\Http\Requests\Admin\Payment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PaymentStatisticsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $customerIds = $this->input('customer_ids');

        if (is_string($customerIds) && ! empty($customerIds)) {
            $ids = array_map('intval', array_filter(array_map('trim', explode(',', $customerIds))));
            $this->merge(['customer_ids' => $ids]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_ids' => ['nullable'],
            'period' => ['nullable', 'string', 'in:monthly,quarterly,yearly'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'export' => ['nullable', 'in:true,false,1,0'],
        ];
    }
}
