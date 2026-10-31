<?php

namespace App\Enums;

enum OrderShipmentStatus: string
{
    case PENDING   = 'pending';
    case SHIPPED   = 'shipped';
    case DELIVERED = 'delivered';

    public function label(string $locale = 'en'): string
    {
        return match($locale) {
            'ko' => match($this) {
                self::PENDING   => '대기',
                self::SHIPPED   => '배송중',
                self::DELIVERED => '배송완료',
            },
            'ja' => match($this) {
                self::PENDING   => '保留中',
                self::SHIPPED   => '配送中',
                self::DELIVERED => '配達完了',
            },
            default => match($this) {
                self::PENDING   => 'Pending',
                self::SHIPPED   => 'Shipped',
                self::DELIVERED => 'Delivered',
            },
        };
    }
}
