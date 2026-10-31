<?php

namespace App\Enums;

enum NoticeType: string
{
    case ALL = 'all';
    case ORDERS = 'orders';
    case PRODUCT_NEWS = 'product_news';
    case SERVICE = 'service';
    case EVENTS = 'events';
    case SHIPPING_DELIVERY = 'shipping_delivery';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::ALL => '전체',
            self::ORDERS => '주문',
            self::PRODUCT_NEWS => '상품 소식',
            self::SERVICE => '서비스',
            self::EVENTS => '이벤트',
            self::SHIPPING_DELIVERY => '배송 / 배송조회',
            self::OTHER => '기타',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::ALL => 'All',
            self::ORDERS => 'Orders',
            self::PRODUCT_NEWS => 'Product News',
            self::SERVICE => 'Service',
            self::EVENTS => 'Events',
            self::SHIPPING_DELIVERY => 'Shipping / Delivery',
            self::OTHER => 'Other',
        };
    }
}
