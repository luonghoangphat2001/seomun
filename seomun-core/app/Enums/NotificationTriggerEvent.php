<?php

namespace App\Enums;

enum NotificationTriggerEvent: string
{
    case ORDER_PLACED = 'order_placed';
    case ORDER_STATUS_CHANGED = 'order_status_changed';
    case PAYMENT_COMPLETED = 'payment_completed';
    case PAYMENT_FAILED = 'payment_failed';
    case REFUND_PROCESSED = 'refund_processed';
    case DESIGN_CONFIRMATION_REQUEST = 'design_confirmation_request';
    case DESIGN_REJECTED = 'design_rejected';
    case SHIPMENT_STARTED = 'shipment_started';
    case MEMBERSHIP_LEVEL_UPGRADE = 'membership_level_upgrade';
    case INQUIRY_ANSWERED = 'inquiry_answered';
    case CUSTOMER_APPROVED = 'customer_approved';

    public function label(): string
    {
        return match ($this) {
            self::ORDER_PLACED => 'Order Placed',
            self::ORDER_STATUS_CHANGED => 'Order Status Changed',
            self::PAYMENT_COMPLETED => 'Payment Completed',
            self::PAYMENT_FAILED => 'Payment Failed',
            self::REFUND_PROCESSED => 'Refund Processed',
            self::DESIGN_CONFIRMATION_REQUEST => 'Design Confirmation Request',
            self::DESIGN_REJECTED => 'Design Rejected',
            self::SHIPMENT_STARTED => 'Shipment Started',
            self::MEMBERSHIP_LEVEL_UPGRADE => 'Membership Level Upgrade',
            self::INQUIRY_ANSWERED => 'Inquiry Answered',
            self::CUSTOMER_APPROVED => 'Customer Approved',
        };
    }
}
