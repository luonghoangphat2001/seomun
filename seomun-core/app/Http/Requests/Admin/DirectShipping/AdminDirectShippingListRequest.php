<?php

namespace App\Http\Requests\Admin\DirectShipping;

use App\Enums\DirectShippingStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminDirectShippingListRequest extends FormRequest
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
            'search_term' => 'nullable|string|max:255',
            'user_id' => 'nullable|integer',
            'status' => [
                'nullable',
                'string',
                Rule::in(array_column(DirectShippingStatus::cases(), 'value')),
            ],
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'page' => 'nullable|integer|min:1',
            'current_page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'current_page' => $this->input('page') ?? $this->input('current_page', 1),
            'per_page' => $this->per_page ?? 20,
        ]);
    }
}