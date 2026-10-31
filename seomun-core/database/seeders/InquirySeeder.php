<?php

namespace Database\Seeders;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use App\Models\Inquiry;
use App\Models\InquiryAttachment;
use App\Models\InquiryComment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InquirySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing inquiry-related data (disable FKs to allow truncate)
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        InquiryComment::truncate();
        InquiryAttachment::truncate();
        Inquiry::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Use an existing user as the inquirer
        /** @var User $user */
        $user = User::query()->firstOrFail();

        // Use another user (or fallback) as admin replier
        $adminUser = User::query()->where('id', '!=', $user->id)->first() ?? $user;

        // 1. Pending inquiry (no reply yet)
        Inquiry::create([
            'user_id' => $user->id,
            'product_id' => null,
            'category' => InquiryCategory::PRODUCT,
            'title' => '티셔츠 디자인 수정 요청',
            'content' => "안녕하세요.\n티셔츠 디자인 수정 관련 문의드립니다.",
            'order_number' => 'INQ-TEST-ORDER-001',
            'contact' => '010-1234-5678',
            'status' => InquiryStatus::PENDING,
        ]);

        // 2. In-progress inquiry
        Inquiry::create([
            'user_id' => $user->id,
            'product_id' => null,
            'category' => InquiryCategory::DELIVERY,
            'title' => '배송 지연 문의',
            'content' => '주문한 상품 배송 일정 문의드립니다.',
            'order_number' => 'INQ-TEST-ORDER-002',
            'contact' => '010-9876-5432',
            'status' => InquiryStatus::IN_PROGRESS,
        ]);

        // 3. Completed inquiry with reply (same order_number as #1 to test related inquiries)
        Inquiry::create([
            'user_id' => $user->id,
            'product_id' => null,
            'category' => InquiryCategory::PRODUCT,
            'title' => '티셔츠 인쇄 색상 변경',
            'content' => '이전에 주문한 티셔츠 인쇄 색상 변경 가능 여부 문의드립니다.',
            'order_number' => 'INQ-TEST-ORDER-001',
            'contact' => '010-1234-5678',
            'status' => InquiryStatus::COMPLETED,
            'replied_by' => $adminUser->id,
            'reply_contact_phone' => $adminUser->phone ?? null,
            'reply_content' => '요청해주신 내용대로 디자인 수정 및 색상 변경 진행하겠습니다.',
            'is_edited_reply' => false,
        ]);
    }
}
