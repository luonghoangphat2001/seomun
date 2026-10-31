<?php

namespace App\Http\Resources;

use App\Enums\BankCode;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VirtualAccountResource extends JsonResource
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
            'provider' => $this->provider,

            'account_number' => $this->account_number,

            'bank' => [
                'code' => $this->bank_code,
                'name' => BankCode::tryFrom($this->bank_code)?->label(),
            ],

            'customer_name' => $this->customer_name,
            'account_type' => $this->account_type,
            'status' => $this->status,

            'issued_at' => $this->issued_at,
            'closed_at' => $this->closed_at,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}