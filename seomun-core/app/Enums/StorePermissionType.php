<?php

namespace App\Enums;

enum StorePermissionType: string
{
    case ORDER_AUTHORITY = 'order_authority';
    case APPROVAL_LINE_MANAGE = 'approval_line_manage';
    case USER_MANAGEMENT = 'user_management';
    case BASIC_DATA_MANAGE = 'basic_data_manage';
    case NOTICE = 'notice';
    case PRICE_VISIBILITY = 'price_visibility';
    case CATALOG_MANAGEMENT = 'catalog_management';
    case SHIPPING_MANAGEMENT = 'shipping_management';
    case PROMOTION_MANAGEMENT = 'promotion_management';
    case INVENTORY_MANAGEMENT = 'inventory_management';
    case PRODUCTION_INQUIRY = 'production_inquiry';

    public function label(): string
    {
        return match ($this) {
            self::ORDER_AUTHORITY => '주문권한',
            self::APPROVAL_LINE_MANAGE => '결재선 관리',
            self::USER_MANAGEMENT => '이용자관리',
            self::BASIC_DATA_MANAGE => '기초자료관리',
            self::NOTICE => '공지사항',
            self::PRICE_VISIBILITY => '가격노출',
            self::CATALOG_MANAGEMENT => '카탈로그관리',
            self::SHIPPING_MANAGEMENT => '배송지관리',
            self::PROMOTION_MANAGEMENT => '홍보물 관리',
            self::INVENTORY_MANAGEMENT => '재고관리',
            self::PRODUCTION_INQUIRY => '제작문의',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::ORDER_AUTHORITY => 'Order Authority',
            self::APPROVAL_LINE_MANAGE => 'Approval Line Management',
            self::USER_MANAGEMENT => 'User Management',
            self::BASIC_DATA_MANAGE => 'Basic Data Management',
            self::NOTICE => 'Notice',
            self::PRICE_VISIBILITY => 'Price Visibility',
            self::CATALOG_MANAGEMENT => 'Catalog Management',
            self::SHIPPING_MANAGEMENT => 'Shipping Management',
            self::PROMOTION_MANAGEMENT => 'Promotion Material Management',
            self::INVENTORY_MANAGEMENT => 'Inventory Management',
            self::PRODUCTION_INQUIRY => 'Production Inquiry',
        };
    }

    public static function valuesByKeyword(string $keyword): array
    {
        // Normalize keyword: lower-case and treat underscores as spaces so that
        // both enum values (order_authority) and labels ("Order Authority") work.
        $keyword = mb_strtolower(trim(str_replace('_', ' ', $keyword)));

        return collect(self::cases())
            ->filter(function (self $case) use ($keyword) {
                $valueNorm = mb_strtolower(str_replace('_', ' ', $case->value));
                $labelKo = mb_strtolower($case->label());
                $labelEn = mb_strtolower($case->labelEn());

                return str_contains($valueNorm, $keyword)
                    || str_contains($labelKo, $keyword)
                    || str_contains($labelEn, $keyword);
            })
            ->map(fn (self $case) => $case->value)
            ->values()
            ->all();
    }
}
