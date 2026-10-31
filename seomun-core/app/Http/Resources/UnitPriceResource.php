<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UnitPriceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'erp_size_option_id' => $this->erp_size_option_id,
            'erp_paper_option_id' => $this->erp_paper_option_id,
            'product_id' => $this->product_id,
            'combination_options' => $this->combination_options,
            'is_active' => $this->is_active,
            'erp_subject_master_option_id' => $this->erp_subject_master_option_id,
            'erp_size_option' => $this->whenLoaded('erpSizeOption', function () {
                return $this->erpSizeOption ? [
                    'id' => $this->erpSizeOption->id,
                    'size_id' => $this->erpSizeOption?->size?->id,
                    'label' => $this->erpSizeOption->label,
                ] : null;
            }),
            'erp_paper_option' => $this->whenLoaded('erpPaperOption', function () {
                return $this->erpPaperOption ? [
                    'id' => $this->erpPaperOption->id,
                    'paper_id' => $this->erpPaperOption?->paper?->id,
                    'label' => $this->erpPaperOption->label,
                ] : null;
            }),
            'subject_master_option' => $this->whenLoaded('subjectMasterOption', function () {
                return $this->subjectMasterOption ? [
                    'id' => $this->subjectMasterOption->id,
                    'label' => $this->subjectMasterOption->label,
                ] : null;
            }),
            'quantitys' => $this->whenLoaded('items', function () {
                return $this->items->pluck('quantity_min')->values();
            }),
        ];
    }
}
