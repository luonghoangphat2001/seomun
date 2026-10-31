<?php

namespace App\Http\Resources;

use App\Enums\OrderShipmentStatus;
use App\Enums\OrderShipmentType;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Resources\Admin\AdminUserResource;
use App\Support\OptionGroupLabelLocalizer;
use Carbon\Carbon;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class OrderResource extends JsonResource
{
    /**
     * Convert stored image path to absolute URL without double-prefixing.
     */
    private static function toFullImageUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        return $disk->url($path);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $paidAmount = null;
        if ($this->relationLoaded('paymentTransaction')) {
            $paidTransaction = $this->paymentTransaction
                ->where('status', PaymentStatus::PAID->value)
                ->sortByDesc('paid_at')
                ->first();
            $paidAmount = $paidTransaction?->amount;
        }

        $shippingStatusValue = null;
        $shippingStatusLabelKo = null;
        $shippingStatusLabelEn = null;
        $invoiceNumber = null;
        if ($this->relationLoaded('deliveryTracking') && $this->deliveryTracking) {
            $dt = $this->deliveryTracking;
            $shippingStatusValue = $dt->delivery_status?->value;
            $shippingStatusLabelKo = match ($dt->delivery_status?->value) {
                'pickup' => '픽업',
                'in_transit' => '배송중',
                'delivered' => '배송완료',
                default => null,
            };
            $shippingStatusLabelEn = $dt->delivery_status?->label();
            $invoiceNumber = $dt->invoice_number;
        }
        if ($shippingStatusValue === null && $this->status) {
            $s = OrderStatus::tryFrom($this->status);
            if (in_array($s, [OrderStatus::DeliveryCompleted, OrderStatus::Completed, OrderStatus::Shipped], true)) {
                $shippingStatusValue = 'delivered';
                $shippingStatusLabelKo = '배송완료';
                $shippingStatusLabelEn = 'Delivered';
            } elseif (in_array($s, [OrderStatus::Shipping, OrderStatus::ReadyToShip], true)) {
                $shippingStatusValue = 'in_transit';
                $shippingStatusLabelKo = '배송중';
                $shippingStatusLabelEn = 'In transit';
            }
        }

        $orderHistoryStorageUntil = null;
        $orderHistoryStorageDaysRemaining = null;

        $storageKey = 'order_history_storage_until';
        $rawUntil = $this->metadata[$storageKey] ?? null;
        if (!empty($rawUntil)) {
            try {
                $orderHistoryStorageUntil = $rawUntil instanceof Carbon ? $rawUntil : Carbon::parse($rawUntil);
            } catch (\Throwable) {
                $orderHistoryStorageUntil = null;
            }
        } elseif ($this->relationLoaded('user') && $this->user?->relationLoaded('customer')) {
            // Initial storage: clamp to 30 days, then each + extends by 7 days (see extend-storage API).
            $retentionDaysRaw = $this->user?->customer?->order_history_retention_days;
            $retentionDays = $retentionDaysRaw !== null && $retentionDaysRaw !== ''
                ? (int) floor((float) $retentionDaysRaw)
                : 7;
            $initialDays = max(0, min(30, $retentionDays));

            $start = $this->placed_at ?? $this->created_at;
            if ($start instanceof Carbon) {
                $orderHistoryStorageUntil = $start->copy()->addDays($initialDays);
            }
        }

        if ($orderHistoryStorageUntil instanceof Carbon) {
            $now = Carbon::now();
            $remainingSeconds = $orderHistoryStorageUntil->getTimestamp() - $now->getTimestamp();
            $orderHistoryStorageDaysRemaining = $remainingSeconds > 0
                ? (int) ceil($remainingSeconds / 86400)
                : 0;
        }

        $assignedDesigners = $this->relationLoaded('items')
            ? $this->items
                ->filter(fn ($item) => $item->relationLoaded('designWorkflow'))
                ->map(fn ($item) => $item->designWorkflow?->assignedDesigner)
                ->filter()
                ->unique('id')
                ->values()
            : collect();

        $formatDesigner = static fn ($designer): array => [
            'id' => $designer->id,
            'username' => $designer->username,
            'name' => $designer->name,
        ];

        return [
            'id' => $this->id,
            'user' => new AdminUserResource($this->user),
            'order_number' => $this->order_number,
            'order_external_number' => $this->order_external_number,
            'payment_method' => $this->payment_method,
            'payment_transaction' => $this->relationLoaded('paymentTransaction')
                ? $this->paymentTransaction->sortByDesc('id')->first()
                : null,
            'status' => $this->status,
            'status_label_ko' => OrderStatus::tryFrom($this->status)?->label() ?? $this->status,
            'status_label_en' => OrderStatus::tryFrom($this->status)?->labelEn() ?? $this->status,
            'payment_status' => $this->payment_status,
            'order_status_stage' => $this->getOrderStatusStage(),
            'estimated_production_days' => $this->estimated_production_days,
            'shipping_fee_type' => $this->shipping_fee_type,
            'shipping_fee' => (string) ($this->shipping_fee ?? '0'),
            'additional_shipping_fee' => (int) ($this->additional_shipping_fee ?? 0),
            'shipping_adjustment_reason' => $this->shipping_adjustment_reason,
            'shipping_adjusted_at' => $this->shipping_adjusted_at?->format('Y-m-d H:i:s'),
            'shipping_branch_name' => $this->shipping_branch_name,
            'shipping_time' => $this->shipping_time,
            'amount_shipping' => round($this->amount_shipping ?? 0),
            'shipping_method' => $this->shipping_method,
            'currency' => $this->currency,
            'totals' => [
                'subtotal' => round($this->subtotal_amount ?? 0),
                'discount' => round($this->discount_amount ?? 0),
                'tax' => round($this->tax_amount ?? 0),
                'shipping_fee' => round($this->shipping_fee ?? 0),
                'additional_shipping_fee' => round($this->additional_shipping_fee ?? 0),
                'point_used' => round($this->point_used ?? 0),
                'total' => round($this->total_amount ?? 0),
            ],
            'product' => [
                'id' => $this->product_id,
                'name' => $this->product_name,
                'description' => $this->product?->description,
                'short_description' => $this->product?->short_description,
                'images' => self::toFullImageUrl($this->product?->first_image),
            ],
            'design_mode_code' => $this->design_mode_code,
            'assigned_designer' => $assignedDesigners->count() === 1
                ? $formatDesigner($assignedDesigners->first())
                : null,
            'assigned_designers' => $assignedDesigners->map($formatDesigner)->values(),
            'contact' => [
                'name' => $this->contact_name,
                'postcode' => $this->contact_postcode,
                'address' => $this->contact_address,
                'address_detail' => $this->contact_address_detail,
                'phone' => $this->contact_phone,
                'phone2' => $this->contact_phone2,
                'tel' => $this->contact_tel,
                'email' => $this->contact_email,
                'company_name' => $this->user?->customer?->company_name ?: ($this?->company_name ?? null),
            ],
            'customer_manager' => null, // TODO: map when customer manager info is available
            'assigned_person' => $this->shipment?->shippingManager?->name,
            'shipping' => [
                'name' => $this->shipping_name,
                'phone' => $this->shipping_phone,
                'cellphone_number' => $this->shipping_phone,
                'phone2' => $this->shipping_phone2,
                'postcode' => $this->shipping_postcode,
                'address' => $this->shipping_address,
                'address_detail' => $this->shipping_address_detail,
                'method' => $this->shipping_method,
                'email' => $this->shipping_email ?? $this->contact_email,
                'shipping_carrier' => $this->deliveryTracking?->courier_name,
                'shipped_date' => $this->shipment?->shipment_date?->format('Y-m-d'),
                'shipping_memo' => $this->customer_note,
                'shipping_status' => $shippingStatusValue,
                'shipping_status_label_ko' => $shippingStatusLabelKo,
                'shipping_status_label_en' => $shippingStatusLabelEn,
                'invoice_number' => $invoiceNumber,
                'message_preset' => $this->shipping_message_preset,
                'message_custom' => $this->shipping_message_custom,
            ],
            'sender' => [
                'sender_name' => $this->sender_name,
                'sender_phone' => $this->sender_phone,
                'sender_zipcode' => $this->sender_zipcode,
                'sender_address' => $this->sender_address,
                'sender_address2' => $this->sender_address2,
            ],
            'payment_details' => [
                'order_amount' => (string) ($this->subtotal_amount ?? '0'),
                'shipping_fee' => (string) ($this->shipping_fee ?? '0'),
                'payment_amount' => (string) ($this->total_amount ?? '0'),
                'paid_amount' => (string) ($paidAmount ?? '0'),
            ],
            'order_history_storage_until' => $orderHistoryStorageUntil?->toIso8601String(),
            'order_history_storage_days_remaining' => $orderHistoryStorageDaysRemaining,
            'proof' => [
                'status' => $this->metadata['proof_status'] ?? null,
                'confirmed_at' => $this->metadata['proof_confirmed_at'] ?? null,
                'corrections' => $this->metadata['corrections'] ?? [],
                'file_resubmissions' => $this->metadata['file_resubmissions'] ?? [],
            ],
            'metadata' => [
                'estimated_points_earned' => $this->metadata['estimated_points_earned'] ?? null,
                'selected_options' => OptionGroupLabelLocalizer::localize($this->selected_options ?? []),
                'coupon' => $this->metadata['coupon'] ?? null,
                'estimated_production_days' => $this->estimated_production_days,
                'requested_delivery_date' => $this->requested_delivery_date?->format('Y-m-d'),
                'placed_at' => $this->placed_at?->toIso8601String(),
                'customer_note' => $this->customer_note,
                'shipping_weight' => $this->metadata['shipping_weight'] ?? null,
                'box_count' => $this->metadata['box_count'] ?? null,
            ],
            'coupon' => $this->metadata['coupon'] ?? null,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'reviews' => $this->whenLoaded('reviews', function () {
                return ReviewResource::collection($this->reviews);
            }),
            'order_shipments' => $this->whenLoaded('orderShipments', function () {
                return $this->orderShipments->map(function ($shipment) {
                    return [
                        'id' => $shipment->id,
                        'type' => $shipment->type?->value,
                        'type_label_ko' => $shipment->type === OrderShipmentType::COMBINED ? '합배송' : '따로배송',
                        'status' => $shipment->status?->value,
                        'status_label_ko' => match ($shipment->status) {
                            OrderShipmentStatus::PENDING => '배송 준비중',
                            OrderShipmentStatus::SHIPPED => '배송중',
                            OrderShipmentStatus::DELIVERED => '배송완료',
                            default => null,
                        },
                        'tracking_number' => $shipment->tracking_number,
                        'carrier_code' => $shipment->carrier_code,
                        'carrier_name' => $shipment->carrier_name,
                        'shipping_method' => $shipment->shipping_method,
                        'memo' => $shipment->memo,
                        'shipping_fee' => (string) ($shipment->shipping_fee ?? '0'),
                        'shipping_name' => $shipment->shipping_name,
                        'shipping_phone' => $shipment->shipping_phone,
                        'shipping_postcode' => $shipment->shipping_postcode,
                        'shipping_address' => $shipment->shipping_address,
                        'shipping_address_detail' => $shipment->shipping_address_detail,
                        'shipped_at' => $shipment->shipped_at?->format('Y-m-d'),
                        'delivered_at' => $shipment->delivered_at?->format('Y-m-d'),
                        'items' => $shipment->relationLoaded('items')
                            ? $shipment->items->map(fn($item) => [
                                'id' => $item->id,
                                'product_name' => $item->product_name ?? $item->title ?? null,
                                'quantity' => $item->quantity,
                            ])->values()->all()
                            : [],
                    ];
                })->values()->all();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Map internal order/payment status to a 5-step order status stage for MyPage UI.
     *
     * Stages (lowercase snake_case for FE):
     * - payment_completed
     * - order_confirmed
     * - in_production
     * - shipping
     * - delivered
     */
    private function getOrderStatusStage(): ?string
    {
        $status = $this->status ? OrderStatus::tryFrom($this->status) : null;

        if (!$status) {
            $paymentStatus = $this->payment_status ? PaymentStatus::tryFrom($this->payment_status) : null;

            if ($paymentStatus && $paymentStatus->isCompleted()) {
                return 'payment_completed';
            }

            return null;
        }

        if (in_array($status, OrderStatus::getInProductionEnum(), true)) {
            return 'in_production';
        }

        return match ($status) {
            // 1. Payment completed (earliest stage or cancelled/refund flow)
            OrderStatus::Draft,
            OrderStatus::Pending,
            OrderStatus::AwaitingPayment,
            OrderStatus::Cancelled,
            OrderStatus::RefundRequested,
            OrderStatus::RefundCompleted => 'payment_completed',

            // 2. Order confirmed
            OrderStatus::Confirmed,
            OrderStatus::PurchaseConfirmed,
            OrderStatus::DesignConfirmationRequested,
            OrderStatus::DesignConfirmed,
            OrderStatus::DesignRejected => 'order_confirmed',

            // 3. In production use above (in_production)

            // 4. Shipping
            OrderStatus::ReadyToShip,
            OrderStatus::Shipping,
            OrderStatus::Shipped => 'shipping',

            // 5. Delivered (end state)
            OrderStatus::DeliveryCompleted,
            OrderStatus::Completed => 'delivered',

            default => null,
        };
    }
}
