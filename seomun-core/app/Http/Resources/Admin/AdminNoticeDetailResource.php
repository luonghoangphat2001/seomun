<?php

namespace App\Http\Resources\Admin;

use App\Enums\NoticeType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminNoticeDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Determine exposure status based on is_active, published_at, and expires_at
        $isExposed = $this->is_active
            && ($this->published_at === null || $this->published_at <= now())
            && ($this->expires_at === null || $this->expires_at >= now());

        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'type' => $this->type,
            'type_label' => NoticeType::tryFrom($this->type)?->label(),
            'attachments' => collect($this->attachments ?? [])->map(fn(array|string $item) => is_array($item)
                ? ['key' => $item['key'] ?? '', 'name' => $item['name'] ?? basename(parse_url($item['url'] ?? '', PHP_URL_PATH)), 'url' => $item['url'] ?? '', 'size' => $item['size'] ?? 0]
                : ['key' => $item, 'name' => basename(parse_url($item, PHP_URL_PATH)), 'url' => $item, 'size' => 0]
            )->values()->all(),
            'is_pinned' => $this->is_pinned,
            'is_active' => $this->is_active,
            'view_count' => $this->view_count,
            'published_at' => $this->published_at?->format('Y-m-d H:i:s'),
            'expires_at' => $this->expires_at?->format('Y-m-d H:i:s'),
            'exposure_status' => [
                'value' => $isExposed ? 'exposed' : 'non-exposed',
                'label' => $isExposed ? 'Exposed' : 'Non-Exposed',
            ],
            'exposure_target' => $this->exposure_target ?? 'all',
            'exposure_location' => $this->exposure_location,
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
