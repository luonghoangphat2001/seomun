<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * 회원별 저장 옵션 (저장한 옵션 불러오기) — 보관 1년, 디자인 파일 미저장.
     */
    public function up(): void
    {
        Schema::create('saved_product_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();

            $table->string('order_name', 255)->nullable()->comment('주문명 (검색용)');
            $table->string('summary_text', 2000)->nullable()->comment('목록 요약 문구');
            $table->json('detail')->nullable()->comment('확장 영역 표시용: 규격, 용지, 인쇄도수 등');

            $table->foreignId('product_quantity_price_id')
                ->nullable()
                ->constrained('product_quantity_prices')
                ->nullOnDelete();

            $table->integer('quantity')->default(1)
                ->comment('quantity_price_tier.quantity 와 동일 개념');
            $table->decimal('number_of_cases', 8, 2)->default(1)
                ->comment('bundle_tiers.bundle_value(건)');

            $table->json('options')->nullable()->comment('장바구니 options 와 동일 구조');
            $table->unsignedBigInteger('design_id')->nullable();
            $table->json('design_ids')->nullable();

            $table->text('notes')->nullable();
            $table->timestamp('expires_at')->comment('저장일 기준 1년 후 자동 삭제 대상');

            $table->timestamps();

            $table->index(['user_id', 'expires_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_product_options');
    }
};
