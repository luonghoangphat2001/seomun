<?php

namespace App\Casts;

use App\Enums\PaymentMethod;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class PaymentMethodCast implements CastsAttributes
{
    /**
     * Cast from DB (maps legacy 'credit_card' to CARD).
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): ?PaymentMethod
    {
        return PaymentMethod::fromStored($value);
    }

    /**
     * Cast to DB (always store enum value).
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof PaymentMethod) {
            return $value->value;
        }

        $parsed = PaymentMethod::fromStored((string) $value);

        return $parsed?->value;
    }
}
