<?php

namespace App\Http\Resources;

use App\Enums\DesignModeCode;
use App\Models\ProductOption;
use App\Services\DesignService;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CartItemResource extends JsonResource
{
    /**
     * Convert stored image path to public URL (same rules as ProductResource).
     */
    private static function productImageUrl(?string $path): ?string
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
        $cases = (float) ($this->number_of_cases ?? 1);

        $fileDesign = null;
        $editorDesign = ['front' => null, 'back' => null];
        if ($this->designGroup) {
            if ($this->designGroup->source_type === DesignModeCode::UPLOAD_FILE) {
                $fileDesign = $this->designGroup->uploadArtworks()->first();
            } else {
                $editorDesigns = $this->designGroup->orderArtworks()->get();

                $editorDesign = [
                    'front' => $editorDesigns->where('side', 'front')->first(),
                    'back' => $editorDesigns->where('side', 'back')->first(),
                ];
            }
        }

        $options = collect($this->options ?? []);

        $optionIds = $options->pluck('option_id');

        $productOptions = ProductOption::with('group')
            ->whereIn('id', $optionIds)
            ->get()
            ->keyBy('id');

        $data = [
            'id' => $this->id,
            'cart_id' => $this->cart_id,
            'product_id' => $this->product_id,
            // Legacy single design id kept for FE compatibility.
            'quantity' => $this->quantity,
            // bundle_tiers.bundle_value (건); alias multiplier for older clients
            'number_of_cases' => $cases,
            'multiplier' => $cases,
            'total_quantity' => $this->quantity * $cases,
            'price' => $this->price ? (float) $this->price : null,
            'subtotal' => (float) $this->subtotal,
            'options' => $options->map(function ($item) use ($productOptions) {
                $option = $productOptions[$item['option_id']] ?? null;

                return [
                    'group' => [
                        'id' => $option?->group?->id,
                        'name' => $option?->group?->name,
                        'code' => $option?->group?->code,
                    ],
                    'option' => [
                        'id' => $option?->id,
                        'label' => $option?->label,
                        'value' => $option?->value,
                    ],
                ];
            }),
            'input_options' => $this->input_options,
            'notes' => $this->notes,
            'storage_date' => $this->storage_date?->toIso8601String(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        // Response canonical field: always use design_ids for FE mapping.
        $data['design'] = [
            'front' => $editorDesign['front'],
            'back' => $editorDesign['back'],
            'title' => $this->designGroup?->title,
            'file' => $fileDesign,
            'preview_pdf_url' => $this->designGroup?->preview_pdf_url,
        ];

        if ($this->relationLoaded('product') && $this->product) {
            $productData = [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'name_en' => $this->product->name_en,
                'slug' => $this->product->slug,
                'sku' => $this->product->sku,
                'price' => (float) $this->price,
                'compare_price' => null,
                'pricing_profile_id' => $this->product->pricing_profile_id,
                'pricing_structure' => $this->product->pricing_structure?->value ?? $this->product->pricing_structure,
                'images' => $this->product->images,
                'first_image' => self::productImageUrl($this->product->first_image),
                'is_active' => (bool) $this->product->is_active,
                'stock_quantity' => $this->product->stock_quantity,
            ];

            if ($this->product->relationLoaded('productSets') && $this->product->productSets) {
                $set = $this->product->productSets;
                $productData['product_sets'] = [
                    'quantity' => $set->quantity,
                    'set_type' => $set->set_type,
                    'min_set' => $set->min_set,
                    'max_set' => $set->max_set,
                    'step_set' => $set->step_set,
                    'set_unit' => $set->set_unit,
                    'select_options' => $set->select_options,
                ];
            }

            if ($this->product->relationLoaded('specification') && $this->product->specification) {
                $spec = $this->product->specification;
                $productData['specification'] = [
                    'production_time_days' => $spec->production_time_days,
                ];
            }

            $data['product'] = $productData;
        }

        if ($this->relationLoaded('design') && $this->design) {
            $data['design'] = [
                'id' => $this->design->id,
                'name' => $this->design->name ?? null,
            ];
        }

        if ($this->bulk_order_batch_id && $this->relationLoaded('bulkOrderBatch') && $this->bulkOrderBatch) {
            $batch = $this->bulkOrderBatch;
            $entries = $batch->relationLoaded('entries') ? $batch->entries : collect();
            $validEntries = $entries->where('status', 'valid')->sortBy('row_number')->values();
            $data['bulk_order'] = [
                'batch_id' => $batch->id,
                'name' => $batch->name,
                'status' => $batch->status,
                'valid_entry_count' => $validEntries->count(),
                'entries' => $validEntries->map(static fn ($e) => [
                    'id' => $e->id,
                    'row_number' => $e->row_number,
                    'data' => $e->data,
                    'status' => $e->status,
                ])->all(),
            ];
        }

        $data['line_display'] = $this->buildLineDisplay($request);

        return $data;
    }

    /**
     * UI-oriented fields (thumbnail, spec line, 첨부 PDF 메타, 수량/건 표기).
     *
     * @return array<string, mixed>
     */
    private function buildLineDisplay(Request $request): array
    {
        /** @var DesignService $designService */
        $designService = app(DesignService::class);

        $thumbnail = null;
        $attachments = [];

        if ($this->relationLoaded('resolvedArtworks')) {
            foreach ($this->resolvedArtworks as $art) {
                if ($thumbnail === null) {
                    $thumbnail = $designService->getPreviewUrlForSide($art, 'front')
                        ?? $designService->getPreviewUrl($art);
                }
                $meta = is_array($art->file_metadata) ? $art->file_metadata : [];
                if ($meta !== []) {
                    $attachments[] = [
                        'name' => $meta['name'] ?? null,
                        'url' => $meta['url'] ?? null,
                        'mime' => $meta['mime'] ?? null,
                        'size' => $meta['size'] ?? null,
                    ];
                }
            }
        }

        if ($thumbnail === null && $this->relationLoaded('product') && $this->product) {
            $thumbnail = self::productImageUrl($this->product->first_image);
        }

        return [
            'thumbnail_url' => $thumbnail,
            'specifications_line' => $this->buildSpecificationsLine(),
            'post_processing' => $this->extractPostProcessingLabel(),
            'quantity_label' => $this->buildQuantityLabel(),
            'unit_price' => $this->price ? (float) $this->price : null,
            'line_total' => (float) $this->subtotal,
            'attachments' => $attachments,
        ];
    }

    private function buildSpecificationsLine(): ?string
    {
        $options = $this->options;
        if (is_array($options)) {
            if (! empty($options['summary']) && is_string($options['summary'])) {
                return $options['summary'];
            }
            $skip = ['post_processing', '후가공', 'summary'];
            $parts = [];
            foreach ($options as $key => $value) {
                if (in_array($key, $skip, true)) {
                    continue;
                }
                if (is_scalar($value) && $value !== '') {
                    $parts[] = (string) $value;
                }
            }
            if ($parts !== []) {
                return implode(' / ', $parts);
            }
        }

        if ($this->relationLoaded('product') && $this->product?->relationLoaded('specification') && $this->product->specification) {
            $s = $this->product->specification;
            $parts = array_filter([
                $s->paper_type,
                $s->paper_weight_gsm ? (string) $s->paper_weight_gsm.'g' : null,
                ($s->size_width_mm && $s->size_height_mm)
                ? $s->size_width_mm.'x'.$s->size_height_mm.($s->size_unit ? ' '.$s->size_unit : '')
                : null,
                $s->print_side,
                $s->coating,
            ]);

            return $parts !== [] ? implode(' / ', $parts) : null;
        }

        return null;
    }

    private function extractPostProcessingLabel(): ?string
    {
        $o = $this->options;
        if (! is_array($o)) {
            return null;
        }
        foreach (['post_processing', '후가공'] as $key) {
            if (! isset($o[$key])) {
                continue;
            }
            $v = $o[$key];
            if (is_array($v)) {
                return implode(', ', array_map(fn ($x) => (string) $x, $v));
            }

            return $v !== '' ? (string) $v : null;
        }

        return null;
    }

    private function buildQuantityLabel(): string
    {
        $cases = (float) ($this->number_of_cases ?? 1);
        $qty = (int) $this->quantity;
        $displayUnit = '매';
        if ($this->relationLoaded('product') && $this->product?->productSets) {
            $displayUnit = $this->product->productSets->set_unit ?: '매';
        }
        $caseStr = fmod($cases, 1.0) === 0.0
            ? (string) (int) $cases
            : rtrim(rtrim(number_format($cases, 2, '.', ''), '0'), '.');

        return "{$qty}{$displayUnit} x {$caseStr}건";
    }
}
