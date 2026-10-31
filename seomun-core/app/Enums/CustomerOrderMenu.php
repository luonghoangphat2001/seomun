<?php

namespace App\Enums;

enum CustomerOrderMenu: string
{
    case ALL_MENUS = 'all_menus';                      // 모든 메뉴
    case CLOUD_CARD = 'cloud_card';                    // 클라우드명함
    case OFFICE_PRINTING = 'office_printing';          // 오피스프린팅
    case OFFICE_PRO_ORDER = 'office_pro_order';        // 오피스프린팅 > 전문가용 견적주문
    case CUSTOM_PRODUCTS = 'custom_products';          // 맞춤제품
    case PROMOTIONAL = 'promotional';                  // 홍보물
    case NAME_TAGS = 'name_tags';                      // 명찰
    case LARGE_FORMAT_PRINT = 'large_format_print';    // 실사출력
    case FILE_ORDER = 'file_order';                    // 파일주문

    public function label(): string
    {
        return match ($this) {
            self::ALL_MENUS => '모든 메뉴',
            self::CLOUD_CARD => '클라우드명함',
            self::OFFICE_PRINTING => '오피스프린팅',
            self::OFFICE_PRO_ORDER => '오피스프린팅 > 전문가용 견적주문',
            self::CUSTOM_PRODUCTS => '맞춤제품',
            self::PROMOTIONAL => '홍보물',
            self::NAME_TAGS => '명찰',
            self::LARGE_FORMAT_PRINT => '실사출력',
            self::FILE_ORDER => '파일주문',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::ALL_MENUS => 'All Menus',
            self::CLOUD_CARD => 'Cloud Business Card',
            self::OFFICE_PRINTING => 'Office Printing',
            self::OFFICE_PRO_ORDER => 'Office Printing > Professional Order',
            self::CUSTOM_PRODUCTS => 'Custom Products',
            self::PROMOTIONAL => 'Promotional Materials',
            self::NAME_TAGS => 'Name Tags',
            self::LARGE_FORMAT_PRINT => 'Large Format Print',
            self::FILE_ORDER => 'File Order',
        };
    }
}
