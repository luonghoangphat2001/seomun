<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_orders', function (Blueprint $table) {
            // 1. Primary Identification & Grouping
            $table->id();
            $table->string('order_number')->unique();
            $table->string('order_external_number')->nullable()->index();

            // Position within a group (e.g., for bulk or split orders)
            $table->unsignedTinyInteger('order_sequence')
                ->nullable()
                ->comment('Position within the group (1, 2, 3...). Set on approval, stays static.');

            // 2. Relationships
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();

            // 3. Order Status & Financials
            $table->string('product_name')->nullable();
            $table->string('status', 50)->default('pending')->index();
            $table->string('payment_status', 50)->default('pending');
            $table->string('currency', 3)->default('KRW');

            $table->decimal('subtotal_amount', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('shipping_fee', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);

            $table->timestamp('placed_at')->nullable();

            // 4. Contact Information (Ordering Party)
            $table->string('contact_name')->nullable();
            $table->string('contact_tel', 50)->nullable();
            $table->string('contact_phone', 50)->nullable();
            $table->string('contact_phone2', 50)->nullable();
            $table->string('contact_email')->nullable();

            // 5. Sender Information (Return Address)
            $table->string('sender_name')->nullable();
            $table->string('sender_phone', 50)->nullable();
            $table->string('sender_zipcode', 20)->nullable();
            $table->string('sender_address')->nullable();
            $table->string('sender_address2')->nullable();

            // 6. Shipping & Delivery
            $table->string('shipping_name')->nullable();
            $table->string('shipping_phone', 50)->nullable();
            $table->string('shipping_phone2', 50)->nullable();
            $table->string('shipping_postcode', 20)->nullable();
            $table->string('shipping_address')->nullable();
            $table->string('shipping_address_detail')->nullable();
            $table->string('shipping_method', 50)->nullable();
            $table->string('shipping_time', 50)->nullable();

            // 7. Design Files & Metadata
            $table->string('design_file_url')->nullable()->comment('Remote/S3 design file link');
            $table->string('design_file_local')->nullable()->comment('Local server path for the design file');
            $table->json('metadata')->nullable();

            // 8. System Timestamps
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_orders');
    }
};
