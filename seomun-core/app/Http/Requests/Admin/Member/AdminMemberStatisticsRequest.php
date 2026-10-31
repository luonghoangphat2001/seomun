<?php

namespace App\Http\Requests\Admin\Member;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminMemberStatisticsRequest extends FormRequest
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
        return [
            'start_date' => ['nullable', 'date', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'customer_ids' => ['nullable'],
            'export' => ['nullable', 'in:true,false,1,0'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Convert customer_ids string (e.g., "1,2,3") to array
        $customerIds = $this->input('customer_ids');

        if (is_string($customerIds) && ! empty($customerIds)) {
            if ($customerIds === 'all') {
                $this->merge(['customer_ids' => 'all']);
            } else {
                $ids = array_map('intval', array_filter(array_map('trim', explode(',', $customerIds))));
                $this->merge(['customer_ids' => $ids]);
            }
        }
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'start_date' => 'Start date',
            'end_date' => 'End date',
            'customer_ids' => 'Customer IDs',
            'customer_ids.*' => 'Customer ID',
            'export' => 'Export flag',
        ];
    }

    /**
     * Get the validated data from the request.
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated();

        // Handle customer_ids parameter
        $customerIds = $this->input('customer_ids');

        if (empty($customerIds) || $customerIds === 'all') {
            $data['customer_ids'] = 'all';
        } elseif (is_string($customerIds)) {
            // If customer_ids is a string (e.g., "1,2,3"), convert to array of integers
            $data['customer_ids'] = array_map('intval', array_filter(array_map('trim', explode(',', $customerIds))));
        } elseif (is_array($customerIds)) {
            // If customer_ids is an array, ensure all values are integers
            $data['customer_ids'] = array_map('intval', array_filter($customerIds));
        }

        return $data;
    }
}
