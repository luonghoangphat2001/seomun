<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminGuideContentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isExposed = $this->is_active
            && ($this->published_at === null || $this->published_at <= now())
            && ($this->expires_at === null || $this->expires_at >= now());

        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'type' => $this->type,
            'attachments' => collect($this->attachments ?? [])->map(fn(array|string $item) => is_array($item)
                ? ['key' => $item['key'] ?? '', 'name' => $item['name'] ?? basename(parse_url($item['url'] ?? '', PHP_URL_PATH)), 'url' => $item['url'] ?? '', 'size' => $item['size'] ?? 0]
                : ['key' => $item, 'name' => basename(parse_url($item, PHP_URL_PATH)), 'url' => $item, 'size' => 0]
            )->values()->all(),
            'is_active' => $this->is_active,
            'exposure_status' => [
                'value' => $isExposed ? 'exposed' : 'non-exposed',
                'label' => $isExposed ? 'Exposed' : 'Non-Exposed',
            ],
            'exposure_target' => $this->exposure_target ?? 'all',
            'exposure_start_date' => $this->published_at?->format('Y-m-d H:i:s'),
            'exposure_end_date' => $this->expires_at?->format('Y-m-d H:i:s'),
            'author' => $this->whenLoaded('createdBy', function () {
                return $this->createdBy ? [
                    'id' => $this->createdBy->id,
                    'username' => $this->createdBy->username,
                    'name' => $this->createdBy->name,
                ] : null;
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
