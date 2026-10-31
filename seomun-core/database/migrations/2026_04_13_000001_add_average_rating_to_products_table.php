<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('average_rating', 3, 2)->default(0)->after('exposure_count');
            $table->unsignedInteger('total_reviews')->default(0)->after('average_rating');
            $table->unsignedInteger('total_rating')->default(0)->after('total_reviews');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'product_id']);
            $table->unique(['user_id', 'product_id', 'order_id'], 'reviews_user_product_order_unique');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['average_rating', 'total_reviews', 'total_rating']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique('reviews_user_product_order_unique');
            $table->unique(['user_id', 'product_id'], 'reviews_user_id_product_id_unique');
        });
    }
};
