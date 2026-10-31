<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Faq;
use App\Models\Popup;
use App\Models\User;
use Illuminate\Database\Seeder;

class BannerFaqPopupSeeder extends Seeder
{
    /**
     * Seed sample banners, FAQs, and popups so admin search-filters return options.
     */
    public function run(): void
    {
        $admin = User::where('username', 'superadmin')->orWhere('authority', 'super_admin')->first();
        if (! $admin) {
            $this->command->warn('No Super Admin user found. Run UserSeeder first.');

            return;
        }

        $createdBy = $admin->id;

        // Banners
        $bannerNames = ['Main Banner', 'Promo Banner', 'Login Banner'];
        foreach ($bannerNames as $i => $name) {
            Banner::firstOrCreate(
                ['name' => $name],
                [
                    'image_path' => 'banners/placeholder-'.($i + 1).'.jpg',
                    'link_url' => null,
                    'exposure_location' => $i === 0 ? 'main' : ($i === 1 ? 'login' : 'dashboard'),
                    'is_active' => true,
                    'sort_order' => $i + 1,
                    'created_by' => $createdBy,
                ]
            );
        }

        // FAQs
        $faqs = [
            ['category' => 'membership', 'question' => 'How do I change my password?', 'answer' => 'Go to My Page > Profile > Change Password.'],
            ['category' => 'orders', 'question' => 'How can I track my order?', 'answer' => 'Check Order History in My Page and use the tracking link.'],
            ['category' => 'payment_accounting', 'question' => 'What payment methods are accepted?', 'answer' => 'We accept card, bank transfer, and pay-later for qualified customers.'],
            ['category' => 'design', 'question' => 'Who do I contact for support?', 'answer' => 'Use the 1:1 Inquiry in My Page or contact the customer center.'],
        ];
        foreach ($faqs as $i => $row) {
            Faq::firstOrCreate(
                ['question' => $row['question']],
                [
                    'category' => $row['category'],
                    'answer' => $row['answer'],
                    'sort_order' => $i + 1,
                    'is_active' => true,
                    'view_count' => 0,
                    'created_by' => $createdBy,
                ]
            );
        }

        // Popups
        $popupNames = ['Welcome Popup', 'Event Popup', 'Notice Popup'];
        foreach ($popupNames as $i => $name) {
            Popup::firstOrCreate(
                ['name' => $name],
                [
                    'content' => '<p>Sample content for '.$name.'.</p>',
                    'image_path' => null,
                    'exposure_location' => $i === 0 ? 'main' : ($i === 1 ? 'login' : 'dashboard'),
                    'width' => 400,
                    'height' => 300,
                    'is_active' => true,
                    'created_by' => $createdBy,
                ]
            );
        }

        $this->command->info('BannerFaqPopupSeeder: banners, FAQs, and popups seeded.');
    }
}
