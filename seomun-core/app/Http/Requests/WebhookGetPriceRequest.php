<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WebhookGetPriceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'item_code3' => 'required|string',
            'size1' => 'required|numeric|min:0',
            'size2' => 'required|numeric|min:0',
            'qnt' => 'required|integer|min:1',
            'api_ratio_com' => 'nullable|numeric|min:0|max:200',
            'size_ratio' => 'nullable|numeric|min:0|max:200',
            'opt1' => 'nullable|string',
            'opt2' => 'nullable|string',
            'opt3' => 'nullable|string',
            'opt4' => 'nullable|string',
            'opt5' => 'nullable|string',
            'opt6' => 'nullable|string',
            'opt7' => 'nullable|string',
            'opt8' => 'nullable|string',
        ];
    }
}
