<?php

namespace App\Http\Requests\Admin\Shipment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminShipmentUpdateTrackingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tracking_number' => ['required', 'string', 'max:100'],
            'carrier_code'    => ['nullable', 'string', 'max:50'],
            'carrier_name'    => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tracking_number.required' => '송장번호를 입력해 주세요.',
            'tracking_number.max'      => '송장번호는 100자 이하로 입력해 주세요.',
            'carrier_code.max'         => '배송사 코드는 50자 이하로 입력해 주세요.',
            'carrier_name.max'         => '배송사명은 100자 이하로 입력해 주세요.',
        ];
    }
}
