<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case PENDING = 'pending';                     // Waiting for payment
    case PROCESSING = 'processing';               // Payment in progress
    case PAID = 'paid';                          // Payment successful
    case FAILED = 'failed';                      // Payment failed
    case CANCELLED = 'cancelled';                // Payment cancelled
    case REFUNDED = 'refunded';                  // Full refund
    case PARTIALLY_REFUNDED = 'partially_refunded'; // Partial refund
    case EXPIRED = 'expired';                    // Payment expired (for virtual account)

    public function label(): string
    {
        return match ($this) {
            self::PENDING => '대기',
            self::PROCESSING => '처리 중',
            self::PAID => '결제 완료',
            self::FAILED => '결제 실패',
            self::CANCELLED => '취소됨',
            self::REFUNDED => '환불 완료',
            self::PARTIALLY_REFUNDED => '부분 환불',
            self::EXPIRED => '만료됨',
        };
    }

    /**
     * Check if payment is completed
     */
    public function isCompleted(): bool
    {
        return in_array($this, [self::PAID, self::REFUNDED, self::PARTIALLY_REFUNDED]);
    }

    /**
     * Check if payment is pending or processing
     */
    public function isPending(): bool
    {
        return in_array($this, [self::PENDING, self::PROCESSING]);
    }

    /**
     * Check if payment failed or cancelled
     */
    public function isFailed(): bool
    {
        return in_array($this, [self::FAILED, self::CANCELLED, self::EXPIRED]);
    }

    /**
     * Get all valid values
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function fromLabel(string $label): ?self
    {
        foreach (self::cases() as $case) {
            if ($case->label() === $label) {
                return $case;
            }
        }

        return null;
    }
}
