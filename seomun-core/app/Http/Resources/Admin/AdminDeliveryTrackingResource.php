<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminDeliveryTrackingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $order = $this->order;
        $quantity = $order?->items?->sum('quantity') ?? 0;

        return [
            'id' => $this->id,
            'order_number' => $order?->order_number,
            'customer_name' => $order?->company_name,
            'product_name' => $order?->product_name,
            'quantity' => (int) $quantity,
            'invoice_number' => $this->invoice_number,
            'waybill_registered_at' => $this->waybill_registered_at?->format('Y-m-d'),
            'delivery_status' => $this->delivery_status?->value ?? $this->delivery_status,
            'delivery_status_label' => $this->delivery_status?->label() ?? null,
            'courier_name' => $this->courier_name,
        ];
    }
}
