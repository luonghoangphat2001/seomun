<?php

namespace App\Http\Resources\Admin;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminLimitUsagedLogsResource extends JsonResource
{
    const TYPE = [
        // order class
        Order::class,
    ];

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'user_limit_id' => $this->user_limit_id,
            'usage_amount' => $this->usage_amount,
            'remaining_amount' => $this->remaining_amount,
            'description' => $this->description,
            'quantity' => $this->quantity,
            'notes' => $this->notes,
            'transaction_person' => $this->transaction_person,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'details' => $this->mappingResource($this->reference_type, $this->reference_id),
        ];
    }

    private function mappingResource(string $class, int $id)
    {
        return match ($class) {
            Order::class => Order::find($id) ? new AdminOrderResource(Order::find($id)) : null,
            default => null,
        };
    }
}
