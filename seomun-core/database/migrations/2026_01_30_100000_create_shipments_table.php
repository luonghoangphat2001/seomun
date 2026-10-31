<?php

use App\Enums\ShipmentStatus;
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
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->date('shipment_date')->comment('출고일');
            $table->foreignId('shipping_manager_id')->nullable()->constrained('users')->nullOnDelete()->comment('출고 관리자');
            $table->string('shipment_status', 50)->default(ShipmentStatus::Scheduled->value)->comment('출고 상태: scheduled, in_progress, completed');
            $table->timestamps();

            $table->index(['shipment_date', 'shipment_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
