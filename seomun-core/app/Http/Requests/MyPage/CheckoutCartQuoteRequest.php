<?php

namespace App\Http\Requests\MyPage;

use App\Enums\ShippingMethod;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class CheckoutCartQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    
    public function rules(): array
    {
         $shippingMethodValues = array_map(fn ($case) => $case->value, ShippingMethod::cases());
        return [
            'item_ids' => 'nullable|array|min:1',
            'item_ids.*' => 'integer|exists:cart_items,id',

            'point_used' => 'nullable|integer|min:0|multiple_of:100',
            'user_coupon_id' => ['nullable', 'integer', 'exists:user_coupons,id'],
            'shipping_method' => ['nullable', 'string', 'in:'.implode(',', $shippingMethodValues)],
        ];
    }
}