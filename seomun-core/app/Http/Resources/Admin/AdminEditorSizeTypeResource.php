<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminEditorSizeTypeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'parent_id' => $this->parent_id,
            'parent' => $this->whenLoaded('parent', function () {
                return $this->parent ? [
                    'id' => $this->parent->id,
                    'name' => $this->parent->name,
                ] : null;
            }),
            'sort_order' => $this->sort_order,
            'status' => [
                'value' => $this->is_active ? 'active' : 'hidden',
                'label' => $this->is_active ? 'Active' : 'Hidden',
            ],
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'children' => $this->whenLoaded('children', function () {
                return $this->children->map(fn ($child) => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'sort_order' => $child->sort_order,
                    'is_active' => $child->is_active,
                    'status' => [
                        'value' => $child->is_active ? 'active' : 'hidden',
                        'label' => $child->is_active ? 'Active' : 'Hidden',
                    ],
                ]);
            }),
            'sizes' => $this->whenLoaded('allSizes', function () {
                return $this->allSizes->map(fn ($size) => [
                    'id' => $size->id,
                    'name' => $size->name,
                    'width' => $size->width,
                    'height' => $size->height,
                    'unit' => $size->unit,
                    'sort_order' => $size->sort_order,
                    'is_active' => $size->is_active,
                ]);
            }),
        ];
    }
}
