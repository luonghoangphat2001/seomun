<?php

namespace App\Http\Requests\Admin\Customer;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SuperAdminUpsertCustomerRequest extends FormRequest
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
        $customerId = $this->route('id');

        return [
            'member_type' => 'nullable|string|in:individual,business',
            'name' => 'nullable|string|max:100',
            'username' => [
                'nullable', 'string', 'min:4', 'max:50',
                'regex:/^[a-zA-Z0-9_]+$/',
                Rule::unique('users', 'username')
                    ->ignore($customerId, 'customer_id'),
            ],
            'password' => 'nullable|string|min:6|max:20|regex:/^(?=.*[a-zA-Z])[A-Za-z\d!@#$%^&*_]+$/|confirmed',
            'password_confirmation' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:20',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'company_name' => 'required|string|max:200',
            'business_registration_number' => [
                'nullable', 'string', 'max:20',
                Rule::unique('customers', 'business_registration_number')
                    ->ignore($customerId)
                    ->whereNull('deleted_at'),
            ],
            'representative_name' => 'nullable|string|max:100',
            'business_type' => 'nullable|string|max:100',
            'business_items' => 'nullable|string|max:100',
            'business_postcode' => 'nullable|string|max:10',
            'business_address' => 'nullable|string|max:255',
            'business_detailed_address' => 'nullable|string|max:255',
            'tax_invoice_email' => 'nullable|email|max:255',
            'homepage_url' => 'nullable|string|max:255',
            'business_registration_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ];
    }
}
