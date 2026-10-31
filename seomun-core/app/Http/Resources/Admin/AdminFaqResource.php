<?php

namespace App\Http\Resources\Admin;

use App\Enums\FaqCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminFaqResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $category = is_string($this->category) ? FaqCategory::tryFrom($this->category) : null;

        return [
            'id' => $this->id,
            'category' => $category->value,
            'question' => $this->question,
            'answer' => $this->answer,
            'sort_order' => $this->sort_order,
            'view_count' => $this->view_count,
            'posting_status' => [
                'value' => $this->is_active ? 'exposed' : 'non-exposed',
                'label' => $this->is_active ? 'Exposed' : 'Non-Exposed',
            ],
            'exposure_target' => $this->exposure_target ?? 'all',
            'author' => $this->whenLoaded('createdBy', function () {
                return $this->createdBy ? [
                    'id' => $this->createdBy->id,
                    'username' => $this->createdBy->username,
                    'name' => $this->createdBy->name,
                ] : null;
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
