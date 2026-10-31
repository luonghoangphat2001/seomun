<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminPaymentResource extends JsonResource
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
            'transaction_id' => $this->transaction_id,
            'order' => new OrderResource($this->order),
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'pg_name' => $this->pg_name,
            'pg_response' => $this->pg_response,
            'pg_request' => $this->pg_request,
            'card_name' => $this->card_name,
            'card_number' => $this->card_number,
            'virtual_account_number' => $this->virtual_account_number,
            'virtual_account_bank' => $this->virtual_account_bank,
            'virtual_account_expires_at' => $this->virtual_account_expires_at,
            'paid_at' => $this->paid_at,
            'failed_at' => $this->failed_at,
            'meta_data' => $this->metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
