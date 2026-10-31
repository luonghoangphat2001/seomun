<?php

namespace Database\Seeders;

use App\Models\DirectShippingRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DirectShippingRequestSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DirectShippingRequest::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $user = User::query()->firstOrFail();

        $samples = [
            [
                'shipping_name'    => '서울 본사 직배송',
                'recipient_name'   => '김철수',
                'phone'            => '010-1234-5678',
                'postcode'         => '04524',
                'address'          => '서울특별시 중구 세종대로 110',
                'detailed_address' => '3층 총무팀',
                'storage_location' => '1층 경비실 보관',
                'detail_request'   => '직배송 요청드립니다. 평일 오전 10시~12시 사이 배송 부탁드립니다.',
                'amount'           => 150000,
                'status'           => 'pending',
            ],
            [
                'shipping_name'    => '부산 지사 직배송',
                'recipient_name'   => '이영희',
                'phone'            => '010-9876-5432',
                'postcode'         => '48058',
                'address'          => '부산광역시 해운대구 해운대해변로 264',
                'detailed_address' => '2층 사무실',
                'storage_location' => null,
                'detail_request'   => '현수막 및 배너 직배송 요청입니다. 오후 2시 이후 배송 가능합니다.',
                'amount'           => 85000,
                'status'           => 'confirmed',
            ],
            [
                'shipping_name'    => '강남 행사장 직배송',
                'recipient_name'   => '박민준',
                'phone'            => '010-5555-7777',
                'postcode'         => '06236',
                'address'          => '서울특별시 강남구 테헤란로 521',
                'detailed_address' => 'B1 행사장',
                'storage_location' => '행사장 입구 왼쪽',
                'detail_request'   => '전시회 부스용 인쇄물 직배송입니다. 행사 전날인 2026-04-20 오후까지 도착 필요합니다.',
                'amount'           => 320000,
                'status'           => 'completed',
            ],
            [
                'shipping_name'    => '인천 창고 직배송',
                'recipient_name'   => '최지수',
                'phone'            => '010-3333-4444',
                'postcode'         => '21999',
                'address'          => '인천광역시 중구 공항로 272',
                'detailed_address' => null,
                'storage_location' => '창고 A동 3번 구역',
                'detail_request'   => '포장재 대량 직배송 요청입니다. 팔레트 단위로 배송 부탁드립니다.',
                'amount'           => 0,
                'status'           => 'cancelled',
            ],
        ];

        foreach ($samples as $data) {
            DirectShippingRequest::create(array_merge(['user_id' => $user->id], $data));
        }
    }
}
