<?php

namespace App\Enums;

enum InquiryCategory: string
{
    case PRODUCT  = 'product';   // 상품문의
    case QUOTE    = 'quote';     // 견적문의
    case SHIPPING = 'shipping';  // 출고/배송문의
    case PAYMENT  = 'payment';   // 결제/회계문의
    case REWORK   = 'rework';    // 재작업신청
    case REFUND   = 'refund';    // 환불신청

    public function label(): string
    {
        return match ($this) {
            self::PRODUCT  => '상품문의',
            self::QUOTE    => '견적문의',
            self::SHIPPING => '출고/배송문의',
            self::PAYMENT  => '결제/회계문의',
            self::REWORK   => '재작업신청',
            self::REFUND   => '환불신청',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::PRODUCT  => 'Product Inquiry',
            self::QUOTE    => 'Request for Quotation',
            self::SHIPPING => 'Shipping/Delivery Inquiry',
            self::PAYMENT  => 'Payment/Accounting Inquiry',
            self::REWORK   => 'Rework Request',
            self::REFUND   => 'Refund Request',
        };
    }

    public function path(): string
    {
        return match ($this) {
            self::PRODUCT  => 'product-inquiry',
            self::QUOTE    => 'quote-inquiry',
            self::SHIPPING => 'shipping-inquiry',
            self::PAYMENT  => 'payment-inquiry',
            self::REWORK   => 'rework-request',
            self::REFUND   => 'refund-request',
        };
    }
}
