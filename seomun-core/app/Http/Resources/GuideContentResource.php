<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuideContentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'content'     => $this->content,
            'type'        => $this->type,
            'attachments' => $this->attachments ?? [],
            'published_at' => $this->published_at?->toDateTimeString(),
            'created_at'  => $this->created_at?->toDateTimeString(),
        ];
    }
}
