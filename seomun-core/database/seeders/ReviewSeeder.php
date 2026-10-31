<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $faker = FakerFactory::create();

        $user = User::where('username', 'individual_user')->first();
        if (! $user) {
            $this->command->warn('User "individual_user" not found. Skipping.');

            return;
        }

        $orders = Order::where('user_id', $user->id)->take(5)->get();
        if ($orders->isEmpty()) {
            $this->command->warn('No orders found for "individual_user". Cannot seed reviews with orders.');
            return;
        }

        $reviewsData = [
            [
                'rating' => 5,
                'title' => '최고의 품질과 빠른 배송',
                'content' => '명함 품질이 기대 이상이었습니다. 종이도 고급스럽고 인쇄도 매우 선명합니다. 다음에도 꼭 다시 주문하겠습니다.',
            ],
            [
                'rating' => 4,
                'title' => '가격 대비 만족스러운 제품',
                'content' => '가격에 비해 품질이 매우 좋았습니다. 배송이 예상보다 하루 정도 늦었지만 전체적으로 만족합니다.',
            ],
            [
                'rating' => 5,
                'title' => '비즈니스에 딱 맞는 명함',
                'content' => '브랜드 이미지를 잘 살려주는 명함입니다. 색상이 정확하고 마감도 매우 고급스럽습니다. 적극 추천합니다.',
            ],
            [
                'rating' => 3,
                'title' => '무난한 구매 경험',
                'content' => '전체적으로 괜찮았지만 일부 명함의 글자가 약간 흐리게 인쇄되었습니다. 다만 고객센터의 응대는 친절했습니다.',
            ],
            [
                'rating' => 4,
                'title' => '다양한 디자인과 종이 옵션',
                'content' => '종이 종류를 다양하게 선택할 수 있어서 좋았습니다. 무광 마감이 고급스럽고 주문 과정도 매우 간편했습니다.',
            ],
            [
                'rating' => 5,
                'title' => '지금까지 주문한 명함 중 최고',
                'content' => '다른 업체에서 주문했던 명함보다 훨씬 품질이 좋습니다. 종이가 두껍고 색감도 선명하며 배송도 빨랐습니다.',
            ],
        ];

        $createdCount = 0;
        $orderIndex = 0;
        foreach ($reviewsData as $reviewData) {
            $order = $orders[$orderIndex % $orders->count()];

            Review::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'product_id' => $order->product_id,
                    'order_id' => $order->id,
                ],
                [
                    'title' => $reviewData['title'],
                    'rating' => $reviewData['rating'],
                    'content' => $reviewData['content'],
                    'images' => [],
                    'is_approved' => true,
                    'is_published' => true,
                    'created_at' => $faker->dateTimeBetween('-3 months', 'now'),
                    'updated_at' => $faker->dateTimeBetween('-3 months', 'now'),
                ]
            );
            $createdCount++;
            $orderIndex++;
        }

        $this->command->info("Created {$createdCount} reviews for user {$user->username} across {$orders->count()} orders.");
    }
}
