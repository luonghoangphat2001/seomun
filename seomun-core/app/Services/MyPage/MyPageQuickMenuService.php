<?php

namespace App\Services\MyPage;

use App\Models\User;
use App\Models\UserQuickMenuItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MyPageQuickMenuService
{
    /**
     * Get quick menu items for user
     */
    public function getQuickMenu(User $user): array
    {
        try {
            $items = UserQuickMenuItem::where('user_id', $user->id)
                ->orderBy('sort_order')
                ->orderBy('created_at')
                ->get();

            return $items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'menu_code' => $item->menu_code,
                    'label' => $item->label,
                    'label_en' => $item->label_en,
                    'menu_type' => $item->menu_type,
                    'route' => $item->route,
                    'sort_order' => $item->sort_order,
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Get MyPage quick menu failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Update quick menu items for user
     * Replaces all existing items with new ones (max 6)
     */
    public function updateQuickMenu(User $user, array $items): array
    {
        try {
            DB::beginTransaction();

            // Delete existing items
            UserQuickMenuItem::where('user_id', $user->id)->delete();

            // Create new items
            $createdItems = [];
            foreach ($items as $index => $item) {
                $menuItem = UserQuickMenuItem::create([
                    'user_id' => $user->id,
                    'menu_code' => $item['menu_code'],
                    'label' => $item['label'],
                    'label_en' => $item['label_en'] ?? null,
                    'menu_type' => $item['menu_type'] ?? null,
                    'route' => $item['route'] ?? null,
                    'sort_order' => $item['sort_order'] ?? $index,
                ]);

                $createdItems[] = [
                    'id' => $menuItem->id,
                    'menu_code' => $menuItem->menu_code,
                    'label' => $menuItem->label,
                    'label_en' => $menuItem->label_en,
                    'menu_type' => $menuItem->menu_type,
                    'route' => $menuItem->route,
                    'sort_order' => $menuItem->sort_order,
                ];
            }

            DB::commit();

            return $createdItems;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update MyPage quick menu failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get available menu options (for reference/frontend use)
     * This can be extended later with a configuration file or database table
     */
    public function getAvailableMenuOptions(): array
    {
        return [
            'categories' => [
                ['menu_code' => 'business_card', 'label' => '명함', 'label_en' => 'Business Card', 'menu_type' => 'category'],
                ['menu_code' => 'sticker', 'label' => '스티커', 'label_en' => 'Sticker', 'menu_type' => 'category'],
                ['menu_code' => 'flyer', 'label' => '전단', 'label_en' => 'Flyer', 'menu_type' => 'category'],
                ['menu_code' => 'catalog', 'label' => '카탈로그', 'label_en' => 'Catalog', 'menu_type' => 'category'],
                ['menu_code' => 'envelope', 'label' => '봉투/양식지', 'label_en' => 'Envelope/Form', 'menu_type' => 'category'],
                ['menu_code' => 'box', 'label' => '박스/판촉물', 'label_en' => 'Box/Promotional', 'menu_type' => 'category'],
                ['menu_code' => 'large_format', 'label' => '실사출력', 'label_en' => 'Large Format Printing', 'menu_type' => 'category'],
            ],
            'orders' => [
                ['menu_code' => 'order_history', 'label' => '주문내역', 'label_en' => 'Order History', 'menu_type' => 'order'],
                ['menu_code' => 'cart', 'label' => '장바구니', 'label_en' => 'Shopping Cart', 'menu_type' => 'order'],
                ['menu_code' => 'return_exchange', 'label' => '반품/교환 신청', 'label_en' => 'Return/Exchange Request', 'menu_type' => 'order'],
            ],
            'account' => [
                ['menu_code' => 'my_info', 'label' => '내 정보', 'label_en' => 'My Info', 'menu_type' => 'account'],
                ['menu_code' => 'admin_settings', 'label' => '관리자 설정', 'label_en' => 'Admin Settings', 'menu_type' => 'account'],
            ],
            'support' => [
                ['menu_code' => 'faq', 'label' => '자주 묻는 질문', 'label_en' => 'FAQ', 'menu_type' => 'support'],
                ['menu_code' => 'inquiry', 'label' => '1:1문의', 'label_en' => '1:1 Inquiry', 'menu_type' => 'support'],
                ['menu_code' => 'notice', 'label' => '공지사항', 'label_en' => 'Notices', 'menu_type' => 'support'],
            ],
        ];
    }
}
