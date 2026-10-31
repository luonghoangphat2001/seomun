<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminBannerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isExposed = $this->is_active
            && ($this->exposure_start_date === null || $this->exposure_start_date <= now())
            && ($this->exposure_end_date === null || $this->exposure_end_date >= now());

        return [
            'id' => $this->id,
            'name' => $this->name,
            'image_path' => $this->image_path,
            'image_path_mobile' => $this->image_path_mobile,
            'link_url' => $this->link_url,
            'exposure_location' => $this->exposure_location,
            'exposure_target' => $this->exposure_target ?? ['all'],
            'status' => [
                'value' => $isExposed ? 'exposed' : 'non-exposed',
                'label' => $isExposed ? 'Exposed' : 'Non-Exposed',
            ],
            'sort_order' => $this->sort_order,
            'exposure_start_date' => $this->exposure_start_date?->format('Y-m-d H:i:s'),
            'exposure_end_date' => $this->exposure_end_date?->format('Y-m-d H:i:s'),
            'registrant' => $this->whenLoaded('createdBy', function () {
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
