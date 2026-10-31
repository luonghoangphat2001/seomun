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
        Schema::create('papers', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // General paper / Specialty paper / High-quality paper / Sticker paper / Paperboard / Banner / Plastic / Colored
            $table->string('manufacturer')->nullable();;
            $table->string('name');
            $table->json('specification')->nullable();
            $table->string('color')->nullable();
            $table->string('pattern')->nullable();;
            $table->decimal('basis_weight', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();;
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('papers');
    }
};
