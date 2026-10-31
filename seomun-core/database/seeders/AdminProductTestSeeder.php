<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductQuantityPrice;
use App\Models\QuantityPriceTier;
use Illuminate\Database\Seeder;

class AdminProductTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates 3 test products for admin product filter testing:
     * 1. Product with quotation (has quantityPrices), branch_name, client_name, is_active=true, stock_quantity > 0
     * 2. Product without quotation (no quantityPrices), branch_name, client_name, is_active=false, stock_quantity = 0
     * 3. Product with quotation, null branch_name, null client_name, is_active=true, stock_quantity > 0
     */
    public function run(): void
    {
        // Get a category (use first available category)
        $category = Category::first();
        if (! $category) {
            $this->command->warn('No categories found. Please run CategorySeeder first.');

            return;
        }

        // Product 1: Has quotation, has branch/client, active, in stock
        $product1 = Product::firstOrCreate(
            ['slug' => 'test-product-with-quotation'],
            [
                'category_id' => $category->id,
                'name' => 'Test Product With Quotation',
                'name_en' => 'Test Product With Quotation',
                'slug' => 'test-product-with-quotation',
                'description' => 'Test product that has quotation (quantity prices)',
                'short_description' => 'Has quotation',
                'price' => 10000,
                'sku' => 'TEST-001',
                'images' => [],
                'is_popular' => false,
                'is_featured' => false,
                'stock_quantity' => 50,
                'min_quantity' => 1,
                'max_quantity' => 1000,
                'sort_order' => 1,
                'is_active' => true,
                'branch_name' => 'Seoul Branch',
                'client_name' => 'Test Client A',
            ]
        );

        // Add quantity prices to product 1
        if (! $product1->quantityPrices()->exists()) {
            $t100 = QuantityPriceTier::firstOrCreate(
                ['quantity' => 100, 'unit' => 'sheets'],
                ['sort_order' => 100, 'is_active' => true]
            );
            $t500 = QuantityPriceTier::firstOrCreate(
                ['quantity' => 500, 'unit' => 'sheets'],
                ['sort_order' => 500, 'is_active' => true]
            );
            ProductQuantityPrice::create([
                'product_id' => $product1->id,
                'quantity_price_tier_id' => $t100->id,
                'price' => 8000,
                'currency' => 'KRW',
                'production_days' => 3,
                'is_default' => false,
            ]);
            ProductQuantityPrice::create([
                'product_id' => $product1->id,
                'quantity_price_tier_id' => $t500->id,
                'price' => 35000,
                'currency' => 'KRW',
                'production_days' => 5,
                'is_default' => false,
            ]);
        }

        // Product 2: No quotation, has branch/client, inactive, out of stock
        $product2 = Product::firstOrCreate(
            ['slug' => 'test-product-no-quotation'],
            [
                'category_id' => $category->id,
                'name' => 'Test Product No Quotation',
                'name_en' => 'Test Product No Quotation',
                'slug' => 'test-product-no-quotation',
                'description' => 'Test product that does NOT have quotation (no quantity prices)',
                'short_description' => 'No quotation',
                'price' => 15000,
                'sku' => 'TEST-002',
                'images' => [],
                'is_popular' => false,
                'is_featured' => false,
                'stock_quantity' => 0,
                'min_quantity' => 1,
                'max_quantity' => 1000,
                'sort_order' => 2,
                'is_active' => false,
                'branch_name' => 'Busan Branch',
                'client_name' => 'Test Client B',
            ]
        );

        // Ensure product 2 has NO quantity prices
        $product2->quantityPrices()->delete();

        // Product 3: Has quotation, no branch/client, active, in stock
        $product3 = Product::firstOrCreate(
            ['slug' => 'test-product-quotation-no-branch'],
            [
                'category_id' => $category->id,
                'name' => 'Test Product Quotation No Branch',
                'name_en' => 'Test Product Quotation No Branch',
                'slug' => 'test-product-quotation-no-branch',
                'description' => 'Test product with quotation but no branch/client info',
                'short_description' => 'Has quotation, no branch',
                'price' => 12000,
                'sku' => 'TEST-003',
                'images' => [],
                'is_popular' => false,
                'is_featured' => false,
                'stock_quantity' => 30,
                'min_quantity' => 1,
                'max_quantity' => 1000,
                'sort_order' => 3,
                'is_active' => true,
                'branch_name' => null,
                'client_name' => null,
            ]
        );

        // Add quantity prices to product 3
        if (! $product3->quantityPrices()->exists()) {
            $t200 = QuantityPriceTier::firstOrCreate(
                ['quantity' => 200, 'unit' => 'sheets'],
                ['sort_order' => 200, 'is_active' => true]
            );
            ProductQuantityPrice::create([
                'product_id' => $product3->id,
                'quantity_price_tier_id' => $t200->id,
                'price' => 20000,
                'currency' => 'KRW',
                'production_days' => 4,
                'is_default' => true,
            ]);
        }

        $this->command->info('Admin Product Test Seeder completed successfully!');
        $this->command->info('Created/Updated 3 test products:');
        $this->command->info('  1. TEST-001: Has quotation, branch/client, active, in stock');
        $this->command->info('  2. TEST-002: No quotation, branch/client, inactive, out of stock');
        $this->command->info('  3. TEST-003: Has quotation, no branch/client, active, in stock');
    }
}
