<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MyPageShippingAddressResource extends JsonResource
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
            'recipient' => $this->recipient,
            'phone' => $this->phone ?: $this->mobile,
            'postcode' => $this->postcode,
            'address' => $this->address,
            'detailed_address' => $this->detailed_address,
            'delivery_message_preset' => $this->delivery_message_preset,
            'delivery_message_custom' => $this->delivery_message_custom ?: $this->delivery_message,
            'is_default' => $this->is_default,
        ];
    }
}
