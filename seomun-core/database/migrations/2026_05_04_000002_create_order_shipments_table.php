<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20)->default('combined')
                ->comment('combined = 합배송, separate = 따로 배송');
            $table->string('status', 30)->default('pending')
                ->comment('pending, shipped, delivered');
            $table->string('tracking_number', 100)->nullable();
            $table->string('carrier_code', 50)->nullable()->comment('SweetTracker carrier code');
            $table->decimal('shipping_fee', 10, 2)->default(0);
            $table->string('shipping_name', 100)->nullable();
            $table->string('shipping_phone', 30)->nullable();
            $table->string('shipping_postcode', 20)->nullable();
            $table->string('shipping_address', 255)->nullable();
            $table->string('shipping_address_detail', 255)->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_shipments');
    }
};
