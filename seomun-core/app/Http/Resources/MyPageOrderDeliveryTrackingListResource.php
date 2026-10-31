<?php

namespace App\Http\Resources;

use App\Enums\OrderStatus;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MyPageOrderDeliveryTrackingListResource extends JsonResource
{
    private static function toAssetUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        return $disk->url($path);
    }

    public function toArray(Request $request): array
    {
        $firstItem = $this->relationLoaded('items') ? $this->items->first() : null;
        $artwork = $firstItem && $firstItem->relationLoaded('artworks')
            ? $firstItem->artworks->firstWhere('side', 'front')
            : null;
        $thumbPath = $artwork?->preview_image_path ?: $this->product?->first_image;
        $quantity = $this->relationLoaded('items')
            ? (int) $this->items->sum(fn($item) => (int) ($item->quantity ?? 0) * (float) ($item->multiplier ?? 1))
            : 0;
        $status = $this->status ? OrderStatus::tryFrom($this->status) : null;

        return [
            'order_number' => $this->order_number,
            'ordered_at' => $this->created_at?->toISOString(),
            'thumbnail_url' => self::toAssetUrl($thumbPath),
            'product_name' => $this->product_name,
            'product_spec' => $firstItem?->configuration,
            'quantity' => $quantity,
            'items' => OrderItemResource::collection($this->items)->resolve($request),
            'amount' => (string) ($this->total_amount ?? '0.00'),
            'status' => $this->status,
            'status_label' => $status?->label() ?? $this->status,
            'proof_status' => $this->metadata['proof_status'] ?? null,
            'invoice_number' => $this->deliveryTracking?->invoice_number,
            'can_track_delivery' => ! empty($this->deliveryTracking?->invoice_number),
            'review' => [
                'has_review' => (bool) $this->review?->id,
                'review_id'  => $this->review?->id,
            ],
        ];
    }
}
