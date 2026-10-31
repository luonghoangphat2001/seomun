<?php

use App\Enums\NotificationDeliveryStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_deliveries', function (Blueprint $table) {
            $table->id();
            $table->morphs('subject');
            $table->string('event', 100);
            $table->string('channel', 32);
            $table->string('recipient_name')->nullable();
            $table->string('recipient_address');
            $table->string('template_code')->nullable();
            $table->json('payload');
            $table->string('status', 32)->default(NotificationDeliveryStatus::PENDING->value);
            $table->json('provider_response')->nullable();
            $table->text('error_message')->nullable();
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['event', 'created_at']);
            $table->index(['status', 'channel']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_deliveries');
    }
};
