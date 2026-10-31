<?php

namespace App\Enums;

enum PointCategory: string
{
    case SIGNUP = 'signup';
    case EXPIRE = 'expire';
    case INVITE = 'invite';
    case MANUAL = 'manual';
    case ORDER = 'order';

    public function label(): string
    {
        return match ($this) {
            self::SIGNUP => '가입',
            self::EXPIRE => '만료',
            self::INVITE => '초대',
            self::MANUAL => '수동',
            self::ORDER => '주문',
        };
    }
}
