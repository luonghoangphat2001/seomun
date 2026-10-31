<?php

namespace App\Enums;

enum UserMembershipLevel: string
{
    case BASIC = 'basic';
    case PREMIUM = 'premium';
    case VIP = 'vip';
}
