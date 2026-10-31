<?php

namespace App\Http\Resources;

use App\Http\Resources\Admin\AdminErpOptionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductOptionResource extends JsonResource
{
    /**
     * Convert path to full URL (if relative).
     */
    private static function toFullUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    /**
     * Check if option belongs to a group
     */
    private function isGroup(string $code): bool
    {
        return $this->relationLoaded('group') && $this->group?->code === $code;
    }

    /**
     * Check if option is post-processing (후가공)
     */
    private function isPostProcessing(): bool
    {
        return $this->relationLoaded('group')
            && str_starts_with($this->group?->code, 'post_');
    }

    /**
     * Transform paper metadata → paper_characteristics
     */
    private function mapPaperCharacteristics(array $metadata): array
    {
        return [
            'preview_image' => self::toFullUrl($metadata['preview_image'] ?? null),
            'description' => $metadata['description'] ?? null,
            'characteristics' => $metadata['characteristics'] ?? null,
            'view_url' => self::toFullUrl($metadata['view_url'] ?? null),
        ];
    }

    /**
     * Transform post-processing metadata → post_processing
     */
    private function mapPostProcessing(array $metadata): array
    {
        return [
            'images' => collect($metadata['images'] ?? [])
                ->map(fn($path) => self::toFullUrl($path))
                ->filter()
                ->values(),

            'description' => $metadata['description'] ?? null,

            'url' => $metadata['url'] ?? null,
        ];
    }

    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $metadata = $this->metadata ?? [];

        // Detect group types
        $isPaper = $this->isGroup('paper_stock');
        $isPostProcessing = $this->isPostProcessing();

        return [
            'id' => $this->id,
            'label' => $this->label,
            'value' => $this->value,
            'additional_price' => $this->additional_price,
            'sort_order' => $this->sort_order,

            // Raw metadata (optional, only when not empty)
            'metadata' => $this->when(!empty($metadata), $metadata),

            // New ERP option fields
            'option_code' => $this->option_code,
            'field_name' => $this->field_name,
            'category' => $this->category,
            'erp_option_id' => $this->erp_option_id,
            'erp_option' => $this->whenLoaded(
                'erpOption',
                fn() => new AdminErpOptionResource($this->erpOption)
            ),

            // Info icon — configurable per product per option
            'info_icon' => [
                'enabled' => (bool) ($metadata['info_icon_enabled'] ?? false),
                'description' => $metadata['info_description'] ?? null,
            ],

            // Domain-specific fields (clean for FE)
            'paper_characteristics' => $this->when(
                $isPaper,
                fn() => $this->mapPaperCharacteristics($metadata)
            ),

            'post_processing' => $this->when(
                $isPostProcessing,
                fn() => $this->mapPostProcessing($metadata)
            ),
        ];
    }
}
