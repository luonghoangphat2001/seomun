<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderProofResubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:pdf,jpeg,jpg,png', 'max:20480'],
            'note' => ['nullable', 'string', 'max:1000'],
            'order_item_id' => ['required', 'integer', 'exists:order_items,id'],
        ];
    }
}
