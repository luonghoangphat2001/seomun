<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminProductStatisticsRequest extends FormRequest
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
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
            'export_type' => ['nullable', 'string', 'in:ALL,CURRENT_PAGE,SELECTED'],
            'export' => ['nullable', 'in:true,false'],
        ];
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
            'limit' => 'Limit',
            'export_type' => 'Export type',
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
            $data['customer_ids'] = array_map('intval', explode(',', $customerIds));
        } elseif (is_array($customerIds)) {
            // If customer_ids is an array, ensure all values are integers
            $data['customer_ids'] = array_map('intval', $customerIds);
        }

        return $data;
    }
}
