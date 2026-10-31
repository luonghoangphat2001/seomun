<?php

namespace App\Http\Requests\Admin\AdminDashboard;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminDashboardOrderStaticsRequest extends FormRequest
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
            'customer_ids' => ['nullable'],
            'period' => ['nullable', 'string', 'in:7d,30d'],
            'export' => ['nullable', 'in:true,false'],
        ];
    }
}
