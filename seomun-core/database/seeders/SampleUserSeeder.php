<?php

namespace Database\Seeders;

use App\Enums\ApprovalStatus;
use App\Enums\UserStatus;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SampleUserSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = 'password123';

        // 1. Individual user (개인회원)
        User::firstOrCreate(
            ['username' => 'individual_user'],
            [
                'customer_id'      => null,
                'member_type'      => 'individual',
                'status'           => UserStatus::ACTIVE,
                'approval_status'  => ApprovalStatus::ACCEPTED->value,
                'approved_at'      => now(),
                'name'             => '홍길동',
                'email'            => 'individual@example.com',
                'password'         => Hash::make($defaultPassword),
                'phone'            => '02-1234-5678',
                'mobile'           => '010-1234-5678',
                'postcode'         => '04524',
                'address'          => '서울특별시 중구 세종대로 110',
                'detailed_address' => '101호',
                'authority'        => 'normal_user',
                'headquarters'     => null,
                'business_office'  => null,
                'team'             => null,
                'position'         => null,
                'agree_privacy'    => true,
                'agree_terms'      => true,
                'agreed_at'        => now(),
                'remember_token'   => Str::random(10),
            ]
        );

        // 2. Business user (기업회원) — requires a Customer record
        $customer = Customer::firstOrCreate(
            ['business_registration_number' => '123-45-67890'],
            [
                'company_name'                  => '(주)샘플기업',
                'business_registration_number'  => '123-45-67890',
                'representative_name'           => '김대표',
                'business_type'                 => '제조업',
                'postcode'                      => '06236',
                'address'                       => '서울특별시 강남구 테헤란로 521',
                'detailed_address'              => '5층',
                'contact_name'                  => '이담당',
                'contact_email'                 => 'business@example.com',
                'contact_mobile'                => '010-9876-5432',
                'contact_phone'                 => '02-9876-5432',
                'access_code'                   => strtoupper(Str::random(8)),
                'shipping_fee_applied'          => 'none',
                'order_menus'                   => '[]',
                'other_menus'                   => '[]',
                'approval_status'               => ApprovalStatus::ACCEPTED->value,
                'approved_at'                   => now(),
                'status'                        => 'normal',
            ]
        );

        User::firstOrCreate(
            ['username' => 'business_user'],
            [
                'customer_id'      => $customer->id,
                'member_type'      => 'business',
                'status'           => UserStatus::ACTIVE,
                'approval_status'  => ApprovalStatus::ACCEPTED->value,
                'approved_at'      => now(),
                'name'             => '이담당',
                'email'            => 'business@example.com',
                'password'         => Hash::make($defaultPassword),
                'phone'            => '02-9876-5432',
                'mobile'           => '010-9876-5432',
                'postcode'         => '06236',
                'address'          => '서울특별시 강남구 테헤란로 521',
                'detailed_address' => '5층',
                'authority'        => 'normal_user',
                'headquarters'     => '본사',
                'business_office'  => '서울 사무소',
                'team'             => '구매팀',
                'position'         => '대리',
                'agree_privacy'    => true,
                'agree_terms'      => true,
                'agreed_at'        => now(),
                'remember_token'   => Str::random(10),
            ]
        );

        if (isset($this->command)) {
            $this->command->info('Sample users seeded (password: ' . $defaultPassword . ')');
            $this->command->info('  - individual_user  → 개인회원 (홍길동)');
            $this->command->info('  - business_user    → 기업회원 (이담당 / (주)샘플기업)');
        }
    }
}
