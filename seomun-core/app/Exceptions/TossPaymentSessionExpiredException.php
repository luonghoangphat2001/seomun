<?php

namespace App\Exceptions;

use Exception;

class TossPaymentSessionExpiredException extends Exception
{
    public const TOSS_CODE = 'NOT_FOUND_PAYMENT_SESSION';

    public function __construct(string $message = '결제 시간이 만료되었습니다. 결제를 다시 시작해 주세요.', int $code = 400)
    {
        parent::__construct($message, $code);
    }

    public function getTossCode(): string
    {
        return self::TOSS_CODE;
    }
}
