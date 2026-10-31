<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BannerResource extends JsonResource
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
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'image_path' => $this->image_path,
            'image_url' => self::toFullUrl($this->image_path),
            'image_path_mobile' => $this->image_path_mobile,
            'image_url_mobile' => self::toFullUrl($this->image_path_mobile),
            'link_url' => $this->link_url,
            'exposure_location' => $this->exposure_location,
            'sort_order' => $this->sort_order,
        ];
    }
}
