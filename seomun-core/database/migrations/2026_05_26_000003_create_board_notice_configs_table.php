<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('board_notice_configs', function (Blueprint $table) {
            $table->id();
            $table->string('board_type', 50)->unique()->comment('notice, faq, inquiry, review, etc.');
            $table->boolean('notice_enabled')->default(false);
            $table->text('notice_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('board_notice_configs');
    }
};
