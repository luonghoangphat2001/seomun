<?php

namespace App\Services;

use App\Enums\PaymentWebhookEventType;
use App\Enums\PaymentWebhookProcessingStatus;
use App\Enums\PaymentWebhookProvider;
use App\Models\PaymentWebhookLog;
use Illuminate\Support\Facades\Log;

class PaymentWebhookLogService
{
    public function log(array $data): PaymentWebhookLog
    {
        return PaymentWebhookLog::create([
            'provider' => $data['provider'],
            'event_type' => $data['event_type'],
            'transaction_key' => $data['transaction_key'] ?? null,
            'order_number' => $data['order_id'] ?? null,
            'payload' => $data['payload'] ?? [],
            'processing_status' => $data['processing_status'],
            'error_message' => $data['error_message'] ?? null,
        ]);
    }
}