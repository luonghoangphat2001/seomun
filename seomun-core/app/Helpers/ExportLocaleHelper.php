<?php

namespace App\Helpers;

class ExportLocaleHelper
{
    /**
     * Get product export column headings based on locale.
     *
     * @return array<string>
     */
    public static function getProductHeadings(string $locale = 'en'): array
    {
        $headings = [
            'en' => [
                'ID',
                'Product Name',
                'Product Code (SKU)',
                'Category',
                'Status',
                'Promotional',
                'Price',
                'Stock Quantity',
                'Registered At',
                'Branch Name',
                'Client Name',
                'Is Public',
                'Has Quotation',
                'Availability',
            ],
            'ko' => [
                'ID',
                '제품명',
                '제품 코드 (SKU)',
                '카테고리',
                '상태',
                '홍보용',
                '가격',
                '재고 수량',
                '등록일',
                '지점명',
                '고객사명',
                '공개 여부',
                '견적 여부',
                '재고 상태',
            ],
            'ja' => [
                'ID',
                '商品名',
                '商品コード (SKU)',
                'カテゴリ',
                'ステータス',
                'プロモーション用',
                '価格',
                '在庫数',
                '登録日',
                '支店名',
                '顧客名',
                '公開状況',
                '見積もり有無',
                '在庫状況',
            ],
        ];

        return $headings[$locale] ?? $headings['en'];
    }

    /**
     * Get sheet name for product export based on locale.
     */
    public static function getProductSheetName(string $locale = 'ko'): string
    {
        $sheetNames = [
            'en' => 'Products',
            'ko' => '제품 목록',
            'ja' => '商品一覧',
        ];

        return $sheetNames[$locale] ?? $sheetNames['en'];
    }

    /**
     * Get customer export column headings based on locale.
     *
     * @return array<string>
     */
    public static function getCustomerHeadings(string $locale = 'en'): array
    {
        $headings = [
            'en' => [
                'ID',
                'Company Name',
                'Business Registration Number',
                'Representative Name',
                'Contact Name',
                'Contact Phone',
                'Contact Email',
                'Approval Status',
                'Status',
                'Access Code',
                'Registered At',
            ],
            'ko' => [
                'ID',
                '회사명',
                '사업자등록번호',
                '대표자명',
                '담당자명',
                '담당자 연락처',
                '담당자 이메일',
                '승인 상태',
                '상태',
                '접속 코드',
                '등록일시',
            ],
            'ja' => [
                'ID',
                '会社名',
                '事業者登録番号',
                '代表者名',
                '担当者名',
                '担当者電話',
                '担当者メール',
                '承認状態',
                'ステータス',
                'アクセスコード',
                '登録日時',
            ],
        ];

        return $headings[$locale] ?? $headings['en'];
    }

    /**
     * Get sheet name for customer export based on locale.
     */
    public static function getCustomerSheetName(string $locale = 'en'): string
    {
        $sheetNames = [
            'en' => 'Customers',
            'ko' => '고객사 목록',
            'ja' => '顧客一覧',
        ];

        return $sheetNames[$locale] ?? $sheetNames['en'];
    }

    /**
     * Get inquiry export column headings based on locale.
     *
     * @return array<string>
     */
    public static function getInquiryHeadings(string $locale = 'en'): array
    {
        $headings = [
            'en' => [
                'ID',
                'Inquiry Number',
                'Inquiry Type',
                'Title',
                'Customer Name',
                'Inquirer Name',
                'Status',
                'Person in Charge',
                'Has Attachment',
                'Registered At',
            ],
            'ko' => [
                'ID',
                '문의 번호',
                '문의 유형',
                '제목',
                '고객사명',
                '문의자명',
                '상태',
                '담당자',
                '첨부 여부',
                '등록일시',
            ],
            'ja' => [
                'ID',
                '問い合わせ番号',
                '問い合わせ種別',
                'タイトル',
                '顧客名',
                '問い合わせ者名',
                'ステータス',
                '担当者',
                '添付有無',
                '登録日時',
            ],
        ];

        return $headings[$locale] ?? $headings['en'];
    }

    /**
     * Get sheet name for inquiry export based on locale.
     */
    public static function getInquirySheetName(string $locale = 'en'): string
    {
        $sheetNames = [
            'en' => 'Inquiries',
            'ko' => '문의 목록',
            'ja' => '問い合わせ一覧',
        ];

        return $sheetNames[$locale] ?? $sheetNames['en'];
    }

