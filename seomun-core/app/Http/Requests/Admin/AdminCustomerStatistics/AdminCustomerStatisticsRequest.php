<?php

namespace App\Http\Requests\Admin\AdminCustomerStatistics;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;

class AdminCustomerStatisticsRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'customer_ids' => 'nullable|array',
            'customer_ids.*' => 'nullable|integer',
            'sales_representative' => 'nullable|string|max:255',
            'export' => 'nullable|string|in:true,false,1,0',
        ];
    }

    /**
     * Get the validated data from the request.
     */
    public function validated($key = null, $default = null)
    {
        $data = parent::validated();

        // Handle customer_ids as string (comma-separated)
        if (isset($data['customer_ids']) && is_string($data['customer_ids'])) {
            $data['customer_ids'] = explode(',', $data['customer_ids']);
            $data['customer_ids'] = array_filter(array_map('trim', $data['customer_ids']));
        }

        // Handle export parameter as boolean
        if (isset($data['export'])) {
            $data['export'] = filter_var($data['export'], FILTER_VALIDATE_BOOLEAN);
        }

        return $key ? Arr::get($data, $key, $default) : $data;
    }
}
