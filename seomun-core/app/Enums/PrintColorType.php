<?php

namespace App\Enums;

enum PrintColorType: string
{
    case COLLAR = 'collar';
    case BLACK_AND_WHITE = 'black_and_white';
    
    public function label(): string
    {
        return match($this) {
            self::COLLAR => 'collar',
            self::BLACK_AND_WHITE => 'Black and White',
        };
    }
}