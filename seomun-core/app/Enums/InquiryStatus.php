<?php

namespace App\Enums;

enum InquiryStatus: string
{
    case PENDING = 'pending';       // 답변 대기
    case RESPONDED = 'responded';   // 답변 완료

    public function label(): string
    {
        return match ($this) {
            self::PENDING   => '답변 대기',
            self::RESPONDED => '답변 완료',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::PENDING   => 'Pending',
            self::RESPONDED => 'Responded',
        };
    }
}
