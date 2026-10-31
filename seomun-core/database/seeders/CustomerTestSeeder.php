<?php

namespace Database\Seeders;

use App\Enums\ApprovalStatus;
use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use App\Enums\UserLimitStatus;
use App\Models\Code;
use App\Models\Customer;
use App\Models\Inquiry;
use App\Models\LimitUsagedLogs;
use App\Models\User;
use App\Models\UserLimit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CustomerTestSeeder extends Seeder
{
    public function run(): void
    {
        $branchCode = Code::query()->first();

        $customers = [
            [
                'access_code' => 'SEED001',
                'company_name' => '테스트 고객사 A',
                'business_registration_number' => '111-11-11111',
                'representative_name' => '김대표',
                'contact_name' => '이담당',
                'contact_position' => '부장',
                'contact_phone' => '02-1111-1111',
                'contact_mobile' => '010-1111-1111',
                'contact_email' => 'seed001@example.com',
                'postcode' => '04524',
                'address' => '서울특별시 중구 세종대로 110',
                'detailed_address' => '101호',
                'status' => 'normal',
                'approval_status' => ApprovalStatus::ACCEPTED,
                'approved_at' => now()->subDays(30),
            ],
            [
                'access_code' => 'SEED002',
                'company_name' => '테스트 고객사 B',
                'business_registration_number' => '222-22-22222',
                'representative_name' => '박대표',
                'contact_name' => '최담당',
                'contact_position' => '과장',
                'contact_phone' => '02-2222-2222',
                'contact_mobile' => '010-2222-2222',
                'contact_email' => 'seed002@example.com',
                'postcode' => '06232',
                'address' => '서울특별시 강남구 테헤란로 152',
                'detailed_address' => '202호',
                'status' => 'inactive',
                'approval_status' => ApprovalStatus::PENDING,
            ],
            [
                'access_code' => 'SEED003',
                'company_name' => '테스트 고객사 C',
                'business_registration_number' => '333-33-33333',
                'representative_name' => '정대표',
                'contact_name' => '강담당',
                'contact_position' => '대리',
                'contact_phone' => '02-3333-3333',
                'contact_mobile' => '010-3333-3333',
                'contact_email' => 'seed003@example.com',
                'postcode' => '48060',
                'address' => '부산광역시 해운대구 센텀중앙로 48',
                'detailed_address' => '303호',
                'status' => 'normal',
                'approval_status' => ApprovalStatus::ACCEPTED,
                'approved_at' => now()->subDays(10),
            ],
        ];

        foreach ($customers as $data) {
            $customer = Customer::firstOrCreate(
                ['access_code' => $data['access_code']],
                array_merge($data, [
                    'api_key' => Str::random(64),
                    'webhook_secret' => Str::random(64),
                    'branch_in_charge' => $branchCode?->id,
                    'shipping_method' => ['delivery'],
                    'shipping_fee_applied' => false,
                    'shipping_fee' => 0,
                    'order_menus' => [],
                    'other_menus' => [],
                    'prepaid_payment_enabled' => true,
                    'postpaid_payment_enabled' => false,
                    'prepaid_payment_methods' => ['card', 'bank_transfer'],
                    'customer_footer_copyright' => 'Copyright(c) Seomun All rights reserved.',
                    'created_at' => now(),
                ])
            );

            // Create members for customer
            foreach (range(1, 3) as $j) {
                $username = strtolower($data['access_code']) . "_user{$j}";
                $user = User::firstOrCreate(
                    ['username' => $username],
                    [
                        'customer_id' => $customer->id,
                        'name' => "테스트 멤버 {$j} ({$data['access_code']})",
                        'email' => "{$username}@example.com",
                        'password' => Hash::make('password123'),
                        'authority' => 'normal_user',
                        'status' => 'active',
                        'headquarters' => 'HQ',
                        'business_office' => '서울',
                        'team' => '영업팀',
                        'position' => ['사원', '대리', '과장'][$j - 1],
                        'phone' => '010-' . str_pad($j, 4, '0', STR_PAD_LEFT) . '-' . str_pad($j * 1111, 4, '0', STR_PAD_LEFT),
                        'agree_privacy' => true,
                        'agree_terms' => true,
                        'agreed_at' => now(),
                    ]
                );

                // Create user limit (bookkeeping)
                $limit = UserLimit::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'limit' => 5000000 * $j,
                        'usage_amount' => 1000000 * $j,
                        'remaining_amount' => 4000000 * $j,
                        'status' => UserLimitStatus::ACTIVE,
                    ]
                );

                // Create bookkeeping transactions
                if ($limit->wasRecentlyCreated) {
                    $transactionPersons = ['Kim Admin', 'Lee Manager', 'Park Staff'];
                    $details = ['Invoice settlement', 'Point deduction adjustment', 'Invoice settlement'];
                    foreach (range(1, 3) as $k) {
                        LimitUsagedLogs::create([
                            'user_limit_id' => $limit->id,
                            'usage_amount' => 300000 * $k,
                            'remaining_amount' => $limit->remaining_amount - (300000 * $k),
                            'description' => $details[$k - 1],
                            'quantity' => $k,
                            'notes' => $k % 2 === 0 ? null : 'Checked by finance team',
                            'transaction_person' => $transactionPersons[$k - 1],
                            'reference_type' => 'order',
                            'reference_id' => $k,
                        ]);
                    }
                }
            }

            // Create inquiries for customer's first user
            $firstUser = User::where('customer_id', $customer->id)->first();
            if ($firstUser) {
                $inquiryData = [
                    ['category' => InquiryCategory::PRODUCT, 'status' => InquiryStatus::PENDING, 'title' => '상품 문의입니다'],
                    ['category' => InquiryCategory::QUOTE, 'status' => InquiryStatus::IN_PROGRESS, 'title' => '견적 문의입니다'],
                    ['category' => InquiryCategory::SHIPPING, 'status' => InquiryStatus::COMPLETED, 'title' => '배송 문의입니다'],
                ];
                foreach ($inquiryData as $inq) {
                    Inquiry::create([
                        'user_id' => $firstUser->id,
                        'category' => $inq['category'],
                        'title' => $inq['title'],
                        'content' => "테스트 문의 내용입니다. ({$data['company_name']})",
                        'contact' => $data['contact_mobile'],
                        'status' => $inq['status'],
                    ]);
                }
            }
        }

        $this->command->info('CustomerTestSeeder done: ' . Customer::whereIn('access_code', ['SEED001', 'SEED002', 'SEED003'])->count() . ' customers seeded.');
    }
}
