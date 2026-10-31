<?php

use App\Enums\DeliveryStatus;
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
        Schema::create('delivery_trackings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('invoice_number')->comment('송장번호');
            $table->date('waybill_registered_at')->nullable()->comment('송장 등록일');
            $table->string('delivery_status', 50)->default(DeliveryStatus::Pickup->value)->comment('배송 상태: pickup, in_transit, delivered');
            $table->string('courier_name')->nullable()->comment('배송 업체');
            $table->json('tracking_info')->nullable()->comment('추적 정보');
            $table->timestamps();

            $table->unique('invoice_number');
            $table->index(['delivery_status', 'waybill_registered_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_trackings');
    }
};
