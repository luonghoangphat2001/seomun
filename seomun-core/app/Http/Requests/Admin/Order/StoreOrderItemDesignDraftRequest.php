<?php

namespace App\Http\Requests\Admin\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderItemDesignDraftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:pdf,ai,jpg,jpeg,png', 'max:51200'],
            'note' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
