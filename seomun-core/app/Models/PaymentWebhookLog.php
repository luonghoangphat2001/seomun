<?php

namespace App\Models;

use App\Enums\PaymentWebhookProcessingStatus;
use App\Enums\PaymentWebhookProvider;
use App\Enums\PaymentWebhookEventType;
use Illuminate\Database\Eloquent\Model;

class PaymentWebhookLog extends Model
{
    protected $fillable = [
        'provider',
        'event_type',
        'transaction_key',
        'order_number',
        'payload',
        'processing_status',
        'error_message',
    ];

    protected $casts = [
        'payload' => 'array',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'provider' => PaymentWebhookProvider::class,
        'event_type' => PaymentWebhookEventType::class,
        'processing_status' => PaymentWebhookProcessingStatus::class,
    ];
}
