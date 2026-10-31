<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MyPageCashReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $order = $this->order;

        return [
            'document_number' => $this->order?->order_number,
            'issued_at'       => $this->cash_receipt_issued_at?->toDateString(),
            'order_amount'    => (string) ($order?->subtotal_amount ?? '0.00'),
            'shipping_fee'    => (string) ($order?->shipping_fee ?? '0.00'),
            'total_amount'    => (string) ($order?->total_amount ?? '0.00'),
            'supply_amount'   => (string) ($order?->subtotal_amount ?? '0.00'),
            'tax_amount'      => (string) ($order?->tax_amount ?? '0.00'),
        ];
    }
}
