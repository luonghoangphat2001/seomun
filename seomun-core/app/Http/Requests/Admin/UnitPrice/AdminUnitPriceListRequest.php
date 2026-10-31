<?php

namespace App\Http\Requests\Admin\UnitPrice;

use App\Enums\UnitPriceCategory;
use App\Enums\UnitPriceTab;
use Illuminate\Foundation\Http\FormRequest;

class AdminUnitPriceListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search_keyword' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'string', 'in:true,false,all'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'current_page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
