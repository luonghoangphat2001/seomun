<?php

namespace App\Services\Admin;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Validation\ValidationException;

class AdminBarcodeService
{
    private const NEXT_STATUS_MAP = [
        OrderStatus::PurchaseConfirmed->value => OrderStatus::PendingReception->value,
        OrderStatus::PendingReception->value  => OrderStatus::Typesetting->value,
        OrderStatus::FileError->value         => OrderStatus::PendingCorrection->value,
        OrderStatus::PendingCorrection->value => OrderStatus::Typesetting->value,
        OrderStatus::Typesetting->value       => OrderStatus::OutputOfPower->value,
        OrderStatus::OutputOfPower->value     => OrderStatus::Print->value,
        OrderStatus::Print->value             => OrderStatus::PostProcessing->value,
        OrderStatus::PostProcessing->value    => OrderStatus::ProductionDone->value,
    ];

    public function scan(string $barcode): array
    {
        $order = Order::where('order_number', $barcode)
            ->orWhere('order_external_number', $barcode)
            ->firstOrFail();

        $currentStatus = $order->status instanceof OrderStatus
            ? $order->status->value
            : (string) $order->status;

        if (! isset(self::NEXT_STATUS_MAP[$currentStatus])) {
            throw ValidationException::withMessages([
                'barcode' => [
                    '현재 상태에서는 바코드 스캔을 통한 상태 변경이 불가합니다. (현재: '
                        . ($order->status instanceof OrderStatus ? $order->status->label() : $currentStatus) . ')',
                ],
            ]);
        }

        $nextStatus = self::NEXT_STATUS_MAP[$currentStatus];

        $order->update(['status' => $nextStatus]);
        $order->refresh();

        return [
            'order_number'          => $order->order_number,
            'status_before'         => $currentStatus,
            'status_after'          => OrderStatus::from($nextStatus),
            'status_after_label_ko' => OrderStatus::from($nextStatus)->label(),
        ];
    }
}
