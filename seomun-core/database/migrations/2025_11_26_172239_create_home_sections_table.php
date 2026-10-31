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
        Schema::create('home_sections', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50)->comment('섹션 타입 (Section Type): banner, popular_products, category_icons, recent_orders, notices, etc.');
            $table->string('title', 255)->nullable()->comment('제목 (Title)');
            $table->string('subtitle', 255)->nullable()->comment('부제목 (Subtitle)');
            $table->text('content')->nullable()->comment('내용 (Content) - JSON format for flexible data');
            $table->string('image', 500)->nullable()->comment('이미지 URL (Image URL)');
            $table->string('link', 500)->nullable()->comment('링크 (Link URL)');
            $table->integer('sort_order')->default(0)->comment('정렬 순서 (Sort Order)');
            $table->boolean('is_active')->default(true)->comment('활성화 여부 (Active Status)');
            $table->timestamp('starts_at')->nullable()->comment('시작 시간 (Start Time)');
            $table->timestamp('ends_at')->nullable()->comment('종료 시간 (End Time)');
            $table->json('metadata')->nullable()->comment('추가 메타데이터 (Additional Metadata)');
            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('is_active');
            $table->index('sort_order');
            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_sections');
    }
};
