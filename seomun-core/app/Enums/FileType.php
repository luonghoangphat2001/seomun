<?php

namespace App\Enums;

enum FileType: string
{
    case BUSINESS_REGISTRATIONS = 'business-registrations';
    case CUSTOMER_BUSINESS_REGISTRATION = 'customers/business-registration';
    case BANNERS = 'banners';
    case CATEGORY_EXPOSURE = 'categories/exposure';
    case GUIDE_CONTENT_ATTACHMENTS = 'guide-contents-attachments';
    case NOTICE_ATTACHMENTS = 'notices-attachments';
    case POPUPS = 'popups';
    case PRODUCT_IMAGES = 'products/images';
    case TEMPLATE_PREVIEWS = 'templates/previews';
    case TEMPLATES = 'templates';
    case BULK_ORDERS = 'bulk-orders';
    case INQUIRY_ATTACHMENTS = 'inquiry-attachments';
    case USER_GUIDES = 'user-guides';
    case DIRECT_SHIPPING = 'direct-shipping';
    case EQUIPMENTS = 'equipments';
    case PAPER = 'papers';
    case DESIGNS = 'designs';
    case REVIEWS = 'reviews';
    case OUTSOURCING_REGISTRATION_CERTIFICATES = 'outsourcing/registration-certificates';
    case DIELINES = 'dielines';

    public function label(): string
    {
        return match ($this) {
            self::BUSINESS_REGISTRATIONS => 'Business Registrations',
            self::CUSTOMER_BUSINESS_REGISTRATION => 'Customer Business Registration',
            self::BANNERS => 'Banners',
            self::CATEGORY_EXPOSURE => 'Category Exposure',
            self::GUIDE_CONTENT_ATTACHMENTS => 'Guide Contents Attachments',
            self::NOTICE_ATTACHMENTS => 'Notice Attachments',
            self::POPUPS => 'Popups',
            self::PRODUCT_IMAGES => 'Product Images',
            self::TEMPLATE_PREVIEWS => 'Template Previews',
            self::TEMPLATES => 'Templates',
            self::BULK_ORDERS => 'Bulk Orders',
            self::INQUIRY_ATTACHMENTS => 'Inquiry Attachments',
            self::USER_GUIDES => 'User Guides',
            self::DIRECT_SHIPPING => 'Direct Shipping',
            self::EQUIPMENTS => 'Equipments',
            self::PAPER => 'papers',
            self::DESIGNS => 'designs',
            self::REVIEWS => 'reviews',
            self::OUTSOURCING_REGISTRATION_CERTIFICATES => 'Outsourcing Registration Certificates',
            self::DIELINES => 'Dielines',
        };
    }

    public static function options(): array
    {
        return array_map(fn($case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }
}
