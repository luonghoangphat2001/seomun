<?php

namespace Database\Seeders;

use App\Enums\ApprovalStatus;
use App\Models\Customer;
use App\Models\CustomerPromotionalProduct;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CustomerPromotionalProductTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates test customer promotional products for Exposure Control feature testing.
     * Truncates existing data and creates new promotional product relationships.
     */
    public function run(): void
    {
        // Truncate existing promotional products
        DB::table('customer_promotional_products')->truncate();
        $this->command->info('Truncated existing customer promotional products.');

        // Get available customers or create test customers
        $customers = Customer::where('status', 'normal')
            ->where('approval_status', 'accepted')
            ->limit(5)
            ->get();

        if ($customers->isEmpty()) {
            $this->command->warn('No active customers found. Creating test customers...');
            $customers = $this->createTestCustomers();

            if ($customers->isEmpty()) {
                $this->command->error('Failed to create test customers.');

                return;
            }
        }

        // Get available active products
        $products = Product::where('is_active', true)
            ->limit(20)
            ->get();

        if ($products->isEmpty()) {
            $this->command->warn('No active products found. Please create products first.');

            return;
        }

        $this->command->info("Found {$customers->count()} customers and {$products->count()} products.");

        // Create promotional products for each customer
        foreach ($customers as $index => $customer) {
            // Each customer gets a different set of promotional products
            $productCount = min(5 + ($index * 2), $products->count()); // 5, 7, 9, 11, 13 products
            $customerProducts = $products->random($productCount);

            $sortOrder = 0;
            foreach ($customerProducts as $product) {
                CustomerPromotionalProduct::create([
                    'customer_id' => $customer->id,
                    'product_id' => $product->id,
                    'sort_order' => $sortOrder++,
                ]);
            }

            $this->command->info("  - Customer '{$customer->company_name}' (ID: {$customer->id}): {$productCount} promotional products");
        }

        // Create a customer with no promotional products (for testing empty state)
        $customerWithoutPromo = $customers->last();
        if ($customerWithoutPromo) {
            // Remove promotional products for the last customer to test empty state
            CustomerPromotionalProduct::where('customer_id', $customerWithoutPromo->id)->delete();
            $this->command->info("  - Customer '{$customerWithoutPromo->company_name}' (ID: {$customerWithoutPromo->id}): 0 promotional products (for testing empty state)");
        }

        // Summary
        $totalPromotionalProducts = CustomerPromotionalProduct::count();
        $customersWithPromo = CustomerPromotionalProduct::distinct('customer_id')->count('customer_id');

        $this->command->info('');
        $this->command->info('Customer Promotional Product Test Seeder completed successfully!');
        $this->command->info("  - Total promotional product relationships: {$totalPromotionalProducts}");
        $this->command->info("  - Customers with promotional products: {$customersWithPromo}");
        $this->command->info('');
        $this->command->info('You can now test the Exposure Control API endpoints:');
        $this->command->info('  GET  /api/admin/customers/{customer_id}/promotional-products');
        $this->command->info('  PUT  /api/admin/customers/{customer_id}/promotional-products');
    }

    /**
     * Create test customers if none exist
     */
    private function createTestCustomers(): Collection
    {
        $customerData = [
            [
                'access_code' => 'SEOUL_CARD_001',
                'company_name' => 'Seoul Card Shop',
                'business_registration_number' => '110-11-11111',
                'representative_name' => 'Kim Seoul',
                'contact_name' => 'Kim Manager',
                'contact_email' => 'contact@seoulcard.com',
                'contact_phone' => '02-1234-5678',
                'order_menus' => json_encode(['cloud_card', 'office_printing']),
                'other_menus' => json_encode(['promotional']),
                'shipping_fee_applied' => 'fixed',
                'shipping_fee' => 3000.00,
                'status' => 'normal',
                'approval_status' => ApprovalStatus::ACCEPTED,
                'approved_at' => now()->subDays(10),
            ],
            [
                'access_code' => 'BUSAN_DESIGN_001',
                'company_name' => 'Busan Design Studio',
                'business_registration_number' => '220-22-22222',
                'representative_name' => 'Lee Busan',
                'contact_name' => 'Lee Director',
                'contact_email' => 'contact@busandesign.com',
                'contact_phone' => '051-2345-6789',
                'order_menus' => json_encode(['custom_products', 'file_order']),
                'other_menus' => json_encode(['promotional', 'name_tags']),
                'shipping_fee_applied' => 'fixed',
                'shipping_fee' => 3500.00,
                'status' => 'normal',
                'approval_status' => ApprovalStatus::ACCEPTED,
                'approved_at' => now()->subDays(8),
            ],
            [
                'access_code' => 'INCHEON_CREATIVE_001',
                'company_name' => 'Incheon Creative Cards',
                'business_registration_number' => '330-33-33333',
                'representative_name' => 'Park Incheon',
                'contact_name' => 'Park Creative',
                'contact_email' => 'contact@incheoncreative.com',
                'contact_phone' => '032-3456-7890',
                'order_menus' => json_encode(['cloud_card', 'office_printing', 'custom_products']),
                'other_menus' => json_encode(['promotional']),
                'shipping_fee_applied' => 'free',
                'shipping_fee' => 0.00,
                'status' => 'normal',
                'approval_status' => ApprovalStatus::ACCEPTED,
                'approved_at' => now()->subDays(6),
            ],
            [
                'access_code' => 'DAEGU_TEMPLATE_001',
                'company_name' => 'Daegu Template Store',
                'business_registration_number' => '440-44-44444',
                'representative_name' => 'Choi Daegu',
                'contact_name' => 'Choi Store',
                'contact_email' => 'contact@daegutemplate.com',
                'contact_phone' => '053-4567-8901',
                'order_menus' => json_encode(['office_printing', 'file_order']),
                'other_menus' => json_encode(['promotional', 'name_tags', 'large_format_print']),
                'shipping_fee_applied' => 'fixed',
                'shipping_fee' => 4000.00,
                'status' => 'normal',
                'approval_status' => ApprovalStatus::ACCEPTED,
                'approved_at' => now()->subDays(4),
            ],
            [
                'access_code' => 'GWANGJU_PRINT_001',
                'company_name' => 'Gwangju Print Co',
                'business_registration_number' => '550-55-55555',
                'representative_name' => 'Jung Gwangju',
                'contact_name' => 'Jung Print',
                'contact_email' => 'contact@gwangjuprint.com',
                'contact_phone' => '062-5678-9012',
                'order_menus' => json_encode(['cloud_card']),
                'other_menus' => json_encode(['promotional']),
                'shipping_fee_applied' => 'free',
                'shipping_fee' => 0.00,
                'status' => 'normal',
                'approval_status' => ApprovalStatus::ACCEPTED,
                'approved_at' => now()->subDays(2),
            ],
        ];

        $customers = collect();

        foreach ($customerData as $data) {
            $customer = Customer::where('business_registration_number', $data['business_registration_number'])->first();
            if (! $customer) {
                $customer = Customer::create($data);
                $this->command->info("Created customer: {$customer->company_name} (ID: {$customer->id})");
            } else {
                // Update status to ensure it's normal and accepted
                $customer->update([
                    'status' => 'normal',
                    'approval_status' => ApprovalStatus::ACCEPTED,
                ]);
                $this->command->info("Using existing customer: {$customer->company_name} (ID: {$customer->id})");
            }
            $customers->push($customer);
        }

        return $customers;
    }
}
