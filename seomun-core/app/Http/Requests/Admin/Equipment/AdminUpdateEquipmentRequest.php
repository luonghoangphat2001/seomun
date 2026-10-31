<?php

namespace App\Http\Requests\Admin\Equipment;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdateEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name'        => 'nullable|string|max:255',
            'name'                => 'sometimes|required|string|max:255',
            'machine_type'        => 'nullable|string|in:P1350,P140,IX3200',
            'maintenance_company' => 'nullable|string|max:255',
            'manager_name'        => 'nullable|string|max:255',
            'manager_phone'       => 'nullable|string|max:50',
            'introduced_at'       => 'nullable|date',
            'image'               => 'nullable|string|max:500',
            'work_process'        => 'sometimes|required|string|in:coating,cutting,output,printing,post_processing',
            'status'              => 'nullable|string|in:active,inactive,maintenance',
            'notes'               => 'nullable|string',
        ];
    }
}
