<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUnitPriceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'erp_size_option_id' => $this->erp_size_option_id,
            'erp_size_option' => $this->whenLoaded('erpSizeOption', function () {
                return $this->erpSizeOption ? [
                    'id' => $this->erpSizeOption->id,
                    'label' => $this->erpSizeOption->label,
                    'attributes' => $this->erpSizeOption->attributes,
                ] : null;
            }),
            'erp_paper_option_id' => $this->erp_paper_option_id,
            'erp_paper_option' => $this->whenLoaded('erpPaperOption', function () {
                return $this->erpPaperOption ? [
                    'id' => $this->erpPaperOption->id,
                    'label' => $this->erpPaperOption->label,
                    'attributes' => $this->erpPaperOption->attributes,
                ] : null;
            }),
            'erp_subject_master_option_id' => $this->erp_subject_master_option_id,
            'erp_subject_master_option' => $this->whenLoaded('subjectMasterOption', function () {
                return $this->subjectMasterOption ? [
                    'id' => $this->subjectMasterOption->id,
                    'label' => $this->subjectMasterOption->label,
                    'attributes' => $this->subjectMasterOption->attributes,
                ] : null;
            }),
            'product_id' => $this->product_id,
            'product' => $this->whenLoaded('product', function () {
                return $this->product ? [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                    'category' => $this->product->category ? [
                        'id' => $this->product->category->id,
                        'name' => $this->product->category->name,
                    ] : null,                ] : null;
            }),
            'combination_options' => $this->combination_options,
            'status' => [
                'value' => $this->is_active ? 'active' : 'inactive',
                'label' => $this->is_active ? 'Active' : 'Inactive',
            ],
            'is_active' => $this->is_active,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'items' => $this->whenLoaded('allItems', function () {
                return $this->allItems->map(fn ($item) => [
                    'id' => $item->id,
                    'price_value' => (string) $item->price_value,
                    'raw_cost' => $item->raw_cost ? (string) $item->raw_cost : null,
                    'attributes' => $item->attributes,
                    'quantity_min' => $item->quantity_min,
                    'is_active' => $item->is_active,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ]);
            }),
        ];
    }
}
