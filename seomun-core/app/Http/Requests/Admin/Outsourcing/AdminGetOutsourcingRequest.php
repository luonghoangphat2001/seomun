<?php

namespace App\Http\Requests\Admin\Outsourcing;

use Illuminate\Foundation\Http\FormRequest;

class AdminGetOutsourcingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search_type' => 'nullable|string|in:name,work_details,representative_name,email,contact,address,registration_number',
            'keyword'     => 'nullable|string|max:255',
            'is_active'   => 'nullable|boolean',
            'per_page'    => 'nullable|integer|min:1|max:100',
        ];
    }
}
