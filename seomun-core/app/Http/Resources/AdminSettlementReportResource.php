<?php

namespace App\Http\Resources;

use App\Enums\PaymentStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminSettlementReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'transaction_id' => $this->resource['transaction_id'],
            'order_number' => $this->resource['order_number'],
            'status' => PaymentStatus::fromLabel($this->resource['status'])?->value ?? $this->resource['status'],
            'payment_status' => $this->resource['payment_status'],
            'paid_at' => $this->resource['paid_at'],
            'failed_at' => $this->resource['failed_at'],
            'created_at' => $this->resource['created_at'],
            'customer_id' => $this->resource['customer_id'] ?? '',
            'customer_name' => $this->resource['customer_name'] ?? '',
            'product_id' => $this->resource['product_id'] ?? '',
            'product_name' => $this->resource['product_name'] ?? '',
            'category_id' => $this->resource['category_id'] ?? '',
            'category_name' => $this->resource['category_name'] ?? '',
            'payment_amount' => $this->resource['payment_amount'] ?? '',
            'supply_price' => $this->resource['supply_price'] ?? '',
            'vat' => $this->resource['vat'] ?? '',
            'commission' => $this->resource['commission'] ?? '',
        ];
    }
}
