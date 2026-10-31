<?php

namespace App\Support;

use App\Enums\ErpOptionGroupCode;

final class OptionGroupLabelLocalizer
{
    public static function label(?string $code, string $fallback): string
    {
        return ErpOptionGroupCode::tryFrom((string) $code)?->koreanLabel() ?? $fallback;
    }

    public static function localize(array $data): array
    {
        if (isset($data['group']) && is_array($data['group'])) {
            $code = $data['group']['code'] ?? null;
            $name = $data['group']['name'] ?? null;

            if (is_string($name)) {
                $data['group']['name'] = self::label($code, $name);
            }
        }

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = self::localize($value);
            }
        }

        return $data;
    }
}
