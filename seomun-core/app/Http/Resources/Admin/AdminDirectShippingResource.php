<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminDirectShippingResource extends JsonResource
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
            'user_id' => $this->user_id,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'username' => $this->user->username,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'customer' => $this->user->customer ? [
                    'id' => $this->user->customer->id,
                    'company_name' => $this->user->customer->company_name,
                ] : null,
            ] : null,
            'shipping_name' => $this->shipping_name,
            'recipient_name' => $this->recipient_name,
            'phone' => $this->phone,
            'postcode' => $this->postcode,
            'address' => $this->address,
            'detailed_address' => $this->detailed_address,
            'storage_location' => $this->storage_location,
            'file_url' => $this->file_path ? asset('storage/' . $this->file_path) : null,
            'file_name' => $this->file_name,
            'detail_request' => $this->detail_request,
            'amount' => $this->amount,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}