<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PopupResource extends JsonResource
{
    private static function toFullUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }
        if (str_starts_with($path, '/')) {
            return url($path);
        }

        return asset('storage/'.$path);
    }

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
            'content' => $this->content,
            'image_path' => $this->image_path,
            'image_url' => self::toFullUrl($this->image_path),
            'exposure_location' => $this->exposure_location,
            'exposure_target' => $this->exposure_target ?? ['all'],
            'width' => $this->width,
            'height' => $this->height,
            'size_settings' => [
                'width' => $this->width,
                'height' => $this->height,
            ],
            'exposure_start_date' => $this->exposure_start_date?->format('Y-m-d H:i:s'),
            'exposure_end_date' => $this->exposure_end_date?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
