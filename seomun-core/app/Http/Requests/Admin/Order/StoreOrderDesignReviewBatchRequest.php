<?php

namespace App\Http\Requests\Admin\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderDesignReviewBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'version_ids' => ['required', 'array', 'min:1'],
            'version_ids.*' => ['integer', 'distinct', 'exists:order_item_design_versions,id'],
        ];
    }
}
