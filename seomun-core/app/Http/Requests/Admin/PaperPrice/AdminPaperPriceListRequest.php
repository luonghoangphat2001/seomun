<?php

namespace App\Http\Requests\Admin\PaperPrice;

use Illuminate\Foundation\Http\FormRequest;

class AdminPaperPriceListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paper_id' => 'nullable|exists:papers,id',
            'paper_size_division_code' => 'nullable|string',
            'is_hot_deal' => 'nullable|boolean',
            'supply_price_min' => 'nullable|integer|min:0',
            'supply_price_max' => 'nullable|integer|min:0',
            'cost_min' => 'nullable|integer|min:0',
            'cost_max' => 'nullable|integer|min:0',
            'sort_by' => 'nullable|string|in:paper_id,supply_price,cost,created_at',
            'sort_order' => 'nullable|string|in:asc,desc',
            'per_page' => 'nullable|integer|min:1|max:100',
            'current_page' => 'nullable|integer|min:1',
        ];
    }
}
