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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->comment('사용자 ID (User ID)');
            $table->foreignId('product_id')->constrained()->onDelete('cascade')->comment('제품 ID (Product ID)');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null')->comment('주문 ID (Order ID - optional)');
            $table->integer('rating')->comment('별점 (Rating 1-5)');
            $table->string('title', 200)->comment('리뷰 제목 (Review Title)');
            $table->text('content')->comment('리뷰 내용 (Review Content)');
            $table->json('images')->nullable()->comment('리뷰 이미지 (Review Images - array of URLs)');
            $table->boolean('is_approved')->default(false)->comment('승인 여부 (Approval Status)');
            $table->boolean('is_published')->default(false)->comment('발행 여부 (Published Status)');
            $table->timestamps();
            $table->softDeletes();

            // Ensure one user can only write one review per product
            $table->unique(['user_id', 'product_id']);

            // Indexes for faster queries
            $table->index(['user_id', 'is_published']);
            $table->index(['product_id', 'is_published']);
            $table->index('rating');
            $table->index('is_approved');
            $table->index('is_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
