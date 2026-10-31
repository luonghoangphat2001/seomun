<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class WebhookCreateOrderRequest extends FormRequest
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
            'orders.*.order_idx' => 'required|string',
            'orders.*.items.*.item_code' => 'required|string',
            'orders.*.items.*.size_sel' => 'nullable|string',
            'orders.*.items.*.item_name3' => 'nullable|string',
            'orders.*.items.*.size1' => 'nullable|integer',
            'orders.*.items.*.size2' => 'nullable|integer',
            'orders.*.items.*.qnt' => 'required|integer',
            'orders.*.items.*.amount' => 'required|integer',
            'orders.*.items.*.api_ratio_com' => 'nullable|numeric|min:0|max:200', // Customer rate ratio
            'orders.*.items.*.size_ratio' => 'nullable|numeric|min:0|max:200', // Size ratio
            'orders.*.items.*.filename' => 'nullable|string',
            'orders.*.items.*.subject' => 'nullable|string',
            'orders.*.items.*.opt1' => 'nullable|string',
            'orders.*.items.*.opt2' => 'nullable|string',
            'orders.*.items.*.opt3' => 'nullable|string',
            'orders.*.items.*.opt4' => 'nullable|string',
            'orders.*.items.*.opt5' => 'nullable|string',
            'orders.*.items.*.opt6' => 'nullable|string',
            'orders.*.items.*.opt7' => 'nullable|string',
            'orders.*.items.*.opt8' => 'nullable|string',
        ];
    }
}
