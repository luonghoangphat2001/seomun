<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmOrderProofRequest extends FormRequest
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
            'confirm' => ['required', 'boolean'],
            'order_item_id' => ['required', 'integer', 'exists:order_items,id'],
        ];
    }
}
