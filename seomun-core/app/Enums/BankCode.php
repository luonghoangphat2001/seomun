<?php

namespace App\Enums;

enum BankCode: string
{
    case IBK = '03';          // 기업은행 (IBK)
    case KB = '06';           // 국민은행 (KB Kookmin Bank)
    case NH = '11';           // 농협 (NongHyup Bank)
    case WOORI = '20';        // 우리은행 (Woori Bank)
    case DGB = '31';          // 대구은행 (Daegu Bank)
    case BUSAN = '32';        // 부산은행 (Busan Bank)
    case HANA = '81';         // KEB하나은행 (Hana Bank)
    case SHINHAN = '88';      // 신한은행 (Shinhan Bank)

    public function label(): string
    {
        return match ($this) {
            self::IBK => '기업은행',
            self::KB => '국민은행',
            self::NH => '농협',
            self::WOORI => '우리은행',
            self::DGB => '대구은행',
            self::BUSAN => '부산은행',
            self::HANA => 'KEB하나은행',
            self::SHINHAN => '신한은행',
        };
    }

    public static function options(): array
    {
        return array_map(
            fn (self $bank) => [
                'code' => $bank->value,
                'name' => $bank->label(),
            ],
            self::cases()
        );
    }
}