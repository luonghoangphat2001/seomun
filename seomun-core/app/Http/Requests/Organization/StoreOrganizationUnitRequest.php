<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrganizationUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'parent_id' => 'nullable|integer|exists:organization_units,id',
            'level' => 'required|string|in:headquarters,business_office,team',
            'name_ko' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:100',
            // FE can also send `positions` (value + sort_order) for `level=team`.
            // Backend stores it in `position` (single string column).
            'positions' => 'nullable|array',
            'positions.*.sort_order' => 'nullable|integer|min:0',
            'positions.*.value' => 'required_with:positions|string|max:100',
            'position' => 'nullable|string|max:10000',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ];
    }
}
