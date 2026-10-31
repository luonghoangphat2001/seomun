<?php

namespace App\Http\Requests\Admin\Order;

use App\Enums\OrderStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminOrderBulkChangeStatusRequest extends FormRequest
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
        $orderStatusValues = array_map(fn ($case) => $case->value, OrderStatus::cases());

        return [
            'order_numbers' => ['required', 'array', 'min:1'],
            'order_numbers.*' => ['required', 'string'],
            'status' => ['required', 'string', 'in:'.implode(',', $orderStatusValues)],
            'reason' => ['nullable', 'string'],
            'note' => ['nullable', 'string'],
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
                $numbers = \App\Models\Order::whereIn('id', $ids)->pluck('order_number')->all();
                $this->merge(['order_numbers' => $numbers]);
            }
        }

        if ($this->filled('note') && ! $this->filled('reason')) {
            $this->merge(['reason' => $this->input('note')]);
        }
    }
}
