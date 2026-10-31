<?php

namespace App\Http\Requests\Admin\Equipment;

use Illuminate\Foundation\Http\FormRequest;

class AdminGetEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'keyword'      => 'nullable|string|max:255',
            'search_type'  => 'nullable|string|in:company_name,name,maintenance_company,manager_name',
            'work_process' => 'nullable|string|in:coating,cutting,output,printing,post_processing',
            'machine_type' => 'nullable|string|in:P1350,P140,IX3200',
            'status'       => 'nullable|string|in:active,inactive,maintenance',
            'per_page'     => 'nullable|integer|between:1,100',
        ];
    }
}
