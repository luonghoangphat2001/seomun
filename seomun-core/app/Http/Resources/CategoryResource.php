<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $children = null;

        if ($this->relationLoaded('childrenRecursive')) {
            $children = CategoryResource::collection($this->childrenRecursive);
        } elseif ($this->relationLoaded('children')) {
            $children = CategoryResource::collection($this->children);
        }

        return [
            'id' => $this->id,
            'name' => [
                'ko' => $this->name,
                'en' => $this->name_en ?? $this->name,
            ],
            'code' => $this->code,
            'slug' => $this->slug,
            'parent_id' => $this->parent_id,
            'description' => $this->description,
            'image' => $this->image,
            'icon' => $this->icon,
            'sort_order' => $this->sort_order,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'parent' => $this->when(
                $this->relationLoaded('parent') && $this->parent,
                fn () => new CategoryResource($this->parent)
            ),
            'children' => $this->when(! is_null($children), $children),
            'is_best' => $this->is_best,
        ];
    }
}
