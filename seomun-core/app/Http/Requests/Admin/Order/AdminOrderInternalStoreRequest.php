<?php

namespace App\Http\Requests\Admin\Order;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminOrderInternalStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // TODO: add concrete admin authorization if needed
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
            // Basic information
            'basic_information.customer_name' => ['required', 'string', 'max:255'],
            'basic_information.orderer_name' => ['required', 'string', 'max:255'],
            'basic_information.delivery_address' => ['required', 'string', 'max:500'],
            'basic_information.contact_info' => ['required', 'string', 'max:100'],

            // Product information
            'product_information.product_list' => ['required', 'array', 'min:1'],
            'product_information.product_list.*.title' => ['required', 'string', 'max:255'],
            'product_information.product_list.*.quantity' => ['required', 'integer', 'min:1'],
            'product_information.product_list.*.amount' => ['required', 'numeric', 'min:0'],
            'product_information.product_list.*.options' => ['nullable', 'array'],
            'product_information.product_list.*.options.*' => ['nullable'],

            // Payment information
            'payment_information.payment_method' => ['required', 'string', 'max:50'],
            'payment_information.payment_amount' => ['required', 'numeric', 'min:0'],

            // Optional metadata
            'memo' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
