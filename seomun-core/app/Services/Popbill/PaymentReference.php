<?php

namespace App\Services\Popbill;

use InvalidArgumentException;

class PaymentReference
{
    /** Unique per payment ID; never reused after cancellation. Not an authentication secret. */
    public static function forId(int $id): string
    {
        if ($id < 1 || $id > 2821109907455) { // Eight base-36 digits.
            throw new InvalidArgumentException('Payment ID exceeds bank reference capacity.');
        }

        return 'SM'.str_pad(strtoupper(base_convert((string) $id, 10, 36)), 8, '0', STR_PAD_LEFT);
    }
}
