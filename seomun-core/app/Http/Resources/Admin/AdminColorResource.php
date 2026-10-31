<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminColorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'r_value' => $this->r_value,
            'g_value' => $this->g_value,
            'b_value' => $this->b_value,
            'c_value' => $this->c_value,
            'm_value' => $this->m_value,
            'y_value' => $this->y_value,
            'k_value' => $this->k_value,
        ];

        return $data;
    }
}
