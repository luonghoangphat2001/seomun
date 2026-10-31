<?php

namespace Database\Seeders;

use App\Models\OutsourcingCompany;
use Illuminate\Database\Seeder;

class OutsourcingCompanySeeder extends Seeder
{
    public function run(): void
    {
        OutsourcingCompany::query()->delete();

        $companies = [
            [
                'name'                     => '서문인쇄 협력사',
                'work_details'             => '명함, 브로슈어, 전단지 인쇄',
                'representative_name'      => '홍길동',
                'registration_number'      => '123-45-67890',
                'registration_certificate' => null,
                'email'                    => 'contact@partner1.com',
                'contact'                  => '02-1234-5678',
                'address'                  => '서울시 종로구 세종대로 1',
                'memo'                     => null,
                'is_active'                => true,
            ],
            [
                'name'                     => '대한인쇄',
                'work_details'             => '현수막, 배너, 포스터 출력',
                'representative_name'      => '김철수',
                'registration_number'      => '234-56-78901',
                'registration_certificate' => null,
                'email'                    => 'info@daehan.com',
                'contact'                  => '031-234-5678',
                'address'                  => '경기도 수원시 팔달구 효원로 1',
                'memo'                     => '대량 주문 시 단가 협의 가능',
                'is_active'                => true,
            ],
            [
                'name'                     => '한국디지털인쇄',
                'work_details'             => '디지털 인쇄, 포장재, 스티커',
                'representative_name'      => '이영희',
                'registration_number'      => '345-67-89012',
                'registration_certificate' => null,
                'email'                    => 'sales@kdprint.com',
                'contact'                  => '02-9876-5432',
                'address'                  => '서울시 마포구 양화로 45',
                'memo'                     => null,
                'is_active'                => true,
            ],
            [
                'name'                     => '부산오프셋',
                'work_details'             => '오프셋 인쇄, 카탈로그, 책자',
                'representative_name'      => '박민준',
                'registration_number'      => '456-78-90123',
                'registration_certificate' => null,
                'email'                    => 'busan@offset.co.kr',
                'contact'                  => '051-345-6789',
                'address'                  => '부산시 해운대구 센텀중앙로 55',
                'memo'                     => '납기 최소 5일 소요',
                'is_active'                => false,
            ],
        ];

        foreach ($companies as $company) {
            OutsourcingCompany::create($company);
        }
    }
}
