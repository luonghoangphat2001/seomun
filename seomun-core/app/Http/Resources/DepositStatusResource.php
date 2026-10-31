<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepositStatusResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'order_number'   => $this->order?->order_number,
            'payment_method' => $this->payment_method,
            'amount'         => $this->amount,
            'depositor'      => $this->bank_account_holder,
            'paid_at'        => $this->paid_at?->toDateTimeString(),
        ];
    }
}
