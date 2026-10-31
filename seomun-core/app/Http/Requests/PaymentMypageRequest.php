<?php

namespace App\Http\Requests;

use App\Http\Requests\Admin\Commons\PaginationRequest;
use Illuminate\Contracts\Validation\ValidationRule;

class PaymentMypageRequest extends PaginationRequest
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
            'per_page' => ['nullable', 'integer'],
            'page' => ['nullable', 'integer'],
            'start_date' => ['nullable', 'date', 'before_or_equal:end_date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'order_number' => ['nullable', 'string'],
        ];
    }
}
