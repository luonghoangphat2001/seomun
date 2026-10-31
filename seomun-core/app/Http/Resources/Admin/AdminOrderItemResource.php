<?php

namespace App\Http\Resources\Admin;

use App\Services\DesignService;
use App\Support\OptionGroupLabelLocalizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin order item resource with product information (FSD: Order Details - Product Information)
 * and design/artwork data for PDF export flow.
 */
class AdminOrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $designService = app(DesignService::class);
        $urlExpirationMinutes = 60;
        $configuration = is_array($this->configuration)
            ? OptionGroupLabelLocalizer::localize($this->configuration)
            : $this->configuration;

        $designs = $this->whenLoaded('artworks', function () use ($designService, $urlExpirationMinutes) {
            return collect($this->artworks)->map(function ($artwork) use ($designService, $urlExpirationMinutes) {
                return [
                    'id' => $artwork->id,
                    'side' => $artwork->side,
                    'preview_url' => $designService->getPreviewUrl($artwork, $urlExpirationMinutes),
                    'layout_data_url' => $designService->getLayoutDataUrl($artwork, $urlExpirationMinutes),
                ];
            })->values()->all();
        }, []);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'quantity' => $this->quantity,
            'multiplier' => $this->multiplier,
            'unit' => $this->unit,
            'production_days' => $this->production_days,
            'unit_price' => (string) ($this->unit_price ?? '0.00'),
            'total_price' => (string) ($this->total_price ?? '0.00'),
            'options' => $configuration,
            'configuration' => $configuration,
            'notes' => $this->notes,
            'post_processing' => $this->notes,
            'designs' => $designs,
            'assigned_designer' => $this->whenLoaded('designWorkflow', fn () => $this->designWorkflow?->assignedDesigner ? [
                'id' => $this->designWorkflow->assignedDesigner->id,
                'username' => $this->designWorkflow->assignedDesigner->username,
                'name' => $this->designWorkflow->assignedDesigner->name,
            ] : null),
        ];
    }
}
