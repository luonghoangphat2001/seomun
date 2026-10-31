<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LimitManagementHistoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'detail' => $this->mappingReferenceType($this->reference_type),
            'usage_amount' => $this->usage_amount,
            'remaining_amount' => $this->remaining_amount,
            'description' => $this->description,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }

    private function mappingReferenceType(string $class)
    {
        return match ($class) {
            Order::class => OrderResource::make($this->getDataResource($class, $this->reference_id)),
            default => null,
        };
    }

    private function getDataResource(string $class, int $id)
    {
        return $class::find($id);
    }
}
