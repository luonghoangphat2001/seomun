<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CARD = 'card';  // 카드결제 (includes legacy credit_card)
    case VIRTUAL_ACCOUNT = 'virtual_account';
    case BANK_TRANSFER = 'bank_transfer';
    case TOSS = 'toss';
    case PAY_LATER = 'paylater';
    /** 전용계좌 즉시결제 (UI — balance / virtual dedicated account flow) */
    case DEDICATED_ACCOUNT = 'dedicated_account';
    /** 세금계산서 / 후불 계열 요청값과 정렬 */
    case NAVER_PAY = 'NAVER_PAY';
    case KAKAO_PAY = "KAKAO_PAY";

    public const EXT_CODE_BANK_TRANSFER = '1';

    public const EXT_CODE_ACCOUNTS_RECEIVABLE = '9';

    public function label(): string
    {
        return match ($this) {
            self::CARD => '카드결제',
            self::VIRTUAL_ACCOUNT => '가상계좌',
            self::BANK_TRANSFER => '무통장 입금',
            self::TOSS => '토스',
            self::PAY_LATER => '후불결제',
            self::DEDICATED_ACCOUNT => '전용계좌',
            self::KAKAO_PAY => '카카오페이',
            self::NAVER_PAY => '네이버페이',
        };
    }

    /**
     * Payment methods for FE, in display order (Credit Card → Toss → rest)
     */
    public static function allowedForDisplay(): array
    {
        return [
            self::CARD,
            self::TOSS,
            self::VIRTUAL_ACCOUNT,
            self::BANK_TRANSFER,
            self::PAY_LATER,
        ];
    }

    public function requiresImmediateVerification(): bool
    {
        return in_array($this, [self::CARD, self::TOSS, self::VIRTUAL_ACCOUNT]);
    }

    /**
     * Parse from DB/API value (maps legacy 'credit_card' to CARD)
     */
    public static function fromStored(?string $value): ?self
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (strtolower($value) === 'credit_card') {
            return self::CARD;
        }

        return self::tryFrom($value);
    }

    /**
     * Parse checkout / legacy string to enum (never returns PAY_LATER for unknown tax_invoice if mapped).
     */
    public static function forCheckoutString(?string $value): self
    {
        if ($value === null || $value === '') {
            return self::CARD;
        }

        $fromStored = self::fromStored($value);
        if ($fromStored !== null) {
            return $fromStored;
        }

        return self::tryFrom($value) ?? self::CARD;
    }

    public function isManualConfirmation(): bool
    {
        return in_array($this, [self::BANK_TRANSFER, self::VIRTUAL_ACCOUNT, self::DEDICATED_ACCOUNT]);
    }

    public static function fromExternal(string $code): ?string
    {
        return match ($code) {
            self::EXT_CODE_BANK_TRANSFER => self::BANK_TRANSFER->value,
            self::EXT_CODE_ACCOUNTS_RECEIVABLE => self::PAY_LATER->value,
            default => null,
        };
    }
}
