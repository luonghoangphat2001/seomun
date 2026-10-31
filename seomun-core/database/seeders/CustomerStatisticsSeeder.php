<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ShippingFeeType;
use App\Enums\ShippingMethod;
use App\Enums\UserAuthority;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CustomerStatisticsSeeder extends Seeder
{
    /**
     * Run the database seeds to create customer statistics test data.
     */
    public function run(): void
    {
        $faker = FakerFactory::create();

        // Check if products exist, create some if not
        if (Product::count() < 3) {
            $this->command->warn('Creating test products...');
            $this->call(ProductSeeder::class);
        }

        $products = Product::take(5)->get();

        // List of sales representatives for testing
        $salesRepresentatives = [
            'Kim Young-ho',
            'Lee Min-ji',
            'Park Sang-hoon',
            'Choi Ji-won',
            'Yoon Tae-hyun',
            'Jung Soo-jin',
        ];

        $this->command->info('Creating customer statistics test data...');

        // Create 50 customers with users and orders
        for ($i = 1; $i <= 50; $i++) {
            // Create customer
            $customer = Customer::create([
                'access_code' => $faker->lexify('????????'),
                'is_seomun_graphics_branch' => $faker->boolean(),
                'company_name' => $faker->company(),
                'business_registration_number' => $faker->lexify('????????????'),
                'representative_name' => $faker->name(),
                'contact_name' => $faker->name(),
                'contact_position' => $faker->jobTitle(),
                'contact_phone' => $faker->phoneNumber(),
                'contact_email' => $faker->safeEmail(),
                'contact_mobile' => $faker->phoneNumber(),
                'contact_fax' => $faker->phoneNumber(),
                'order_menus' => json_encode(['menu1', 'menu2']),
                'other_menus' => json_encode(['menu3']),
                'main_menu' => 'main',
                'mro_customer_code' => $faker->lexify('????????'),
                'branch_in_charge' => null, // Skip for now
                'sales_representative_name' => $salesRepresentatives[array_rand($salesRepresentatives)],
                'sales_representative_contact' => $faker->phoneNumber(),
                'customer_header_title' => $faker->words(3, true),
                'customer_skin' => 'default',
                'customer_footer_contact_number_1' => $faker->phoneNumber(),
                'customer_footer_contact_number_2' => $faker->phoneNumber(),
                'customer_footer_copyright' => $faker->words(3, true),
                'order_notification_enabled' => $faker->boolean(),
                'order_notification_phone' => $faker->phoneNumber(),
                'order_notification_email' => $faker->safeEmail(),
                'simple_order_sms_notification_enabled' => $faker->boolean(),
                'simple_order_sms_notification_phone' => $faker->phoneNumber(),
                'order_teams_notification_enabled' => $faker->boolean(),
                'postcode' => $faker->postcode(),
                'address' => $faker->address(),
                'detailed_address' => $faker->secondaryAddress(),
                'business_type' => $faker->words(3, true),
                'business_items' => $faker->words(3, true),
                'shipping_fee_applied' => $faker->boolean(),
                'shipping_method' => json_encode(['method1', 'method2']),
                'shipping_fee' => $faker->randomFloat(2, 0, 10000),
                'shipping_fee_type' => ShippingFeeType::PAYMENT,
                'free_shipping_min_order_amount' => $faker->randomFloat(2, 0, 10000),
                'postpaid_payment_enabled' => $faker->boolean(),
                'prepaid_payment_enabled' => $faker->boolean(),
                'prepaid_payment_methods' => json_encode(['card', 'bank']),
                'delivery_confirmation_step_enabled' => $faker->boolean(),
                'order_history_retention_days' => $faker->randomNumber(2),
                'tcps_enabled' => $faker->boolean(),
                'member_approval_required' => $faker->boolean(),
                'signup_approval_email_enabled' => $faker->boolean(),
                'signup_approval_email' => $faker->safeEmail(),
                'signup_approval_sms_enabled' => $faker->boolean(),
                'signup_approval_phone' => $faker->phoneNumber(),
                'signup_approval_result_email_enabled' => $faker->boolean(),
                'site_version' => 'v3',
                'signup_enabled' => $faker->boolean(),
                'org_level_1_name' => $faker->words(3, true),
                'org_level_2_name' => $faker->words(3, true),
                'org_level_3_name' => $faker->words(3, true),
                'logo_v3_common' => $faker->imageUrl(),
                'logo_v2_header' => $faker->imageUrl(),
                'logo_v2_login' => $faker->imageUrl(),
                'document_upload_enabled' => $faker->boolean(),
                'is_mro' => $faker->boolean(),
                'is_franchise' => $faker->boolean(),
                'is_partner' => $faker->boolean(),
                'commission_cloud_card' => $faker->randomFloat(2, 0, 2),
                'commission_office_printing' => $faker->randomFloat(2, 0, 2),
                'commission_pro_order' => $faker->randomFloat(2, 0, 2),
                'commission_custom_product' => $faker->randomFloat(2, 0, 2),
                'commission_promo_material' => $faker->randomFloat(2, 0, 2),
                'commission_name_tag' => $faker->randomFloat(2, 0, 2),
                'commission_large_format_print' => $faker->randomFloat(2, 0, 2),
                'commission_file_order' => $faker->randomFloat(2, 0, 2),
                'status' => 'active',
                'approval_status' => 'accepted',
                'approved_at' => $faker->dateTimeBetween('-1 year', '+1 year'),
                'approved_by' => null,
                'created_at' => $faker->dateTimeBetween('-2 years', 'now'),
                'updated_at' => $faker->dateTimeBetween('-2 years', 'now'),
            ]);

            // Create 1-3 users for this customer
            $userCount = $faker->numberBetween(1, 3);
            for ($j = 1; $j <= $userCount; $j++) {
                $user = User::create([
                    'customer_id' => $customer->id,
                    'status' => 'active',
                    'approval_status' => 'accepted',
                    'username' => 'user'.$i.$j.'_'.Str::random(4),
                    'name' => $faker->name(),
                    'email' => $faker->safeEmail(),
                    'password' => bcrypt('password'),
                    'phone' => $faker->phoneNumber(),
                    'mobile' => $faker->phoneNumber(),
                    'postcode' => $faker->postcode(),
                    'address' => $faker->address(),
                    'detailed_address' => $faker->secondaryAddress(),
                    'authority' => UserAuthority::USER,
                    'headquarters' => $faker->company(),
                    'business_office' => $faker->companySuffix(),
                    'team' => $faker->words(2, true),
                    'position' => $faker->jobTitle(),
                    'agree_privacy' => true,
                    'agree_terms' => true,
                    'agreed_at' => $faker->dateTimeBetween('-1 year', 'now'),
                    'approved_at' => $faker->dateTimeBetween('-1 year', 'now'),
                    'approved_by' => null,
                    'individual_approval' => $faker->boolean(),
                    'approval_line' => json_encode(['manager', 'director']),
                ]);

                // Create orders for this user
                $orderCount = $faker->numberBetween(0, 10); // Some customers will have no orders (inactive)
                for ($k = 1; $k <= $orderCount; $k++) {
                    $product = $products->random();

                    $subtotal = $faker->randomFloat(2, 30000, 300000);
                    $shippingFee = $faker->randomFloat(2, 0, 10000);
                    $tax = $subtotal * 0.1;
                    $total = $subtotal + $shippingFee + $tax;

                    // Determine order status (mostly completed for statistics)
                    $statuses = [
                        OrderStatus::Completed, OrderStatus::Completed, OrderStatus::Completed,
                        OrderStatus::Completed, OrderStatus::Completed, OrderStatus::Shipped,
                        OrderStatus::Cancelled, OrderStatus::Pending,
                    ];
                    $status = $statuses[array_rand($statuses)];

                    $order = Order::create([
                        'order_number' => 'P'.now()->format('Ymd').'-'.strtoupper(Str::random(6)),
                        'user_id' => $user->id,
                        'product_id' => $product->id,
                        'design_mode_id' => null,
                        'product_name' => $product->name,
                        'design_mode_name' => null,
                        'status' => $status->value,
                        'payment_status' => PaymentStatus::PAID,
                        'currency' => 'KRW',
                        'subtotal_amount' => $subtotal,
                        'discount_amount' => 0,
                        'tax_amount' => $tax,
                        'shipping_fee' => $shippingFee,
                        'total_amount' => $total,
                        'estimated_production_days' => $faker->numberBetween(3, 7),
                        'requested_delivery_date' => $faker->dateTimeBetween('now', '+1 week'),
                        'placed_at' => $faker->dateTimeBetween('-1 year', 'now'),
                        'contact_name' => $user->name,
                        'contact_phone' => $user->phone,
                        'contact_phone2' => '',
                        'contact_tel' => '',
                        'contact_email' => $user->email,
                        'company_name' => $customer->company_name,
                        'shipping_name' => $user->name,
                        'shipping_phone' => $user->phone,
                        'shipping_phone2' => null,
                        'shipping_postcode' => $faker->postcode(),
                        'shipping_address' => $faker->streetAddress(),
                        'shipping_address_detail' => $faker->secondaryAddress(),
                        'shipping_method' => ShippingMethod::COURIER,
                        'shipping_fee_type' => ShippingFeeType::PAYMENT,
                        'customer_note' => $faker->optional(0.5)->sentence(),
                        'selected_options' => [],
                        'metadata' => [],
                        'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
                        'updated_at' => $faker->dateTimeBetween('-1 year', 'now'),
                    ]);

                    // Create order items
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_quantity_price_id' => null,
                        'title' => $faker->words(3, true),
                        'quantity' => $faker->numberBetween(1, 10),
                        'multiplier' => 1,
                        'unit' => '매',
                        'production_days' => 3,
                        'unit_price' => $subtotal / $faker->numberBetween(1, 10),
                        'total_price' => $subtotal,
                        'configuration' => [
                            'unit_label' => $faker->words(2, true),
                        ],
                        'notes' => null,
                    ]);
                }
            }

            if ($i % 10 == 0) {
                $this->command->info('Created '.$i.' customers...');
            }
        }

        $this->command->info('Customer statistics test data created successfully!');
        $this->command->info('Total customers created: '.Customer::count());
        $this->command->info('Total users created: '.User::count());
        $this->command->info('Total orders created: '.Order::count());
        $this->command->info('Total order items created: '.OrderItem::count());
    }
}
