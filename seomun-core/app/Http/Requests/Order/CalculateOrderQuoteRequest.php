<?php

namespace App\Http\Requests\Order;

use App\Enums\DesignModeCode;
use App\Enums\ShippingMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CalculateOrderQuoteRequest extends FormRequest
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
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $shippingMethodValues = array_map(fn($case) => $case->value, ShippingMethod::cases());
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity_sets.quantity' => ['required', 'integer', 'min:1'],
            'quantity_sets.multiplier' => ['required', 'integer', 'min:1'],
            'selected_options' => ['required', 'array'],
            'selected_options.*.group_id' => ['required_with:selected_options', 'integer', 'exists:product_option_groups,id'],
            'selected_options.*.option_id' => ['required_with:selected_options', 'integer', 'exists:product_options,id'],
            "input_options" => ['required', 'array'],
            'requested_delivery_date' => ['nullable', 'date', 'after_or_equal:today'],
            'customer_note' => ['nullable', 'string'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'shipping_fee' => ['nullable', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            // point
            'point_used' => ['nullable', 'integer'],
            // coupon
            'user_coupon_id' => ['nullable', 'integer', 'exists:user_coupons,id'],
            'shipping_method' => ['nullable', 'string', 'in:' . implode(',', $shippingMethodValues)],
        ];
    }
}
