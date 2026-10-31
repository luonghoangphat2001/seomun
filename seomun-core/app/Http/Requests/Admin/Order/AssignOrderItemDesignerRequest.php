<?php

namespace App\Http\Requests\Admin\Order;

use Illuminate\Foundation\Http\FormRequest;

class AssignOrderItemDesignerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'designer_user_id' => ['required', 'integer', 'exists:users,id'],
            'order_item_ids' => ['nullable', 'array', 'min:1'],
            'order_item_ids.*' => ['integer', 'distinct', 'exists:order_items,id'],
        ];
    }
}
