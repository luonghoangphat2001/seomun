<?php

namespace App\Enums;

enum CustomerOtherMenu: string
{
    case ALL_MENUS = 'all_menus';                      // 모든 메뉴
    case INQUIRY = 'inquiry';                          // 제작문의
    case STATISTICS = 'statistics';                    // 통계
    case NOTICE = 'notice';                            // 공지사항
    case PRIVACY_POLICY = 'privacy_policy';            // 개인정보취급방침
    case TCPS_GUIDE = 'tcps_guide';                    // TCPS 이용안내
    case QNA = 'qna';                                  // Q&A
    case COPYRIGHT = 'copyright';                      // Copyright
    case INFO_EDIT = 'info_edit';                      // 정보수정
    case CART = 'cart';                                // 장바구니
    case ORDER_HISTORY = 'order_history';              // 주문내역
    case LOGOUT = 'logout';                            // 로그아웃
    case ADDRESS_EDIT = 'address_edit';                // 회원정보 주소수정

    public function label(): string
    {
        return match ($this) {
            self::ALL_MENUS => '모든 메뉴',
            self::INQUIRY => '제작문의',
            self::STATISTICS => '통계',
            self::NOTICE => '공지사항',
            self::PRIVACY_POLICY => '개인정보취급방침',
            self::TCPS_GUIDE => 'TCPS 이용안내',
            self::QNA => 'Q&A',
            self::COPYRIGHT => 'Copyright',
            self::INFO_EDIT => '정보수정',
            self::CART => '장바구니',
            self::ORDER_HISTORY => '주문내역',
            self::LOGOUT => '로그아웃',
            self::ADDRESS_EDIT => '회원정보 주소수정',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::ALL_MENUS => 'All Menus',
            self::INQUIRY => 'Inquiry',
            self::STATISTICS => 'Statistics',
            self::NOTICE => 'Notice',
            self::PRIVACY_POLICY => 'Privacy Policy',
            self::TCPS_GUIDE => 'TCPS Guide',
            self::QNA => 'Q&A',
            self::COPYRIGHT => 'Copyright',
            self::INFO_EDIT => 'Edit Info',
            self::CART => 'Cart',
            self::ORDER_HISTORY => 'Order History',
            self::LOGOUT => 'Logout',
            self::ADDRESS_EDIT => 'Edit Address',
        };
    }
}
