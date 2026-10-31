<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminProductResource extends ProductResource
{
    /**
     * Convert file path to full URL (public /uploads/... or storage).
     */
    private static function toFullImagePath(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }
        // Path like /uploads/products/... (public folder)
        if (str_starts_with($path, '/')) {
            return url($path);
        }

        // Path relative to storage/app/public
        return Storage::disk('public')->url($path);
    }

    /**
     * Transform the resource into an array for admin view.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        // Add admin-specific fields
        // Note: Some fields require additional database fields (admin_memo, registered_by)
        return array_merge($data, [
            // Branch (지점명) - uses branch_name column
            'branch' => $this->branch_name,

            // Client / Customer name (고객사명) - uses client_name column
            'customer' => $this->client_name,

            // Admin memo (관리메모) - TODO: Add admin_memo field to products table
            'admin_memo' => null, // $this->admin_memo ?? null,

            // Registered by (등록자명) - TODO: Add created_by_id field to products table
            'registered_by' => null, // $this->creator->name ?? null,
            'registered_by_id' => null, // $this->created_by_id ?? null,

            // Quotation info (견적정보)
            'has_quotation' => $this->pricing_profile_id !== null,
            'quotation_count' => null,

            // Public status (공개여부) - maps to is_active
            'is_public' => $this->is_active,

            // Customer usage status (고객사 이용여부) - TODO: Add logic to determine usage
            'customer_usage_status' => null, // 'used' or 'not_used' based on orders

            // Product sets (case/pack quantity options)
            'product_sets' => $this->whenLoaded('productSets', function () {
                if (! $this->productSets) {
                    return null;
                }

                return [
                    'id' => $this->productSets->id,
                    'quantity' => $this->productSets->quantity,
                    'set_type' => $this->productSets->set_type,
                    'min_set' => $this->productSets->min_set,
                    'max_set' => $this->productSets->max_set,
                    'step_set' => $this->productSets->step_set,
                    'set_unit' => $this->productSets->set_unit,
                    'select_options' => $this->productSets->select_options,
                ];
            }),
            'web_editor_id' => $this->whenLoaded('webEditor', function () {
                return $this->webEditor?->id;
            }),
            'web_editor' => $this->whenLoaded('webEditor', function () {
                return $this->webEditor ? [
                    'id' => $this->webEditor->id,
                    'name' => $this->webEditor->name,
                ] : null;
            })
        ]);
    }
}
