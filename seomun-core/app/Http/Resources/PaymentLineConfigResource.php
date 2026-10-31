<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentLineConfigResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'user_id' => $this->user_id,
            'is_enabled' => $this->is_enabled,
            'is_use_email_notification' => $this->is_use_email_notification,
        ];

        return $data;
    }
}
