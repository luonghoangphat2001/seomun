<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrganizationUnitRequest extends FormRequest
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
            'parent_id' => 'sometimes|nullable|integer|exists:organization_units,id',
            'level' => 'sometimes|required|string|in:headquarters,business_office,team',
            'name_ko' => 'sometimes|required|string|max:255',
            'name_en' => 'sometimes|nullable|string|max:255',
            'code' => 'sometimes|nullable|string|max:100',
            // FE sometimes sends `positions` as an array (value + sort_order) for team nodes.
            // Backend stores it in a single `position` string column, so we accept `positions` here too.
            'positions' => 'sometimes|nullable|array',
            'positions.*.sort_order' => 'nullable|integer|min:0',
            'positions.*.value' => 'required_with:positions|string|max:100',
            'position' => 'sometimes|nullable|string|max:10000',
            'sort_order' => 'sometimes|nullable|integer|min:0',
            'is_active' => 'sometimes|nullable|boolean',
        ];
    }
}
