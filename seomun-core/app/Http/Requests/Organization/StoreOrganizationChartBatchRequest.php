<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrganizationChartBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Rules for one node in the tree (used recursively).
     *
     * @param  string  $prefix  e.g. 'nodes', 'nodes.*.children', 'nodes.*.children.*.children'
     * @return array<string, mixed>
     */
    protected function nodeRules(string $prefix): array
    {
        return [
            $prefix.'*.level' => 'required|string|in:headquarters,business_office,team',
            $prefix.'*.name_ko' => 'required|string|max:255',
            $prefix.'*.name_en' => 'nullable|string|max:255',
            $prefix.'*.code' => 'nullable|string|max:100',
            $prefix.'*.positions' => 'nullable|array',
            $prefix.'*.positions.*.sort_order' => 'nullable|integer|min:0',
            $prefix.'*.positions.*.value' => 'required_with:'.$prefix.'.*.positions|string|max:100',
            $prefix.'*.position' => 'nullable|string|max:10000',
            $prefix.'*.sort_order' => 'nullable|integer|min:0',
            $prefix.'*.is_active' => 'nullable|boolean',
            $prefix.'*.children' => 'nullable|array',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = [
            'nodes' => 'required|array',
            'nodes.*.level' => 'required|string|in:headquarters,business_office,team',
            'nodes.*.name_ko' => 'required|string|max:255',
            'nodes.*.name_en' => 'nullable|string|max:255',
            'nodes.*.code' => 'nullable|string|max:100',
            'nodes.*.positions' => 'nullable|array',
            'nodes.*.positions.*.sort_order' => 'nullable|integer|min:0',
            'nodes.*.positions.*.value' => 'required_with:nodes.*.positions|string|max:100',
            'nodes.*.position' => 'nullable|string|max:10000',
            'nodes.*.sort_order' => 'nullable|integer|min:0',
            'nodes.*.is_active' => 'nullable|boolean',
            'nodes.*.children' => 'nullable|array',
        ];

        // Level 2 (e.g. business_office under headquarters)
        $rules['nodes.*.children.*.level'] = 'required|string|in:headquarters,business_office,team';
        $rules['nodes.*.children.*.name_ko'] = 'required|string|max:255';
        $rules['nodes.*.children.*.name_en'] = 'nullable|string|max:255';
        $rules['nodes.*.children.*.code'] = 'nullable|string|max:100';
        $rules['nodes.*.children.*.positions'] = 'nullable|array';
        $rules['nodes.*.children.*.positions.*.sort_order'] = 'nullable|integer|min:0';
        $rules['nodes.*.children.*.positions.*.value'] = 'required_with:nodes.*.children.*.positions|string|max:100';
        $rules['nodes.*.children.*.position'] = 'nullable|string|max:10000';
        $rules['nodes.*.children.*.sort_order'] = 'nullable|integer|min:0';
        $rules['nodes.*.children.*.is_active'] = 'nullable|boolean';
        $rules['nodes.*.children.*.children'] = 'nullable|array';

        // Level 3 (e.g. team under business_office)
        $rules['nodes.*.children.*.children.*.level'] = 'required|string|in:headquarters,business_office,team';
        $rules['nodes.*.children.*.children.*.name_ko'] = 'required|string|max:255';
        $rules['nodes.*.children.*.children.*.name_en'] = 'nullable|string|max:255';
        $rules['nodes.*.children.*.children.*.code'] = 'nullable|string|max:100';
        $rules['nodes.*.children.*.children.*.positions'] = 'nullable|array';
        $rules['nodes.*.children.*.children.*.positions.*.sort_order'] = 'nullable|integer|min:0';
        $rules['nodes.*.children.*.children.*.positions.*.value'] = 'required_with:nodes.*.children.*.children.*.positions|string|max:100';
        $rules['nodes.*.children.*.children.*.position'] = 'nullable|string|max:10000';
        $rules['nodes.*.children.*.children.*.sort_order'] = 'nullable|integer|min:0';
        $rules['nodes.*.children.*.children.*.is_active'] = 'nullable|boolean';
        $rules['nodes.*.children.*.children.*.children'] = 'nullable|array';

        return $rules;
    }
}
