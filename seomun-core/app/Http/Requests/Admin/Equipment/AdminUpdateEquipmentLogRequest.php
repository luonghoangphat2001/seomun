<?php

namespace App\Http\Requests\Admin\Equipment;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdateEquipmentLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'log_date'            => 'sometimes|required|date',
            'maintenance_details' => 'sometimes|required|string',
            'special_notes'       => 'nullable|string',
            'cost_type'           => 'nullable|string|in:paid,free',
            'manager'             => 'nullable|string|max:255',
        ];
    }
}
