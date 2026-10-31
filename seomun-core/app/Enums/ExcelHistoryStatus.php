<?php

namespace App\Enums;

enum ExcelHistoryStatus: string
{
    case PROCESSING = 'processing';
    case COMPLETED = 'completed';
    case FAILED = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::PROCESSING => '처리 중',
            self::COMPLETED => '완료',
            self::FAILED => '실패',
        };
    }
}
