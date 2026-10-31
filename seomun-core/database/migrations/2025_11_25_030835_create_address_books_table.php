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
        Schema::create('address_books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100)->comment('배송지명 (Delivery Address Name)');
            $table->string('recipient', 100)->comment('수령자 (Recipient)');
            $table->string('phone', 20)->nullable()->comment('전화번호 (Phone Number)');
            $table->string('mobile', 20)->nullable()->comment('핸드폰 (Mobile Phone)');
            $table->string('postcode', 10)->nullable()->comment('우편번호 (Postal Code)');
            $table->string('address')->nullable()->comment('주소 (Address)');
            $table->string('detailed_address')->nullable()->comment('상세 주소 (Detailed Address)');
            $table->boolean('is_default')->default(false)->comment('기본 배송지 (Default Delivery Address)');
            $table->timestamps();
            $table->softDeletes();

            // Index for faster queries
            $table->index('user_id');
            $table->index(['user_id', 'is_default']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('address_books');
    }
};
