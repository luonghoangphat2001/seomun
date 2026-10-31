<?php

namespace App\Enums;

enum CustomerPrepaidPaymentMethod: string
{
    case CREDIT_CARD = 'credit_card';   // 신용카드
    case BANK_TRANSFER = 'bank_transfer'; // 계좌이체
    case VIRTUAL_ACCOUNT = 'virtual_account'; // 가상계좌

    public function label(): string
    {
        return match ($this) {
            self::CREDIT_CARD => '신용카드',
            self::BANK_TRANSFER => '계좌이체',
            self::VIRTUAL_ACCOUNT => '가상계좌',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::CREDIT_CARD => 'Credit Card',
            self::BANK_TRANSFER => 'Bank Transfer',
            self::VIRTUAL_ACCOUNT => 'Virtual Account',
        };
    }
}
