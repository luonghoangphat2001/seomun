<?php

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
        Schema::create('notification_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notification_template_id')->nullable()->constrained('notification_templates')->nullOnDelete()->comment('Related notification template');
            $table->enum('notification_type', ['email', 'notification_talk', 'sms'])->comment('Notification type');
            $table->string('recipient_name', 255)->nullable()->comment('Recipient name');
            $table->string('recipient_contact', 255)->nullable()->comment('Recipient email/phone');
            $table->string('message_title', 255)->nullable()->comment('Message title / subject');
            $table->text('message_content')->nullable()->comment('Message content');
            $table->enum('sending_result', ['success', 'failure'])->comment('Sending result');
            $table->text('failure_reason')->nullable()->comment('Failure reason (if any)');
            $table->foreignId('sender_id')->nullable()->constrained('users')->nullOnDelete()->comment('Sender (admin)');
            $table->timestamp('sent_at')->nullable()->comment('Sending date and time');
            $table->json('meta')->nullable()->comment('Additional metadata (payload, channel config snapshot, etc.)');
            $table->timestamps();

            $table->index('notification_template_id');
            $table->index('notification_type');
            $table->index('recipient_name');
            $table->index('sending_result');
            $table->index('sender_id');
            $table->index('sent_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_histories');
    }
};
