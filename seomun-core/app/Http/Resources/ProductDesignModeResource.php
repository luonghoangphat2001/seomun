<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductDesignModeResource extends JsonResource
{
    /**
     * Convert path to full URL (if relative).
     */
    private static function toFullUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $metadata = $this->metadata ?? [];

        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'sort_order' => $this->sort_order,
            'metadata' => $metadata,
            // Enhanced metadata for design preview (full URLs)
            'preview' => $this->when(
                ! empty($metadata['preview_image']) || ! empty($metadata['preview_url']),
                fn () => [
                    'image' => self::toFullUrl($metadata['preview_image'] ?? null),
                    'url' => self::toFullUrl($metadata['preview_url'] ?? null),
                    'description' => $metadata['preview_description'] ?? null,
                ]
            ),
        ];
    }
}
