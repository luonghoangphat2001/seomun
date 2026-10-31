<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Draft = 'draft';
    case Pending = 'pending';
    case AwaitingPayment = 'awaiting_payment';
    case Confirmed = 'confirmed';
    case PurchaseConfirmed = 'purchase_confirmed';

    case PendingReception = 'pending_reception';
    case FileError = 'file_error';
    case PendingCorrection = 'pending_correction';
    case Typesetting = 'typesetting';
    case OutputOfPower = 'output_of_power';
    case Print = 'print';
    case PostProcessing = 'post_processing';
    case ProductionDone = 'production_done';

    case ReadyToShip = 'ready_to_ship';
    case Shipping = 'shipping';
    case Shipped = 'shipped';
    case DeliveryCompleted = 'delivery_completed';
    case Completed = 'completed';
    case DesignInProgress = 'design_in_progress';
    case DesignConfirmationRequested = 'design_confirmation_requested';
    case DesignConfirmed = 'design_confirmed';
    case DesignRejected = 'design_rejected';
    case Cancelled = 'cancelled';
    case RefundRequested = 'refund_requested';
    case RefundCompleted = 'refund_completed';

    /**
     * Get Korean label for order status
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => '초안',
            self::Pending => '주문 대기',
            self::AwaitingPayment => '입금 대기',
            self::Confirmed => '주문 접수',
            self::PurchaseConfirmed => '구매 확정',

            self::PendingReception  => '접수 대기',
            self::FileError         => '파일 오류',
            self::PendingCorrection => '수정 대기',
            self::Typesetting       => '조판',
            self::OutputOfPower     => '출력',
            self::Print             => '인쇄',
            self::PostProcessing    => '후가공',
            self::ProductionDone    => '제작 완료',

            self::ReadyToShip => '배송 준비',
            self::Shipping => '배송 중',
            self::Shipped => '배송 완료',
            self::DeliveryCompleted => '배송 완료',
            self::Completed => '완료',
            self::DesignInProgress => '디자인 진행 중',
            self::DesignConfirmationRequested => '디자인 교정 확인 요청',
            self::DesignConfirmed => '디자인 교정 확인 완료',
            self::DesignRejected => '디자인 교정 반려',
            self::Cancelled => '취소',
            self::RefundRequested => '환불 요청',
            self::RefundCompleted => '환불 완료',
        };
    }

    /**
     * Get English label for order status
     */
    public function labelEn(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Pending => 'Pending',
            self::AwaitingPayment => 'Awaiting Payment',
            self::Confirmed => 'Confirmed',
            self::PurchaseConfirmed => 'Purchase Confirmed',

            self::PendingReception  => 'Pending Reception',
            self::FileError         => 'File Error',
            self::PendingCorrection => 'Pending Correction',
            self::Typesetting       => 'Typesetting',
            self::OutputOfPower     => 'Output',
            self::Print             => 'Printing',
            self::PostProcessing    => 'Post-processing',
            self::ProductionDone    => 'Production Completed',

            self::ReadyToShip => 'Ready to Ship',
            self::Shipping => 'Shipping',
            self::Shipped => 'Shipped',
            self::DeliveryCompleted => 'Delivery Completed',
            self::Completed => 'Completed',
            self::DesignInProgress => 'Design In Progress',
            self::DesignConfirmationRequested => 'Design Confirmation Requested',
            self::DesignConfirmed => 'Design Confirmed',
            self::DesignRejected => 'Design Rejected',
            self::Cancelled => 'Cancelled',
            self::RefundRequested => 'Refund Requested',
            self::RefundCompleted => 'Refund Completed',
        };
    }

    /**
     * Return all enum values as an array.
     */
    public static function values(): array
    {
        return array_map(
            fn(self $status) => $status->value,
            self::cases()
        );
    }

    /**
     * @return array<string>
     */
    public static function getRefundOrCancellationProcess(): array
    {
        return [
            self::RefundRequested->value,
            self::RefundCompleted->value,
            self::Cancelled->value,
        ];
    }

    public static function getStatusEditFileUpload(): array
    {
        return [
            self::Draft->value,
            self::Pending->value,
            self::AwaitingPayment->value,
            self::Confirmed->value,
            self::PurchaseConfirmed->value,
            self::PendingReception->value,
            self::FileError->value,
            self::PendingCorrection->value,
        ];
    }


    public static function getInProduction(): array
    {
        return [
            self::PendingReception->value,
            self::FileError->value,
            self::PendingCorrection->value,
            self::Typesetting->value,
            self::OutputOfPower->value,
            self::Print->value,
            self::PostProcessing->value,
            self::ProductionDone->value,
        ];
    }

    public static function getInProductionEnum(): array
    {
        return [
            self::PendingReception,
            self::FileError,
            self::PendingCorrection,
            self::Typesetting,
            self::OutputOfPower,
            self::Print,
            self::PostProcessing,
            self::ProductionDone,
        ];
    }

    public static function getShippableStatuses(): array
    {
        return [
            self::ReadyToShip->value,
            self::Shipping->value,
            self::Shipped->value,
            self::DeliveryCompleted->value,
            self::Completed->value,
        ];
    }
}
