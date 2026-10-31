<?php

namespace App\Enums;

enum UserRegistrationPath: string
{
    case DIRECT = 'direct';
    case MOBILE_APP = 'mobile_app';
    case SOCIAL_LOGIN = 'social_login';
    case REFERRAL = 'referral';
}