    /**
     * Get member export column headings based on locale.
     *
     * @return array<string>
     */
    public static function getMemberHeadings(string $locale = 'en'): array
    {
        $headings = [
            'en' => [
                'ID',
                'Username',
                'Name',
                'Email',
                'Phone',
                'Mobile',
                'Status',
                'Customer Company',
                'Note',
                'Registered At',
            ],
            'ko' => [
                'ID',
                '아이디',
                '이름',
                '이메일',
                '전화번호',
                '휴대폰 번호',
                '상태',
                '고객사명',
                '비고',
                '등록일시',
            ],
            'ja' => [
                'ID',
                'ユーザー名',
                '氏名',
                'メールアドレス',
                '電話番号',
                '携帯番号',
                'ステータス',
                '顧客名',
                '備考',
                '登録日時',
            ],
        ];

        return $headings[$locale] ?? $headings['en'];
    }

    /**
     * Get sheet name for member export based on locale.
     */
    public static function getMemberSheetName(string $locale = 'en'): string
    {
        $sheetNames = [
            'en' => 'Members',
            'ko' => '회원 목록',
            'ja' => '会員一覧',
        ];

        return $sheetNames[$locale] ?? $sheetNames['en'];
    }

    /**
     * Get admin permission export column headings based on locale.
     *
     * @return array<string>
     */
    public static function getAdminPermissionHeadings(string $locale = 'en'): array
    {
        $headings = [
            'en' => [
                'ID',
                'Authority Name',
                'Description',
                'Usage Status',
                'Registrant Name',
                'Registrant Email',
                'Registered At',
            ],
            'ko' => [
                'ID',
                '권한명',
                '설명',
                '사용 상태',
                '등록자 이름',
                '등록자 이메일',
                '등록일시',
            ],
            'ja' => [
                'ID',
                '権限名',
                '説明',
                '利用状態',
                '登録者名',
                '登録者メール',
                '登録日時',
            ],
        ];

        return $headings[$locale] ?? $headings['en'];
    }

    /**
     * Get sheet name for admin permission export based on locale.
     */
    public static function getAdminPermissionSheetName(string $locale = 'en'): string
    {
        $sheetNames = [
            'en' => 'Administrator Permissions',
            'ko' => '관리자 권한 목록',
            'ja' => '管理者権限一覧',
        ];

        return $sheetNames[$locale] ?? $sheetNames['en'];
    }

    /**
     * Get user permission export column headings based on locale.
     *
     * @return array<string>
     */
    public static function getUserPermissionHeadings(string $locale = 'en'): array
    {
        $headings = [
            'en' => [
                'ID',
                'Customer Company',
                'User Name',
                'Username',
                'Email',
                'Authority Name',
                'Status',
                'Grant Date',
                'Registrant Name',
            ],
            'ko' => [
                'ID',
                '고객사명',
                '사용자 이름',
                '아이디',
                '이메일',
                '권한명',
                '상태',
                '부여일',
                '등록자 이름',
            ],
            'ja' => [
                'ID',
                '顧客名',
                'ユーザー名',
                'ログインID',
                'メールアドレス',
                '権限名',
                'ステータス',
                '付与日',
                '登録者名',
            ],
        ];

        return $headings[$locale] ?? $headings['en'];
    }

    /**
     * Get sheet name for user permission export based on locale.
     */
    public static function getUserPermissionSheetName(string $locale = 'en'): string
    {
        $sheetNames = [
            'en' => 'User Permissions',
            'ko' => '사용자 권한 목록',
            'ja' => 'ユーザー権限一覧',
        ];

        return $sheetNames[$locale] ?? $sheetNames['en'];
    }

    /**
     * Get delivery tracking export column headings based on locale.
     *
     * @return array<string>
     */
    public static function getDeliveryTrackingHeadings(string $locale = 'en'): array
    {
        $headings = [
            'en' => [
                'No',
                'Order Number',
                'Customer Name',
                'Product Name',
                'Quantity',
                'Invoice Number',
                'Waybill Date',
                'Delivery Status',
                'Courier',
            ],
            'ko' => [
                '번호',
                '주문번호',
                '고객사명',
                '제품명',
                '수량',
                '송장번호',
                '송장 등록일',
                '배송 상태',
                '택배사',
            ],
            'ja' => [
                'No',
                '注文番号',
                '顧客名',
                '商品名',
                '数量',
                '送り状番号',
                '送り状登録日',
                '配送状態',
                '配送業者',
            ],
        ];

        return $headings[$locale] ?? $headings['en'];
    }

