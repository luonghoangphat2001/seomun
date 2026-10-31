<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * Mask card number to protect sensitive data
     * Example: 1234-****-****-5678
     */
    private function maskCardNumber(?string $cardNumber): ?string
    {
        if (empty($cardNumber)) {
            return null;
        }

        // Remove any non-digit characters
        $cleanNumber = preg_replace('/\D/', '', $cardNumber);

        if (strlen($cleanNumber) >= 8) {
            $first = substr($cleanNumber, 0, 4);
            $last = substr($cleanNumber, -4);

            return $first.'-****-****-'.$last;
        }

        return $cardNumber;
    }

    /**
     * Mask bank account number to protect sensitive data
     * Example: ****-**-123456
     */
    private function maskBankAccount(?string $accountNumber): ?string
    {
        if (empty($accountNumber)) {
            return null;
        }

        // If account number contains hyphens (like Korean format: 123-45-678900)
        if (strpos($accountNumber, '-') !== false) {
            $parts = explode('-', $accountNumber);
            if (count($parts) >= 3) {
                return '****-**-'.end($parts);
            }
        }

        // For other formats, mask all except last 6 digits
        if (strlen($accountNumber) >= 6) {
            $last = substr($accountNumber, -6);
            $maskLength = strlen($accountNumber) - 6;

            return str_repeat('*', $maskLength).$last;
        }

        return $accountNumber;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'transaction_id' => $this->transaction_id,
            'order' => new OrderResource($this->order),
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'pg_name' => $this->pg_name,
            'card_name' => $this->card_name,
            'card_number' => $this->maskCardNumber($this->card_number),
            'virtual_account_number' => $this->maskBankAccount($this->virtual_account_number),
            'virtual_account_bank' => $this->virtual_account_bank,
            'virtual_account_expires_at' => $this->virtual_account_expires_at,
            'paid_at' => $this->paid_at,
            'failed_at' => $this->failed_at,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
