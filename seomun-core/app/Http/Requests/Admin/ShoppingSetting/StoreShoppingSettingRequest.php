<?php

namespace App\Http\Requests\Admin\ShoppingSetting;

use Illuminate\Foundation\Http\FormRequest;

class StoreShoppingSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // In a real app, you might check permissions here
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'type' => ['required', 'in:General Precautions,General Production Guide,Shipment & Delivery Information,User Guide'],
        ];
    }
}
