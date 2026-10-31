<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderProofRevisionRequest extends FormRequest
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
            'request_message' => ['required', 'string', 'max:2000'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,jpeg,jpg,png', 'max:10240'],
            'order_item_id' => ['required', 'integer', 'exists:order_items,id'],
        ];
    }
}
