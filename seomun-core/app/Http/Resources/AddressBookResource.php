<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressBookResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Format full address: [postcode]address detailed_address
        $fullAddress = '';
        if ($this->postcode) {
            $fullAddress = "[{$this->postcode}]";
        }
        if ($this->address) {
            $fullAddress .= $this->address;
        }
        if ($this->detailed_address) {
            $fullAddress .= ' '.$this->detailed_address;
        }
        $fullAddress = trim($fullAddress);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'recipient' => $this->recipient,
            'phone' => $this->phone,
            'mobile' => $this->mobile,
            'email' => $this->email,
            'postcode' => $this->postcode,
            'address' => $this->address,
            'detailed_address' => $this->detailed_address,
            'full_address' => $fullAddress ?: null, // Full formatted address for display
            'is_default' => $this->is_default,
            'delivery_message' => $this->delivery_message,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
