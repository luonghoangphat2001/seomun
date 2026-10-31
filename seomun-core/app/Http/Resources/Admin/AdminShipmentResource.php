<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminShipmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $order = $this->order;
        $items = $this->items;

        return [
            'id'              => $this->id,
            'order_number'    => $order?->order_number,
            'customer_name'   => $order?->company_name,
            'type'            => $this->type?->value,
            'status'          => $this->status?->value,
            'tracking_number' => $this->tracking_number,
            'carrier_code'    => $this->carrier_code,
            'carrier_name'    => $this->carrier_name,
            'shipping_fee'    => $this->shipping_fee,
            'shipping_name'   => $this->shipping_name,
            'shipping_phone'  => $this->shipping_phone,
            'shipping_address' => trim($this->shipping_address.' '.$this->shipping_address_detail),
            'shipped_at'      => $this->shipped_at?->format('Y-m-d H:i:s'),
            'delivered_at'    => $this->delivered_at?->format('Y-m-d H:i:s'),
            'items'           => $items->map(fn ($item) => [
                'id'           => $item->id,
                'product_name' => $item->product?->name ?? $item->product_name,
                'quantity'     => $item->quantity,
                'requires_separate_shipping' => $item->product?->requires_separate_shipping ?? false,
            ]),
        ];
    }
}
