<?php

namespace App\Http\Requests\Admin\Outsourcing;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdateOutsourcingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                     => 'sometimes|required|string|max:255',
            'work_details'             => 'nullable|string',
            'representative_name'      => 'nullable|string|max:255',
            'registration_number'      => 'nullable|string|max:100',
            'registration_certificate' => 'nullable|string|max:500',
            'email'                    => 'nullable|email|max:255',
            'contact'                  => 'nullable|string|max:50',
            'address'                  => 'nullable|string|max:500',
            'memo'                     => 'nullable|string',
            'is_active'                => 'nullable|boolean',
        ];
    }
}
