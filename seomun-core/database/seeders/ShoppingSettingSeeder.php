<?php

namespace Database\Seeders;

use App\Enums\ShoppingSettingType;
use App\Models\ShoppingSetting;
use App\Models\ShoppingSettingItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShoppingSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('product_shopping_setting_items')->truncate();
        DB::table('shopping_setting_items')->truncate();
        DB::table('shopping_settings')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $settings = [
            [
                'title' => 'General Precautions',
                'content' => 'Content for General Precautions.',
                'type' => ShoppingSettingType::GENERAL_PRECAUTIONS,
                'items' => [
                    [
                        'title' => '기본 유의사항 (Default General Precautions)',
                        'content' => '<p>주문 전 제작 사양 및 작업 가이드를 반드시 확인해 주세요. 모니터 색상(RGB)과 실제 인쇄 색상(CMYK)은 차이가 있을 수 있습니다.</p>',
                        'is_default' => true,
                        'sort_order' => 1,
                    ],
                    [
                        'title' => '재단 및 후가공 유의사항 (Cutting & Finishing Precautions)',
                        'content' => '<p>재단 시 ±1~2mm의 오차가 발생할 수 있으므로 주요 텍스트는 안전 영역 안쪽으로 배치해 주시기 바랍니다.</p>',
                        'is_default' => false,
                        'sort_order' => 2,
                    ],
                ],
            ],
            [
                'title' => 'General Production Guide',
                'content' => 'Content for General Production Guide.',
                'type' => ShoppingSettingType::GENERAL_PRODUCTION_GUIDE,
                'items' => [
                    [
                        'title' => '일반 제작 안내 (Standard Production Guide)',
                        'content' => '<p>결제 완료 후 시안 확정 단계부터 제작이 진행되며, 제품별 표준 제작 기간이 소요됩니다.</p>',
                        'is_default' => true,
                        'sort_order' => 1,
                    ],
                    [
                        'title' => '특수 후가공 제작 안내 (Special Finishing Guide)',
                        'content' => '<p>박, 형압, 에폭시 등 특수 후가공이 포함된 상품은 공정 특성상 추가 제작일(1~2일)이 소요될 수 있습니다.</p>',
                        'is_default' => false,
                        'sort_order' => 2,
                    ],
                ],
            ],
            [
                'title' => 'Shipment & Delivery Information',
                'content' => 'Content for Shipment & Delivery Information.',
                'type' => ShoppingSettingType::SHIPMENT_DELIVERY_INFORMATION,
                'items' => [
                    [
                        'title' => '기본 택배 배송 (Standard Delivery)',
                        'content' => '<p>CJ대한통운을 통해 출고되며, 출고 후 영업일 기준 1~3일 내에 배송됩니다. 도서 산간 지역은 추가 배송비가 발생할 수 있습니다.</p>',
                        'is_default' => true,
                        'sort_order' => 1,
                    ],
                    [
                        'title' => '화물 / 퀵 배송 안내 (Freight / Quick Delivery)',
                        'content' => '<p>부피가 크거나 파손 위험이 높은 제품, 긴급 수령 건은 화물 택배 또는 오토바이/다마스 퀵 배송(착불)으로 출고됩니다.</p>',
                        'is_default' => false,
                        'sort_order' => 2,
                    ],
                ],
            ],
            [
                'title' => 'User Guide',
                'content' => 'Content for User Guide.',
                'type' => ShoppingSettingType::USER_GUIDE,
                'items' => [
                    [
                        'title' => '기본 이용 가이드 (General User Guide)',
                        'content' => '<p>웹 에디터 또는 템플릿 다운로드를 통해 손쉽게 디자인 파일을 접수하실 수 있습니다.</p>',
                        'is_default' => true,
                        'sort_order' => 1,
                    ],
                    [
                        'title' => '대량 주문 / 맞춤 견적 가이드 (Bulk & Custom Order Guide)',
                        'content' => '<p>대량 주문 또는 옵션 외 사양은 고객센터 1:1 문의를 통해 별도 견적 상담 후 진행 가능합니다.</p>',
                        'is_default' => false,
                        'sort_order' => 2,
                    ],
                ],
            ],
        ];

        foreach ($settings as $settingData) {
            $items = $settingData['items'];
            unset($settingData['items']);

            $setting = ShoppingSetting::create($settingData);

            foreach ($items as $itemData) {
                $setting->items()->create($itemData);
            }
        }
    }
}
