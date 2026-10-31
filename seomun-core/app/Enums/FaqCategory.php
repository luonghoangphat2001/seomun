<?php

namespace App\Enums;

enum FaqCategory: string
{
    case MEMBERSHIP = 'membership';
    case FILES = 'files';
    case DESIGN = 'design';
    case ORDERS = 'orders';
    case PRODUCTION = 'production';
    case SHIPPING_DELIVERY = 'shipping_delivery';
    case PAYMENT_ACCOUNTING = 'payment_accounting';

    public function label(): string
    {
        return match ($this) {
            self::MEMBERSHIP => '회원',
            self::FILES => '파일',
            self::DESIGN => '디자인',
            self::ORDERS => '주문',
            self::PRODUCTION => '제작',
            self::SHIPPING_DELIVERY => '배송',
            self::PAYMENT_ACCOUNTING => '결제 / 회계',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::MEMBERSHIP => 'Membership',
            self::FILES => 'Files',
            self::DESIGN => 'Design',
            self::ORDERS => 'Orders',
            self::PRODUCTION => 'Production',
            self::SHIPPING_DELIVERY => 'Shipping / Delivery',
            self::PAYMENT_ACCOUNTING => 'Payment / Accounting',
        };
    }
}
