<?php

namespace App\Http\Resources;

use App\Enums\DesignModeCode;
use App\Models\DesignGroup;
use App\Support\OptionGroupLabelLocalizer;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class OrderItemResource extends JsonResource
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

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $configuration = is_array($this->configuration)
            ? OptionGroupLabelLocalizer::localize($this->configuration)
            : [];
        $fileDesign = null;
        $confirmedFile = null;
        $editorDesign = ['front' => null, 'back' => null];
        if ($this->relationLoaded('designGroup') && $this->designGroup) {
            if ($this->designGroup->source_type === DesignModeCode::UPLOAD_FILE) {
                $fileDesign = $this->designGroup->relationLoaded('uploadArtworks')
                    ? $this->designGroup->uploadArtworks->first()
                    : null;
            } else {
                $editorDesigns = $this->designGroup->relationLoaded('orderArtworks')
                    ? $this->designGroup->orderArtworks
                    : collect();

                $editorDesign = [
                    'front' => $editorDesigns->where('side', 'front')->first(),
                    'back'  => $editorDesigns->where('side', 'back')->first(),
                ];
            }
        }

        // For the design-service upload_file flow, this is the exact draft
        // approved by the customer. It is intentionally distinct from
        // design.file, which is the customer's original uploaded artwork.
        if (
            $this->relationLoaded('designWorkflow')
            && $this->designWorkflow?->design_mode_code === DesignModeCode::UPLOAD_FILE->value
            && $this->designWorkflow->final_file_path
        ) {
            $confirmedFile = [
                'name' => $this->designWorkflow->final_file_name,
                'url' => self::toAssetUrl($this->designWorkflow->final_file_path),
                'confirmed_at' => $this->designWorkflow->finalized_at?->toIso8601String(),
            ];
        }

        // Transform configuration to match frontend ProductConfiguration format
        $transformedConfig = [
            'jobs' => $configuration['jobs'] ?? '',
            'size' => $configuration['size'] ?? '',
            'paper' => $configuration['paper'] ?? '',
            'sheets' => $configuration['sheets'] ?? '',
            'attachment' => $configuration['attachment'] ?? '',
            'product_name' => $configuration['product_name'] ?? '',
            'design_preview' => $configuration['design_preview'] ?? '',
            'product_category' => $configuration['product_category'] ?? '',
            'design' => $configuration['design'] ?? '',
        ];

        $cases = (float) ($this->multiplier ?? 1);
        $qty = (int) ($this->quantity ?? 0);

        return [
            'id' => $this->id,
            'product_id' => $configuration['product_id'] ?? null,
            'title' => $this->title,
            'quantity' => $qty,
            'number_of_cases' => $cases,
            'multiplier' => $cases, // backward-compatible alias
            'total_quantity' => $qty * $cases,
            'unit' => $this->unit,
            'production_days' => $this->production_days,
            'unit_price' => (string) ($this->unit_price ?? '0.00'),
            'total_price' => (string) ($this->total_price ?? '0.00'),
            'design' =>  [
                'front' => $editorDesign['front'],
                'back' => $editorDesign['back'],
                'file' => $fileDesign,
                'confirmed_file' => $confirmedFile,
            ],
            'options' => $configuration['options'] ?? [],
            'input_options' => $configuration['input_options'] ?? [],
            'product_snapshot' => [
                'id' => $configuration['product_id'] ?? null,
                'name' => $configuration['product_name'] ?? ($this->title ?? ''),
                'name_en' => $configuration['product_name_en']
                    ?? $configuration['product_name']
                    ?? ($this->title ?? ''),
                'name_ja' => $configuration['product_name_ja']
                    ?? $configuration['product_name']
                    ?? ($this->title ?? ''),
                'slug' => $configuration['product_slug'] ?? null,
                'sku' => $configuration['product_sku'] ?? null,
                'category' => $configuration['product_category'] ?? '',
                'category_en' => $configuration['product_category_en']
                    ?? $configuration['product_category']
                    ?? '',
                'category_ja' => $configuration['product_category_ja']
                    ?? $configuration['product_category']
                    ?? '',
                'specification' => [],
                'first_image' => data_get($configuration, 'product_snapshot.images.0'),
            ],
            'configuration' => $transformedConfig,
            'notes' => $this->notes,
            'metadata' => $this->metadata ?? null,
        ];
    }
}
