<?php

namespace App\Http\Requests\Admin\Inquiry;

use Illuminate\Foundation\Http\FormRequest;

class AdminInquiryStatisticsRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'customer_ids' => 'nullable|array',
            'customer_ids.*' => 'exists:users,id',
            'period' => 'nullable|string|in:7d,30d,90d,365d',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'export' => 'nullable|in:true,false,1,0',
        ];
    }
}
