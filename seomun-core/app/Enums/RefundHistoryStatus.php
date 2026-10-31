<?php

namespace App\Enums;

enum RefundHistoryStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Failed = 'failed';
}