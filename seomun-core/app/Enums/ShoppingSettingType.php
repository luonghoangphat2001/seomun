<?php

namespace App\Enums;

enum ShoppingSettingType: string
{
    case GENERAL_PRECAUTIONS = 'General Precautions';
    case GENERAL_PRODUCTION_GUIDE = 'General Production Guide';
    case SHIPMENT_DELIVERY_INFORMATION = 'Shipment & Delivery Information';
    case USER_GUIDE = 'User Guide';

    public function label(): string
    {
        return $this->value;
    }
}