    /**
     * Get sheet name for delivery tracking export based on locale.
     */
    public static function getDeliveryTrackingSheetName(string $locale = 'en'): string
    {
        $sheetNames = [
            'en' => 'Delivery Tracking',
            'ko' => '배송 추적',
            'ja' => '配送追跡',
        ];

        return $sheetNames[$locale] ?? $sheetNames['en'];
    }

    /**
     * Get shipment export column headings based on locale.
     *
     * @return array<string>
     */
    public static function getShipmentHeadings(string $locale = 'en'): array
    {
        $headings = [
            'en' => [
                'No',
                'Order Number',
                'Customer Name',
                'Type',
                'Product Name',
                'Quantity',
                'Tracking Number',
                'Carrier',
                'Status',
                'Shipped At',
                'Delivered At',
                'Shipping Fee',
            ],
            'ko' => [
                '번호',
                '주문번호',
                '고객사명',
                '배송유형',
                '제품명',
                '수량',
                '운송장번호',
                '택배사',
                '상태',
                '출고일',
                '배달완료일',
                '배송비',
            ],
            'ja' => [
                'No',
                '注文番号',
                '顧客名',
                '配送タイプ',
                '商品名',
                '数量',
                '追跡番号',
                '配送業者',
                'ステータス',
                '出荷日',
                '配達完了日',
                '送料',
            ],
        ];

        return $headings[$locale] ?? $headings['en'];
    }

    /**
     * Get sheet name for shipment export based on locale.
     */
    public static function getShipmentSheetName(string $locale = 'en'): string
    {
        $sheetNames = [
            'en' => 'Shipments',
            'ko' => '출고 목록',
            'ja' => '出荷一覧',
        ];

        return $sheetNames[$locale] ?? $sheetNames['en'];
    }

    /**
     * Get ERP option export column headings based on locale.
     *
     * @return array<string>
     */
    public static function getErpOptionHeadings(string $locale = 'en'): array
    {
        $headings = [
            'en' => [
                'ID',
                'Group Code',
                'Group Label',
                'Option Code',
                'Option Label',
                'Value',
                'Additional Price',
                'Status',
                'Display Type',
                'Required',
                'Sort Order',
                'Created At',
            ],
            'ko' => [
                'ID',
                '그룹 코드',
                '그룹명',
                '옵션 코드',
                '옵션명',
                '값',
                '추가 금액',
                '상태',
                '노출 타입',
                '필수 여부',
                '정렬 순서',
                '생성일시',
            ],
            'ja' => [
                'ID',
                'グループコード',
                'グループ名',
                'オプションコード',
                'オプション名',
                '値',
                '追加金額',
                'ステータス',
                '表示タイプ',
                '必須',
                '並び順',
                '作成日時',
            ],
        ];

        return $headings[$locale] ?? $headings['en'];
    }

    /**
     * Get sheet name for ERP product option export based on locale.
     */
    public static function getErpOptionSheetName(string $locale = 'en'): string
    {
        $sheetNames = [
            'en' => 'ERP Product Options',
            'ko' => 'ERP 옵션 목록',
            'ja' => 'ERPオプション一覧',
        ];

        return $sheetNames[$locale] ?? $sheetNames['en'];
    }

    /**
     * Get ERP option group export column headings based on locale.
     *
     * @return array<string>
     */
    public static function getErpOptionGroupHeadings(string $locale = 'en'): array
    {
        $headings = [
            'en' => [
                'ID',
                'Code',
                'Label',
                'Type',
                'Required',
                'Display Type',
                'Created At',
            ],
            'ko' => [
                'ID',
                '코드',
                '명칭',
                '유형',
                '필수 여부',
                '노출 타입',
                '생성일시',
            ],
            'ja' => [
                'ID',
                'コード',
                '名称',
                'タイプ',
                '必須',
                '表示タイプ',
                '作成日時',
            ],
        ];

        return $headings[$locale] ?? $headings['en'];
    }

    /**
     * Get sheet name for ERP option group export based on locale.
     */
    public static function getErpOptionGroupSheetName(string $locale = 'en'): string
    {
        $sheetNames = [
            'en' => 'ERP Option Groups',
            'ko' => 'ERP 옵션 그룹 목록',
            'ja' => 'ERPオプショングループ一覧',
        ];

        return $sheetNames[$locale] ?? $sheetNames['en'];
    }
}
