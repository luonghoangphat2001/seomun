<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderShippingInfoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // protected by auth:sanctum at route
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Contact information (customer)
            'contact.name' => ['required', 'string', 'max:255'],
            'contact.phone' => ['required', 'string', 'max:50', 'regex:/^[0-9-]+$/'],
            'contact.email' => ['nullable', 'email', 'max:255'],

            // Shipping information (receiver)
            'shipping.name' => ['required', 'string', 'max:255'],
            'shipping.phone' => ['required', 'string', 'max:50', 'regex:/^[0-9-]+$/'],
            'shipping.postcode' => ['required', 'string', 'max:20'],
            'shipping.address' => ['required', 'string', 'max:255'],
            'shipping.address_detail' => ['nullable', 'string', 'max:255'],
            'shipping_method' => ['nullable', 'string', 'in:courier,quick,pickup'],

            // Optional fields for company name and customer note
            'company_name' => ['nullable', 'string', 'max:255'],
            'customer_note' => ['nullable', 'string', 'max:2000'],
            'requested_delivery_date' => ['nullable', 'date'],
        ];
    }
}
