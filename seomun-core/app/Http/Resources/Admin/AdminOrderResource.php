<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\OrderResource;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminOrderResource extends OrderResource
{
    /**
     * Transform the resource into an array for admin view.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        $assignedDesigners = $this->relationLoaded('itemDesignWorkflows')
            ? $this->itemDesignWorkflows
                ->map(fn ($workflow) => $workflow->assignedDesigner)
                ->filter()
                ->unique('id')
                ->values()
            : collect();

        $formatDesigner = static fn ($designer): array => [
            'id' => $designer->id,
            'username' => $designer->username,
            'name' => $designer->name,
        ];

        // Add admin-specific fields
        return array_merge($data, [
            // User information (회원 정보)
            'user' => [
                'id' => $this->user?->id,
                'username' => $this->user?->username,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
            ],

            // Company name from order or customer (고객사)
            'company_name' => $this->user?->customer?->company_name ?: ($this?->company_name ?? null),

            // Design work is assigned per item. Most orders have one designer,
            // while assigned_designers preserves every designer for split work.
            'assigned_designer' => $assignedDesigners->count() === 1
                ? $formatDesigner($assignedDesigners->first())
                : null,
            // Order counts (수량/건수)
            'quantity' => $this->items->sum('quantity') ?? 0,
            'item_count' => $this->items->count(),

            // Design: order has at least one artwork (for showing "Design PDF" button on list)
            'has_design' => ($this->artworks_count ?? 0) > 0,

            // Manager assignments (담당자 지정)
            'reception_manager' => [
                'id' => $this->metadata['reception_manager_id'] ?? null,
                'name' => $this->metadata['reception_manager_name'] ?? null,
            ],
            'production_manager' => [
                'id' => $this->metadata['production_manager_id'] ?? null,
                'name' => $this->metadata['production_manager_name'] ?? null,
            ],

            // Production site (생산처)
            'production_site' => $this->metadata['production_site'] ?? null,

            // Shipping method (배송처)
            'shipping_method' => $this->shipping_method,

            // Delivery date (납기일)
            'requested_delivery_date' => $this->requested_delivery_date?->format('Y-m-d'),

            // Waybill information (운송장 정보)
            'waybill' => [
                'number' => $this->metadata['waybill_number'] ?? null,
                'courier' => $this->metadata['waybill_courier'] ?? null,
                'registered_at' => isset($this->metadata['waybill_registered_at'])
                    ? (is_string($this->metadata['waybill_registered_at'])
                        ? $this->metadata['waybill_registered_at']
                        : (Carbon::parse($this->metadata['waybill_registered_at'])->toIso8601String()))
                    : null,
            ],

            // Order source (주문처)
            'order_source' => $this->metadata['order_source'] ?? null,

            // Order linkage (주문연동)
            'order_linkage' => $this->metadata['order_linkage'] ?? null,

            // Reception point (접수처)
            'reception_point' => $this->metadata['reception_point'] ?? null,

            // Deleted status
            'deleted_at' => $this->deleted_at?->toIso8601String(),

            // FSD: Order Details - Product Information (ordered products, options, quantity, amount, post-processing + design for PDF export)
            'product_information' => [
                'items' => AdminOrderItemResource::collection($this->whenLoaded('items')),
            ],
        ]);
    }
}
