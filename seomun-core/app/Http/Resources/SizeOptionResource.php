<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SizeOptionResource extends JsonResource
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
            'cutting_width' => $this->cutting_width,
            'cutting_height' => $this->cutting_height,
            'working_width' => $this->working_width,
            'working_height' => $this->working_height,
        ];
    }
}