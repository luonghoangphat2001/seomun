<?php

namespace App\Http\Requests\Admin\Order;

use App\Models\Order;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminOrderBulkDesignPdfRequest extends FormRequest
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
            'order_numbers' => ['required', 'array', 'min:1', 'max:50'],
            'order_numbers.*' => ['required', 'string', 'exists:orders,order_number'],
            'format' => ['nullable', 'string', 'in:pdf'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $orderNumbers = $this->input('order_numbers');
        if (is_string($orderNumbers)) {
            $orderNumbers = array_filter(array_map('trim', explode(',', $orderNumbers)));
            $this->merge(['order_numbers' => $orderNumbers]);
        }

        if (! $this->filled('order_numbers')) {
            $ids = $this->input('selected_ids') ?? $this->input('order_ids');
            if (is_string($ids)) {
                $ids = array_filter(array_map('trim', explode(',', $ids)));
            }
            if (is_array($ids) && ! empty($ids)) {
                $numbers = Order::whereIn('id', $ids)->pluck('order_number')->all();
                $this->merge(['order_numbers' => $numbers]);
            }
        }
    }
}
