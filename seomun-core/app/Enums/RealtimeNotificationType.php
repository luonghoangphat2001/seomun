<?php

namespace App\Enums;

enum RealtimeNotificationType: string
{
    case INQUIRY_REPLY = 'inquiry_reply';
    case ORDER_STATUS_CHANGED = 'order_status_changed';
    case PAYMENT_SUCCEEDED = 'payment_succeeded';

    public function title(): string
    {
        return match ($this) {
            self::INQUIRY_REPLY => '문의 답변 안내',
            self::ORDER_STATUS_CHANGED => '주문 상태 변경 안내',
            self::PAYMENT_SUCCEEDED => '결제 완료 안내',
        };
    }

    /** @param array<string, mixed> $payload */
    public function message(array $payload): string
    {
        return match ($this) {
            self::INQUIRY_REPLY => '문의하신 내용에 답변이 등록되었습니다.',
            self::ORDER_STATUS_CHANGED => sprintf(
                '주문번호 %s의 상태가 변경되었습니다.',
                $payload['order_number'] ?? '-'
            ),
            self::PAYMENT_SUCCEEDED => sprintf(
                '주문번호 %s의 결제가 완료되었습니다.',
                $payload['order_number'] ?? '-'
            ),
        };
    }
}
