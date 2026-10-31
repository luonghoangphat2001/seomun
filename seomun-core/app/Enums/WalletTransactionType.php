<?php

namespace App\Enums;

enum WalletTransactionType: string
{
    case DEPOSIT = 'deposit';
    case REFUND = 'refund';

    case PAYMENT = 'payment';

    case MANUAL_ADJUSTMENT = 'manual_adjustment';
}