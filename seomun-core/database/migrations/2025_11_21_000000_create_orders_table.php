<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\ShippingFeeType;
use App\Enums\ShippingMethod;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            // Extract enum values from Enums
            $shippingMethodValues = array_map(fn ($case) => $case->value, ShippingMethod::cases());
            $shippingFeeTypeValues = array_map(fn ($case) => $case->value, ShippingFeeType::cases());

            // 1. Primary Key & Order Identification
            $table->id();
            $table->string('order_number')->unique();
            $table->string('order_external_number')->nullable();

            // 2. Foreign Keys (Relationships)
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('design_mode_id')->nullable()->constrained('product_design_modes')->nullOnDelete();

            // 3. Product Snapshots (Stored to preserve data even if product is deleted/changed)
            $table->string('product_name');
            $table->string('design_mode_name')->nullable();
            $table->json('selected_options')->nullable();

            // 4. Status & Financials
            $table->string('status', 50)->default(OrderStatus::Pending->value);
            $table->string('payment_status', 50)->default('pending');
            $table->string('currency', 3)->default('KRW');
            $table->decimal('subtotal_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('shipping_fee', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('payment_method', 50)->default(PaymentMethod::TOSS->value);

            // 5. Contact / Ordering Party Information
            $table->string('contact_name');
            $table->string('contact_phone', 50);
            $table->string('contact_phone2', 50);
            $table->string('contact_tel')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('company_name')->nullable();
            $table->string('contact_postcode', 20)->nullable();
            $table->string('contact_address')->nullable();
            $table->string('contact_address_detail')->nullable();

            // 6. Shipping & Recipient Information
            $table->string('shipping_name')->nullable();
            $table->string('shipping_phone', 50)->nullable();
            $table->string('shipping_email')->nullable();
            $table->string('shipping_postcode', 20)->nullable();
            $table->string('shipping_address')->nullable();
            $table->string('shipping_address_detail')->nullable();
            $table->string('shipping_branch_name')->nullable();
            $table->string('shipping_time')->nullable();

            // 7. Shipping Configuration
            $table->enum('shipping_method', $shippingMethodValues)->default(ShippingMethod::COURIER->value);
            $table->enum('shipping_fee_type', $shippingFeeTypeValues)->default(ShippingFeeType::PAYMENT->value)
                ->comment('Fee type: 2: Collect on Delivery, 3: Prepaid');

            // 8. Sender Information (Optional)
            $table->string('sender_name')->nullable();
            $table->string('sender_phone')->nullable();
            $table->string('sender_zipcode')->nullable();
            $table->string('sender_address')->nullable();
            $table->string('sender_address2')->nullable();

            // 9. Point
            $table->integer('point_used')->default(0);
            $table->integer('point_discount')->default(0);

            // 10. Logistics & Timestamps
            $table->integer('estimated_production_days')->nullable();
            $table->date('requested_delivery_date')->nullable();
            $table->unsignedTinyInteger('storage_date')->nullable()->comment('File retention period in days');
            $table->timestamp('placed_at')->nullable();
            $table->text('customer_note')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
