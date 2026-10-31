<?php

namespace App\Enums;

enum CustomerShippingMethod: string
{
    case PARCEL_PREPAID = 'parcel_prepaid';     // 택배선불
    case PARCEL_POSTPAID = 'parcel_postpaid';     // 택배후불
    case POD = 'pod';                           // POD배송
    case CENTER = 'center';                     // 센터배송
    case BRANCH = 'branch';                     // 지점배송

    public function label(): string
    {
        return match ($this) {
            self::PARCEL_PREPAID => '택배선불',
            self::PARCEL_POSTPAID => '택배후불',
            self::POD => 'POD배송',
            self::CENTER => '센터배송',
            self::BRANCH => '지점배송',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::PARCEL_PREPAID => 'Parcel (Prepaid)',
            self::PARCEL_POSTPAID => 'Parcel (Collect)',
            self::POD => 'POD Delivery',
            self::CENTER => 'Center Delivery',
            self::BRANCH => 'Branch Delivery',
        };
    }
}
