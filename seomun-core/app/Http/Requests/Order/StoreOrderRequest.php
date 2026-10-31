<?php

namespace App\Http\Requests\Order;

use App\Enums\PaymentMethod;
use App\Enums\ShippingFeeType;
use App\Enums\ShippingMethod;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends CalculateOrderQuoteRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $paymentMethodValues = array_map(fn ($case) => $case->value, PaymentMethod::cases());
        $shippingMethodValues = array_map(fn ($case) => $case->value, ShippingMethod::cases());
        $shippingFeeTypeValues = array_map(fn ($case) => $case->value, ShippingFeeType::cases());

        $requiresShippingAddress = in_array($this->input('shipping_method'), ['courier', 'quick'], true);

        return array_merge(parent::rules(), [
            'order_external_number' => ['nullable', 'string'],
            'payment_method' => ['required', 'string', 'in:'.implode(',', $paymentMethodValues)],
            // Contact (주문자 정보): name, 주소, 전화번호, 휴대폰, 이메일
            'contact.name' => ['required', 'string', 'max:255'],
            'contact.postcode' => ['nullable', 'string', 'max:20'],
            'contact.address' => ['nullable', 'string', 'max:255'],
            'contact.address_detail' => ['nullable', 'string', 'max:255'],
            'contact.phone' => ['required', 'string', 'max:50', 'regex:/^[0-9-]+$/'],
            'contact.phone2' => ['nullable', 'string', 'max:50', 'regex:/^[0-9-]+$/'],
            'contact.tel' => ['nullable', 'string', 'max:50', 'regex:/^[0-9-]+$/'],
            'contact.email' => ['nullable', 'email', 'max:255'],
            'contact.save_for_worker' => ['sometimes', 'boolean'],
            'company_name' => ['nullable', 'string', 'max:255'],
            // Shipping (배송 정보): name, 주소, 전화번호, 휴대폰, 이메일, 배송 메모
            'shipping.name' => [Rule::requiredIf($requiresShippingAddress), 'nullable', 'string', 'max:255'],
            'shipping.phone' => [Rule::requiredIf($requiresShippingAddress), 'nullable', 'string', 'max:50', 'regex:/^[0-9-]+$/'],
            'shipping.phone2' => ['nullable', 'string', 'max:50', 'regex:/^[0-9-]+$/'],
            'shipping.postcode' => [Rule::requiredIf($requiresShippingAddress), 'nullable', 'string', 'max:20'],
            'shipping.address' => [Rule::requiredIf($requiresShippingAddress), 'nullable', 'string', 'max:255'],
            'shipping.address_detail' => ['nullable', 'string', 'max:255'],
            'shipping.email' => ['nullable', 'email', 'max:255'],
            'shipping.message_preset' => ['nullable', 'string', 'max:255'],
            'shipping.message_custom' => ['nullable', 'string'],
            'shipping.save_for_shipping_address' => ['sometimes', 'boolean'],
            'shipping_method' => ['required', 'string', 'in:'.implode(',', $shippingMethodValues)],
            'shipping_fee_type' => ['required', 'string', 'in:'.implode(',', $shippingFeeTypeValues)],
            'shipping_branch_name' => ['nullable', 'string', 'max:255'],
            'shipping_time' => ['nullable', 'string', 'max:255'],
            'amount_shipping' => ['nullable', 'integer'],
            'sender.name' => ['nullable', 'string', 'max:255'],
            'sender.phone' => ['nullable', 'string', 'max:50', 'regex:/^[0-9-]+$/'],
            'sender.zipcode' => ['nullable', 'string', 'max:20'],
            'sender.address' => ['nullable', 'string', 'max:255'],
            'sender.address2' => ['nullable', 'string', 'max:255'],
            'design_group_id' => ['required_with:selected_options', 'integer', 'exists:design_groups,id'],
        ]);
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('payment_method')) {
            $this->merge(['payment_method' => PaymentMethod::fromExternal($this->input('payment_method')) ?? $this->input('payment_method')]);
        }
        if ($this->filled('shipping_method')) {
            $this->merge(['shipping_method' => ShippingMethod::fromExternal($this->input('shipping_method')) ?? $this->input('shipping_method')]);
        }
    }
}
