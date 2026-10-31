<?php

namespace Database\Seeders;

use App\Enums\ApprovalStatus;
use App\Enums\UserMembershipLevel;
use App\Enums\UserRegistrationPath;
use App\Enums\UserStatus;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class MemberStatisticsSampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some sample customers if none exist
        $customers = [
            ['company_name' => 'Samsung Electronics', 'contact_name' => 'John Doe', 'contact_email' => 'john@example.com', 'contact_phone' => '010-1234-5678', 'business_registration_number' => '123-45-67890', 'access_code' => 'SAMSUNG123', 'order_menus' => 'business_cards,flyers', 'other_menus' => '', 'shipping_fee' => 0, 'shipping_fee_applied' => 'per_order'],
            ['company_name' => 'LG Electronics', 'contact_name' => 'Jane Smith', 'contact_email' => 'jane@example.com', 'contact_phone' => '010-9876-5432', 'business_registration_number' => '987-65-43210', 'access_code' => 'LG456', 'order_menus' => 'business_cards,posters', 'other_menus' => '', 'shipping_fee' => 0, 'shipping_fee_applied' => 'per_order'],
            ['company_name' => 'Hyundai Motors', 'contact_name' => 'Bob Johnson', 'contact_email' => 'bob@example.com', 'contact_phone' => '010-4567-8901', 'business_registration_number' => '555-12-34567', 'access_code' => 'HYUNDAI789', 'order_menus' => 'business_cards,brochures', 'other_menus' => '', 'shipping_fee' => 0, 'shipping_fee_applied' => 'per_order'],
            ['company_name' => 'SK Telecom', 'contact_name' => 'Alice Williams', 'contact_email' => 'alice@example.com', 'contact_phone' => '010-2345-6789', 'business_registration_number' => '222-33-44444', 'access_code' => 'SKT001', 'order_menus' => 'business_cards,calendars', 'other_menus' => '', 'shipping_fee' => 0, 'shipping_fee_applied' => 'per_order'],
        ];

        foreach ($customers as $customerData) {
            Customer::firstOrCreate(
                ['business_registration_number' => $customerData['business_registration_number']],
                $customerData
            );
        }

        $customers = Customer::all();
        $levels = UserMembershipLevel::cases();
        $paths = UserRegistrationPath::cases();

        // Hàm tạo user mẫu được tái sử dụng
        $createUser = function (array $attributes = []) use ($customers, $levels, $paths) {
            // Check if we already have enough users
            $activeUsersCount = User::where('status', UserStatus::ACTIVE)->count();
            $withdrawnUsersCount = User::where('status', UserStatus::WITHDRAWN)->count();

            if ($activeUsersCount >= 20 && Arr::get($attributes, 'status', UserStatus::ACTIVE) === UserStatus::ACTIVE) {
                return null;
            }
            if ($withdrawnUsersCount >= 10 && Arr::get($attributes, 'status', UserStatus::ACTIVE) === UserStatus::WITHDRAWN) {
                return null;
            }

            $customer = $customers->random();
            $level = $levels[array_rand($levels)];
            $path = $paths[array_rand($paths)];

            $defaultAttributes = [
                'customer_id' => $customer->id,
                'username' => fake()->userName(),
                'name' => fake()->name(),
                'email' => fake()->unique()->safeEmail(),
                'password' => bcrypt('password123'),
                'phone' => '010-'.rand(1000, 9999).'-'.rand(1000, 9999),
                'mobile' => '010-'.rand(1000, 9999).'-'.rand(1000, 9999),
                'postcode' => fake()->postcode(),
                'address' => fake()->city(),
                'detailed_address' => fake()->streetAddress(),
                'authority' => 'USER',
                'status' => UserStatus::ACTIVE,
                'approval_status' => ApprovalStatus::ACCEPTED,
                'agreed_at' => now(),
                'approved_at' => now(),
                'last_login_at' => now(),
                'registration_path' => $path,
                'agree_privacy' => true,
                'agree_terms' => true,
            ];

            return User::create(array_merge($defaultAttributes, $attributes));
        };

        // Create active members (with recent last_login_at)
        $activeCount = User::where('status', UserStatus::ACTIVE)->count();
        for ($i = $activeCount; $i < 20; $i++) {
            $createUser([
                'status' => UserStatus::ACTIVE,
                'agreed_at' => now()->subDays(rand(1, 30)),
                'approved_at' => now()->subDays(rand(1, 29)),
                'last_login_at' => now()->subDays(rand(0, 7)), // Active in last week
            ]);
        }

        // Create withdrawn members (status = WITHDRAWN)
        $withdrawnCount = User::where('status', UserStatus::WITHDRAWN)->count();
        for ($i = $withdrawnCount; $i < 10; $i++) {
            $createUser([
                'status' => UserStatus::WITHDRAWN,
                'agreed_at' => now()->subMonths(rand(1, 12)),
                'approved_at' => now()->subMonths(rand(1, 12)),
                'last_login_at' => now()->subMonths(rand(1, 12)),
            ]);
        }

        // Create new members (created in last 7 days)
        $newCount = User::where('status', UserStatus::ACTIVE)
            ->whereDate('created_at', '>=', now()->subDays(7))->count();
        $newMemberCreatedAt = now()->subDays(rand(0, 7));
        for ($i = $newCount; $i < 15; $i++) {
            $createUser([
                'status' => UserStatus::ACTIVE,
                'agreed_at' => $newMemberCreatedAt,
                'approved_at' => $newMemberCreatedAt->copy()->addDays(rand(0, 2)),
                'last_login_at' => $newMemberCreatedAt->copy()->addDays(rand(0, 5)),
                'created_at' => $newMemberCreatedAt,
                'updated_at' => $newMemberCreatedAt,
            ]);
        }

        $this->command->info('Sample data for member statistics has been created!');
        $this->command->info('Active users: '.User::where('status', UserStatus::ACTIVE)->count());
        $this->command->info('Withdrawn users: '.User::where('status', UserStatus::WITHDRAWN)->count());
        $this->command->info('New users (last 7 days): '.User::where('status', UserStatus::ACTIVE)
            ->whereDate('created_at', '>=', now()->subDays(7))->count());
    }
}
