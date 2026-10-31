<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminEditorSizeResource extends JsonResource
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
            'editor_size_type_id' => $this->editor_size_type_id,
            'name' => $this->name,
            'width' => $this->width,
            'height' => $this->height,
            'unit' => $this->unit,
            'thumbnail_url' => $this->thumbnail_url,
            'sort_order' => $this->sort_order,
            'status' => [
                'value' => $this->is_active ? 'active' : 'hidden',
                'label' => $this->is_active ? 'Active' : 'Hidden',
            ],
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'type' => $this->whenLoaded('sizeType', function () {
                return [
                    'id' => $this->sizeType->id,
                    'name' => $this->sizeType->name,
                ];
            }),
            'templates' => $this->whenLoaded('templates', function () {
                return $this->templates->map(fn ($template) => [
                    'id' => $template->id,
                    'name' => $template->name,
                    'product_id' => $template->product_id,
                    'editor_size_id' => $template->editor_size_id,
                    'is_active' => $template->is_active,
                ]);
            }),
        ];
    }
}
