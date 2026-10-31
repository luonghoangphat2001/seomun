<?php

namespace App\Enums;

enum OrderExtraEntryInputType: string
{
    case TEXT = 'text';
    case SELECT = 'select';
    case NUMBER = 'number';
    case DATE = 'date';
}
