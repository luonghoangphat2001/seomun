<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validation for applying points to an order.
 * Validates the order number from route and points from request body.
 */
class ApplyPointRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get validation rules for applying points.
     */
    public function rules(): array
    {
        return [
            'point_use' => [
                'required',
                'integer',
                'min:1',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'points.required' => '사용할 포인트를 입력해 주세요.',
            'points.integer' => '포인트는 정수로만 입력 가능합니다.',
            'points.min' => '최소 1포인트부터 사용 가능합니다.',
        ];
    }

    /**
     * Merge route parameters into validation data.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'orderNumber' => $this->route('orderNumber'),
        ]);
    }
}
